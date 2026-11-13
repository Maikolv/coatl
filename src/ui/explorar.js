/* ---------- 18. Recorrido exploratorio: widgets con pregunta, interacción y respuesta ----------
   Todos usan las MISMAS funciones del motor (derivar, modeloLogistico, curvaSupervivencia,
   rangoP, monteCarlo) sobre el escenario del formulario: para entradas equivalentes dan los
   mismos números que el simulador. Cada widget expone su estado en data-estado
   (cargando · listo · vacio · error) y su texto en #<id>-estado. */

const reduceMov = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function estadoWidget(id, estado, msj){
  const w=$(id); if(!w) return;
  w.dataset.estado=estado;
  const s=$(id+"-estado"); if(s) s.textContent = msj || ({cargando:"Calculando…", listo:"", vacio:"Sin datos para este escenario.", error:"No se pudo calcular; los demás resultados siguen disponibles."})[estado];
}
function seguro(id, fn){
  try{ const r=fn(); if(r!==false) estadoWidget(id,"listo"); }
  catch(err){ console.warn("COATL · widget "+id, err); estadoWidget(id,"error"); }
}
let ultimoEsc=null, ultimoModelo=null, ultimoMC=null, ultimoS=null;

/* ===== Inicio · widget demostrativo ===== */
function pintarDemo(){
  seguro("wDemo",()=>{
    if(!ultimoEsc) return false;
    const mu=+$("demoClientes").value;
    $("demoClientesV").textContent=mu;
    const e=derivar(Object.assign({},ultimoEsc,{mu}));
    const P=modeloLogistico(e).P;
    $("demoP").textContent=pct(P);
    $("demoU").textContent=mxn.format(Math.round(e.utilMes));
    $("demoPE").textContent=isFinite(e.peDia)?Math.ceil(e.peDia)+" clientes/día":"No alcanzable";
    const tope=200;
    $("demoBarra").style.width=Math.min(100,mu/tope*100)+"%";
    const pe=isFinite(e.peDia)?Math.min(100,e.peDia/tope*100):100;
    $("demoBarraPE").style.left=pe+"%";
    $("demoMarcaPE").style.left=pe+"%";
    $("demoBarra").classList.toggle("bajo-equilibrio", isFinite(e.peDia) && mu<e.peDia);
    $("demoAbrir").textContent="Abrir el simulador con "+mu+" clientes/día →";
  });
}
$("demoClientes").addEventListener("input",pintarDemo);
$("demoAbrir").addEventListener("click",()=>{
  $("clientes").value=$("demoClientes").value;
  calcular();
  irA("simulador");
  $("clientes").focus({preventScroll:true});
  toast("Simulador abierto con "+$("clientes").value+" clientes/día.");
});

/* ===== Inicio · mapa 2.5D con las formas reales de las zonas ===== */
/* Toma las mismas formas del mapa del equipo (#mapaEsquema), las proyecta en perspectiva
   oblicua y las extruye: altura = P a 3 años, escala explícita (100 % = ESC_Z px, regla de
   50 % rotulada). La superficie de cada zona lleva su foto real (Wikimedia Commons). */
let zona25=null;
const ESC_Z=105, OBL={sx:-0.5, sy:0.58, ox:165, oy:150};
const ORDEN25=["periferia","heroes","centro","flores","corredor","popular"];   // de fondo a frente
const ANCLA25={periferia:[390,122],heroes:[206,206],centro:[398,206],flores:[590,204],corredor:[300,286],popular:[212,350]};
const proy=(x,y,z)=>[x+OBL.sx*y+OBL.ox, OBL.sy*y+OBL.oy-z];
const matriz=z=>"matrix(1 0 "+OBL.sx+" "+OBL.sy+" "+OBL.ox+" "+(OBL.oy-z).toFixed(1)+")";
function aclarar(rgb,k){const m=/rgb\((\d+),(\d+),(\d+)\)/.exec(rgb); if(!m) return rgb;
  return "rgb("+[1,2,3].map(i=>Math.max(0,Math.min(255,Math.round(+m[i]*k)))).join(",")+")";}
