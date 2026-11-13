/* ---------- 9. Render de resultados ---------- */
let ultimoP=0, ultimoNivel="";
function pintarVeredicto(P){
  const p100=Math.round(P*100), el=$("probNum"), de=ultimoP;
  const t0=performance.now(), dur=650;
  function paso(t){
    const k=Math.min(1,(t-t0)/dur), v=de+(P-de)*(1-Math.pow(1-k,3));
    el.textContent=(v*100).toFixed(1)+"%";
    if(k<1)requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
  ultimoP=P;
  $("aguja").style.transform="translateX(-50%) rotate("+(-90+P*180)+"deg)";
  const sem=$("semaforo");
  let nivel;
  if(P>=0.65){nivel="alto";sem.className="semaforo alto";sem.textContent="Escenario sólido"}
  else if(P>=0.45){nivel="medio";sem.className="semaforo medio";sem.textContent="Escenario condicionado"}
  else {nivel="bajo";sem.className="semaforo bajo";sem.textContent="Escenario frágil"}
  if(nivel==="alto"&&ultimoNivel!=="alto"&&ultimoNivel!=="")fiesta();
  ultimoNivel=nivel;
  const mg=$("miniGrid");
  if(!mg.children.length){for(let i=0;i<100;i++){const c=document.createElement("div");c.className="celda";mg.appendChild(c)}}
  [...mg.children].forEach((c,i)=>c.classList.toggle("viva",i<p100));
  $("miniLeyenda").textContent="De 100 escenarios como el tuyo, ≈"+p100+" llegarían operando y rentables al año 3.";
}
function fiesta(){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const capa=$("confeti"); capa.innerHTML="";
  const colores=["#C8102E","#E2233F","#7A0C1F","#FFC9CF","#FFFFFF"];
  for(let i=0;i<38;i++){
    const s=document.createElement("span");s.className="confeti";
    const c=colores[Math.floor(Math.random()*colores.length)];
    s.style.background=c;
    if(c==="#FFFFFF")s.style.border="1.5px solid #C8102E";
    s.style.left=(3+Math.random()*94)+"%";
    s.style.animationDelay=(Math.random()*0.35)+"s";
    s.style.animationDuration=(1+Math.random()*0.8)+"s";
    if(Math.random()<0.4)s.style.borderRadius="50%";
    capa.appendChild(s);
  }
  setTimeout(()=>{capa.innerHTML=""},2400);
}

function pintarKPIs(e,mc,S,modelo){
  const f=finanzas(e,mc,S), rp=rangoP(modelo);
  const datos=[
    ["Probabilidad a 3 años: rango plausible", pct(rp.p05)+" a "+pct(rp.p95), "P5–P95 al perturbar los β (sensibilidad, no intervalo muestral)"],
    ["Utilidad mensual esperada", mxn.format(Math.round(e.utilMes)), "modelo determinista de costo–volumen, antes de impuestos"],
    ["P(utilidad anual > 0)", pct(mc.pPos), "frecuencia empírica en 2,000 corridas"],
    ["Utilidad anual P5 · P50 · P95", mxn.format(Math.round(mc.p05))+" · "+mxn.format(Math.round(mc.p50))+" · "+mxn.format(Math.round(mc.p95)), "escenarios pesimista, mediano y optimista del Monte Carlo"],
    ["Punto de equilibrio", isFinite(e.peDia)?Math.ceil(e.peDia)+" clientes/día":"No alcanzable", mxn.format(Math.round(e.pePesos))+" en ventas mensuales"],
    ["Margen de seguridad", pct(e.ms), e.ms>=0?"ventas por encima del equilibrio":"ventas por debajo del equilibrio"],
    ["ROI anual esperado", pct(f.roi), "utilidad anual media del Monte Carlo / inversión, antes de impuestos"],
    ["Recuperación (payback)", f.payback?f.payback.toFixed(1)+" meses":"No se recupera", "inversión / utilidad mensual determinista"],
    ["VPN a 3 años ("+(e.r*100).toFixed(1).replace(/.0$/,"")+"%)", mxn.format(Math.round(f.vpn)), "flujos con crecimiento g e inflación π, ponderados por S(t); sin valor terminal"]
  ];
  $("kpis").innerHTML=datos.map(d=>'<div class="kpi"><div class="v">'+d[1]+'</div><div class="k">'+d[0]+'</div><div class="d">'+d[2]+"</div></div>").join("");
  return f.vpn;
}

function pintarLectura(e,mc,modelo,vpn){
  const P=modelo.P, frases=[];
  frases.push("La probabilidad estimada de éxito a 3 años es de <strong>"+pct(P)+"</strong>, frente al <strong>42.6%</strong> de supervivencia nacional a 3 años (INEGI, 1989–2019): tu escenario está "+(P>S0[3]?"por encima":"por debajo")+" de la media. Al perturbar los supuestos del modelo, P se mueve entre <strong>"+pct(rangoP(modelo).p05)+"</strong> y <strong>"+pct(rangoP(modelo).p95)+"</strong>: léelo como orden de magnitud, no como cifra exacta.");
  const ordenados=[...modelo.contribs].sort((a,b)=>a[1]-b[1]);
  const peor=ordenados[0], mejor=ordenados[ordenados.length-1];
  if(peor[1]<0) frases.push("La variable que más resta es <strong>"+peor[0].toLowerCase()+"</strong> (β = "+peor[1].toFixed(2)+"); es el primer candidato para el análisis de sensibilidad.");
  if(mejor[1]>0) frases.push("La variable que más suma es <strong>"+mejor[0].toLowerCase()+"</strong> (β = +"+mejor[1].toFixed(2)+").");
  frases.push("En la simulación Monte Carlo, el "+pct(mc.pPos)+" de los 2,000 años simulados terminó con utilidad positiva; la utilidad anual media fue de "+mxn.format(Math.round(mc.media))+" con desviación estándar de "+mxn.format(Math.round(mc.sd))+".");
  if(isFinite(e.peDia)) frases.push("Necesitas ≈<strong>"+Math.ceil(e.peDia)+" clientes/día</strong> para el punto de equilibrio y esperas "+Math.round(e.mu)+"; el margen de seguridad es de "+pct(e.ms)+".");
  else frases.push("Con este ticket y costo variable el margen de contribución es nulo o negativo: <strong>no existe punto de equilibrio alcanzable</strong>; revisa precio y costos antes que cualquier otra variable.");
  frases.push(vpn>0?"El VPN a 3 años es positivo ("+mxn.format(Math.round(vpn))+"): el proyecto crea valor por encima de tu tasa de descuento.":"El VPN a 3 años es negativo ("+mxn.format(Math.round(vpn))+"): a tu tasa de descuento, el proyecto aún no compensa la inversión.");
  $("lecturaLista").innerHTML=frases.map(f=>"<li>"+f+"</li>").join("");
  $("lecturaPanel").hidden=false;
}

/* ---------- 10. Gráficas ---------- */
Chart.defaults.font.family='"Hanken Grotesk",Arial,sans-serif';
Chart.defaults.color="#4A3A3C";
Chart.defaults.plugins.legend.labels.boxWidth=14;
/* Sin animaciones de Chart.js: eran la mayor parte del tiempo de bloqueo (Lighthouse). */
Chart.defaults.animation=false;

(function graficasContexto(){
  new Chart($("graficaUE"),{type:"bar",data:{
    labels:["2013","2018","2020"],
    datasets:[{label:"Unidades económicas",data:[8517,9710,11018],
      backgroundColor:["#E9B9BE","#C8102E","#7A0C1F"],borderRadius:8,maxBarThickness:90}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.y.toLocaleString("es-MX")+" unidades"}}},
      scales:{y:{beginAtZero:true,grid:{color:"#F4E2E1"}},x:{grid:{display:false}}}}});
  new Chart($("graficaSectores"),{type:"doughnut",data:{
    labels:["Comercio al por menor","Servicios","Manufactura","Otros"],
    datasets:[{data:[45.9,45.0,6.0,3.0],backgroundColor:["#C8102E","#7A0C1F","#E2233F","#E9B9BE"],borderColor:"#fff",borderWidth:3}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:"58%",
      plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:c=>c.label+": "+c.parsed+"% del padrón"}}}}});
})();

