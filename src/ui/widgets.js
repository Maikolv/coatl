/* ---------- 17. Widgets de análisis (todos derivados del propio modelo) ---------- */
const COL={rojo:"#C8102E",granate:"#7A0C1F",rosa:"#E9B9BE",hueso:"#FBF6F3",tinta:"#38070F"};

/* Etiquetas largas en varias líneas (Chart.js acepta arreglos) para que no se corten a la izquierda. */
function partirEtiqueta(t,max=16){ const out=[]; let l="";
  for(const w of t.split(" ")){ if((l+" "+w).trim().length>max&&l){ out.push(l); l=w; } else l=(l+" "+w).trim(); }
  if(l) out.push(l); return out.length>1?out:t; }
/* Tornado: contribución βᵢ de cada variable a z, ordenada por magnitud. */
function pintarTornado(modelo){
  const c=[...modelo.contribs].filter(x=>x[1]!==0).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));
  const datos=c.length?c:[["Todas las variables en posición neutra",0]];
  graficar($("graficaTornado"),{type:"bar",data:{
    labels:datos.map(x=>partirEtiqueta(x[0].replace(/ \(.+\)$/,""))),
    datasets:[{label:"β (aporte a z)",data:datos.map(x=>+x[1].toFixed(2)),
      backgroundColor:datos.map(x=>x[1]<0?COL.rojo:COL.granate),borderRadius:4}]},
    options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:t=>"β = "+(t.parsed.x>0?"+":"")+t.parsed.x.toFixed(2)}}},
      scales:{x:{grid:{color:"#F4E2E1"},title:{display:true,text:"Aporte a z (unidades logit)"}},y:{grid:{display:false},ticks:{autoSkip:false}}}}});
}

/* Comparador de zonas: el mismo negocio evaluado en las 6 zonas (usa datosMapa del mapa). */
function pintarComparadorZonas(){
  const filas=[...datosMapa].sort((a,b)=>b.P-a.P).map(d=>
    "<tr"+(d.k===escZonaActual?' class="actual"':"")+'><th scope="row">'+CORTOS[d.k]+"</th><td>"+pct(d.P)+
    "</td><td>"+mxn.format(Math.round(d.util))+"</td><td>$"+d.z.rm2+"</td><td>"+d.z.afl.toFixed(2)+"</td></tr>").join("");
  $("comparadorZonas").innerHTML="<caption>Comparador de zonas para tu mismo negocio</caption>"+
    '<thead><tr><th scope="col">Zona</th><th scope="col">P (3 años)</th><th scope="col">Utilidad/mes</th><th scope="col">Renta m²</th><th scope="col">Afluencia</th></tr></thead><tbody>'+filas+"</tbody>";
}

/* Escenarios guardados (solo en memoria: no se guarda nada en el navegador ni se envía). */
const guardados=[];
let ultimoResumen=null;
function resumenEscenario(e,modelo,mc,f){
  const rp=rangoP(modelo);
  return {nombre:e.giro.n+" · "+CORTOS[e.zonaKey], negocio:negocioActual, P:modelo.P, rango:pct(rp.p05)+"–"+pct(rp.p95),
    util:e.utilMes, p05:mc.p05, p95:mc.p95, pe:e.peDia, roi:f.roi, payback:f.payback, vpn:f.vpn, hash:serializarEscenario()};
}
function pintarComparador(){
  const t=$("tablaComparar"), cap='<caption class="sr-only">Escenarios guardados</caption>';
  if(!guardados.length){t.innerHTML=cap+'<tbody><tr><td class="vacio">Aún no hay escenarios guardados.</td></tr></tbody>';return}
  const fila=(et,fn)=>'<tr><th scope="row">'+et+"</th>"+guardados.map(g=>"<td>"+fn(g)+"</td>").join("")+"</tr>";
  t.innerHTML=cap+'<thead><tr><th scope="col">Métrica</th>'+
    guardados.map((g,i)=>'<th scope="col"><a href="#'+g.hash+'" data-cargar="'+i+'">'+String.fromCharCode(65+i)+". "+esc(g.nombre)+"</a></th>").join("")+"</tr></thead><tbody>"+
    fila("P a 3 años",g=>pct(g.P))+fila("Rango plausible",g=>g.rango)+
    fila("Utilidad/mes",g=>mxn.format(Math.round(g.util)))+
    fila("Utilidad anual P5–P95",g=>mxn.format(Math.round(g.p05))+" a "+mxn.format(Math.round(g.p95)))+
    fila("Equilibrio",g=>isFinite(g.pe)?Math.ceil(g.pe)+" clientes/día":"No alcanzable")+
    fila("ROI anual",g=>pct(g.roi))+fila("Payback",g=>g.payback?g.payback.toFixed(1)+" meses":"—")+
    fila("VPN 3 años",g=>mxn.format(Math.round(g.vpn)))+"</tbody>";
}
$("guardarEsc").addEventListener("click",()=>{
  /* Resuelve un recálculo pendiente para no guardar métricas viejas (hallazgo 7 de Codex). */
  if(typeof tVivo!=="undefined") clearTimeout(tVivo);
  calcular();
  if(!ultimoResumen)return;
  if(guardados.length>=3)guardados.shift();
  guardados.push(Object.assign({},ultimoResumen));
  pintarComparador();
  toast("Escenario guardado para comparar ("+guardados.length+"/3).");
});
$("limpiarEsc").addEventListener("click",()=>{guardados.length=0;pintarComparador()});
$("tablaComparar").addEventListener("click",ev=>{
  const a=ev.target.closest("a[data-cargar]"); if(!a)return;
  ev.preventDefault(); cargarEscenario(guardados[+a.dataset.cargar].hash);
});

