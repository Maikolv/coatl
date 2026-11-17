/* ---------- 12. Dinámica: aviso, dado y cálculo en vivo ---------- */
let tToast=null;
function toast(msj){
  const t=$("toastCOATL"); t.textContent=msj; t.classList.add("activa");
  clearTimeout(tToast); tToast=setTimeout(()=>t.classList.remove("activa"),2800);
}
const ALE=a=>a[Math.floor(Math.random()*a.length)];
function aleSelect(id){const s=$(id);s.selectedIndex=Math.floor(Math.random()*s.options.length)}
$("dado").addEventListener("click",()=>{
  const ic=document.querySelector("#dado .ic");
  ic.classList.remove("gira"); void ic.offsetWidth; ic.classList.add("gira");
  $("giro").value=ALE(Object.keys(GIROS)); $("giro").dispatchEvent(new Event("change"));
  $("zona").value=ALE(Object.keys(ZONAS));
  ["experiencia","formalidad","marketing","competencia","reserva","local","dias","estacionalidad"].forEach(aleSelect);
  $("empleados").value=Math.floor(Math.random()*6);
  $("superficie").value=20+5*Math.floor(Math.random()*33);
  $("inversion").value=10000*Math.round((80000+Math.random()*1420000)/10000);
  $("vInversion").textContent=mxn.format(+$("inversion").value);
  $("credito").value=5*Math.floor(Math.random()*15);
  $("vCredito").textContent=$("credito").value+"%";
  $("tasa").value=18+Math.round(Math.random()*18);
  $("otrosFijos").value=500*Math.round((3000+Math.random()*9000)/500);
  $("merma").value=(Math.round(Math.random()*16)/2).toFixed(1);
  $("vMerma").textContent=(+$("merma").value)+"%";
  $("mktGasto").value=250*Math.round(Math.random()*20);
  $("crecimiento").value=Math.round(Math.random()*40)/2;
  $("inflacion").value=(3+Math.round(Math.random()*8)/2).toFixed(1);
  $("sugerirRenta").click(); $("sugerirClientes").click();
  calcular();
  toast("🎲 Escenario sorpresa generado: revisa qué variables lo hacen fuerte o frágil.");
});
let tVivo=null;
/* Indicador «cálculo listo» para quien automatiza o prueba el sitio: <html data-calculo="pendiente|listo">.
   Pasa a «listo» cuando terminó el cálculo de la última versión, se pintaron todos los apartados y acabó la
   animación del contador; data-calculo-version cuenta los cálculos terminados. */
function estadoCalculo(estado){ document.documentElement.dataset.calculo=estado; }
estadoCalculo("pendiente");
["input","change"].forEach(ev=>$("forma").addEventListener(ev,()=>{
  solicitudCalculo=null;
  estadoCalculo("pendiente");
  marcarPendiente();
  clearTimeout(tVivo); tVivo=setTimeout(calcular,220);
}));

/* ---------- 13. Transiciones de aparición al hacer scroll ---------- */
(function revelar(){
  const sel=".cifra,.panel,.metodo,.limitaciones,.seccion>.folio,.seccion>.titulo,.seccion>.intro,.intro-flex>.intro,.ilustracion";
  const els=[...document.querySelectorAll(sel)];
  const porPadre=new Map();
  els.forEach(el=>{
    el.classList.add("revela");
    const n=porPadre.get(el.parentElement)||0;
    el.style.transitionDelay=Math.min(n*70,350)+"ms";
    porPadre.set(el.parentElement,n+1);
  });
  const io=new IntersectionObserver(entradas=>entradas.forEach(en=>{
    if(en.isIntersecting){en.target.classList.add("visible");io.unobserve(en.target)}
  }),{threshold:.12,rootMargin:"0px 0px -40px 0px"});
  els.forEach(e=>io.observe(e));
})();

/* ---------- 13b. Motor FODA y plan de acción en tiempo real ---------- */
/* Cada palanca: clona el escenario, mejora UNA variable, vuelve a correr el
   modelo y mide el salto real de probabilidad (ΔP). Es análisis de
   sensibilidad honesto convertido en recomendaciones accionables. */
function probDe(e2){ return modeloLogistico(derivar(e2)).P; }
/* Las palancas usan β que son asociación (giro, zona y formalidad, medidos con datos) o supuesto del
   equipo, nunca efecto causal probado: el plan cuenta solo la MITAD del salto que da el modelo. */