function cajaPath(d){ const n=(d.match(/-?\d+(\.\d+)?/g)||[]).map(Number), xs=n.filter((_,i)=>i%2===0), ys=n.filter((_,i)=>i%2===1);
  return {x:Math.min(...xs), y:Math.min(...ys), w:Math.max(...xs)-Math.min(...xs), h:Math.max(...ys)-Math.min(...ys)}; }
function svgIsometrico(){
  const formas={}; ORDEN25.forEach(k=>{const p=$("mz-"+k); if(p) formas[k]=p.getAttribute("d")});
  const defs=ORDEN25.filter(k=>formas[k]&&FOTOS_ZONAS[k]).map(k=>{const c=cajaPath(formas[k]);
    return '<pattern id="foto25-'+k+'" patternUnits="userSpaceOnUse" x="'+c.x+'" y="'+c.y+'" width="'+c.w+'" height="'+c.h+'"><image href="'+FOTOS_ZONAS[k].src+'" width="'+c.w+'" height="'+c.h+'" preserveAspectRatio="xMidYMid slice"/></pattern>'}).join("");
  const sierra="M368,312 L706,316 Q690,374 636,416 Q518,440 398,410 Q374,364 368,312 Z";
  let capas='<path d="'+sierra+'" transform="'+matriz(0)+'" class="suelo25"/>';
  ORDEN25.forEach(k=>{
    const d=datosMapa.find(x=>x.k===k); if(!d||!formas[k]) return;
    const z=d.P*ESC_Z, col=colorP(d.P), sel=k===zona25, act=k===escZonaActual;
    let muros=""; for(let t=0;t<z;t+=2.5) muros+='<path d="'+formas[k]+'" transform="'+matriz(t)+'" fill="'+aclarar(col,0.42+0.3*t/Math.max(z,1))+'"/>';
    capas+='<g data-zona="'+k+'" class="zona25'+(sel?" sel":"")+(act?" actual":"")+'"><title>'+d.z.n+': '+pct(d.P)+'</title>'+
      '<path d="'+formas[k]+'" transform="'+matriz(-3)+'" class="sombra25"/>'+muros+
      '<path d="'+formas[k]+'" transform="'+matriz(z)+'" fill="url(#foto25-'+k+')" class="foto25"/>'+
      '<path d="'+formas[k]+'" transform="'+matriz(z)+'" fill="'+col+'" class="tinte25"/>'+
      '<path d="'+formas[k]+'" transform="'+matriz(z)+'" class="borde25"/></g>';
  });
  const rot=ORDEN25.map(k=>{const d=datosMapa.find(x=>x.k===k); if(!d) return ""; const [x,y]=proy(ANCLA25[k][0],ANCLA25[k][1],d.P*ESC_Z);
    return '<g class="rot25" data-zona="'+k+'"><text x="'+x.toFixed(1)+'" y="'+(y-6).toFixed(1)+'" class="rot-z">'+CORTOS[k]+'</text><text x="'+x.toFixed(1)+'" y="'+(y+10).toFixed(1)+'" class="rot-p">'+pct(d.P)+'</text></g>'}).join("");
  const [ex,ey]=proy(735,330,0);
  const regla='<g class="escala"><line x1="'+ex+'" y1="'+ey+'" x2="'+ex+'" y2="'+(ey-ESC_Z*.5)+'"/><line x1="'+(ex-4)+'" y1="'+(ey-ESC_Z*.5)+'" x2="'+(ex+4)+'" y2="'+(ey-ESC_Z*.5)+'"/><text x="'+(ex+7)+'" y="'+(ey-ESC_Z*.25+3)+'">50 %</text></g>';
  return '<svg viewBox="40 30 760 360" class="iso" preserveAspectRatio="xMidYMid meet"><defs>'+defs+'</defs>'+capas+rot+regla+
    '<text x="795" y="384" class="nota" text-anchor="end">altura = P a 3 años · formas del esquema del equipo, no catastrales · N ↑</text></svg>';
}
function pintarMapa25(){
  seguro("wMapa",()=>{
    if(!datosMapa.length) { estadoWidget("wMapa","vacio"); return false; }
    if(!zona25 || !ZONAS[zona25]) zona25=escZonaActual;
    $("mapa25").innerHTML=svgIsometrico();
    $("mapa25").querySelectorAll("g[data-zona]").forEach(g=>g.addEventListener("click",()=>elegirZona25(g.dataset.zona)));
    pintarPostal(zona25);
    const lista=$("mapa25Lista");
    lista.innerHTML=[...datosMapa].sort((a,b)=>b.P-a.P).map(d=>
      '<li role="option" id="z25-'+d.k+'" data-zona="'+d.k+'" aria-selected="'+(d.k===zona25)+'"><span class="punto" data-color="'+colorP(d.P)+'"></span>'+CORTOS[d.k]+'<span class="rp">'+pct(d.P)+'</span></li>').join("");
    lista.querySelectorAll(".punto[data-color]").forEach(s=>{s.style.background=s.dataset.color});
    lista.setAttribute("aria-activedescendant","z25-"+zona25);
    pintarFicha25();
  });
}
function elegirZona25(k){ zona25=k; pintarMapa25(); }
function pintarFicha25(){
  const d=datosMapa.find(x=>x.k===zona25); if(!d) return;
  const f=FOTOS_ZONAS[d.k];
  $("mapa25Ficha").innerHTML=(f?'<figure class="foto-cita ficha-foto"><img src="'+f.src+'" alt="Vista de '+d.z.n+'" loading="lazy"><figcaption><a href="'+f.pagina+'" target="_blank" rel="noopener">'+f.autor+'</a> · <a href="'+f.licenciaUrl+'" target="_blank" rel="noopener">'+f.licencia+'</a></figcaption></figure>':'')+'<div class="ficha-datos"><h3>'+d.z.n+'</h3><dl>'+
    '<div><dt>P a 3 años (este negocio aquí)</dt><dd>'+pct(d.P)+' <span class="proc proc-modelo">resultado del modelo</span></dd></div>'+
    '<div><dt>Utilidad mensual esperada</dt><dd>'+mxn.format(Math.round(d.util))+' <span class="proc proc-modelo">resultado del modelo</span></dd></div>'+
    '<div><dt>Afluencia relativa</dt><dd>'+d.z.afl.toFixed(2)+' (1.00 = promedio) <span class="proc proc-supuesto">estimación del equipo</span></dd></div>'+
    '<div><dt>Renta de referencia</dt><dd>$'+d.z.rm2+'/m²·mes <span class="proc proc-supuesto">estimación del equipo</span></dd></div>'+
    '<div><dt>Ajuste β de la zona</dt><dd>'+(d.z.z>0?"+":"")+d.z.z.toFixed(2)+' <span class="proc proc-supuesto">estimación del equipo</span></dd></div></dl></div>';
  $("mapa25Abrir").textContent=d.k===escZonaActual?"Esta ya es la zona del simulador ↓":"Abrir el simulador en "+CORTOS[d.k]+" →";
}
$("mapa25Lista").addEventListener("click",ev=>{const li=ev.target.closest("li[data-zona]"); if(li) elegirZona25(li.dataset.zona)});
$("mapa25Lista").addEventListener("keydown",ev=>{
  const orden=[...$("mapa25Lista").querySelectorAll("li[data-zona]")].map(li=>li.dataset.zona);
  let i=orden.indexOf(zona25);
  if(ev.key==="ArrowDown"||ev.key==="ArrowRight") i=Math.min(orden.length-1,i+1);
  else if(ev.key==="ArrowUp"||ev.key==="ArrowLeft") i=Math.max(0,i-1);
  else if(ev.key==="Home") i=0; else if(ev.key==="End") i=orden.length-1;
  else if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();$("mapa25Abrir").click();return}
  else return;
  ev.preventDefault(); elegirZona25(orden[i]);
});
$("mapa25Abrir").addEventListener("click",()=>{
  if(zona25 && zona25!==escZonaActual) irAZona(zona25);
  irA("simulador");
});

