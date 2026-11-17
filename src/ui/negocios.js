/* ---------- 26. Mi negocio: nombre y negocios guardados, AISLADOS por usuario ----------
   COATL no tiene servidor ni cuentas, así que el aislamiento ocurre en el propio navegador:
   · Sin perfil: lo que guardas vive solo en ESTA pestaña (sessionStorage) y se borra al cerrarla.
   · Con perfil (usuario + clave): tus negocios se guardan CIFRADOS (AES-GCM de 256 bits; la llave se deriva
     de tu clave con PBKDF2-SHA-256, 250,000 iteraciones). En el almacenamiento solo queda un identificador
     derivado del usuario y datos ilegibles: otra persona en el mismo equipo no ve ni los nombres de tus negocios
     sin tu clave. El perfil se cierra solo tras 15 minutos sin actividad, al pulsar «Salir» o al cerrar la pestaña.
   Nada se envía a ningún servidor ni viaja en el enlace para compartir. Se guardan las variables del formulario
   y las respuestas del diagnóstico; nunca los archivos del apartado «Para empresas». */
const MAX_NEGOCIOS=20, CLAVE_SESION="coatl-negocios-sesion", PREFIJO_PERFIL="coatl-perfil-", ITER_PBKDF2=250000, INACTIVIDAD_MS=15*60*1000;
let negocioActual="", respuestasMadurez={};
let perfil=null;   // {usuario, id, llave, sal, negocios[]} mientras la sesión del perfil está abierta (solo en memoria)
let temporizadorPerfil=0;

const limpiarNombre=t=>String(t||"").replace(/\s+/g," ").trim().slice(0,60);
const valido=l=>Array.isArray(l)?l.filter(n=>n&&typeof n.nombre==="string"&&typeof n.esc==="string").slice(0,MAX_NEGOCIOS):[];
const b64=bytes=>{ let s=""; new Uint8Array(bytes).forEach(b=>{ s+=String.fromCharCode(b); }); return btoa(s); };
const deB64=t=>Uint8Array.from(atob(t),c=>c.charCodeAt(0));
const CIFRADO=!!(window.crypto&&crypto.subtle&&window.isSecureContext);

