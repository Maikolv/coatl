/* ---------- 29. Reportes: negocio (simulador), plan (estrategia) y reporte completo con QR ----------
   Ningún reporte es una captura del sitio: se arma un documento propio con lo relevante del negocio,
   con la paleta, la greca y las tipografías de COATL. Las gráficas se vuelven a dibujar a 3×.
   · «negocio»: indicadores, supuestos, gráficas, alternativas, solidez, fiscal y modelo 2.5D.
   · «plan»: FODA, plan priorizado, plan combinado, impacto y control, calendario de 90 días.
   · «completo»: los dos anteriores. Es el que abre el código QR en el teléfono (?reporte=1#r=…).
   El QR lleva el resultado DENTRO del enlace (fragmento #r, que el navegador no envía al servidor):
   solo viajan las variables que cambiaste, el nombre del negocio, tus respuestas del diagnóstico y
   las acciones marcadas del plan. Todo se calcula otra vez en el teléfono con el mismo motor. */
const GRAFICAS_REPORTE=[["graficaSupervivencia","Supervivencia a 10 años"],["graficaMC","Utilidad anual simulada (Monte Carlo, 2,000 años)"],
  ["graficaPE","Punto de equilibrio"],["graficaTornado","Qué mueve tu probabilidad"]];
const LOGO_SVG='<svg viewBox="0 0 38 38" aria-hidden="true"><rect width="38" height="38" rx="9" fill="#C8102E"/><path d="M8 27 v-5 h5 v-5 h5 v-5 h12 v5 h-7 v5 h-5 v5 z" fill="#fff"/><circle cx="27.5" cy="14.5" r="1.8" fill="#C8102E"/></svg>';
/* Dirección del sitio para el QR: la propia página si está publicada en cualquier dominio; si se abre en el equipo
   (localhost, 127.0.0.1 o archivo), la dirección canónica que declara la página (<link rel="canonical">), porque un
   teléfono no puede abrir «localhost». Si el sitio cambia de dominio basta con actualizar el canonical de src/index.html. */
const URL_PUBLICA=(document.querySelector('link[rel="canonical"]')||{}).href||"https://maikolv.github.io/coatl/";
const SITIO_LOCAL=location.protocol==="file:"||/^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0)$/.test(location.hostname)||/\.(local|test|localhost)$/.test(location.hostname);
const VISTA_REPORTE=new URLSearchParams(location.search).get("reporte")==="1";
const valorCampo=c=>c.type==="checkbox"?(c.checked?"1":"0"):c.value;
/* Estado inicial del formulario (escenario de referencia): el QR solo codifica lo que difiere de él. */
const FORMA_BASE=new Map(camposForma().map(c=>[c.id,valorCampo(c)]));

