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
/* Pestañas dentro del proyecto: cada apartado que abres queda como pestaña (cambiar y cerrar,
   como en un navegador). La lista dura lo que la sesión de esta ventana. */
let abiertas=[]; try{ abiertas=JSON.parse(sessionStorage.getItem('coatl-pestanas'))||[]; }catch(_){}
abiertas=abiertas.filter(id=>VISTAS.some(v=>v.id===id));
// La tira se pega debajo de la barra superior si esta es fija; en horizontal bajo, la barra se desplaza y la tira va arriba.
function fijarTope(){ const tira=document.getElementById('pestanasApp'), nav=document.querySelector('.nav'); if(!tira||!nav) return;
  tira.style.top=(getComputedStyle(nav).position==='sticky'?nav.offsetHeight:0)+'px'; }
window.addEventListener('resize',fijarTope);
function pintarPestanas(){
  const tira=document.getElementById('pestanasApp'); if(!tira) return;
  fijarTope();
  try{ sessionStorage.setItem('coatl-pestanas',JSON.stringify(abiertas)); }catch(_){}
  tira.innerHTML=abiertas.map(id=>{const v=VISTAS.find(x=>x.id===id), act=id===vistaActual;
    return '<div class="pa-tab'+(act?' activa':'')+'" data-id="'+id+'"><button type="button" class="pa-mover" data-mover="'+id+'" aria-label="Mover la pestaña '+v.titulo+' (flechas izquierda y derecha, o arrastrar)" title="Arrastra para cambiar el orden">⠿</button><a href="#'+id+'"'+(act?' aria-current="page"':'')+'>'+v.titulo+'</a>'+
      '<button type="button" data-cerrar="'+id+'" aria-label="Cerrar la pestaña '+v.titulo+'">✕</button></div>';}).join('');
  const act=tira.querySelector('.activa'); if(act) tira.scrollLeft=act.offsetLeft-tira.clientWidth/2+act.offsetWidth/2;
}
/* Reordenar pestañas: arrastrar el asa ⠿ (ratón o dedo, pointer events) o flechas ←/→ con el asa enfocada.
   El orden se guarda en la sesión junto con la lista. */
function moverPestana(id, destino){
  const i=abiertas.indexOf(id); if(i<0) return;
  destino=Math.max(0,Math.min(abiertas.length-1,destino)); if(destino===i){ pintarPestanas(); return; }
  abiertas.splice(i,1); abiertas.splice(destino,0,id); pintarPestanas();
  document.querySelector('[data-mover="'+id+'"]')?.focus();
  const aviso=$("avisoPestanas"); if(aviso) aviso.textContent=VISTAS.find(v=>v.id===id).titulo+": posición "+(destino+1)+" de "+abiertas.length;
}
(function arrastrePestanas(){
  const tira=$("pestanasApp"); if(!tira) return;
  let arr=null;
  const destinoEn=x=>[...tira.querySelectorAll(".pa-tab")].filter(t=>t!==arr.el).filter(t=>{const r=t.getBoundingClientRect(); return x>r.left+r.width/2;}).length;
  tira.addEventListener("pointerdown",ev=>{
    const h=ev.target.closest("[data-mover]"); if(!h) return;
    ev.preventDefault(); h.setPointerCapture(ev.pointerId);
    arr={id:h.dataset.mover, x0:ev.clientX, el:h.closest(".pa-tab")}; arr.el.classList.add("arrastrando");
  });
  tira.addEventListener("pointermove",ev=>{
    if(!arr) return; arr.el.style.transform="translateX("+(ev.clientX-arr.x0)+"px)";
    const d=destinoEn(ev.clientX); tira.querySelectorAll(".pa-tab").forEach(t=>t.classList.remove("destino"));
    const otros=[...tira.querySelectorAll(".pa-tab")].filter(t=>t!==arr.el); (otros[d]||otros[otros.length-1])?.classList.add("destino");
  });
  const soltar=ev=>{ if(!arr) return; const {id}=arr, d=ev.type==="pointerup"?destinoEn(ev.clientX):abiertas.indexOf(id); arr=null; moverPestana(id,d); };
  tira.addEventListener("pointerup",soltar); tira.addEventListener("pointercancel",soltar);
  tira.addEventListener("keydown",ev=>{
    const h=ev.target.closest("[data-mover]"); if(!h) return;
    const i=abiertas.indexOf(h.dataset.mover);
    if(ev.key==="ArrowLeft"){ ev.preventDefault(); moverPestana(h.dataset.mover,i-1); }
    else if(ev.key==="ArrowRight"){ ev.preventDefault(); moverPestana(h.dataset.mover,i+1); }
  });
})();
document.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-cerrar]'); if(!b) return;
  const id=b.dataset.cerrar, i=abiertas.indexOf(id); abiertas.splice(i,1);
  if(id===vistaActual) irA(abiertas[Math.min(i,abiertas.length-1)]||'inicio'); else pintarPestanas();
});
VISTAS.forEach(v=>v.secciones.forEach(s=>{const el=$(s); if(el) el.dataset.pagina=v.id}));
function vistaDe(id){
  const directa=VISTAS.find(v=>v.id===id); if(directa) return directa;   // «#territorio» no es id de ningún elemento
  const el=id&&document.getElementById(id);
  const sec=el&&el.closest("[data-pagina]");
  return sec?VISTAS.find(v=>v.id===sec.dataset.pagina):null;
}
function mostrarVista(v, destino, desplazar){
  if(TODO){ if(destino&&desplazar) destino.scrollIntoView({behavior:reduceMov()?"auto":"smooth"}); return; }
  const cambio=vistaActual!==v.id;
  vistaActual=v.id;
  if(!abiertas.includes(v.id)) abiertas.push(v.id);
  pintarPestanas();
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