/* Plugin de Chart.js: líneas verticales en los percentiles del Monte Carlo. */
/* Crea la gráfica una vez y después solo actualiza datos y opciones (sin animación):
   recrear las 6 gráficas en cada recálculo dominaba el tiempo de bloqueo. */
const GRAF={}, PENDIENTES=new Map();
const ioGraficas=("IntersectionObserver" in window)?new IntersectionObserver(es=>es.forEach(en=>{
  if(!en.isIntersecting) return;
  ioGraficas.unobserve(en.target);
  const cfg=PENDIENTES.get(en.target); PENDIENTES.delete(en.target);
  if(cfg) GRAF[en.target.id]=new Chart(en.target,cfg);
}),{rootMargin:"200px 0px"}):null;
/* La primera vez la gráfica se crea solo cuando su lienzo se acerca a la vista. */
function graficar(lienzo,cfg){
  const prev=GRAF[lienzo.id];
  if(prev && prev.config.type===cfg.type){ prev.data=cfg.data; prev.options=cfg.options; prev.update("none"); return prev; }
  if(prev){ prev.destroy(); delete GRAF[lienzo.id]; }
  if(ioGraficas){ if(!PENDIENTES.has(lienzo)) ioGraficas.observe(lienzo); PENDIENTES.set(lienzo,cfg); return null; }
  return (GRAF[lienzo.id]=new Chart(lienzo,cfg));
}
/* Para exportar: crea en el acto las gráficas pendientes. */
function graficasListas(ids){
  return ids.map(id=>{const c=$(id); if(!GRAF[id]&&PENDIENTES.has(c)){ioGraficas.unobserve(c);GRAF[id]=new Chart(c,PENDIENTES.get(c));PENDIENTES.delete(c)} return GRAF[id]}).filter(Boolean);
}
const PLUGIN_PERCENTILES={id:"lineasPercentil",afterDatasetsDraw(ch,_a,o){
    const marcas=o.marcas||[], lo=o.lo, paso=o.paso;
    const {ctx,chartArea:a,scales:{x}}=ch, n=ch.data.labels.length;
    ctx.save(); ctx.setLineDash([5,4]); ctx.strokeStyle="#38070F"; ctx.fillStyle="#38070F";
    ctx.font="600 11px 'Spline Sans Mono',monospace"; ctx.textAlign="center";
    marcas.forEach(([et,v])=>{
      const idx=(v-lo)/paso-0.5, px=x.getPixelForValue(0)+(x.getPixelForValue(n-1)-x.getPixelForValue(0))*idx/(n-1||1);
      ctx.beginPath(); ctx.moveTo(px,a.top+14); ctx.lineTo(px,a.bottom); ctx.stroke(); ctx.fillText(et,px,a.top+10);
    });
    ctx.restore();
  }};
