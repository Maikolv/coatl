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
$("ajustePrecio").addEventListener("input",()=>{const v=+$("ajustePrecio").value;$("vAjuste").textContent=(v>0?"+":"")+v+"%"});
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

/* Pestañas: patrón WAI-ARIA (clic, flechas, Inicio/Fin; tabindex móvil). */
const PESTANAS=[...document.querySelectorAll(".pestana")];
function activarPestana(b,foco){
  PESTANAS.forEach(x=>{x.setAttribute("aria-selected","false");x.tabIndex=-1});
  document.querySelectorAll(".cuadro").forEach(x=>x.classList.remove("activo"));
  b.setAttribute("aria-selected","true"); b.tabIndex=0;
  $(b.dataset.cuadro).classList.add("activo");
  if(foco) b.focus();
}
PESTANAS.forEach((b,i)=>{
  b.addEventListener("click",()=>activarPestana(b,false));
  b.addEventListener("keydown",ev=>{
    const n=PESTANAS.length, mapa={ArrowRight:(i+1)%n, ArrowLeft:(i-1+n)%n, Home:0, End:n-1};
    if(ev.key in mapa){ev.preventDefault();activarPestana(PESTANAS[mapa[ev.key]],true)}
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
/* Lee un número respetando los límites min/max del control (hallazgo 1 de Codex):
   evita NaN o VPN infinito con valores manuales o de un enlace manipulado. */
function num(id){
  const c=$(id); let v=Number(c.value);
  if(!Number.isFinite(v)) v=Number(c.defaultValue)||0;
  if(c.min!=="") v=Math.max(Number(c.min),v);
  if(c.max!=="") v=Math.min(Number(c.max),v);
  if(String(v)!==c.value && document.activeElement!==c) c.value=String(v);
  return v;
}
function leerEscenario(){
  const giro=GIROS[$("giro").value]||GIROS.cafeteria, zona=ZONAS[$("zona").value]||ZONAS.heroes;
  const e={
    zonaKey:$("zona").value, giro, zona,
    expZ:+$("experiencia").value, formZ:+$("formalidad").value, mktZ:+$("marketing").value,
    compZ:+$("competencia").value, resZ:+$("reserva").value,
    modZ:+$("modeloNegocio").value||0, permZ:+$("permisos").value||0,
    modalZ:+$("modalidad").value||0, horZ:+$("horario").value||0,
    empleados:num("empleados"), costoEmpleado:num("costoEmpleado"),
    propio:$("local").value==="propio", superficie:num("superficie"),
    inversion:num("inversion"), credPct:num("credito")/100, tasa:num("tasa")/100,
    renta:num("renta"), ticket:Math.max(1,num("ticket")), cv:num("cvar")/100,
    otrosFijos:num("otrosFijos"),
    mu:Math.max(1,num("clientes")), diasSem:+$("dias").value||6,
    estacion:ESTACION[$("estacionalidad").value]||ESTACION.estable, r:num("descuento")/100,
    merma:num("merma")/100, mktGasto:num("mktGasto"),
    crec:num("crecimiento")/100, inf:num("inflacion")/100,
    ajustePrecio:num("ajustePrecio")/100, elasticidad:+$("elasticidad").value||-1
  };
  /* Precio vs. mercado con elasticidad constante (hallazgo 2 de Codex):
     ticket′ = ticket·(1+a),  μ′ = μ·(1+a)^ε. Con a = 0 (por defecto) no cambia nada. */
  e.ticketBase=e.ticket; e.muBase=e.mu;
  e.ticket=e.ticketBase*(1+e.ajustePrecio);
  e.mu=Math.max(1,e.muBase*Math.pow(1+e.ajustePrecio,e.elasticidad));
  return derivar(e);
}