const FACTOR_PLAN=0.5;
const EVIDENCIA_PALANCA={formalidad:"Asociación medida con datos (ENOE)", zona:"Asociación medida con datos (DENUE)"};
function evidenciaPalanca(clave){ return EVIDENCIA_PALANCA[clave]||"Supuesto del equipo"; }
function efectoPlan(P0, P1){ return P0+Math.max(0,P1-P0)*FACTOR_PLAN; }
function pPlan(e, lista, P0){ return lista.length?efectoPlan(P0, probDe(aplicarPalancas(e,lista))):P0; }
function clon(e){ return Object.assign({}, e); }

function palancas(e, P0){
  const L=[];
  // 1 · Reserva de capital de trabajo
  if(e.resZ < 0.20){
    const c=clon(e); c.resZ=0.20;
    L.push({clave:"reserva", titulo:"Construir 6 meses de capital de trabajo",
      que:"Aparta una reserva líquida equivalente a medio año de gastos fijos antes de operar al límite.",
      base:"El <b>JPMorgan Chase Institute</b> halló que el negocio pequeño mediano sostiene apenas ~27 días de liquidez; quienes acumulan reservas mayores resisten los choques de flujo de efectivo, principal causa de cierre temprano.",
      tasa:"−50% riesgo de cierre por iliquidez", P:probDe(c)});
  }
  // 2 · Desapalancar
  if(e.credPct >= 0.30){
    const c=clon(e); c.credPct=0.15;
    L.push({clave:"deuda", titulo:"Reducir el apalancamiento por debajo del 30%",
      que:"Financia una mayor parte con capital propio o reinversión; baja el porcentaje a crédito y renegocia la tasa.",
      base:"La carga financiera fija convierte cualquier caída de ventas en pérdida. La literatura de demografía de negocios asocia el alto apalancamiento con mayor mortalidad temprana.",
      tasa:"Menor costo fijo mensual", P:probDe(c)});
  }
  // 3 · Margen de contribución (costo variable / proveedores / precio)
  if(e.cv > 0.40){
    const c=clon(e); c.cv=Math.max(0.30, e.cv-0.10);
    L.push({clave:"margen", titulo:"Subir el margen: renegociar proveedores o ajustar precio",
      que:"Negocia compras por volumen, reduce mermas o ajusta el precio para bajar el costo variable ~10 puntos.",
      base:"Cada punto de margen de contribución reduce el punto de equilibrio y amplía el margen de seguridad financiero, que el modelo penaliza fuertemente cuando es bajo.",
      tasa:"Punto de equilibrio más bajo", P:probDe(c)});
  }
  // 4 · Marketing digital
  if(e.mktZ < 0.12){
    const c=clon(e); c.mktZ=0.12; c.mu=Math.round(e.mu*1.12);
    L.push({clave:"marketing", titulo:"Activar marketing digital (redes + WhatsApp Business)",
      que:"Pasa de presencia orgánica básica a una estrategia activa con pauta local y catálogo en WhatsApp Business.",
      base:"El comercio electrónico en México creció más de <b>20% anual</b> (AMVO); una presencia digital activa amplía el alcance a un costo de adquisición bajo frente a medios tradicionales.",
      tasa:"+12% alcance de clientes", P:probDe(c)});
  }
  // 5 · Formalización
  if(e.formZ < 0.10){
    const c=clon(e); c.formZ=0.10;
    L.push({clave:"formalidad", titulo:"Formalizarte ante SAT e IMSS desde el inicio",
      que:"Regístrate formalmente: habilita facturación, acceso a crédito y proveedores y clientes empresariales.",
      base:"Datos del <b>INEGI</b> (Demografía de los Negocios) muestran que los negocios formales viven más que los informales y acceden a financiamiento que los informales no alcanzan.",
      tasa:"Mayor esperanza de vida del negocio", P:probDe(c)});
  }
  // 6 · Retención de clientes
  {
    const c=clon(e); c.mu=Math.round(e.mu*1.07); c.cv=Math.max(0.05, e.cv-0.01);
    const pc=probDe(c);
    if(pc>P0+0.001) L.push({clave:"retencion", titulo:"Programa de fidelización y recompra",
      que:"Tarjeta de lealtad, seguimiento por WhatsApp y atención post-venta para elevar la frecuencia de compra.",
      base:"<b>Bain & Company</b> (Reichheld): aumentar la retención de clientes un 5% puede elevar las utilidades entre <b>25% y 95%</b>; retener cuesta 5–7× menos que adquirir.",
      tasa:"+25% a +95% en utilidades", P:pc});
  }
  // 7 · Mejor zona (del mapa)
  if(typeof datosMapa!=="undefined" && datosMapa.length){
    const mejor=[...datosMapa].sort((a,b)=>b.P-a.P)[0];
    if(mejor && mejor.k!==e.zonaKey && mejor.P>P0+0.005){
      L.push({clave:"zona", titulo:"Ubicarte en "+CORTOS[mejor.k],
        que:"Para este mismo negocio, esa zona ofrece mejor relación entre afluencia y renta. Evalúa el traslado o ábrela ahí.",
        base:"El índice de afluencia por zona —construido a partir de la concentración comercial del Corredor López Portillo y la caracterización socioeconómica de las colonias— eleva la demanda esperada.",
        tasa:"Mayor afluencia peatonal", P:mejor.P, esZona:true, zonaK:mejor.k});
    }
  }
  // 8 · Diferenciación ante competencia
  if(e.compZ <= -0.20){
    const c=clon(e); c.compZ=0; c.mktZ=Math.min(0.12, e.mktZ+0.07);
    L.push({clave:"diferenciacion", titulo:"Diferenciarte ante la competencia saturada",
      que:"Define una propuesta de valor única (especialidad, horario, servicio) que te saque de competir solo por precio.",
      base:"En zonas con 5+ competidores directos, la guerra de precios erosiona el margen; la diferenciación sostiene el ticket y la lealtad.",
      tasa:"Defiende el ticket promedio", P:probDe(c)});
  }
  // 9 · Capacitación / experiencia
  if(e.expZ < 0.15){
    const c=clon(e); c.expZ=0.15;
    L.push({clave:"experiencia", titulo:"Capacitación y mentoría en el giro",
      que:"Toma formación específica del giro o busca un mentor; reduce los errores costosos de los primeros meses.",
      base:"La experiencia previa del fundador correlaciona con la supervivencia del negocio; la curva de aprendizaje temprana es donde ocurre la mayoría de los cierres.",
      tasa:"Menos errores en año 1", P:probDe(c)});
  }
  return L.map(l=>{ const P=efectoPlan(P0,l.P); return {...l, P, lift:P-P0, evid:evidenciaPalanca(l.clave)}; }).filter(l=>l.lift>0.0005).sort((a,b)=>b.lift-a.lift);
}

