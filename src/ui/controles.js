/* ---------- 3. Poblado de selects y controles ---------- */
(function poblar(){
  const sg=$("giro"), sz=$("zona");
  for(const k in GIROS){const o=document.createElement("option");o.value=k;o.textContent=GIROS[k].n;sg.appendChild(o)}
  sg.value="cafeteria";
  for(const k in ZONAS){const o=document.createElement("option");o.value=k;o.textContent=ZONAS[k].n;sz.appendChild(o)}
  sz.value="heroes";
})();
$("giro").addEventListener("change",()=>{const g=GIROS[$("giro").value];$("ticket").value=g.ticket;$("cvar").value=g.cv;$("vCvar").textContent=g.cv+"%"});
/* Hallazgo 5: los campos arrancan con los valores del giro seleccionado (Cafetería). */
$("giro").dispatchEvent(new Event("change"));
$("inversion").addEventListener("input",()=>$("vInversion").textContent=mxn.format(+$("inversion").value));
$("credito").addEventListener("input",()=>$("vCredito").textContent=$("credito").value+"%");
$("cvar").addEventListener("input",()=>$("vCvar").textContent=$("cvar").value+"%");
$("merma").addEventListener("input",()=>$("vMerma").textContent=(+$("merma").value)+"%");
$("sugerirRenta").addEventListener("click",()=>{
  const z=ZONAS[$("zona").value];
  $("renta").value=Math.round(z.rm2*(+$("superficie").value)/100)*100;
  calcular();
});
function factorCompetencia(){return ({"0.15":1.15,"0":1,"-0.20":0.85,"-0.35":0.72})[$("competencia").value]}
$("sugerirClientes").addEventListener("click",()=>{
  const g=GIROS[$("giro").value], z=ZONAS[$("zona").value];
  $("clientes").value=Math.max(1,Math.round(g.dem*z.afl*factorCompetencia()));
  calcular();
});

/* Pestañas */
document.querySelectorAll(".pestana").forEach(b=>{
  b.addEventListener("click",()=>{
    document.querySelectorAll(".pestana").forEach(x=>x.setAttribute("aria-selected","false"));
    document.querySelectorAll(".cuadro").forEach(x=>x.classList.remove("activo"));
    b.setAttribute("aria-selected","true");
    $(b.dataset.cuadro).classList.add("activo");
  });
});

/* ---------- 4. Retícula del hero (frecuencias INEGI) ---------- */
(function tableroHero(){
  const cont=$("cuadricula-hero");
  for(let i=0;i<100;i++){const c=document.createElement("div");c.className="celda";c.style.animationDelay=(i*8)+"ms";cont.appendChild(c)}
  const etapas=[[1,67],[2,56],[3,46],[5,35],[10,25]];
  let e=0;
  function pinta(){
    const [anio,vivos]=etapas[e];
    $("anio-tablero").textContent=" "+anio;
    [...cont.children].forEach((c,i)=>c.classList.toggle("cerro",i>=vivos));
    e=(e+1)%etapas.length;
  }
  pinta();
  if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(pinta,2800);
})();

/* ---------- 5. Lectura del formulario ---------- */
function leerEscenario(){
  const giro=GIROS[$("giro").value], zona=ZONAS[$("zona").value];
  const e={
    zonaKey:$("zona").value, giro, zona,
    expZ:+$("experiencia").value, formZ:+$("formalidad").value, mktZ:+$("marketing").value,
    compZ:+$("competencia").value, resZ:+$("reserva").value,
    empleados:+$("empleados").value||0, costoEmpleado:+$("costoEmpleado").value||0,
    propio:$("local").value==="propio", superficie:+$("superficie").value||0,
    inversion:+$("inversion").value, credPct:(+$("credito").value)/100, tasa:(+$("tasa").value)/100,
    renta:+$("renta").value||0, ticket:+$("ticket").value||1, cv:(+$("cvar").value)/100,
    otrosFijos:+$("otrosFijos").value||0,
    mu:+$("clientes").value||1, diasSem:+$("dias").value,
    estacion:ESTACION[$("estacionalidad").value], r:(+$("descuento").value)/100,
    merma:(+$("merma").value)/100, mktGasto:+$("mktGasto").value||0,
    crec:(+$("crecimiento").value)/100, inf:(+$("inflacion").value)/100
  };
  return derivar(e);
}

