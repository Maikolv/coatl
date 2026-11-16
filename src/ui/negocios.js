/* ---------- 26. Mi negocio: nombre y negocios guardados ----------
   El nombre y los negocios guardados viven SOLO en este navegador (localStorage, clave
   «coatl-negocios»): no se envían a ningún servidor, no viajan en el enlace para compartir y
   se borran con «Eliminar». Se guarda lo que la persona capturó en el simulador (variables del
   formulario) y sus respuestas del diagnóstico; nunca los archivos del apartado «Para empresas». */
const CLAVE_NEGOCIOS="coatl-negocios", MAX_NEGOCIOS=20;
let negocioActual="", respuestasMadurez={};

function leerNegocios(){
  try{
    const l=JSON.parse(localStorage.getItem(CLAVE_NEGOCIOS));
    return Array.isArray(l)?l.filter(n=>n&&typeof n.nombre==="string"&&typeof n.esc==="string").slice(0,MAX_NEGOCIOS):[];
  }catch(_){ return []; }
}
function escribirNegocios(l){ try{ localStorage.setItem(CLAVE_NEGOCIOS,JSON.stringify(l)); return true; }catch(_){ return false; } }
const limpiarNombre=t=>String(t||"").replace(/\s+/g," ").trim().slice(0,60);
function pintarListaNegocios(seleccion){
  const sel=$("negocioLista"), l=leerNegocios();
  sel.textContent="";
  const o0=document.createElement("option"); o0.value=""; o0.textContent=l.length?"— Elige un negocio guardado ("+l.length+") —":"— Ninguno guardado —"; sel.appendChild(o0);
  l.forEach(n=>{ const o=document.createElement("option"); o.value=n.nombre; o.textContent=n.nombre+(n.fecha?" · "+n.fecha:""); sel.appendChild(o); });
  sel.value=seleccion&&l.some(n=>n.nombre===seleccion)?seleccion:"";
  $("negocioEliminar").disabled=!sel.value;
}
function avisoNegocio(t){ $("negocioNota").textContent=t; }
function cambioDeNombre(){
  negocioActual=limpiarNombre($("negocioNombre").value);
  if(typeof ultimoResumen!=="undefined"&&ultimoResumen) ultimoResumen.negocio=negocioActual;
  if(typeof repintarMejora==="function") repintarMejora();
}
$("negocioNombre").addEventListener("input",cambioDeNombre);
$("negocioGuardar").addEventListener("click",()=>{
  const nombre=limpiarNombre($("negocioNombre").value);
  if(!nombre){ avisoNegocio("Escribe primero el nombre de tu negocio para poder guardarlo."); $("negocioNombre").focus(); return; }
  const l=leerNegocios(), i=l.findIndex(n=>n.nombre.toLowerCase()===nombre.toLowerCase());
  const reg={nombre, esc:serializarEscenario(), madurez:Object.assign({},respuestasMadurez), fecha:new Date().toLocaleDateString("es-MX")};
  if(i>=0) l[i]=reg; else { if(l.length>=MAX_NEGOCIOS){ avisoNegocio("Ya tienes "+MAX_NEGOCIOS+" negocios guardados: elimina uno para guardar otro."); return; } l.push(reg); }
  if(!escribirNegocios(l)){ avisoNegocio("Este navegador no permite guardar (modo privado o almacenamiento bloqueado). Usa «Copiar enlace» para conservar tu escenario."); return; }
  pintarListaNegocios(nombre);
  avisoNegocio("«"+nombre+"» "+(i>=0?"actualizado":"guardado")+" en este navegador. No se envió a ningún servidor.");
  if(typeof toast==="function") toast("Negocio guardado: "+nombre);
});
$("negocioLista").addEventListener("change",()=>{
  const n=leerNegocios().find(x=>x.nombre===$("negocioLista").value);
  $("negocioEliminar").disabled=!n;
  if(!n) return;
  $("negocioNombre").value=n.nombre; negocioActual=n.nombre;
  respuestasMadurez={};
  if(n.madurez&&typeof n.madurez==="object") for(const [k,v] of Object.entries(n.madurez)) if(v===0||v===1||v===2) respuestasMadurez[k]=v;
  if(!cargarEscenario(n.esc)) calcular();
  avisoNegocio("Cargaste «"+n.nombre+"». Los cambios que hagas no se guardan hasta que pulses «Guardar negocio».");
});
$("negocioEliminar").addEventListener("click",()=>{
  const nombre=$("negocioLista").value; if(!nombre) return;
  escribirNegocios(leerNegocios().filter(n=>n.nombre!==nombre));
  pintarListaNegocios("");
  avisoNegocio("«"+nombre+"» se eliminó de este navegador.");
  $("negocioLista").focus();
});
pintarListaNegocios("");