function clasificarFODA(e, modelo){
  const INT={"Experiencia en el giro":1,"Reserva de capital":1,"Formalidad fiscal":1,"Marketing":1,
    "Estructura de deuda":1,"Local propio":1,"Margen de seguridad financiero":1,
    "Resiliencia del emprendedor":1,"Motivación para emprender":1};
  const F=[],O=[],D=[],A=[];
  modelo.contribs.forEach(([nom,beta])=>{
    const interno = Object.keys(INT).some(k=>nom.startsWith(k));
    if(interno){
      if(beta>0.04) F.push([nom,beta]);
      else if(beta<-0.04) D.push([nom,beta]);
    }else{ // externo: giro, zona, competencia
      if(beta>0.04) O.push([nom,beta]);
      else if(beta<-0.04) A.push([nom,beta]);
    }
  });
  // Externos adicionales no logísticos
  if(e.crec>0.05) O.push(["Mercado en crecimiento ("+(e.crec*100).toFixed(0)+"% anual)",e.crec]);
  if(e.crec<0) A.push(["Mercado en contracción",e.crec]);
  if(e.inf>=0.06) A.push(["Inflación alta erosiona el margen ("+(e.inf*100).toFixed(1)+"%)",-e.inf]);
  if(e.ms>=0.20) F.push(["Opera con holgura sobre el equilibrio",e.ms]);
  else if(e.ms<0.05) A.push(["Opera muy cerca del punto de equilibrio",-1]);
  if(typeof datosMapa!=="undefined" && datosMapa.length){
    const mejor=[...datosMapa].sort((a,b)=>b.P-a.P)[0];
    if(mejor && mejor.k!==e.zonaKey && mejor.P>modelo.P+0.01)
      O.push(["Existe una zona con mayor probabilidad ("+CORTOS[mejor.k]+")",mejor.P]);
  }
  return {F,O,D,A};
}

