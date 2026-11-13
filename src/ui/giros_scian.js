/* ---------- 23. Todas las actividades del SCIAN como giros + costos ilimitados ----------
   El catálogo viene del DENUE (data/denue/clases.json, más de 900 clases). Una actividad
   que no es uno de los 35 giros calibrados hereda ticket, costo variable, demanda y β de su
   giro COATL más cercano (por subsector SCIAN), rotulado «estimación del equipo». Su
   competencia en Coacalco es el conteo real del DENUE para esa clase. */
const PLANTILLA_SCIAN=[  // prefijo SCIAN → giro COATL de referencia (más específico primero)
  ["3118","panaderia"],["3118","tortilleria"],["311","panaderia"],["31","taller"],["32","taller"],["33","taller"],
  ["4611","abarrotes"],["4612","vinateria"],["461","abarrotes"],["462","abarrotes"],["463","ropa"],["4641","farmacia"],["4642","optica"],["464","farmacia"],
  ["4651","joyeria"],["465","papeleria"],["4662","celulares"],["466","tecnologia"],["467","ferreteria"],["468","refaccionaria"],["469","celulares"],
  ["7225","restaurante"],["722","fonda"],["721","consultorio"],["713","gimnasio"],["71","gimnasio"],
  ["8111","taller"],["811","tecnologia"],["8121","estetica"],["8122","lavanderia"],["812","estetica"],["81","consultorio"],
  ["62","consultorio"],["61","educacion"],["54","consultorio"],["53","consultorio"],["56","lavanderia"],["51","ciber"],["52","consultorio"],["43","abarrotes"]
];
function plantillaDe(codigo){ const p=PLANTILLA_SCIAN.find(([pre])=>codigo.startsWith(pre)); return p?p[1]:"abarrotes"; }
async function catalogoSCIAN(){
  if(DENUE.clases) return DENUE.clases;
  try{ DENUE.clases=await jsonDenue("clases.json"); }catch(_){ DENUE.clases=null; }
  return DENUE.clases;
}
async function usarActividad(codigo){
  const cat=await catalogoSCIAN(); if(!cat||!cat[codigo]) return false;
  const propio=Object.entries((DENUE.meta&&DENUE.meta.giros_scian)||{}).find(([,cs])=>cs.length===1&&cs[0]===codigo);
  if(propio){ $("giro").value=propio[0]; $("giro").dispatchEvent(new Event("change")); calcular(); return true; }
  const base=plantillaDe(codigo), clave="scian_"+codigo;
  if(!GIROS[clave]){
    GIROS[clave]=Object.assign({},GIROS[base],{n:cat[codigo]+" (SCIAN "+codigo+")", scian:codigo, base});
    const o=document.createElement("option"); o.value=clave; o.textContent="SCIAN "+codigo+" · "+cat[codigo];
    $("giroScianGrupo").appendChild(o);
  }
  $("giro").value=clave; $("giro").dispatchEvent(new Event("change")); calcular();
  $("giroNota").innerHTML='Parámetros de referencia de <strong>'+esc(GIROS[base].n)+'</strong> <span class="proc proc-supuesto">estimación del equipo</span>; ajústalos en Finanzas y Operación.';
  return true;
}
(async function prepararBuscador(){
  const opt=document.createElement("optgroup"); opt.label="Actividades del SCIAN agregadas"; opt.id="giroScianGrupo"; $("giro").appendChild(opt);
  $("giro").addEventListener("change",()=>{ if(!GIROS[$("giro").value]||!GIROS[$("giro").value].scian) $("giroNota").textContent=""; });
  const inp=$("giroBusca"), lista=$("giroOpciones");
  inp.addEventListener("focus",async()=>{
    const cat=await catalogoSCIAN();
    if(!cat){ $("giroNota").textContent="El catálogo SCIAN no está disponible en esta versión."; return; }
    if(!lista.children.length) lista.innerHTML=Object.entries(cat).map(([c,n])=>'<option value="'+c+' · '+esc(n)+'">').join("");
    $("giroTotal").textContent=Object.keys(cat).length.toLocaleString("es-MX")+" actividades";
  },{once:true});
  inp.addEventListener("change",async()=>{ const m=/^(\d{6})/.exec(inp.value.trim()); if(m&&await usarActividad(m[1])) inp.value=""; });
})();

/* Competencia real en Coacalco para una actividad SCIAN agregada (clase exacta). */
async function competenciaScian(g){
  if(!g||!g.scian) return null;
  try{ if(!DENUE.ent["15"]) DENUE.ent["15"]=await jsonDenue("ent/15.json"); }catch(_){ return null; }
  return ((DENUE.ent["15"]["020"]||{}).clases||{})[g.scian]||0;
}
const _pcd=pintarCompetenciaDenue;
pintarCompetenciaDenue=async function(){
  const g=GIROS[$("giro").value];
  if(g&&g.scian){ const n=await competenciaScian(g); if(n!=null) $("compDenue").innerHTML='DENUE: <strong>'+fmtN(n)+'</strong> establecimientos de la clase SCIAN '+g.scian+' en todo Coacalco.'; return; }
  _pcd();
};

/* Costos fijos adicionales ilimitados (variables definidas por el usuario). */
function sumaExtras(){ return [...document.querySelectorAll("#extrasLista input[type=number]")].reduce((s,i)=>s+Math.max(0,Number(i.value)||0),0); }
function agregarExtra(nombre,monto){
  const li=document.createElement("li"), id="x"+Math.random().toString(36).slice(2,8);
  li.innerHTML='<label class="sr-only" for="'+id+'n">Concepto</label><input type="text" id="'+id+'n" placeholder="Concepto (p. ej. licencia de software)" value="'+esc(nombre||"")+'">'+
    '<label class="sr-only" for="'+id+'m">Monto mensual</label><input type="number" id="'+id+'m" min="0" step="100" value="'+(monto||0)+'" inputmode="numeric">'+
    '<button type="button" class="quitar" aria-label="Quitar este costo">✕</button>';
  li.querySelector(".quitar").addEventListener("click",()=>{ li.remove(); actualizarExtras(); calcular(); });
  $("extrasLista").appendChild(li); li.querySelector("input").focus();
}
function actualizarExtras(){ $("extrasTotal").textContent=mxn.format(sumaExtras()); }
$("extrasAgregar").addEventListener("click",()=>{ agregarExtra("",0); actualizarExtras(); });
$("extrasLista").addEventListener("input",()=>{ actualizarExtras(); });
$("forma").addEventListener("reset",()=>{ $("extrasLista").innerHTML=""; actualizarExtras(); });
$("giro").addEventListener("change",()=>pintarCompetenciaDenue());