function pintarPostal(k){
  const el=$("demoPostal"), f=FOTOS_ZONAS[k]; if(!el||!f) return;
  el.innerHTML='<img src="'+f.src+'" alt="Vista de '+ZONAS[k].n+'" loading="lazy"><span class="postal-zona">'+ZONAS[k].n+'</span><figcaption><a href="'+f.pagina+'" target="_blank" rel="noopener">'+f.autor+'</a> · <a href="'+f.licenciaUrl+'" target="_blank" rel="noopener">'+f.licencia+'</a></figcaption>';
}

/* ===== Simulador · escenario vigente y restablecer ===== */
function marcarPendiente(){
  const v=$("escVigente"); if(!v) return;
  v.dataset.estado="pendiente";
  $("evEstado").textContent=ultimoEsc?"Recalculando… se muestra la última simulación válida":"Recalculando…";
}
function marcarVigente(e){
  const v=$("escVigente"); if(!v) return;
  v.dataset.estado="vigente";
  $("evEstado").textContent="Escenario vigente";
  $("evNombre").textContent=e.giro.n+" · "+CORTOS[e.zonaKey]+" · "+Math.round(e.muBase||e.mu)+" clientes/día";
  $("evHora").textContent="calculado "+new Date().toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
}
$("restablecer").addEventListener("click",()=>{
  $("forma").reset();
  /* Las opciones de giro y zona se crean por JS: reset() las deja en la primera; se fijan a la referencia. */
  $("giro").value="cafeteria"; $("zona").value="heroes"; $("giro").dispatchEvent(new Event("change"));
  ["inversion","credito","cvar","merma","ajustePrecio"].forEach(id=>$(id).dispatchEvent(new Event("input")));
  history.replaceState(null,"",location.pathname);
  calcular();
  toast("Escenario de referencia restablecido (Cafetería · Los Héroes).");
});