function pintarTriplete(mc){
  const u=[
    {c:"pes", et:"Pesimista · P5", v:mc.p05, d:"5% de los años caen por debajo"},
    {c:"base", et:"Esperado · mediana", v:mc.p50, d:"la mitad de los años queda por encima y la mitad por debajo"},
    {c:"opt", et:"Optimista · P95", v:mc.p95, d:"5% de los años superan esto"}
  ];
  $("triplete").innerHTML=u.map(x=>'<div class="universo '+x.c+'"><span class="et">'+x.et+
    '</span><div class="v">'+mxn.format(Math.round(x.v))+'</div><div class="d">'+x.d+"</div></div>").join("");
}

function liUL(arr, vacio){
  if(!arr.length) return '<li class="vacio">'+vacio+"</li>";
  return arr.map(([nom])=>'<li><span class="factor">'+esc(nom)+"</span></li>").join("");   // el nombre del giro puede venir del usuario (giro propio)
}

/* Aplica varias palancas a la vez sobre una copia del escenario (la usan el techo del plan y el simulador de plan). */
function aplicarPalancas(e, lista){
  let c=clon(e);
  lista.forEach(l=>{
    if(l.clave==="reserva")c.resZ=0.20;
    if(l.clave==="deuda")c.credPct=0.15;
    if(l.clave==="margen")c.cv=Math.max(0.30,c.cv-0.10);
    if(l.clave==="marketing"){c.mktZ=0.12;c.mu=Math.round(c.mu*1.12);}
    if(l.clave==="formalidad")c.formZ=0.10;
    if(l.clave==="experiencia")c.expZ=0.15;
    if(l.clave==="diferenciacion"){c.compZ=0;c.mktZ=Math.min(0.12,c.mktZ+0.07);}
    if(l.clave==="retencion"){c.mu=Math.round(c.mu*1.07);c.cv=Math.max(0.05,c.cv-0.01);}
  });
  /* El traslado de zona se aplica al final para escalar la demanda ya ajustada. */
  const z=lista.find(l=>l.clave==="zona"); if(z) c=trasladarZona(c,z.zonaK);
  return c;
}
function pintarFODA(e, modelo, mc){
  const P0=modelo.P;
  pintarTriplete(mc);
  const f=clasificarFODA(e, modelo);
  $("fodaF").innerHTML=liUL(f.F,"Aún no destacan fortalezas claras: trabaja el plan de acción.");
  $("fodaO").innerHTML=liUL(f.O,"Sin oportunidades externas evidentes en este escenario.");
  $("fodaD").innerHTML=liUL(f.D,"Sin debilidades internas marcadas. ¡Bien!");
  $("fodaA").innerHTML=liUL(f.A,"Sin amenazas externas marcadas en este escenario.");

  const L=palancas(e, P0);
  // Techo realista: aplicar simultáneamente las 3 palancas de mayor impacto
  const techo = pPlan(e, L.slice(0,3), P0);
  $("fodaP").textContent=(P0*100).toFixed(1)+"%";
  $("fodaTecho").textContent="potencial con el plan: "+(techo*100).toFixed(1)+"%";
  // Balance FODA: cuántos factores hay en cada cuadrante y cuánto pesan (Σβ) los internos frente a los externos.
  [["fbF",f.F],["fbO",f.O],["fbD",f.D],["fbA",f.A]].forEach(([id,l])=>{ $(id).textContent=l.length; });
  const mayorA=[...f.A].sort((x,y)=>x[1]-y[1])[0], aFavor=f.F.length+f.O.length, enContra=f.D.length+f.A.length;
  $("fbNota").innerHTML="Brecha al potencial: <strong>+"+((techo-P0)*100).toFixed(1)+" pts</strong> · factores a favor <strong>"+aFavor+"</strong> frente a <strong>"+enContra+"</strong> en contra. "+
    (mayorA?"Amenaza principal: <strong>"+esc(mayorA[0])+"</strong>.":"Sin amenazas externas marcadas.");

  pintarHerramientasPlan(e, modelo, L, P0);
  seguro("wEtapas",()=>{
    $("etapas").innerHTML=etapasPlan(e, mc).map(x=>'<li><p class="cal-t">'+x.t+'</p><p>'+x.d+'</p><p class="etapa-salida"><strong>Criterio de salida:</strong> '+x.salida+'</p></li>').join("");
  });
  if(!L.length){
    $("acciones").innerHTML='<div class="accion"><div class="rank">✓</div><div class="cuerpo"><h3>Escenario muy sólido</h3><p class="que">El modelo no encuentra palancas con mejora significativa: tu configuración ya es robusta. Mantén la reserva de capital y vigila la competencia y la inflación.</p></div><div class="impacto"><div class="lift">—</div><div class="lift-k">sin brecha</div></div></div>';
    $("planCierre").innerHTML="<b>Lectura:</b> conserva la disciplina financiera; incluso con probabilidad alta, la cola izquierda del Monte Carlo existe. Reevalúa el plan si cambian renta, competencia o inflación.";
    return;
  }
  $("acciones").innerHTML=L.slice(0,5).map((l,i)=>{
    const dp=(l.lift*100).toFixed(1);
    const proy=(l.P*100).toFixed(1);
    const accZona = l.esZona ? ' data-irzona="'+l.zonaK+'"' : '';
    const cursor = l.esZona ? ' data-clic="1"' : '';   // cursor vía CSS: la CSP no permite style="" en línea
    return '<div class="accion"'+accZona+cursor+'><div class="rank">'+(i+1)+'</div><div class="cuerpo"><h3>'+
      l.titulo+'</h3><p class="que">'+l.que+'</p><p class="base">'+l.base+
      '</p><span class="tasa">Referencia: '+l.tasa+'</span> <span class="evid">'+l.evid+' · efecto contado a la mitad</span></div><div class="impacto"><div class="lift">+'+dp+
      '</div><div class="lift-k">puntos de prob.</div><div class="proy">→ '+proy+'%</div></div></div>';
  }).join("");
  // clic en acción de zona traslada el escenario
  document.querySelectorAll('.accion[data-irzona]').forEach(a=>{
    a.addEventListener("click",()=>irAZona(a.dataset.irzona));
  });
  const top=L[0];
  $("planCierre").innerHTML="<b>Prioridad #1:</b> "+top.titulo.toLowerCase()+
    " es la palanca de mayor impacto en tu escenario (+"+(top.lift*100).toFixed(1)+
    " puntos). Aplicando las tres primeras acciones, la probabilidad estimada subiría de <b>"+
    (P0*100).toFixed(1)+"%</b> a <b>"+(techo*100).toFixed(1)+"%</b>. Recuerda: son estimaciones del modelo bajo supuestos declarados, no garantías.";
}

