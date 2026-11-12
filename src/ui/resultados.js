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
  const payback = e.utilMes>0 ? (e.inversion/e.utilMes) : null;
  let vpn=-e.inversion;
  for(let t=1;t<=3;t++){
    const ventasT=e.ventasMes*12*Math.pow(1+e.crec,t-1);
    const fijosT=e.fijos*12*Math.pow(1+e.inf,t-1);
    const Ut=ventasT*(1-e.cvEff)-fijosT;
    vpn += S[t]*Ut/Math.pow(1+e.r,t);
  }
  const datos=[
    ["Utilidad mensual esperada", mxn.format(Math.round(e.utilMes)), "modelo determinista de costo–volumen"],
    ["P(utilidad anual > 0)", pct(mc.pPos), "frecuencia empírica en 2,000 corridas"],
    ["Utilidad anual: intervalo 95%", mxn.format(Math.round(mc.p025))+" a "+mxn.format(Math.round(mc.p975)), "percentiles 2.5 y 97.5 del Monte Carlo"],
    ["Punto de equilibrio", isFinite(e.peDia)?Math.ceil(e.peDia)+" clientes/día":"No alcanzable", mxn.format(Math.round(e.pePesos))+" en ventas mensuales"],
    ["Margen de seguridad", pct(e.ms), e.ms>=0?"ventas por encima del equilibrio":"ventas por debajo del equilibrio"],
    ["ROI anual esperado", pct(mc.media/e.inversion), "utilidad anual media / inversión inicial"],
    ["Recuperación (payback)", payback?payback.toFixed(1)+" meses":"No se recupera", "con la utilidad mensual esperada"],
    ["VPN a 3 años ("+(e.r*100).toFixed(1).replace(/\.0$/,"")+"%)", mxn.format(Math.round(vpn)), "flujos con crecimiento g e inflación π, ponderados por S(t)"]
  ];
  $("kpis").innerHTML=datos.map(d=>'<div class="kpi"><div class="v">'+d[1]+'</div><div class="k">'+d[0]+'</div><div class="d">'+d[2]+"</div></div>").join("");
  return vpn;
}

function pintarLectura(e,mc,modelo,vpn){
  const P=modelo.P, frases=[];
  frases.push("La probabilidad estimada de éxito a 3 años es de <strong>"+pct(P)+"</strong>, frente al <strong>46%</strong> de supervivencia promedio nacional (INEGI): tu escenario está "+(P>0.46?"por encima":"por debajo")+" de la media.");
  const ordenados=[...modelo.contribs].sort((a,b)=>a[1]-b[1]);
  const peor=ordenados[0], mejor=ordenados[ordenados.length-1];
  if(peor[1]<0) frases.push("La variable que más resta es <strong>"+peor[0].toLowerCase()+"</strong> (β = "+peor[1].toFixed(2)+"); es el primer candidato para el análisis de sensibilidad.");
  if(mejor[1]>0) frases.push("La variable que más suma es <strong>"+mejor[0].toLowerCase()+"</strong> (β = +"+mejor[1].toFixed(2)+").");
  frases.push("En la simulación Monte Carlo, el "+pct(mc.pPos)+" de los 2,000 años simulados terminó con utilidad positiva; la utilidad anual media fue de "+mxn.format(Math.round(mc.media))+" con desviación estándar de "+mxn.format(Math.round(mc.sd))+".");
  if(isFinite(e.peDia)) frases.push("Necesitas ≈<strong>"+Math.ceil(e.peDia)+" clientes/día</strong> para el punto de equilibrio y esperas "+Math.round(e.mu)+"; el margen de seguridad es de "+pct(e.ms)+".");
  else frases.push("Con este ticket y costo variable el margen de contribución es nulo o negativo: <strong>no existe punto de equilibrio alcanzable</strong>; revisa precio y costos antes que cualquier otra variable.");
  frases.push(vpn>0?"El VPN a 3 años es positivo ("+mxn.format(Math.round(vpn))+"): el proyecto crea valor por encima de tu tasa de descuento.":"El VPN a 3 años es negativo ("+mxn.format(Math.round(vpn))+"): a tu tasa de descuento, el proyecto aún no compensa la inversión.");
  $("lecturaLista").innerHTML=frases.map(f=>"<li>"+f+"</li>").join("");
  $("lectura").hidden=false;
}

/* ---------- 10. Gráficas ---------- */
Chart.defaults.font.family='"Hanken Grotesk",Arial,sans-serif';
Chart.defaults.color="#4A3A3C";
Chart.defaults.plugins.legend.labels.boxWidth=14;
let chSup=null, chMC=null, chPE=null;

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
    datasets:[{data:[48,38,9,5],backgroundColor:["#C8102E","#7A0C1F","#E2233F","#E9B9BE"],borderColor:"#fff",borderWidth:3}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:"58%",
      plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:c=>c.label+": "+c.parsed+"% del padrón"}}}}});
})();

function pintarGraficas(e,mc,S){
  const anios=[...Array(11).keys()];
  if(chSup)chSup.destroy();
  chSup=new Chart($("graficaSupervivencia"),{type:"line",data:{
    labels:anios.map(a=>"Año "+a),
    datasets:[
      {label:"Tu escenario",data:S.map(x=>+(100*x).toFixed(1)),borderColor:"#C8102E",backgroundColor:"rgba(200,16,46,.12)",fill:true,tension:.35,pointRadius:3},
      {label:"Promedio nacional (INEGI)",data:S0.map(x=>+(100*x).toFixed(1)),borderColor:"#9B6A6E",borderDash:[6,5],pointRadius:0,tension:.35}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{tooltip:{callbacks:{label:c=>c.dataset.label+": "+c.parsed.y+"% sigue operando"}}},
      scales:{y:{min:0,max:100,ticks:{callback:v=>v+"%"},grid:{color:"#F4E2E1"}},x:{grid:{display:false}}}}});

  const nb=22, lo=mc.res[0], hi=mc.res[N_SIM-1], paso=(hi-lo)/nb||1;
  const bins=new Array(nb).fill(0);
  mc.res.forEach(x=>bins[Math.min(nb-1,Math.floor((x-lo)/paso))]++);
  const centros=bins.map((_,i)=>lo+paso*(i+0.5));
  if(chMC)chMC.destroy();
  chMC=new Chart($("graficaMC"),{type:"bar",data:{
    labels:centros.map(c=>mxn.format(Math.round(c/1000)*1000)),
    datasets:[{label:"Años simulados",data:bins,
      backgroundColor:centros.map(c=>c<0?"#E2233F":"#7A0C1F"),borderRadius:3,categoryPercentage:1,barPercentage:.96}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{title:i=>"Utilidad ≈ "+i[0].label,label:c=>c.parsed.y+" de 2,000 corridas"}}},
      scales:{y:{beginAtZero:true,grid:{color:"#F4E2E1"},title:{display:true,text:"Frecuencia"}},
              x:{ticks:{maxTicksLimit:6,maxRotation:0},grid:{display:false}}}}});

  const maxX=Math.max(Math.ceil(e.peDia*2),Math.ceil(e.mu*1.4),10);
  const xs=[...Array(13).keys()].map(i=>Math.round(maxX*i/12));
  if(chPE)chPE.destroy();
  chPE=new Chart($("graficaPE"),{type:"line",data:{
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