/* ===== Resultados · supervivencia por año con capas ===== */
function pintarSupervivencia(){
  seguro("wSup",()=>{
    if(!ultimoS) return false;
    const t=+$("supAnio").value, rp=rangoP(ultimoModelo);
    const sb=curvaSupervivencia(rp.p05), sa=curvaSupervivencia(rp.p95);
    $("supAnioV").textContent=t;
    $("supCapas").innerHTML=
      '<div class="capa25 contexto" data-v="'+S0[t]+'"><span>Nacional (INEGI)</span><b>'+pct(S0[t])+'</b></div>'+
      '<div class="capa25 banda" data-a="'+sb[t]+'" data-b="'+sa[t]+'"><span>Sensibilidad P5–P95</span><b>'+pct(sb[t])+' – '+pct(sa[t])+'</b></div>'+
      '<div class="capa25 resultado" data-v="'+ultimoS[t]+'"><span>Tu escenario</span><b>'+pct(ultimoS[t])+'</b></div>';
    $("supCapas").querySelectorAll(".capa25[data-v]").forEach(c=>c.style.setProperty("--v",(+c.dataset.v*100).toFixed(1)));
    const b=$("supCapas").querySelector(".banda"); b.style.setProperty("--a",(sb[t]*100).toFixed(1)); b.style.setProperty("--b",(sa[t]*100).toFixed(1));
    $("supTabla").innerHTML='<caption class="sr-only">Supervivencia por año</caption><thead><tr><th scope="col">Año</th><th scope="col">Tu escenario</th><th scope="col">P5–P95</th><th scope="col">Nacional</th></tr></thead><tbody>'+
      [1,2,3,5,10].map(a=>'<tr'+(a===t?' class="actual"':"")+'><th scope="row">'+a+'</th><td>'+pct(ultimoS[a])+'</td><td>'+pct(sb[a])+'–'+pct(sa[a])+'</td><td>'+pct(S0[a])+'</td></tr>').join("")+"</tbody>";
  });
}
$("supAnio").addEventListener("input",pintarSupervivencia);