/* ---------- 14. Orquestación ---------- */
$("forma").addEventListener("submit",ev=>ev.preventDefault()); /* sin botón: solo cálculo en vivo */
let versionCalculo=0, solicitudCalculo=null;
let workerActivo=crearWorkerCalculo();
function crearWorkerCalculo(){
  if(typeof Worker!=="function") return null;
  let url;
  try{
    url=URL.createObjectURL(new Blob([/*@@WORKER@@*/ null],{type:"text/javascript"}));
    const worker=new Worker(url);
    worker.onmessage=({data:{id,mc,rango}})=>{
      if(id===solicitudCalculo?.id) terminarCalculo(solicitudCalculo,mc,rango);
    };
    worker.onerror=ev=>{
      ev.preventDefault();
      usarCalculoSincrono(worker);
    };
    worker.onmessageerror=()=>usarCalculoSincrono(worker);
    return worker;
  }catch{
    return null;
  }finally{
    if(url) URL.revokeObjectURL(url);
  }
}
function usarCalculoSincrono(worker){
  worker?.terminate();
  workerActivo=null;
  if(solicitudCalculo) terminarCalculo(solicitudCalculo,monteCarlo(solicitudCalculo.e));
}
function calcular(){
  clearTimeout(tVivo);
  tVivo=null;
  const e=leerEscenario();
  const modelo=modeloLogistico(e);
  solicitudCalculo={id:++versionCalculo,e,modelo};
  estadoCalculo("pendiente");
  if(workerActivo){
    pintarVeredicto(modelo.P);   // la probabilidad logística es inmediata: se muestra sin esperar al Monte Carlo
    marcarPendiente();
    try{
      workerActivo.postMessage(solicitudCalculo);
      return;
    }catch{
      usarCalculoSincrono(workerActivo);
      return;
    }
  }
  usarCalculoSincrono(null);
}
function terminarCalculo({id,e,modelo},mc,rango){
  solicitudCalculo=null;
  if(rango) modelo._rangoP=rango;
  const S=curvaSupervivencia(modelo.P);
  pintarVeredicto(modelo.P);
  const vpn=pintarKPIs(e,mc,S,modelo);
  pintarLectura(e,mc,modelo,vpn);
  const fin=finanzas(e,mc,S);
  ultimoResumen=resumenEscenario(e,modelo,mc,fin);
  /* Lo que está fuera de la vista se pinta en tareas separadas (<50 ms cada una)
     para no bloquear el hilo principal; una versión nueva cancela la anterior. */
  [()=>pintarGraficas(e,mc,S,modelo), ()=>pintarMapa(e,modelo), ()=>pintarFODA(e,modelo,mc), ()=>pintarWidgets(e,modelo,mc,S), ()=>pintarExplorar(e,modelo,mc,S), ()=>pintarMejora(e,modelo,mc,fin)]
    .forEach(f=>setTimeout(()=>{ if(id===versionCalculo) f(); },0));
  setTimeout(()=>{ if(id===versionCalculo&&!solicitudCalculo&&!tVivo){ estadoCalculo("listo"); document.documentElement.dataset.calculoVersion=String(id); } },700);   // 650 ms dura el contador animado
}
/* ---------- 15. Barra de progreso y navegación activa ---------- */
(function navViva(){
  const barra=$("progreso");
  window.addEventListener("scroll",()=>{
    const h=document.documentElement;
    barra.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+"%";
  },{passive:true});
  const enlaces=[...document.querySelectorAll('.nav-links a[href^="#"]')];
  const io=new IntersectionObserver(es=>{
    es.forEach(en=>{
      if(!en.isIntersecting) return;
      enlaces.forEach(a=>a.classList.toggle("activa",a.getAttribute("href")==="#"+en.target.id));
    });
  },{rootMargin:"-35% 0px -55% 0px"});
  ["contexto","simulador","mapa","estrategia","metodologia","lectura","legal","creditos"].forEach(id=>{
    const s=$(id); if(s) io.observe(s);
  });
})();