async function idDeUsuario(usuario){
  const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("coatl-perfil:"+usuario.toLowerCase()));
  return b64(h).replace(/[^A-Za-z0-9]/g,"").slice(0,24);
}
async function derivarLlave(clave,sal){
  const base=await crypto.subtle.importKey("raw",new TextEncoder().encode(clave),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",salt:sal,iterations:ITER_PBKDF2,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
async function cifrar(llave,datos){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const c=await crypto.subtle.encrypt({name:"AES-GCM",iv},llave,new TextEncoder().encode(JSON.stringify(datos)));
  return {iv:b64(iv), datos:b64(c)};
}
async function descifrar(llave,reg){
  const p=await crypto.subtle.decrypt({name:"AES-GCM",iv:deB64(reg.iv)},llave,deB64(reg.datos));
  return JSON.parse(new TextDecoder().decode(p));
}

// ---------- Almacén según el modo ----------
function leerSesion(){ try{ return valido(JSON.parse(sessionStorage.getItem(CLAVE_SESION))); }catch(_){ return []; } }
function escribirSesion(l){ try{ sessionStorage.setItem(CLAVE_SESION,JSON.stringify(l)); return true; }catch(_){ return false; } }
function leerNegocios(){ return perfil?perfil.negocios:leerSesion(); }
async function escribirNegocios(l){
  if(!perfil) return escribirSesion(l);
  try{
    const reg=await cifrar(perfil.llave,l);
    localStorage.setItem(PREFIJO_PERFIL+perfil.id,JSON.stringify({v:1,sal:b64(perfil.sal),iter:ITER_PBKDF2,...reg}));
    perfil.negocios=l; return true;
  }catch(_){ return false; }
}
/* Migración: la v11 guardaba sin usuario (clave «coatl-negocios»). Esos negocios no pueden atribuirse a nadie,
   así que se retiran del almacenamiento compartido y quedan solo en esta pestaña para que su dueño los guarde en su perfil. */
(function migrarSinUsuario(){
  try{
    const viejos=valido(JSON.parse(localStorage.getItem("coatl-negocios")));
    localStorage.removeItem("coatl-negocios");
    if(viejos.length){ const l=leerSesion(); viejos.forEach(n=>{ if(!l.some(x=>x.nombre===n.nombre)) l.push(n); }); escribirSesion(l.slice(0,MAX_NEGOCIOS));
      setTimeout(()=>avisoNegocio("Se encontraron "+viejos.length+" negocios guardados sin usuario: ahora están solo en esta pestaña. Entra a tu perfil y guárdalos ahí, o se borrarán al cerrarla."),0); }
  }catch(_){}
})();

// ---------- Interfaz ----------
function pintarPerfil(){
  const abierto=!!perfil;
  $("perfilUsuario").disabled=abierto; $("perfilClave").disabled=abierto;
  $("perfilEntrar").hidden=abierto; $("perfilSalir").hidden=!abierto;
  $("perfilEstado").textContent=abierto?"Perfil abierto: «"+perfil.usuario+"». Tus negocios se guardan cifrados en este navegador."
    :CIFRADO?"Sin perfil: lo que guardes vive solo en esta pestaña. Entra con un usuario y una clave para conservarlo en este equipo, protegido.":
    "Este navegador no permite cifrar (se necesita una conexión segura): lo que guardes vive solo en esta pestaña.";
  $("perfilEntrar").disabled=!CIFRADO;
}
function pintarListaNegocios(seleccion){
  const sel=$("negocioLista"), l=leerNegocios();
  sel.textContent="";
  const o0=document.createElement("option"); o0.value="";
  o0.textContent=l.length?"— Elige un negocio guardado ("+l.length+") —":perfil?"— Tu perfil aún no tiene negocios —":"— Ninguno en esta pestaña —"; sel.appendChild(o0);
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
function reiniciarInactividad(){ clearTimeout(temporizadorPerfil); if(perfil) temporizadorPerfil=setTimeout(()=>{ cerrarPerfil(); avisoNegocio("Tu perfil se cerró tras 15 minutos sin actividad."); },INACTIVIDAD_MS); }
["pointerdown","keydown"].forEach(t=>document.addEventListener(t,()=>{ if(perfil) reiniciarInactividad(); },{passive:true}));
function cerrarPerfil(){
  perfil=null; clearTimeout(temporizadorPerfil);
  $("perfilClave").value=""; pintarPerfil(); pintarListaNegocios("");
}

async function entrarPerfil(){
  const usuario=limpiarNombre($("perfilUsuario").value).slice(0,40), clave=$("perfilClave").value;
  if(!usuario||clave.length<4){ avisoNegocio("Escribe un usuario y una clave de al menos 4 caracteres."); (usuario?$("perfilClave"):$("perfilUsuario")).focus(); return; }
  $("perfilEntrar").disabled=true; avisoNegocio("Abriendo tu perfil…");
  try{
    const id=await idDeUsuario(usuario), crudo=localStorage.getItem(PREFIJO_PERFIL+id);
    let sal, negocios=[], nuevo=false;
    if(crudo){
      const reg=JSON.parse(crudo); sal=deB64(reg.sal);
      const llave=await derivarLlave(clave,sal);
      try{ negocios=valido(await descifrar(llave,reg)); }catch(_){ avisoNegocio("Usuario o clave incorrectos."); $("perfilClave").select(); return; }
      perfil={usuario,id,llave,sal,negocios};
    }else{
      sal=crypto.getRandomValues(new Uint8Array(16)); nuevo=true;
      perfil={usuario,id,llave:await derivarLlave(clave,sal),sal,negocios:[]};
    }
    // Lo guardado en esta pestaña sin perfil se pasa al perfil (y deja de estar en la pestaña).
    const sesion=leerSesion();
    if(sesion.length){ const l=[...perfil.negocios]; sesion.forEach(n=>{ if(!l.some(x=>x.nombre===n.nombre)&&l.length<MAX_NEGOCIOS) l.push(n); }); await escribirNegocios(l); try{ sessionStorage.removeItem(CLAVE_SESION); }catch(_){} }
    else if(nuevo) await escribirNegocios([]);
    $("perfilClave").value=""; pintarPerfil(); pintarListaNegocios(""); reiniciarInactividad();
    avisoNegocio(nuevo?"Perfil nuevo creado para «"+usuario+"». Recuerda tu clave: sin ella no se pueden abrir tus negocios.":"Bienvenido, «"+usuario+"»: "+perfil.negocios.length+" negocio(s) guardado(s).");
  }catch(err){ perfil=null; avisoNegocio("No se pudo abrir el perfil en este navegador."); }
  finally{ $("perfilEntrar").disabled=!CIFRADO; }
}
$("perfilEntrar").addEventListener("click",entrarPerfil);
$("perfilClave").addEventListener("keydown",ev=>{ if(ev.key==="Enter"){ ev.preventDefault(); entrarPerfil(); } });
$("perfilSalir").addEventListener("click",()=>{ const u=perfil&&perfil.usuario; cerrarPerfil(); avisoNegocio("Saliste del perfil «"+u+"». Tus negocios siguen cifrados en este equipo."); $("perfilUsuario").focus(); });
window.addEventListener("pagehide",()=>{ perfil=null; });

$("negocioNombre").addEventListener("input",cambioDeNombre);
$("negocioGuardar").addEventListener("click",async()=>{
  const nombre=limpiarNombre($("negocioNombre").value);
  if(!nombre){ avisoNegocio("Escribe primero el nombre de tu negocio para poder guardarlo."); $("negocioNombre").focus(); return; }
  const l=[...leerNegocios()], i=l.findIndex(n=>n.nombre.toLowerCase()===nombre.toLowerCase());
  const reg={nombre, esc:serializarEscenario(), madurez:Object.assign({},respuestasMadurez), fecha:new Date().toLocaleDateString("es-MX")};
  if(i>=0) l[i]=reg; else { if(l.length>=MAX_NEGOCIOS){ avisoNegocio("Ya tienes "+MAX_NEGOCIOS+" negocios guardados: elimina uno para guardar otro."); return; } l.push(reg); }
  if(!(await escribirNegocios(l))){ avisoNegocio("Este navegador no permite guardar (modo privado o almacenamiento bloqueado). Usa «Copiar enlace» para conservar tu escenario."); return; }
  pintarListaNegocios(nombre);
  avisoNegocio("«"+nombre+"» "+(i>=0?"actualizado":"guardado")+(perfil?" en tu perfil, cifrado en este equipo.":" solo en esta pestaña: entra con tu usuario para conservarlo.")+" No se envió a ningún servidor.");
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
$("negocioEliminar").addEventListener("click",async()=>{
  const nombre=$("negocioLista").value; if(!nombre) return;
  await escribirNegocios(leerNegocios().filter(n=>n.nombre!==nombre));
  pintarListaNegocios("");
  avisoNegocio("«"+nombre+"» se eliminó"+(perfil?" de tu perfil.":" de esta pestaña."));
  $("negocioLista").focus();
});
pintarPerfil();
pintarListaNegocios("");