/* ===== Resultados · Monte Carlo: probabilidad de superar una meta (ECDF) ===== */
function pintarMeta(){
  seguro("wMC",()=>{
    if(!ultimoMC || !ultimoMC.res.length) return false;
    if(!metaTocada) $("mcMeta").value=Math.round(ultimoMC.p50/10000)*10000;   // arranca en la mediana simulada
    const r=ultimoMC.res, n=r.length, meta=Number($("mcMeta").value);
    if(!Number.isFinite(meta)){ estadoWidget("wMC","vacio","Escribe una meta numérica en pesos."); return false; }
    let k=0; while(k<n && r[k]<=meta) k++;
    const prob=(n-k)/n;
    $("mcRespuesta").textContent="En "+(n-k).toLocaleString("es-MX")+" de "+n.toLocaleString("es-MX")+" años simulados ("+pct(prob)+") la utilidad anual supera "+mxn.format(meta)+".";
    const lo=r[0], hi=r[n-1], W=320, H=150, px=v=>20+(v-lo)/((hi-lo)||1)*(W-30), py=q=>H-20-q*(H-35);
    let d="M"+px(lo)+","+py(1);
    for(let i=0;i<n;i+=20) d+=" L"+px(r[i]).toFixed(1)+","+py(1-i/n).toFixed(1);
    d+=" L"+px(hi)+","+py(0);
    const mx=Math.max(20,Math.min(W-10,px(meta)));
    $("mcEcdf").innerHTML='<title>Probabilidad de superar cada nivel de utilidad anual</title>'+
      '<line x1="20" y1="'+(H-20)+'" x2="'+(W-10)+'" y2="'+(H-20)+'" class="eje"/><line x1="20" y1="15" x2="20" y2="'+(H-20)+'" class="eje"/>'+
      '<path d="'+d+'" class="curva"/>'+
      '<line x1="'+mx+'" y1="15" x2="'+mx+'" y2="'+(H-20)+'" class="meta"/>'+
      '<circle cx="'+mx+'" cy="'+py(prob)+'" r="4" class="punto-meta"/>'+
      '<text x="22" y="12" class="rot">P(U &gt; meta)</text><text x="'+(W-10)+'" y="'+(H-5)+'" text-anchor="end" class="rot">utilidad anual →</text>'+
      '<text x="'+mx+'" y="'+(H-6)+'" text-anchor="middle" class="rot">meta</text>';
  });
}
let metaTocada=false;
$("mcMeta").addEventListener("input",()=>{metaTocada=true;pintarMeta()});

