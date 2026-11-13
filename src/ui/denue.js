/* ---------- 19. DENUE nacional (datos reales del INEGI, sincronizados) ----------
   Lee los agregados que genera scripts/denue_sync.py en data/denue/. Solo conteos.
   Si los archivos no están (p. ej. la versión artifact), el widget muestra «sin datos»
   y el resto del sitio sigue funcionando. */
const DENUE={base:"data/denue/", meta:null, nac:null, giros:null, clases:null, ent:{}};
const fmtN=n=>Number(n).toLocaleString("es-MX");
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
async function jsonDenue(ruta){
  const r=await fetch(DENUE.base+ruta,{cache:"no-cache"});
  if(!r.ok) throw new Error(ruta+" → HTTP "+r.status);
  return r.json();
}
function barras(ol, pares, total, max=12){
  const top=pares.slice(0,max), mayor=Math.max(1,...top.map(p=>p[1]));
  ol.innerHTML=top.map(([et,n,extra])=>'<li><span class="db-et">'+esc(et)+'</span><span class="db-barra" data-v="'+(n/mayor*100).toFixed(1)+'"></span><span class="db-n">'+fmtN(n)+(total?' <small>('+(n/total*100).toFixed(1)+' %)</small>':"")+(extra||"")+'</span></li>').join("")||'<li class="vacio">Sin registros.</li>';
  ol.querySelectorAll(".db-barra").forEach(b=>b.style.setProperty("--v",b.dataset.v));
}
const ESTRATOS_ORDEN=["0 a 5 personas","6 a 10 personas","11 a 30 personas","31 a 50 personas","51 a 100 personas","101 a 250 personas","251 y más personas"];
async function cargarDenue(){
  try{
    [DENUE.meta,DENUE.nac,DENUE.giros,DENUE.clases]=await Promise.all(["meta.json","nacional.json","giros.json","clases.json"].map(jsonDenue));
  }catch(err){
    console.warn("COATL · DENUE no disponible:",err.message);
    estadoWidget("wDenue","vacio","Los datos del DENUE no están disponibles en esta versión. Consulta el sitio publicado: https://maikolv.github.io/coatl/#denue");
    pintarCompetenciaDenue(); return;
  }
  const se=$("denueEnt");
  se.innerHTML=Object.entries(DENUE.nac.entidades).sort((a,b)=>a[0].localeCompare(b[0])).map(([k,v])=>'<option value="'+k+'">'+k+" · "+esc(v.nombre)+"</option>").join("");
  se.value=DENUE.nac.entidades["15"]?"15":se.options[0].value;
  const m=DENUE.meta, f=new Date(m.sincronizado);
  $("denueMeta").innerHTML="Fuente: "+m.fuente+' (<a href="'+m.url+'" target="_blank" rel="noopener">descarga oficial</a>). Sincronizado el '+f.toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})+" · "+fmtN(m.total_establecimientos)+" establecimientos en "+fmtN(m.municipios)+" municipios de "+m.entidades+" entidades.";
  await poblarMunicipios("020");
  pintarCompetenciaDenue();
}
async function poblarMunicipios(prefer){
  const ee=$("denueEnt").value;
  const muns=Object.values(DENUE.nac.municipios).filter(x=>x.ent===ee).sort((a,b)=>a.nombre.localeCompare(b.nombre,"es"));
  $("denueMun").innerHTML='<option value="">Toda la entidad</option>'+muns.map(x=>'<option value="'+x.mun+'">'+esc(x.nombre)+"</option>").join("");
  if(prefer && muns.some(x=>x.mun===prefer)) $("denueMun").value=prefer;
  await pintarDenue();
}
async function pintarDenue(){
  const ee=$("denueEnt").value, mm=$("denueMun").value;
  estadoWidget("wDenue","cargando","Cargando "+(DENUE.nac.entidades[ee]||{}).nombre+"…");
  try{
    if(!DENUE.ent[ee]) DENUE.ent[ee]=await jsonDenue("ent/"+ee+".json");
    const E=DENUE.ent[ee], muns=mm?[E[mm]]:Object.values(E);
    if(!muns.length||!muns[0]){estadoWidget("wDenue","vacio");return}
    const suma=k=>{const c={};muns.forEach(x=>Object.entries(x[k]||{}).forEach(([a,n])=>c[a]=(c[a]||0)+n));return c};
    const clases=suma("clases"), estr=suma("estratos"), altas=suma("altas");
    const total=Object.values(clases).reduce((a,b)=>a+b,0);
    const sect={}; Object.entries(clases).forEach(([c,n])=>{const s=DENUE.meta.sectores_scian[c.slice(0,2)]||("Sector "+c.slice(0,2));sect[s]=(sect[s]||0)+n});
    const lugar=mm?E[mm].nombre+", "+DENUE.nac.entidades[ee].nombre:DENUE.nac.entidades[ee].nombre;
    const pobl=(ee==="15"&&mm==="020")?' · <span class="proc proc-oficial">293,444 hab. (Censo 2020): '+(total/293444*1000).toFixed(1)+" por cada 1,000</span>":"";
    $("denueCifras").innerHTML='<div><span>Establecimientos en '+esc(lugar)+'</span><b>'+fmtN(total)+"</b>"+pobl+"</div>"+
      '<div><span>Actividades distintas (clases SCIAN)</span><b>'+fmtN(Object.keys(clases).length)+"</b></div>"+
      '<div><span>Micro (0 a 5 personas)</span><b>'+(total?((estr["0 a 5 personas"]||0)/total*100).toFixed(1):0)+" %</b></div>";
    barras($("denueSectores"),Object.entries(sect).sort((a,b)=>b[1]-a[1]),total,10);
    barras($("denueEstratos"),ESTRATOS_ORDEN.filter(k=>estr[k]).map(k=>[k,estr[k]]),total,7);
    const anios=Object.entries(altas).filter(([a])=>/^\d{4}$/.test(a)&&+a>=2010).sort();
    barras($("denueAltas"),anios.map(([a,n])=>[a,n]),0,20);
    const q=$("denueBusca").value.trim().toLowerCase();
    let cl=Object.entries(clases).map(([c,n])=>[c+" · "+(DENUE.clases[c]||"Clase "+c),n]);
    if(q) cl=cl.filter(([t])=>t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").includes(q.normalize("NFD").replace(/[̀-ͯ]/g,"")));
    barras($("denueClases"),cl.sort((a,b)=>b[1]-a[1]),total,q?40:15);
    if(q && !cl.length) estadoWidget("wDenue","vacio","Ninguna actividad coincide con «"+q+"».");
    else estadoWidget("wDenue","listo");
  }catch(err){ console.warn(err); estadoWidget("wDenue","error"); }
}
$("denueEnt").addEventListener("change",()=>poblarMunicipios());
$("denueMun").addEventListener("change",pintarDenue);
let tBusca=null; $("denueBusca").addEventListener("input",()=>{clearTimeout(tBusca);tBusca=setTimeout(pintarDenue,200)});

/* Competencia registrada en el DENUE para el giro del simulador (Coacalco = 15020). */
function pintarCompetenciaDenue(){
  const el=$("compDenue"); if(!el) return;
  const g=$("giro").value, codigos=DENUE.meta&&DENUE.meta.giros_scian[g];
  if(!DENUE.giros||!codigos){ el.textContent=""; return; }
  if(!codigos.length){ el.innerHTML='DENUE: este giro no tiene una clase SCIAN propia; no hay conteo oficial.'; return; }
  const n=(DENUE.giros["15020"]||{})[g]||0;
  const comp=Object.entries(DENUE.meta.clases_compartidas||{}).filter(([c,gs])=>codigos.includes(c)&&gs.length>1).map(([c])=>c);
  el.innerHTML='DENUE: <strong>'+fmtN(n)+'</strong> establecimientos de este giro en todo Coacalco (SCIAN '+codigos.join(", ")+(comp.length?"; clase compartida con otro giro":"")+'). El selector de arriba es la competencia <em>cercana</em> a tu local.';
}
$("giro").addEventListener("change",pintarCompetenciaDenue);
if("IntersectionObserver" in window){
  const io=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)){ io.disconnect(); cargarDenue(); } },{rootMargin:"600px 0px"});
  io.observe($("denue")); io.observe($("simulador"));
  window.addEventListener("hashchange",()=>{ if(!DENUE.meta) cargarDenue(); },{once:true});
} else cargarDenue();