/* Compartir por URL: todas las variables del formulario en el fragmento (#), nunca en el servidor. */
const camposForma=()=>[...$("forma").querySelectorAll("input[id],select[id]")];
function serializarEscenario(){
  const p=new URLSearchParams();
  camposForma().forEach(c=>p.set(c.id,c.type==="checkbox"?(c.checked?"1":"0"):c.value));
  return "e="+encodeURIComponent(p.toString());
}
function cargarEscenario(hash){
  const m=/(?:^#?|&)e=([^&]+)/.exec(hash||""); if(!m)return false;
  let p; try{p=new URLSearchParams(decodeURIComponent(m[1]))}catch(_){return false}
  camposForma().forEach(c=>{
    if(!p.has(c.id))return;
    const v=p.get(c.id);
    if(c.type==="checkbox")c.checked=v==="1";
    else if(c.tagName==="SELECT"){if([...c.options].some(o=>o.value===v))c.value=v}
    else{const n=Number(v);if(Number.isFinite(n))c.value=String(n)}
  });
  ["inversion","credito","cvar","merma"].forEach(id=>$(id).dispatchEvent(new Event("input")));
  calcular();
  return true;
}
$("compartirURL").addEventListener("click",async()=>{
  const frag="#"+serializarEscenario(), url=location.origin+location.pathname+frag;
  history.replaceState(null,"",frag);
  let ok=false; try{await navigator.clipboard.writeText(url);ok=true}catch(_){}
  $("notaCompartir").textContent=ok?"Enlace copiado al portapapeles.":"Copia este enlace: "+url;
});

/* Exportar reporte (PDF e imagen): ver src/ui/reporte.js. */

/* Alternativa textual de las gráficas para lectores de pantalla (WCAG 1.1.1). */
function describirGraficas(e,modelo,mc,S){
  const rp=rangoP(modelo), sb=curvaSupervivencia(rp.p05), sa=curvaSupervivencia(rp.p95);
  const tor=[...modelo.contribs].filter(c=>c[1]!==0).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))
    .map(c=>c[0].replace(/ (.+)$/,"")+" "+(c[1]>0?"+":"")+c[1].toFixed(2)).join("; ");
  $("descGraficas").textContent=
    "Supervivencia: año 1 "+pct(S[1])+", año 3 "+pct(S[3])+" (banda "+pct(sb[3])+" a "+pct(sa[3])+"), año 5 "+pct(S[5])+", año 10 "+pct(S[10])+
    ". Monte Carlo: P5 "+mxn.format(Math.round(mc.p05))+", mediana "+mxn.format(Math.round(mc.p50))+", P95 "+mxn.format(Math.round(mc.p95))+
    ". Punto de equilibrio: "+(isFinite(e.peDia)?Math.ceil(e.peDia)+" clientes por día":"no alcanzable")+
    ". Aportes β al modelo logístico: "+(tor||"todas las variables neutras")+".";
}
function pintarWidgets(e,modelo,mc,S){
  describirGraficas(e,modelo,mc,S);
  pintarTornado(modelo);
  pintarComparadorZonas();
  pintarComparador();
}