async function graficasAltaRes(escala){
  const lista=await graficasListas(GRAFICAS_REPORTE.map(g=>g[0]));
  return lista.map(g=>{
    let url;
    try{
      const previo=g.options.devicePixelRatio;
      g.options.devicePixelRatio=escala; g.resize();
      url=g.toBase64Image("image/png",1);
      g.options.devicePixelRatio=previo; g.resize();
    }catch(_){ url=g.canvas.toDataURL("image/png"); }
    return {url, titulo:(GRAFICAS_REPORTE.find(x=>x[0]===g.canvas.id)||[])[1]||""};
  });
}
function datosReporte(){
  if(!ultimoMejora||!ultimoResumen) return null;
  const c=contextoNegocio(), r=ultimoResumen, e=c.e, d=x=>mxn.format(Math.round(x)), P0=c.modelo.P;
  const est=estadosMadurez(c), mad=indiceMadurez(est);
  const L=palancas(e,P0);
  const elegidas=(typeof planSel!=="undefined"&&planSel?L.filter(l=>planSel.includes(l.clave)):L.slice(0,3));
  const Pplan=pPlan(e, elegidas, P0);
  return {c, r, mad, e, L, elegidas, Pplan, foda:clasificarFODA(e,c.modelo), fac:factoresImpacto(c.modelo),
    titulo:c.nombre, sub:e.giro.n+" · "+c.zona, fecha:new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"}),
    kpis:[["Probabilidad a 3 años",pct(r.P),"rango plausible "+r.rango],["Utilidad mensual",d(r.util),"antes de impuestos"],["ROI anual",pct(r.roi),"sobre la inversión"],
      ["Recuperación",r.payback?r.payback.toFixed(1)+" meses":"—","de la inversión"],["VPN a 3 años",d(r.vpn),"valor presente neto"]],
    kpisPlan:[["Probabilidad actual",pct(P0),"rango plausible "+r.rango],["Con tu plan",pct(Pplan),elegidas.length+(elegidas.length===1?" acción marcada":" acciones marcadas")],
      ["Brecha que cierras","+"+((Pplan-P0)*100).toFixed(1)+" pts","puntos de probabilidad"],["Solidez",mad.indice+" / 100","nivel "+mad.nivel+" de 5"],
      ["Utilidad tras ISR",d(c.fiscal.utilDespues),"estimación mensual"]],
    supuestos:[["Ticket promedio",c.ticket],["Clientes por día",String(c.clientes)],["Ventas del mes",c.ventasMes],["Costo variable (con merma)",c.cvPct],
      ["Costos fijos del mes",c.fijos],["Empleados",String(e.empleados)],["Inversión inicial",c.inversion],["Financiado con crédito",c.credPct]],
    escenarios:[["Pesimista (percentil 5)",d(r.p05)],["Esperado (mediana)",d(c.mc.p50)],["Optimista (percentil 95)",d(r.p95)],
      ["Punto de equilibrio",isFinite(r.pe)?Math.ceil(r.pe)+" clientes al día":"no alcanzable"]],
    alternativas:L.slice(0,4).map(l=>[l.titulo,pct(P0)+" → "+pct(Math.max(P0,l.P))+" (+"+(l.lift*100).toFixed(1)+" pts)"]),
    fiscal:[["Ventas del mes (sin IVA)",d(c.fiscal.ventasMes)],["Utilidad antes de impuestos",d(e.utilMes)],
      [c.fiscal.regimen==="resico_pf"?"ISR estimado · RESICO ("+(c.fiscal.tasaResico*100).toFixed(1)+" %)":"ISR estimado · régimen general (30 %)","− "+d(c.fiscal.isrMes)],
      ["Utilidad después de ISR",d(c.fiscal.utilDespues)]]};
}
const tablaRep=(filas,cab)=>'<table class="rep-tabla">'+(cab?"<thead><tr>"+cab.map(t=>'<th scope="col">'+t+"</th>").join("")+"</tr></thead>":"")+"<tbody>"+
  filas.map(f=>"<tr>"+f.map((v,i)=>i?"<td>"+esc(v)+"</td>":'<th scope="row">'+esc(v)+"</th>").join("")+"</tr>").join("")+"</tbody></table>";
const cabeceraRep=(D,tipo)=>'<header class="rep-cab">'+LOGO_SVG+'<div class="rep-marca">COATL<small>ANÁLISIS TERRITORIAL · COACALCO</small></div><div class="rep-fecha">'+tipo+"<br>"+esc(D.fecha)+"</div></header>"+
  '<div class="rep-greca"></div><p class="rep-titulo">'+esc(D.titulo)+'</p><p class="rep-sub">'+esc(D.sub)+"</p>";
const kpisRep=l=>'<div class="rep-kpis">'+l.map(([k,v,n])=>'<div class="rep-kpi"><span>'+esc(k)+"</span><strong>"+esc(v)+"</strong><em>"+esc(n)+"</em></div>").join("")+"</div>";
const PIE_REP='<footer class="rep-pie">Estimaciones de un modelo educativo bajo supuestos declarados; no constituyen asesoría financiera, fiscal ni legal. La estimación fiscal es orientativa: confírmala con un contador. '+
  'El índice de solidez es una lista de verificación del equipo, no un modelo estadístico. © 2026 Miguel Antonio Cruz García, Bruno Alejandro López Bautista y Alonso Arroyo Cortés · maikolv.github.io/coatl</footer>';