function pintarGraficas(e,mc,S,modelo){
  const rp=rangoP(modelo), Sbajo=curvaSupervivencia(rp.p05), Salto=curvaSupervivencia(rp.p95);
  const anios=[...Array(11).keys()];
  graficar($("graficaSupervivencia"),{type:"line",data:{
    labels:anios.map(a=>"Año "+a),
    datasets:[
      {label:"Banda alta (P95 de P)",data:Salto.map(x=>+(100*x).toFixed(1)),borderColor:"rgba(200,16,46,.25)",borderWidth:1,pointRadius:0,tension:.35,fill:false},
      {label:"Banda baja (P5 de P)",data:Sbajo.map(x=>+(100*x).toFixed(1)),borderColor:"rgba(200,16,46,.25)",borderWidth:1,backgroundColor:"rgba(200,16,46,.14)",pointRadius:0,tension:.35,fill:"-1"},
      {label:"Tu escenario",data:S.map(x=>+(100*x).toFixed(1)),borderColor:"#C8102E",tension:.35,pointRadius:3,fill:false},
      {label:"Promedio nacional (INEGI)",data:S0.map(x=>+(100*x).toFixed(1)),borderColor:"#9B6A6E",borderDash:[6,5],pointRadius:0,tension:.35}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{tooltip:{callbacks:{label:c=>c.dataset.label+": "+c.parsed.y+"% sigue operando"}}},
      scales:{y:{min:0,max:100,ticks:{callback:v=>v+"%"},grid:{color:"#F4E2E1"}},x:{grid:{display:false}}}}});

  const nb=22, lo=mc.res[0], hi=mc.res[N_SIM-1], paso=(hi-lo)/nb||1;
  const bins=new Array(nb).fill(0);
  mc.res.forEach(x=>bins[Math.min(nb-1,Math.floor((x-lo)/paso))]++);
  const centros=bins.map((_,i)=>lo+paso*(i+0.5));
  graficar($("graficaMC"),{type:"bar",data:{
    labels:centros.map(c=>mxn.format(Math.round(c/1000)*1000)),
    datasets:[{label:"Años simulados",data:bins,
      backgroundColor:centros.map(c=>c<0?"#E2233F":(c<mc.p05||c>mc.p95)?"#E9B9BE":"#7A0C1F"),borderRadius:3,categoryPercentage:1,barPercentage:.96}]},
    plugins:[PLUGIN_PERCENTILES],
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{lineasPercentil:{marcas:[["P5",mc.p05],["P50",mc.p50],["P95",mc.p95]],lo,paso},legend:{display:false},tooltip:{callbacks:{title:i=>"Utilidad ≈ "+i[0].label,label:c=>c.parsed.y+" de 2,000 corridas"}}},
      scales:{y:{beginAtZero:true,grid:{color:"#F4E2E1"},title:{display:true,text:"Frecuencia"}},
              x:{ticks:{maxTicksLimit:6,maxRotation:0},grid:{display:false}}}}});

  const maxX=Math.max(Math.ceil(e.peDia*2),Math.ceil(e.mu*1.4),10);
  const xs=[...Array(13).keys()].map(i=>Math.round(maxX*i/12));
  graficar($("graficaPE"),{type:"line",data:{
    datasets:[
      {label:"Ingresos mensuales",data:xs.map(x=>({x,y:x*e.diasMes*e.ticket})),borderColor:"#1F7A4D",pointRadius:0,tension:0},
      {label:"Costos totales",data:xs.map(x=>({x,y:e.fijos+x*e.diasMes*e.ticket*e.cvEff})),borderColor:"#C8102E",pointRadius:0,tension:0},
      {label:"Punto de equilibrio",data:isFinite(e.peDia)?[{x:e.peDia,y:e.pePesos}]:[],type:"scatter",
       backgroundColor:"#38070F",pointRadius:7,pointStyle:"rectRot"}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{tooltip:{callbacks:{label:c=>c.dataset.label+": "+(c.dataset.type==="scatter"?Math.ceil(e.peDia)+" clientes/día":mxn.format(Math.round(c.parsed.y)))}}},
      scales:{y:{ticks:{callback:v=>"$"+(v/1000).toFixed(0)+"k"},grid:{color:"#F4E2E1"},title:{display:true,text:"Pesos / mes"}},
              x:{type:"linear",min:0,max:maxX,title:{display:true,text:"Clientes por día"},grid:{display:false}}}}});
}

