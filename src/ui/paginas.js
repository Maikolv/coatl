/* ---------- 21. Páginas: cada apartado se abre como una página propia ----------
   Una sola app (index.html autocontenido) con vistas por apartado. La dirección usa el
   identificador del apartado (#simulador, #denue…), así que los enlaces de siempre siguen
   funcionando y se pueden compartir; «atrás» y «adelante» del navegador también.
   ?vista=todo muestra todo en una sola página (útil para imprimir y para las pruebas). */
const VISTAS=[
  {id:"inicio",      titulo:"Inicio",        secciones:["inicio","explorar"]},
  {id:"territorio",  titulo:"Territorio",    secciones:["contexto"]},
  {id:"denue",       titulo:"DENUE nacional",secciones:["denue"]},
  {id:"simulador",   titulo:"Simulador",     secciones:["simulador"]},
  {id:"empresas",    titulo:"Para empresas", secciones:["empresas"]},
  {id:"estrategia",  titulo:"Estrategia",    secciones:["estrategia"]},
  {id:"metodologia", titulo:"Metodología",   secciones:["metodologia","trazabilidad","lectura"]},
  {id:"legal",       titulo:"Aviso legal",   secciones:["legal"]}
];
const TODO=new URLSearchParams(location.search).get("vista")==="todo";
const TITULO_BASE=document.title;
let vistaActual=null;
VISTAS.forEach(v=>v.secciones.forEach(s=>{const el=$(s); if(el) el.dataset.pagina=v.id}));
function vistaDe(id){
  const el=id&&document.getElementById(id);
  const sec=el&&el.closest("[data-pagina]");
  return sec?VISTAS.find(v=>v.id===sec.dataset.pagina):null;
}
function mostrarVista(v, destino, desplazar){
  if(TODO){ if(destino&&desplazar) destino.scrollIntoView({behavior:reduceMov()?"auto":"smooth"}); return; }
  const cambio=vistaActual!==v.id;
  vistaActual=v.id;
  document.querySelectorAll("[data-pagina]").forEach(s=>{ s.hidden=s.dataset.pagina!==v.id; });
  document.querySelectorAll(".nav-links a[data-vista]").forEach(a=>{
    const activo=a.dataset.vista===v.id; a.classList.toggle("activa",activo);
    if(activo) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current");
  });
  document.title=(v.id==="inicio"?"":v.titulo+" · ")+TITULO_BASE;
  if(cambio){
    document.body.classList.remove("vista-entra"); void document.body.offsetWidth; document.body.classList.add("vista-entra");
    window.dispatchEvent(new Event("resize"));             // gráficas y mapa recalculan su tamaño
    if(typeof mapaL!=="undefined"&&mapaL&&mapaL.invalidateSize) setTimeout(()=>mapaL.invalidateSize(),60);
  }
  if(desplazar){
    if(destino&&destino.dataset.pagina!==v.id&&!v.secciones.includes(destino.id)) destino.scrollIntoView({behavior:"auto"});
    else window.scrollTo({top:0,behavior:"auto"});
  }
}
function enrutar(desplazar){
  const h=decodeURIComponent(location.hash.slice(1));
  if(/(^|&)e=/.test(h)){ mostrarVista(VISTAS.find(v=>v.id==="simulador"),null,false); return; }   // escenario compartido
  const v=vistaDe(h)||VISTAS[0];
  mostrarVista(v, h?document.getElementById(h):null, desplazar);
}
/* Navegar a un apartado desde el código (botones «Abrir el simulador», etc.). */
function irA(id){
  if(location.hash==="#"+id) enrutar(true);
  else location.hash=id;
}
window.addEventListener("hashchange",()=>enrutar(true));
if(TODO) document.body.classList.add("vista-todo");
enrutar(false);