function cuerpoNegocio(D,graf){
  return kpisRep(D.kpis)+
    '<div class="rep-dos"><div class="rep-bloque"><p class="rep-h">Tu escenario</p>'+tablaRep(D.supuestos)+'</div>'+
    '<div class="rep-bloque"><p class="rep-h">Un año de operación, tres escenarios</p>'+tablaRep(D.escenarios)+
    '<p class="rep-h">Estimación fiscal mensual</p>'+tablaRep(D.fiscal)+"</div></div>"+
    (graf.length?'<p class="rep-h">Gráficas del escenario</p><div class="rep-graf">'+graf.map(g=>'<figure><figcaption>'+esc(g.titulo)+'</figcaption><img alt="'+esc(g.titulo)+'" src="'+g.url+'"></figure>').join("")+"</div>":"")+
    '<div class="rep-dos"><div class="rep-bloque"><p class="rep-h">Alternativas para mejorar tu resultado</p>'+
      (D.alternativas.length?'<ol class="rep-lista">'+D.alternativas.map(([a,b])=>"<li><strong>"+a+"</strong><br>"+esc(b)+"</li>").join("")+"</ol>":"<p>El modelo no encuentra palancas con mejora significativa.</p>")+
      '<p class="rep-h">Solidez del negocio: '+D.mad.indice+" de 100 · nivel "+D.mad.nivel+" de 5</p>"+
      (D.mad.pendientes.length?'<ol class="rep-lista">'+D.mad.pendientes.slice(0,4).map(p=>"<li><strong>"+esc(p.t)+".</strong> "+esc(p.b(D.c))+"</li>").join("")+"</ol>":"<p>Diagnóstico completo.</p>")+"</div>"+
    '<div class="rep-bloque"><p class="rep-h">Lo que tu negocio puede llegar a ser</p><figure class="rep-escena">'+escenaNegocio(datosEscena(D.c,5))+"</figure></div></div>";
}
function cuerpoPlan(D){
  const P0=D.c.modelo.P, lista=(arr,vacio)=>"<ul class=\"rep-lista\">"+(arr.length?arr.map(([nom])=>"<li>"+esc(String(nom).replace(/<[^>]*>/g,""))+"</li>").join(""):"<li>"+vacio+"</li>")+"</ul>";
  const celda=(t,f)=>'<div class="rep-caja"><p class="rep-caja-t">'+t+"</p>"+(f.length?'<ul class="rep-lista">'+[...f].sort((a,b)=>b.imp-a.imp).map(x=>"<li>"+esc(x.n)+" <strong>"+(x.b<0?"−":"+")+(x.imp*100).toFixed(1)+" pts</strong></li>").join("")+"</ul>":"<p>Ninguno</p>")+"</div>";
  const alto=f=>f.imp>=0.03, conHitos=D.elegidas.filter(l=>HITOS_PLAN[l.clave]);
  return kpisRep(D.kpisPlan)+
    '<p class="rep-h">Diagnóstico FODA de tu escenario</p><div class="rep-foda">'+
      '<div class="rep-caja"><p class="rep-caja-t">Fortalezas · lo que ya juega a tu favor</p>'+lista(D.foda.F,"Aún no destacan fortalezas claras.")+"</div>"+
      '<div class="rep-caja"><p class="rep-caja-t">Oportunidades · palancas del entorno</p>'+lista(D.foda.O,"Sin oportunidades externas evidentes.")+"</div>"+
      '<div class="rep-caja"><p class="rep-caja-t">Debilidades · lo que te resta y sí controlas</p>'+lista(D.foda.D,"Sin debilidades internas marcadas.")+"</div>"+
      '<div class="rep-caja"><p class="rep-caja-t">Amenazas · riesgos del entorno</p>'+lista(D.foda.A,"Sin amenazas externas marcadas.")+"</div></div>"+
    '<p class="rep-h">Plan de acción priorizado</p>'+
      (D.L.length?'<table class="rep-tabla rep-plan"><thead><tr><th scope="col">#</th><th scope="col">Acción</th><th scope="col">Qué hacer</th><th scope="col">Probabilidad</th></tr></thead><tbody>'+
        D.L.map((l,i)=>"<tr><td>"+(i+1)+"</td><th scope=\"row\">"+l.titulo+(D.elegidas.includes(l)?" ✓":"")+"</th><td>"+l.que+"</td><td>"+pct(P0)+" → "+pct(Math.max(P0,l.P))+"<br>+"+(l.lift*100).toFixed(1)+" pts</td></tr>").join("")+"</tbody></table>"+
        '<p class="rep-nota">✓ = acciones marcadas en tu plan. Aplicadas juntas, el modelo estima <strong>'+pct(P0)+" → "+pct(D.Pplan)+"</strong> (+"+((D.Pplan-P0)*100).toFixed(1)+" pts). Los puntos no se suman por separado: los efectos se combinan en la curva logística.</p>"
        :"<p>El modelo no encuentra palancas con mejora significativa: escenario muy sólido.</p>")+
    '<p class="rep-h">Qué factores pesan más y cuáles controlas</p><div class="rep-foda">'+
      celda("Controlas · impacto alto",D.fac.filter(f=>f.ctrl&&alto(f)))+celda("Externo · impacto alto",D.fac.filter(f=>!f.ctrl&&alto(f)))+
      celda("Controlas · impacto bajo",D.fac.filter(f=>f.ctrl&&!alto(f)))+celda("Externo · impacto bajo",D.fac.filter(f=>!f.ctrl&&!alto(f)))+"</div>"+
      '<p class="rep-nota">Impacto = puntos de probabilidad que cambiarían si ese factor fuera neutro. La probabilidad de que ocurra cada riesgo no está medida.</p>'+
    '<p class="rep-h">Plan por etapas con criterios de salida</p><ol class="rep-lista">'+etapasPlan(D.e,D.c.mc).map(x=>"<li><strong>"+x.t+".</strong> "+x.d+" <em>Criterio de salida: "+x.salida+"</em></li>").join("")+"</ol>"+
      '<p class="rep-nota">Ningún modelo asegura que un negocio sobreviva. Este plan acota la pérdida; las acciones de arriba cuentan la mitad del efecto que da el modelo, porque sus coeficientes son asociación o supuesto, no efecto probado.</p>'+
    (conHitos.length?'<p class="rep-h">Calendario de 90 días</p><div class="rep-cal">'+["Días 1 a 30","Días 31 a 60","Días 61 a 90"].map((t,m)=>
        '<div class="rep-caja"><p class="rep-caja-t">'+t+'</p><ul class="rep-lista">'+conHitos.map(l=>"<li>"+HITOS_PLAN[l.clave].m[m]+"</li>").join("")+"</ul></div>").join("")+"</div>"+
      '<p class="rep-h">Indicadores de seguimiento</p><ul class="rep-lista">'+conHitos.map(l=>"<li><strong>"+l.titulo+":</strong> "+HITOS_PLAN[l.clave].kpi+"</li>").join("")+"</ul>":"")+
    (D.mad.pendientes.length?'<p class="rep-h">Siguientes pasos de solidez</p><ol class="rep-lista">'+D.mad.pendientes.slice(0,5).map(p=>"<li><strong>"+esc(p.t)+" (nivel "+p.n+").</strong> "+esc(p.b(D.c))+"</li>").join("")+"</ol>":"");
}
function htmlReporte(D,graf,modo){
  if(modo==="plan") return cabeceraRep(D,"Plan del negocio")+cuerpoPlan(D)+PIE_REP;
  if(modo==="completo") return cabeceraRep(D,"Reporte completo")+'<p class="rep-parte">Parte 1 · Resultado del simulador</p>'+cuerpoNegocio(D,graf)+
    '<p class="rep-parte rep-salto">Parte 2 · Estrategia y plan de acción</p>'+cuerpoPlan(D)+PIE_REP;
  return cabeceraRep(D,"Reporte del negocio")+cuerpoNegocio(D,graf)+PIE_REP;
}
async function prepararReporte(conGraficas){
  if(typeof tVivo!=="undefined"&&tVivo){ clearTimeout(tVivo); calcular(); }
  const D=datosReporte(); if(!D) return null;
  return {D, graf:conGraficas===false?[]:await graficasAltaRes(3)};
}
async function imprimirReporte(modo){
  const R=await prepararReporte(modo!=="plan"); if(!R){ toast("Espera a que termine el cálculo y vuelve a intentarlo."); return; }
  const rep=$("reporteNegocio");
  rep.innerHTML=htmlReporte(R.D,R.graf,modo); rep.hidden=false;
  await Promise.all([...rep.querySelectorAll("img")].map(i=>i.decode().catch(()=>{})));
  document.body.classList.add("imprimir-reporte");
  const limpiar=()=>{ document.body.classList.remove("imprimir-reporte"); if(!VISTA_REPORTE){ rep.hidden=true; rep.innerHTML=""; } window.removeEventListener("afterprint",limpiar); };
  window.addEventListener("afterprint",limpiar);
  window.print();
}
$("exportarPDF").addEventListener("click",()=>imprimirReporte("negocio"));
$("imprimirPlan").addEventListener("click",()=>imprimirReporte("plan"));