/* ---------- 16. Arranque ---------- */
const observarMapa=new IntersectionObserver(([entrada])=>{
  if(!entrada.isIntersecting) return;
  observarMapa.disconnect();
  if(!$("mapaReal").hidden) usarReal();
},{rootMargin:"200px 0px"});
observarMapa.observe($("mapa"));

/* Escenario inicial: el del enlace compartido (#e=...) o el de referencia. */
if(!cargarEscenario(location.hash)) calcular();

/* Formulario fijo (sticky) junto a los resultados: si cabe, se pega debajo de la barra; si es más alto que
   la pantalla, se pega por su borde inferior. Así nunca se ve una columna vacía al recorrer los resultados. */
(function formaFija(){
  const forma=$("forma"), nav=document.querySelector(".nav"), tira=$("pestanasApp");
  const ajustar=()=>{
    const arriba=(nav&&getComputedStyle(nav).position==="sticky"?nav.offsetHeight:0)+(tira?tira.offsetHeight:0)+16;
    document.documentElement.style.setProperty("--tope-forma",Math.min(arriba,innerHeight-forma.offsetHeight-16)+"px");
  };
  new ResizeObserver(ajustar).observe(forma);
  addEventListener("resize",ajustar); ajustar();
})();

/* ---------- 13-bis. Herramientas del plan (Estrategia) ---------- */
// Hitos de 90 días e indicador de seguimiento por palanca: sugerencias del equipo, no datos.
const HITOS_PLAN={
  reserva:{m:["Separar 1 mes de gastos fijos en una cuenta aparte","Llegar a 3 meses de reserva","Llegar a 6 meses de reserva"],kpi:"Meses de gastos fijos cubiertos por la reserva (meta: 6)"},
  deuda:{m:["Renegociar plazo o tasa del crédito","Reducir el crédito con aportación propia","Deuda de 15 % o menos de la inversión"],kpi:"Crédito como % de la inversión (meta: 15 % o menos)"},
  margen:{m:["Cotizar con 3 proveedores","Ajustar recetas o mezcla de productos","Costo variable 10 puntos menor"],kpi:"Costo variable como % de la venta"},
  marketing:{m:["Perfil de Google y redes con fotos y horario","Promoción medible (cupón o código)","12 % más clientes por día"],kpi:"Clientes por día (promedio semanal)"},
  formalidad:{m:["Alta en el SAT (RESICO)","Registro patronal en el IMSS","Facturar y operar formalmente"],kpi:"Trámites completados (de 3)"},
  experiencia:{m:["Elegir curso o mentoría del giro","Completar la capacitación","Aplicar 3 mejoras aprendidas"],kpi:"Horas de capacitación y mejoras aplicadas"},
  diferenciacion:{m:["Definir qué te hace distinto","Ajustar oferta y comunicación","Medir ventas del producto distintivo"],kpi:"% de ventas del producto o servicio distintivo"},
  retencion:{m:["Programa de lealtad sencillo","Registrar clientes recurrentes","7 % más clientes que regresan"],kpi:"Clientes que regresan en 30 días"},
  zona:{m:["Visitar locales disponibles en la zona sugerida","Comparar renta y afluencia en campo","Decidir la ubicación"],kpi:"Renta por m² y peatones por hora"}
};
let planSel=null;
/* Impacto de cada factor = puntos de probabilidad que cambiarían si fuera neutro (β = 0); ctrl = depende del negocio. */
function factoresImpacto(modelo){
  const INT=["Experiencia","Reserva","Formalidad","Marketing","Estructura de deuda","Local propio","Margen de seguridad","Resiliencia","Motivación","Modelo de negocio","Permisos","Modalidad","Horario"];
  const sig=x=>1/(1+Math.exp(-x)), z=modelo.z;
  return modelo.contribs.filter(c=>Math.abs(c[1])>0.001).map(([n,b])=>({n:n.replace(/ \(.+\)$/,""), b, imp:Math.abs(sig(z)-sig(z-b)), ctrl:INT.some(k=>n.startsWith(k))}));
}
/* Plan por etapas con criterios de salida. No promete que el negocio sobreviva: acota la pérdida.
   Cada meta sale de los números del propio negocio (punto de equilibrio, inversión, reserva) y del Monte Carlo. */