/* ===== Resultados · superficie de sensibilidad 2.5D (dos supuestos a la vez) ===== */
const EJES={
  mu:{n:"Clientes por día", u:"clientes/día", get:e=>e.mu, set:(e,v)=>{e.mu=Math.max(1,v)}, fmt:v=>Math.round(v)},
  ticket:{n:"Ticket promedio", u:"MXN", get:e=>e.ticket, set:(e,v)=>{e.ticket=Math.max(1,v)}, fmt:v=>"$"+Math.round(v)},
  cv:{n:"Costo variable", u:"%", get:e=>e.cv*100, set:(e,v)=>{e.cv=Math.min(.9,Math.max(.05,v/100))}, fmt:v=>v.toFixed(0)+" %"},
  renta:{n:"Renta mensual", u:"MXN", get:e=>e.renta, set:(e,v)=>{e.renta=Math.max(0,v)}, fmt:v=>"$"+Math.round(v).toLocaleString("es-MX")}
};
const NSUP=9;
let celdaSel=null, supLeer=null;
/* Delegación: un solo manejador para las 81 celdas (antes 3 por celda; costaba ~360 ms en móvil lento). */
$("supRejilla").addEventListener("click",ev=>{const c=ev.target.closest(".celda25"); if(c&&supLeer){supLeer(c);c.focus()}});
$("supRejilla").addEventListener("focusin",ev=>{const c=ev.target.closest(".celda25"); if(c&&supLeer) supLeer(c)});
$("supRejilla").addEventListener("keydown",ev=>{
  const c=ev.target.closest(".celda25"); if(!c) return;
  const mov={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[ev.key]; if(!mov) return;
  ev.preventDefault();
  const ni=Math.max(0,Math.min(NSUP-1,+c.dataset.i+mov[0])), nj=Math.max(0,Math.min(NSUP-1,+c.dataset.j+mov[1]));
  const sig=$("supRejilla").querySelector('.celda25[data-i="'+ni+'"][data-j="'+nj+'"]');
  c.tabIndex=-1; sig.tabIndex=0; sig.focus();
});
function valoresEje(base){ const v=[]; for(let i=0;i<NSUP;i++) v.push(base*(0.6+0.8*i/(NSUP-1))); return v; }
function evaluar(ex,vx,ey,vy){
  const c=Object.assign({},ultimoEsc); EJES[ex].set(c,vx); EJES[ey].set(c,vy); derivar(c);
  return {P:modeloLogistico(c).P, U:c.utilMes};
}
function pintarSuperficie(){
  seguro("wSuperficie",()=>{
    if(!ultimoEsc) return false;
    let ex=$("supEjeX").value, ey=$("supEjeY").value;
    if(ex===ey){ estadoWidget("wSuperficie","vacio","Elige dos supuestos distintos para los ejes."); $("supRejilla").innerHTML=""; return false; }
    if(ultimoEsc.propio && (ex==="renta"||ey==="renta")){ estadoWidget("wSuperficie","vacio","Con local propio la renta es 0: elige otro supuesto."); $("supRejilla").innerHTML=""; return false; }
    const salida=$("supSalida").value, X=valoresEje(EJES[ex].get(ultimoEsc)), Y=valoresEje(EJES[ey].get(ultimoEsc));
    const val=Y.map(vy=>X.map(vx=>evaluar(ex,vx,ey,vy)[salida]));
    const plano=val.flat(), mn=Math.min(...plano), mxv=Math.max(...plano);
    const fmt=v=>salida==="P"?pct(v):mxn.format(Math.round(v));
    const rej=$("supRejilla");
    rej.style.setProperty("--n",NSUP);
    rej.innerHTML=[...Y.keys()].reverse().map(j=>'<div role="row">'+X.map((vx,i)=>{
      const v=val[j][i], k=(mxv-mn)?(v-mn)/(mxv-mn):0.5, centro=(i===4&&j===4);
      return '<button type="button" role="gridcell" class="celda25'+(centro?" centro":"")+'" data-i="'+i+'" data-j="'+j+'" data-k="'+k.toFixed(3)+'" tabindex="'+(centro?0:-1)+'" aria-label="'+EJES[ex].n+' '+EJES[ex].fmt(vx)+', '+EJES[ey].n+' '+EJES[ey].fmt(Y[j])+': '+fmt(v)+'"></button>';
    }).join("")+"</div>").join("");
    rej.querySelectorAll(".celda25").forEach(c=>{
      const k=+c.dataset.k; c.style.setProperty("--k",k); c.style.setProperty("--color",salida==="P"?colorP(val[+c.dataset.j][+c.dataset.i]):colorP(0.04+0.89*k));
    });
    const leer=c=>{
      const i=+c.dataset.i, j=+c.dataset.j; celdaSel=[i,j];
      const prev=rej.querySelector(".celda25.sel"); if(prev) prev.classList.remove("sel"); c.classList.add("sel");
      $("supLectura").textContent=EJES[ex].n+" = "+EJES[ex].fmt(X[i])+" ("+EJES[ex].u+") y "+EJES[ey].n+" = "+EJES[ey].fmt(Y[j])+" ("+EJES[ey].u+") → "+($("supSalida").selectedOptions[0].text)+": "+fmt(val[j][i])+".";
      $("supCorte").innerHTML='<caption>Corte en '+EJES[ey].n.toLowerCase()+' = '+EJES[ey].fmt(Y[j])+'</caption><thead><tr><th scope="col">'+EJES[ex].n+'</th><th scope="col">'+$("supSalida").selectedOptions[0].text+'</th></tr></thead><tbody>'+
        X.map((vx,ii)=>'<tr'+(ii===i?' class="actual"':"")+'><th scope="row">'+EJES[ex].fmt(vx)+'</th><td>'+fmt(val[j][ii])+'</td></tr>').join("")+"</tbody>";
    };
    supLeer=leer;
    const [ci,cj]=celdaSel&&celdaSel[0]<NSUP?celdaSel:[4,4];
    leer(rej.querySelector('.celda25[data-i="'+ci+'"][data-j="'+cj+'"]'));
  });
}
["supSalida","supEjeX","supEjeY"].forEach(id=>$(id).addEventListener("change",()=>{celdaSel=null;pintarSuperficie()}));
$("supPlano").addEventListener("change",()=>$("supEscena").classList.toggle("plana",$("supPlano").checked));
if(reduceMov()){ $("supPlano").checked=true; $("supEscena").classList.add("plana"); }

/* ===== Metodología · trazabilidad del resultado a su fuente ===== */
const TRAZA=[
  {id:"P", r:"Probabilidad a 3 años (P)", v:()=>ultimoModelo?pct(ultimoModelo.P):"—", formula:"P = 1/(1+e^(−z)), z = β₀ + Σβᵢxᵢ",
   vars:"Giro, zona, experiencia, reserva, competencia, formalidad, marketing, deuda, local, margen de seguridad, modelo de negocio, permisos, modalidad, horario",
   fuente:"β₀: INEGI, Demografía de los Negocios (tabla 1989–2019, S₀(3) = 0.426)", periodo:"1989–2019", tipo:"resultado", sup:"Los βᵢ son estimación del equipo", url:"https://www.inegi.org.mx/contenidos/programas/dn/2021/doc/Nota_Demo_Negocios.pdf"},
  {id:"rango", r:"Rango plausible de P (P5–P95)", v:()=>ultimoModelo?pct(rangoP(ultimoModelo).p05)+" – "+pct(rangoP(ultimoModelo).p95):"—", formula:"βᵢ·(1+0.30ε), β₀+0.15ε; 1,000 sorteos",
   vars:"Los mismos βᵢ del modelo logístico", fuente:"Análisis de sensibilidad del equipo (no es un intervalo muestral)", periodo:"—", tipo:"resultado", sup:"Desviaciones de 30 % y 0.15: estimación del equipo", url:""},
  {id:"S", r:"Curva de supervivencia S(t)", v:()=>ultimoS?"S(5) = "+pct(ultimoS[5]):"—", formula:"S(t) = S₀(t)^h, h = ln P / ln S₀(3)",
   vars:"P y la tabla nacional S₀(t)", fuente:"INEGI, tabulado nacional de supervivencia (t = 1…10)", periodo:"1989–2019", tipo:"dato oficial + supuesto", sup:"Tabla nacional aplicada a Coacalco sin ajuste municipal", url:"https://www.inegi.org.mx/contenidos/programas/dn/2019/tabulados/Nal_Tot_CE2019.xlsx"},
  {id:"U", r:"Utilidad mensual esperada", v:()=>ultimoEsc?mxn.format(Math.round(ultimoEsc.utilMes)):"—", formula:"U = μ·días·t̄·(1−cv′) − CF",
   vars:"Clientes/día, días, ticket, costo variable + merma, renta, nómina, otros fijos, marketing, intereses", fuente:"Entradas del usuario; ticket y CV por giro como valor inicial", periodo:"Mes típico", tipo:"resultado", sup:"Ticket, CV y demanda por giro: estimación del equipo", url:""},
  {id:"MC", r:"Utilidad anual P5 · P50 · P95", v:()=>ultimoMC?mxn.format(Math.round(ultimoMC.p05))+" · "+mxn.format(Math.round(ultimoMC.p50))+" · "+mxn.format(Math.round(ultimoMC.p95)):"—", formula:"2,000 años; F ~ LogN; clientes ~ N(μF,(0.22μF)²); ticket ~ N(t̄,(0.08t̄)²)",
   vars:"Utilidad, estacionalidad, crecimiento g", fuente:"Simulación Monte Carlo (mulberry32, semilla 20262)", periodo:"12 meses", tipo:"resultado", sup:"σ de 22 %, 8 %, 15 % y 2 pp: estimación del equipo", url:""},
  {id:"VPN", r:"VPN a 3 años", v:()=>ultimoEsc&&ultimoMC&&ultimoS?mxn.format(Math.round(finanzas(ultimoEsc,ultimoMC,ultimoS).vpn)):"—", formula:"VPN = −I₀ + Σ S(t)·Uₜ/(1+r)ᵗ",
   vars:"Inversión, tasa de descuento r, crecimiento g, inflación π, S(t)", fuente:"Entradas del usuario + S(t)", periodo:"3 años", tipo:"resultado", sup:"Antes de impuestos; sin valor terminal", url:""},
  {id:"sector", r:"Distribución sectorial", v:()=>"45.9 % comercio al por menor", formula:"Conteo de establecimientos por SCIAN / total",
   vars:"11,554 establecimientos de Coacalco", fuente:"INEGI, DENUE 05/2026", periodo:"Mayo 2026 (descarga 12-nov-2026)", tipo:"dato oficial", sup:"—", url:"https://www.inegi.org.mx/app/mapa/denue/"},
  {id:"pob", r:"Población de Coacalco", v:()=>"293,444", formula:"—", vars:"—", fuente:"INEGI, Censo de Población y Vivienda", periodo:"2020", tipo:"dato oficial", sup:"—", url:"https://www.inegi.org.mx/programas/ccpv/2020/"},
  {id:"zona", r:"Afluencia y renta por zona", v:()=>ultimoEsc?ultimoEsc.zona.afl.toFixed(2)+" · $"+ultimoEsc.zona.rm2+"/m²":"—", formula:"μ_zona = μ·afl_zona/afl_actual; renta = rm2·m²",
   vars:"Zona y superficie", fuente:"Sin fuente oficial (el DENUE no mide afluencia ni rentas)", periodo:"—", tipo:"supuesto", sup:"Estimación del equipo, editable", url:""}
];
let trazaSel="P";
function pintarTraza(){
  seguro("wTraza",()=>{
    const l=$("trazaLista");
    l.innerHTML=TRAZA.map(t=>'<li role="option" id="tz-'+t.id+'" data-id="'+t.id+'" aria-selected="'+(t.id===trazaSel)+'"><span>'+t.r+'</span><b>'+t.v()+'</b></li>').join("");
    l.setAttribute("aria-activedescendant","tz-"+trazaSel);
    const t=TRAZA.find(x=>x.id===trazaSel);
    const enlace=t.url?' <a href="'+t.url+'" target="_blank" rel="noopener">abrir fuente ↗</a>':"";
    $("trazaRuta").innerHTML='<ol class="traza-pasos">'+
      '<li><span class="paso">Resultado</span><strong>'+t.r+'</strong> = '+t.v()+'</li>'+
      '<li><span class="paso">Fórmula</span><code>'+t.formula+'</code></li>'+
      '<li><span class="paso">Variables</span>'+t.vars+'</li>'+
      '<li><span class="paso">Fuente</span>'+t.fuente+enlace+'</li>'+
      '<li><span class="paso">Periodo</span>'+t.periodo+'</li>'+
      '<li><span class="paso">Supuesto</span>'+t.sup+' <span class="proc proc-'+(t.tipo==="dato oficial"?"oficial":t.tipo==="supuesto"?"supuesto":"modelo")+'">'+t.tipo+'</span></li></ol>';
  });
}
$("trazaLista").addEventListener("click",ev=>{const li=ev.target.closest("li[data-id]"); if(li){trazaSel=li.dataset.id;pintarTraza()}});
$("trazaLista").addEventListener("keydown",ev=>{
  const ids=TRAZA.map(t=>t.id); let i=ids.indexOf(trazaSel);
  if(ev.key==="ArrowDown") i=Math.min(ids.length-1,i+1); else if(ev.key==="ArrowUp") i=Math.max(0,i-1);
  else if(ev.key==="Home") i=0; else if(ev.key==="End") i=ids.length-1; else return;
  ev.preventDefault(); trazaSel=ids[i]; pintarTraza();
});

/* Punto de entrada desde calcular() (tarea diferida, después del mapa). */
function pintarExplorar(e,modelo,mc,S){
  ultimoEsc=e; ultimoModelo=modelo; ultimoMC=mc; ultimoS=S;
  if(!tVivo && !solicitudCalculo) marcarVigente(e);
  if(document.activeElement!==$("demoClientes")) $("demoClientes").value=Math.round(e.muBase||e.mu);
  pintarDemo(); pintarMapa25(); pintarSupervivencia(); pintarMeta(); pintarSuperficie(); pintarTraza();
}