/* ----- Resultado en un enlace (para el QR) ----- */
function codificarResultado(){
  const p=new URLSearchParams();
  camposForma().forEach(c=>{ if(FORMA_BASE.has(c.id)&&valorCampo(c)!==FORMA_BASE.get(c.id)) p.set(c.id,valorCampo(c)); });
  const g=$("giro").value;
  if(/^propio_/.test(g)&&GIROS[g]) p.set("_g",GIROS[g].n);
  if(negocioActual) p.set("_n",negocioActual);
  const m=PUNTOS_MADUREZ.map(x=>x.id in respuestasMadurez?String(respuestasMadurez[x.id]):"-").join("");
  if(/[012]/.test(m)) p.set("_m",m);
  if(typeof planSel!=="undefined"&&planSel) p.set("_p",planSel.join("."));
  const x=typeof sumaExtras==="function"?sumaExtras():0; if(x>0) p.set("_x",String(Math.round(x)));
  let b=""; new TextEncoder().encode(p.toString()).forEach(v=>{ b+=String.fromCharCode(v); });
  return btoa(b).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function enlaceResultado(reporte){
  const base=SITIO_LOCAL?URL_PUBLICA:location.origin+location.pathname;
  return base+(reporte?"?reporte=1":"")+"#r="+codificarResultado();
}
async function cargarResultado(hash){
  const m=/(?:^#?|&)r=([A-Za-z0-9_-]+)/.exec(hash||""); if(!m) return false;
  let p;
  try{ const bin=atob(m[1].replace(/-/g,"+").replace(/_/g,"/")); p=new URLSearchParams(new TextDecoder().decode(Uint8Array.from(bin,ch=>ch.charCodeAt(0)))); }catch(_){ return false; }
  const g=p.get("giro")||"";
  if(/^scian_\d{6}$/.test(g)&&typeof usarActividad==="function"){ try{ await usarActividad(g.slice(6)); }catch(_){} }
  else if(p.get("_g")&&typeof usarGiroPropio==="function") usarGiroPropio(limpiarNombre(p.get("_g")).slice(0,80));
  const todo=new URLSearchParams();
  FORMA_BASE.forEach((v,id)=>todo.set(id,p.has(id)?p.get(id):v));
  if(p.get("_g")) todo.set("giro",$("giro").value);
  const x=Number(p.get("_x"));
  if(x>0&&typeof agregarExtra==="function"){ $("extrasLista").innerHTML=""; agregarExtra("Costos propios (del enlace)",Math.min(Math.round(x),10000000)); actualizarExtras(); }
  const nombre=limpiarNombre(p.get("_n")); $("negocioNombre").value=nombre; negocioActual=nombre;
  respuestasMadurez={}; const mm=p.get("_m")||"";
  PUNTOS_MADUREZ.forEach((pt,i)=>{ if(/[012]/.test(mm[i]||"")) respuestasMadurez[pt.id]=+mm[i]; });
  if(p.has("_p")) planSel=p.get("_p").split(".").filter(k=>/^[a-z]{3,20}$/.test(k));
  cargarEscenario("e="+encodeURIComponent(todo.toString()));   // valida cada campo: opciones existentes y números dentro de sus límites
  return true;
}

/* ----- Código QR (biblioteca qrcode-generator, MIT, incluida en el sitio: funciona sin conexión) ----- */
function dibujarQR(lienzo,texto){
  const q=qrcode(0,"M"); q.addData(texto,"Byte"); q.make();
  const n=q.getModuleCount(), margen=4, t=Math.floor(lienzo.width/(n+2*margen)), o=Math.floor((lienzo.width-t*n)/2), x=lienzo.getContext("2d");
  x.fillStyle="#fff"; x.fillRect(0,0,lienzo.width,lienzo.height); x.fillStyle="#38070F";
  for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(q.isDark(r,c)) x.fillRect(o+c*t,o+r*t,t,t);
  return n;
}
function abrirQR(){
  if(typeof tVivo!=="undefined"&&tVivo){ clearTimeout(tVivo); calcular(); }
  const url=enlaceResultado(true), dlg=$("dlgQR"); dlg.dataset.url=url;
  try{ dibujarQR($("qrLienzo"),url); $("qrLienzo").hidden=false;
    $("qrNota").textContent="El código lleva tu resultado dentro del propio enlace ("+url.length+" caracteres): no se sube a ningún servidor. En el teléfono, pulsa «Guardar como PDF»."+(/^(scian_|propio_)/.test($("giro").value)?" Tu giro personalizado viaja con sus parámetros actuales.":""); }
  catch(_){ $("qrLienzo").hidden=true; $("qrNota").textContent="Tu escenario es demasiado largo para un código QR. Usa «Reporte completo en PDF» o «Copiar el enlace»."; }
  if(dlg.showModal) dlg.showModal(); else dlg.setAttribute("open","");
}
["qrResultado","qrPlan"].forEach(id=>$(id).addEventListener("click",abrirQR));
$("qrCerrar").addEventListener("click",()=>$("dlgQR").close());
$("qrCopiar").addEventListener("click",async()=>{
  const url=$("dlgQR").dataset.url||enlaceResultado(true); let ok=false;
  try{ await navigator.clipboard.writeText(url); ok=true; }catch(_){}
  $("qrNota").textContent=ok?"Enlace copiado al portapapeles.":"Copia este enlace: "+url;
});
$("qrPDF").addEventListener("click",()=>{ $("dlgQR").close(); imprimirReporte("completo"); });

/* ----- Vista de reporte (?reporte=1#r=…): lo que abre el QR en el teléfono ----- */
async function mostrarVistaReporte(valido){
  const rep=$("reporteNegocio"), barra=$("repBarra");
  document.body.classList.add("vista-reporte"); barra.hidden=false; rep.hidden=false;
  $("repAbrir").href=location.pathname+location.hash;
  if(!valido){ rep.innerHTML='<p class="rep-titulo">Este enlace no contiene un resultado válido</p><p class="rep-sub">Abre COATL y genera de nuevo tu código desde «Llevarme todo mi resultado».</p>'; return; }
  rep.innerHTML='<p class="rep-sub" role="status">Calculando tu reporte con el motor de COATL…</p>';
  const v=versionCalculo;
  for(let i=0;i<200&&!(ultimoMejora&&ultimoMejora.v>=v&&!solicitudCalculo&&ultimoResumen);i++) await new Promise(r=>setTimeout(r,150));
  const R=await prepararReporte(true);
  if(!R){ rep.innerHTML='<p class="rep-sub">No se pudo calcular el reporte. Recarga la página.</p>'; return; }
  rep.innerHTML=htmlReporte(R.D,R.graf,"completo");
  rep.dataset.listo="1";
  document.title="Reporte de "+R.D.titulo+" · COATL";
}
$("repGuardar").addEventListener("click",()=>window.print());
setTimeout(async()=>{ const ok=await cargarResultado(location.hash); if(VISTA_REPORTE) mostrarVistaReporte(ok); },0);

/* ----- Imagen PNG: lienzo propio a 2× (3200 px de ancho) ----- */
function grecaLienzo(x,x0,y,ancho,alto,color){
  const k=alto/18; x.save(); x.beginPath(); x.rect(x0,y,ancho,alto); x.clip(); x.fillStyle=color;
  for(let px=x0;px<x0+ancho;px+=72*k){
    for(const dx of [0,36]){
      const p=[[0,18],[0,12],[6,12],[6,6],[12,6],[12,0],[24,0],[24,6],[18,6],[18,12],[12,12],[12,18]];
      x.beginPath(); p.forEach(([a,b],i)=>x[i?"lineTo":"moveTo"](px+(dx+a)*k,y+b*k)); x.closePath(); x.fill();
      x.fillRect(px+(dx+28)*k,y+7*k,4*k,4*k);
    }
  }
  x.restore();
}
function rectRedondo(x,a,b,w,h,r){ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); }
function textoAjustado(x,t,a,b,maxW,peso,tam,fam){
  let s=tam; do{ x.font=peso+" "+s+"px "+fam; s-=2; }while(x.measureText(t).width>maxW&&s>14);
  x.fillText(t,a,b);
}
function lineas(x,t,maxW){
  const pal=String(t).split(/\s+/), out=[]; let l="";
  pal.forEach(p=>{ const pr=l?l+" "+p:p; if(x.measureText(pr).width>maxW&&l){ out.push(l); l=p; } else l=pr; });
  if(l) out.push(l); return out;
}
$("exportarPNG").addEventListener("click",async()=>{
  const R=await prepararReporte(true); if(!R){ toast("Espera a que termine el cálculo y vuelve a intentarlo."); return; }
  const {D,graf}=R, S=2, W=1600, M=56, DISP="'Bricolage Grotesque',Arial,sans-serif", CUERPO="'Hanken Grotesk',Arial,sans-serif", MONO="'Spline Sans Mono','Courier New',monospace";
  const imgs=await Promise.all(graf.map(g=>new Promise(ok=>{ const im=new Image(); im.onload=()=>ok(im); im.onerror=()=>ok(null); im.src=g.url; })));
  const gh=460, gw=(W-2*M-24)/2, yG=440, filasG=Math.ceil(graf.length/2), yB=yG+filasG*(gh+24)+10, hB=400, alto=yB+hB+90;
  const cv=document.createElement("canvas"); cv.width=W*S; cv.height=alto*S;
  const x=cv.getContext("2d"); x.scale(S,S); x.textBaseline="alphabetic";
  x.fillStyle=COL.hueso; x.fillRect(0,0,W,alto);
  x.fillStyle=COL.rojo; x.fillRect(0,0,W,14);
  rectRedondo(x,M,40,68,68,16); x.fillStyle=COL.rojo; x.fill();
  x.save(); x.translate(M,40); x.scale(68/38,68/38); x.fillStyle="#fff"; x.fill(new Path2D("M8 27 v-5 h5 v-5 h5 v-5 h12 v5 h-7 v5 h-5 v5 z"));
  x.fillStyle=COL.rojo; x.beginPath(); x.arc(27.5,14.5,1.8,0,7); x.fill(); x.restore();
  x.fillStyle=COL.tinta; x.font="800 46px "+DISP; x.fillText("COATL",M+88,82);
  x.fillStyle=COL.granate; x.font="600 15px "+MONO; x.fillText("ANÁLISIS TERRITORIAL · COACALCO",M+90,106);
  x.textAlign="right"; x.fillStyle="#6B5457"; x.font="500 17px "+MONO; x.fillText("Reporte del negocio",W-M,74); x.fillText(D.fecha,W-M,100); x.textAlign="left";
  grecaLienzo(x,M,128,W-2*M,18,COL.rojo);
  x.fillStyle=COL.tinta; textoAjustado(x,D.titulo,M,214,W-2*M,"800",58,DISP);
  x.fillStyle=COL.granate; x.font="500 26px "+CUERPO; x.fillText(D.sub,M,254);
  const kw=(W-2*M-4*18)/5;
  D.kpis.forEach(([k,v,n],i)=>{ const a=M+i*(kw+18), b=286;
    rectRedondo(x,a,b,kw,124,12); x.fillStyle="#fff"; x.fill(); x.strokeStyle="#EFD6D4"; x.lineWidth=1.5; x.stroke();
    x.fillStyle=COL.rojo; x.fillRect(a+12,b,kw-24,6);
    x.fillStyle="#6B5457"; x.font="600 14px "+MONO; x.fillText(k.toUpperCase(),a+18,b+36);
    x.fillStyle=COL.tinta; textoAjustado(x,v,a+18,b+80,kw-36,"800",38,DISP);
    x.fillStyle="#6B5457"; x.font="500 15px "+CUERPO; x.fillText(n,a+18,b+106); });
  graf.forEach((g,i)=>{ const a=M+(i%2)*(gw+24), b=yG+Math.floor(i/2)*(gh+24), im=imgs[i];
    rectRedondo(x,a,b,gw,gh,12); x.fillStyle="#fff"; x.fill(); x.strokeStyle="#EFD6D4"; x.stroke();
    x.fillStyle=COL.granate; x.font="700 20px "+CUERPO; x.fillText(g.titulo,a+20,b+36);
    if(im){ const bw=gw-40, bh=gh-70, k=Math.min(bw/im.width,bh/im.height), w=im.width*k, h=im.height*k; x.drawImage(im,a+20+(bw-w)/2,b+52+(bh-h)/2,w,h); } });
  const cw=(W-2*M-24)/2;
  [[M,"Alternativas para mejorar tu resultado"],[M+cw+24,"Solidez y estimación fiscal"]].forEach(([a,t])=>{
    rectRedondo(x,a,yB,cw,hB,12); x.fillStyle="#fff"; x.fill(); x.strokeStyle="#EFD6D4"; x.stroke();
    x.fillStyle=COL.rojo; x.fillRect(a+12,yB,cw-24,6); x.fillStyle=COL.granate; x.font="800 24px "+DISP; x.fillText(t,a+22,yB+46); });
  let y=yB+88;
  (D.alternativas.length?D.alternativas:[["El modelo no encuentra palancas con mejora significativa.",""]]).forEach(([a,b],i)=>{
    x.fillStyle=COL.tinta; x.font="700 19px "+CUERPO; const ls=lineas(x,(D.alternativas.length?(i+1)+". ":"")+a,cw-44).slice(0,2);
    ls.forEach(l=>{ x.fillText(l,M+22,y); y+=25; });
    if(b){ x.fillStyle=COL.rojo; x.font="600 17px "+MONO; x.fillText(b,M+22,y); y+=34; } });
  const a2=M+cw+46; y=yB+92;
  x.fillStyle=COL.rojo; x.font="800 54px "+DISP; x.fillText(String(D.mad.indice),a2,y+8);
  const anchoIndice=x.measureText(String(D.mad.indice)).width;
  x.fillStyle="#6B5457"; x.font="600 17px "+MONO; x.fillText("DE 100 · NIVEL "+D.mad.nivel+" DE 5",a2+anchoIndice+18,y); y+=44;
  if(D.mad.pendientes[0]){ x.fillStyle=COL.tinta; x.font="700 19px "+CUERPO; lineas(x,"Siguiente paso: "+D.mad.pendientes[0].t,cw-66).slice(0,2).forEach(l=>{ x.fillText(l,a2,y); y+=25; }); }
  y+=14; x.strokeStyle="#EFD6D4"; x.beginPath(); x.moveTo(a2,y-16); x.lineTo(M+2*cw+2,y-16); x.stroke();
  D.fiscal.forEach(([k,v],i)=>{ const ult=i===D.fiscal.length-1;
    x.fillStyle=ult?COL.tinta:"#4A3A3C"; x.font=(ult?"800":"500")+" 18px "+CUERPO; x.fillText(k,a2,y+10);
    x.textAlign="right"; x.font=(ult?"800":"600")+" 18px "+MONO; x.fillText(v,M+2*cw+2,y+10); x.textAlign="left"; y+=34; });
  grecaLienzo(x,M,alto-74,W-2*M,9,COL.rosa);
  x.fillStyle="#6B5457"; x.font="400 15px "+CUERPO;
  x.fillText("Estimaciones bajo supuestos declarados; no constituyen asesoría financiera, fiscal ni legal. La estimación fiscal es orientativa.",M,alto-40);
  x.fillText("© 2026 Miguel Antonio Cruz García, Bruno Alejandro López Bautista y Alonso Arroyo Cortés · maikolv.github.io/coatl",M,alto-18);
  const nombreArchivo=D.c.conNombre?"COATL-"+D.titulo.normalize("NFD").replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-").slice(0,40)+".png":"COATL-escenario.png";
  cv.toBlob(blob=>{
    const a=document.createElement("a"); a.download=nombreArchivo;
    a.href=blob?URL.createObjectURL(blob):cv.toDataURL("image/png"); a.click();
    if(blob) setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  },"image/png");
});