function etapasPlan(e, mc){
  const peDia=isFinite(e.peDia)?Math.ceil(e.peDia):null, vm=mc.ventasMes||{};
  return [
    {t:"Antes de invertir · prueba de demanda (2 a 4 semanas)",
     d:peDia?"Vende en pequeño (pedidos, puesto temporal o preventa). Meta: <strong>"+peDia+" clientes al día</strong>, tu punto de equilibrio. Si no la alcanzas, no abras todavía: ajusta precio, giro o zona y repite la prueba.":"Con este precio y costo variable no hay punto de equilibrio: corrige precio o costos antes de cualquier prueba.",
     salida:"Sin la meta de clientes, no se abre."},
    {t:"Inversión por tramos (meses 0 a 3)",
     d:"Compromete como máximo <strong>"+mxn.format(Math.round(e.inversion*0.40))+"</strong> (40 % de la inversión) antes de ver el mes 3. Renta flexible, equipo usado o rentado, sin remodelación definitiva.",
     salida:"El resto de la inversión solo se libera si el mes 3 pasa la revisión."},
    {t:"Revisiones en los meses 3, 6 y 12",
     d:"Compara tus ventas mensuales reales con la mediana simulada (<strong>"+mxn.format(Math.round(vm.p50||0))+"</strong>) y con el escenario malo, P5 (<strong>"+mxn.format(Math.round(vm.p05||0))+"</strong>).",
     salida:"Dos meses seguidos por debajo del P5: ajusta a fondo o cierra."},
    {t:"Pérdida máxima decidida desde el día uno",
     d:"Tu reserva (≈ <strong>"+mxn.format(Math.round(mc.cajaInicial||0))+"</strong>) es el tope de lo que estás dispuesto a perder, y nada más. Con tus números, la probabilidad de agotarla en el primer año es de <strong>"+pct(mc.pSinEfectivo||0)+"</strong>.",
     salida:"Si las pérdidas acumuladas alcanzan la reserva, se cierra; no se pide crédito para cubrirlas."},
    {t:"Con datos reales, vuelve a calcular",
     d:"Desde el mes 3, carga tu historial en <strong>Para empresas</strong>: P y los escenarios se recalculan con tus ventas, no con supuestos.",
     salida:"Las decisiones de los meses 6 y 12 usan tus datos."}
  ];
}
function pintarHerramientasPlan(e, modelo, L, P0){
  // Simulador de plan: mismas palancas, aplicadas juntas con aplicarPalancas()
  seguro("wPlan",()=>{
    if(!L.length){ $("planOpciones").innerHTML=""; $("planRes").innerHTML=""; estadoWidget("wPlan","vacio","Tu escenario no tiene palancas con mejora significativa."); return false; }
    const claves=L.map(l=>l.clave);
    if(!planSel || !planSel.every(c=>claves.includes(c))) planSel=claves.slice(0,3);
    const foco=document.activeElement&&document.activeElement.closest("#planOpciones")?document.activeElement.value:null;
    $("planOpciones").innerHTML=L.map(l=>'<label class="plan-op"><input type="checkbox" value="'+l.clave+'"'+(planSel.includes(l.clave)?" checked":"")+'> '+l.titulo+' <span class="plan-dp">+'+(l.lift*100).toFixed(1)+' pts sola</span></label>').join("");
    if(foco){ const f=$("planOpciones").querySelector("input[value=\""+foco+"\"]"); if(f) f.focus(); }
    const elegidas=L.filter(l=>planSel.includes(l.clave));
    const Pplan=pPlan(e, elegidas, P0);
    $("planRes").innerHTML='<span class="plan-p">'+(P0*100).toFixed(1)+'% → <strong>'+(Pplan*100).toFixed(1)+'%</strong></span> con '+elegidas.length+(elegidas.length===1?" acción":" acciones")+' (+'+((Pplan-P0)*100).toFixed(1)+' pts)';
  });
  // Matriz de impacto y control: ΔP si el factor fuera neutro
  seguro("wRiesgo",()=>{
    const fac=factoresImpacto(modelo);
    if(!fac.length){ estadoWidget("wRiesgo","vacio","Todos los factores están en posición neutra."); return false; }
    const alto=f=>f.imp>=0.03;
    const celda=(t,f)=>'<div class="mr-celda"><p class="mr-t">'+t+'</p><ul>'+(f.length?f.sort((a,b)=>b.imp-a.imp).map(x=>'<li class="'+(x.b<0?"neg":"pos")+'">'+esc(x.n)+' <span>'+(x.b<0?"−":"+")+(x.imp*100).toFixed(1)+' pts</span></li>').join(""):'<li class="vacio">Ninguno</li>')+"</ul></div>";
    $("matrizRiesgo").innerHTML=celda("Controlas · impacto alto",fac.filter(f=>f.ctrl&&alto(f)))+celda("Externo · impacto alto",fac.filter(f=>!f.ctrl&&alto(f)))+
      celda("Controlas · impacto bajo",fac.filter(f=>f.ctrl&&!alto(f)))+celda("Externo · impacto bajo",fac.filter(f=>!f.ctrl&&!alto(f)));
  });
  // Calendario de 90 días e indicadores de las acciones marcadas
  seguro("wCalendario",()=>{
    const elegidas=L.filter(l=>planSel&&planSel.includes(l.clave)&&HITOS_PLAN[l.clave]);
    if(!elegidas.length){ $("calendario").innerHTML=""; estadoWidget("wCalendario","vacio","Marca al menos una acción en el simulador de plan."); return false; }
    $("calendario").innerHTML=["Días 1 a 30","Días 31 a 60","Días 61 a 90"].map((t,m)=>'<li><p class="cal-t">'+t+'</p><ul>'+elegidas.map(l=>"<li>"+HITOS_PLAN[l.clave].m[m]+"</li>").join("")+"</ul></li>").join("")+
      '<li class="cal-kpi"><p class="cal-t">Indicadores de seguimiento</p><ul>'+elegidas.map(l=>"<li><strong>"+l.titulo+":</strong> "+HITOS_PLAN[l.clave].kpi+"</li>").join("")+"</ul></li>";
  });
}
$("planOpciones").addEventListener("change",()=>{ planSel=[...$("planOpciones").querySelectorAll("input:checked")].map(i=>i.value); calcular(); });
