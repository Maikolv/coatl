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
["input","change"].forEach(ev=>$("forma").addEventListener(ev,()=>{
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
  return L.map(l=>({...l, lift:l.P-P0})).filter(l=>l.lift>0.0005).sort((a,b)=>b.lift-a.lift);
}

function clasificarFODA(e, modelo){
  const INT={"Experiencia en el giro":1,"Reserva de capital":1,"Formalidad fiscal":1,"Marketing":1,
    "Estructura de deuda":1,"Local propio":1,"Margen de seguridad financiero":1};
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
  return arr.map(([nom])=>'<li><span class="factor">'+nom+"</span></li>").join("");
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
  let cTecho=clon(e);
  L.slice(0,3).forEach(l=>{
    if(l.clave==="reserva")cTecho.resZ=0.20;
    if(l.clave==="deuda")cTecho.credPct=0.15;
    if(l.clave==="margen")cTecho.cv=Math.max(0.30,cTecho.cv-0.10);
    if(l.clave==="marketing"){cTecho.mktZ=0.12;cTecho.mu=Math.round(cTecho.mu*1.12);}
    if(l.clave==="formalidad")cTecho.formZ=0.10;
    if(l.clave==="experiencia")cTecho.expZ=0.15;
    if(l.clave==="diferenciacion"){cTecho.compZ=0;cTecho.mktZ=Math.min(0.12,cTecho.mktZ+0.07);}
    if(l.clave==="retencion"){cTecho.mu=Math.round(cTecho.mu*1.07);cTecho.cv=Math.max(0.05,cTecho.cv-0.01);}
  });
  /* El traslado de zona se aplica al final para escalar la demanda ya ajustada. */
  const accZona=L.slice(0,3).find(l=>l.clave==="zona");
  if(accZona) cTecho=trasladarZona(cTecho,accZona.zonaK);
  const techo = L.length ? Math.max(P0, probDe(cTecho)) : P0;
  $("fodaP").textContent=(P0*100).toFixed(1)+"%";
  $("fodaTecho").textContent="potencial con el plan: "+(techo*100).toFixed(1)+"%";

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
      '</p><span class="tasa">Evidencia: '+l.tasa+'</span></div><div class="impacto"><div class="lift">+'+dp+
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
function calcular(){
  const e=leerEscenario();
  const modelo=modeloLogistico(e);
  const S=curvaSupervivencia(modelo.P);
  const mc=monteCarlo(e);
  pintarVeredicto(modelo.P);
  const vpn=pintarKPIs(e,mc,S,modelo);
  pintarLectura(e,mc,modelo,vpn);
  ultimoResumen=resumenEscenario(e,modelo,mc,finanzas(e,mc,S));
  /* Lo que está fuera de la vista se pinta en tareas separadas (<50 ms cada una)
     para no bloquear el hilo principal; una versión nueva cancela la anterior. */
  const v=++versionCalculo;
  [()=>pintarGraficas(e,mc,S,modelo), ()=>pintarMapa(e,modelo), ()=>pintarFODA(e,modelo,mc), ()=>pintarWidgets(e,modelo,mc,S)]
    .forEach(f=>setTimeout(()=>{ if(v===versionCalculo) f(); },0));
}
let versionCalculo=0;
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
if(!initLeaflet()) usarEsquema();
/* ---------- 15. Modo Oráculo (tema cyber conmutable) ---------- */
(function modoOraculo(){
  const btn=$("btnTema"), txt=$("temaTexto"), cita=$("oraculoCita");
  const frases=[
    "«El futuro no es aleatorio. Es calculable.»",
    "«Lo que los antiguos llamaban destino, nosotros lo llamamos probabilidad.»",
    "«No adivines. Calcula.»",
    "«Mil simulaciones. Una decisión. La correcta.»"
  ];
  let i=0, rot=null;
  function aplicar(on){
    document.body.classList.toggle("oraculo", on);
    btn.setAttribute("aria-pressed", on?"true":"false");
    txt.textContent = on ? "Modo Claro" : "Modo Oráculo";
    btn.querySelector(".ojo").textContent = on ? "☼" : "◉";
    if(on){
      toast("◉ Modo Oráculo activado: misma estadística, visión nocturna.");
      if(!rot && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
        rot=setInterval(()=>{ i=(i+1)%frases.length; if(cita) cita.textContent=frases[i]; }, 5000);
      }
    } else if(rot){ clearInterval(rot); rot=null; if(cita) cita.textContent=frases[0]; }
    // Repinta gráficas para que tomen los colores del tema
    if(typeof calcular==="function") calcular();
  }
  btn.addEventListener("click",()=>aplicar(!document.body.classList.contains("oraculo")));
})();

/* Escenario inicial: el del enlace compartido (#e=...) o el de referencia. */
if(!cargarEscenario(location.hash)) calcular();
