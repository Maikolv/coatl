/* ---------- 11. Mapa de probabilidad por zona ---------- */
const CORTOS={
  corredor:"Corredor López Portillo", centro:"Centro S. Francisco",
  flores:"Villa de las Flores", heroes:"Héroes · Loma Bonita",
  popular:"Potrero · San Rafael", periferia:"Periferia norte"
};
function colorP(p){
  const tope=[[0.04,[200,16,46]],[0.45,[232,162,63]],[0.65,[31,122,77]],[0.93,[17,90,55]]];
  p=acota(p,0.04,0.93);
  let i=0; while(i<tope.length-2 && p>tope[i+1][0]) i++;
  const [pa,ca]=tope[i],[pb,cb]=tope[i+1], k=(p-pa)/(pb-pa);
  const c=ca.map((v,j)=>Math.round(v+(cb[j]-v)*k));
  return "rgb("+c[0]+","+c[1]+","+c[2]+")";
}
let datosMapa=[], escZonaActual="heroes";
/* Traslada el mismo negocio a otra zona: renta de referencia y demanda escalada
   por afluencia. Se usa en el mapa, el comparador y el plan FODA (hallazgo 3 de Codex). */
function trasladarZona(e,k){
  const c=Object.assign({},e);
  c.zonaKey=k; c.zona=ZONAS[k];
  c.renta=e.propio?0:Math.round(ZONAS[k].rm2*e.superficie/100)*100;
  c.mu=Math.max(1,e.mu/e.zona.afl*ZONAS[k].afl);
  return derivar(c);
}
function pintarMapa(e,modelo){
  datosMapa=Object.keys(ZONAS).map(k=>{
    if(k===e.zonaKey) return {k,z:ZONAS[k],P:modelo.P,util:e.utilMes};
    const c=trasladarZona(e,k);
    return {k,z:ZONAS[k],P:modeloLogistico(c).P,util:c.utilMes};
  });
  escZonaActual=e.zonaKey;
  datosMapa.forEach(d=>{
    const p=$("mz-"+d.k);
    p.style.fill=colorP(d.P);
    p.classList.toggle("activa",d.k===e.zonaKey);
    $("pl-"+d.k).textContent=(d.P*100).toFixed(1)+"%";
  });
  const orden=[...datosMapa].sort((a,b)=>b.P-a.P);
  $("ranking").innerHTML=orden.map((d,i)=>{
    const med=i===0?"🥇":i===1?"🥈":i===2?"🥉":(i+1)+"°";
    return '<li data-zona="'+d.k+'" title="Probar esta zona"><span class="medalla">'+med+
      '</span><span class="punto" data-color="'+colorP(d.P)+'"></span><span class="rz">'+CORTOS[d.k]+
      '<span class="ru">utilidad esperada '+mxn.format(Math.round(d.util))+'/mes</span></span><span class="rp">'+
      Math.round(d.P*100)+"%</span></li>";
  }).join("");
  document.querySelectorAll("#ranking .punto[data-color]").forEach(s=>{s.style.background=s.dataset.color});
  const mejor=orden[0], actual=datosMapa.find(d=>d.k===e.zonaKey);
  $("recomendacion").innerHTML = mejor.k===e.zonaKey
    ? "Tu zona actual (<strong>"+CORTOS[mejor.k]+"</strong>) es la de mayor probabilidad para este escenario. Buena ubicación."
    : "Este mismo negocio en <strong>"+CORTOS[mejor.k]+"</strong> ganaría "+Math.round((mejor.P-actual.P)*100)+
      " puntos de probabilidad frente a tu zona actual (ajustando renta y afluencia). Haz clic en el mapa para probarla.";
  actualizarLeaflet();
}
function irAZona(k){
  const e=leerEscenario(), muN=e.muBase/e.zona.afl;
  $("zona").value=k;
  if(!e.propio) $("renta").value=Math.round(ZONAS[k].rm2*e.superficie/100)*100;
  $("clientes").value=Math.max(1,Math.round(muN*ZONAS[k].afl));
  calcular();
  toast("Escenario trasladado a "+CORTOS[k]+": renta y demanda ajustadas a la zona.");
}
(function mapaInteractivo(){
  const cont=document.querySelector(".mapa-cont"), tip=$("mapaTip");
  document.querySelectorAll(".zona-mapa").forEach(p=>{
    const k=p.dataset.zona;
    p.setAttribute("tabindex","0");
    p.setAttribute("role","button");
    p.setAttribute("aria-label","Evaluar escenario en "+ZONAS[k].n);
    p.addEventListener("mousemove",ev=>{
      const d=datosMapa.find(x=>x.k===k); if(!d)return;
      const r=cont.getBoundingClientRect();
      tip.style.left=Math.max(6,Math.min(r.width-236,ev.clientX-r.left+14))+"px";
      tip.style.top=(ev.clientY-r.top+12)+"px";
      tip.innerHTML="<strong>"+d.z.n+"</strong><br>P(éxito a 3 años): <strong>"+Math.round(d.P*100)+
        "%</strong><br>Utilidad esperada: "+mxn.format(Math.round(d.util))+"/mes<br>Renta ref.: $"+d.z.rm2+
        "/m²·mes · Afluencia: "+d.z.afl.toFixed(2);
      tip.style.opacity=1;
    });
    p.addEventListener("mouseleave",()=>tip.style.opacity=0);
    p.addEventListener("click",()=>irAZona(k));
    p.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();irAZona(k)}});
  });
  $("ranking").addEventListener("click",ev=>{
    const li=ev.target.closest("li[data-zona]"); if(li)irAZona(li.dataset.zona);
  });
})();

/* ---------- 11-bis. Mapa real (Leaflet + OpenStreetMap / Esri satélite) ---------- */
const COORDS_ZONAS={
  popular:  [[19.617,-99.130],[19.617,-99.104],[19.648,-99.104],[19.650,-99.118],[19.640,-99.130]],
  centro:   [[19.629,-99.104],[19.629,-99.084],[19.650,-99.084],[19.648,-99.104]],
  flores:   [[19.629,-99.084],[19.629,-99.058],[19.654,-99.058],[19.654,-99.084],[19.650,-99.084]],
  corredor: [[19.6185,-99.124],[19.6185,-99.058],[19.629,-99.058],[19.629,-99.124]],
  heroes:   [[19.650,-99.118],[19.650,-99.084],[19.668,-99.084],[19.668,-99.112]],
  periferia:[[19.654,-99.084],[19.654,-99.050],[19.676,-99.050],[19.676,-99.084]]
};
const HITOS=[
  {ll:[19.6377,-99.0937],t:"Palacio Municipal de Coacalco (referencia aproximada)"},
  {ll:[19.6253,-99.0906],t:"Power Center Coacalco (referencia aproximada)"},
  {ll:[19.6262,-99.1079],t:"Plaza Cosmopol (referencia aproximada)"}
];
let AGEB_COACALCO=null, mapaL=null, capasZona={}, fallosTesela=0, cayoEsquema=false;
function initLeaflet(){
  if(typeof L==="undefined"||mapaL) return !!mapaL;
  try{
    mapaL=L.map("mapaReal",{scrollWheelZoom:false,center:[19.644,-99.090],zoom:13});
    const calles=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:"© Colaboradores de OpenStreetMap"});
    const satelite=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:18,attribution:"Imágenes © Esri, Maxar, Earthstar Geographics"});
    calles.on("tileerror",()=>{fallosTesela++; if(fallosTesela>7 && !cayoEsquema){usarEsquema(); toast("Sin conexión a los mapas: mostrando el esquema del equipo.");}});
    calles.addTo(mapaL);
    L.control.layers({"Calles (OpenStreetMap)":calles,"Satélite (fotografía Esri)":satelite},null,{position:"topright"}).addTo(mapaL);
    L.control.scale({imperial:false}).addTo(mapaL);
    const crearZona=(k,capa,centro)=>{
      capa.on("click",()=>irAZona(k));
      capa.on("mouseover",()=>capa.setStyle({weight:4,fillOpacity:.7}));
      capa.on("mouseout",()=>capa.setStyle({weight:capasZona[k]._activa?4.5:2.5,fillOpacity:.55}));
      capa.addTo(mapaL);
      capa.etiqueta=L.tooltip({permanent:true,direction:"center",className:"lf-et"}).setLatLng(centro).setContent(CORTOS[k]).addTo(mapaL);
      capasZona[k]=capa;
    };
    const ESTILO={color:"#FFFFFF",weight:2.5,fillColor:"#E9B9BE",fillOpacity:.55};
    for(const k in COORDS_ZONAS){ const p=L.polygon(COORDS_ZONAS[k],ESTILO); crearZona(k,p,p.getBounds().getCenter()); }
    // Límites oficiales: AGEB urbanas del INEGI agrupadas por zona (si el archivo está disponible).
    fetch("data/ageb/coacalco.json").then(r=>r.ok?r.json():null).then(j=>{
      if(!j||!j.agebs) return;
      for(const k in capasZona){ mapaL.removeLayer(capasZona[k]); mapaL.removeLayer(capasZona[k].etiqueta); }
      for(const k in COORDS_ZONAS){
        const g=L.featureGroup(j.agebs.filter(a=>a.zona===k).map(a=>L.polygon(a.poligonos,ESTILO).bindTooltip("AGEB "+esc(a.ageb)+" · "+fmtN(a.pob)+" hab. (Censo 2020)")));
        if(!g.getLayers().length) continue;
        crearZona(k,g,g.getBounds().getCenter()); g.resumen=j.resumen[k];
      }
      AGEB_COACALCO=j; actualizarLeaflet();
    }).catch(()=>{});
    HITOS.forEach(h=>L.marker(h.ll,{icon:L.divIcon({className:"lf-hito",iconSize:[14,14]}),title:h.t,alt:h.t,keyboard:true}).bindTooltip(h.t).addTo(mapaL).getElement()?.setAttribute("aria-label",h.t));
    setTimeout(()=>mapaL.invalidateSize(),300);
    return true;
  }catch(err){ mapaL=null; return false; }
}
function actualizarLeaflet(){
  if(!mapaL) return;
  datosMapa.forEach(d=>{
    const pol=capasZona[d.k]; if(!pol) return;
    pol._activa=(d.k===escZonaActual);
    pol.setStyle({fillColor:colorP(d.P),color:pol._activa?"#38070F":"#FFFFFF",weight:pol._activa?4.5:2.5});
    pol.etiqueta.setContent(CORTOS[d.k]+"<br>"+(d.P*100).toFixed(1)+"%");
    pol.bindPopup("<strong>"+d.z.n+"</strong><br>P(éxito a 3 años): <strong>"+(d.P*100).toFixed(1)+"%</strong><br>Utilidad esperada: "+mxn.format(Math.round(d.util))+"/mes<br>Renta ref.: $"+d.z.rm2+"/m²·mes · Afluencia: "+d.z.afl.toFixed(2)+"<br>"+(pol.resumen?"Población 2020 (INEGI): "+fmtN(pol.resumen.pob)+" en "+pol.resumen.agebs+" AGEB<br>":"")+"<em>Clic en la zona para trasladar tu escenario.</em>");
  });
}
function usarEsquema(){
  cayoEsquema=true;
  $("mapaReal").hidden=true; $("mapaEsquema").hidden=false;
  $("btnMapaEsquema").classList.add("activa"); $("btnMapaReal").classList.remove("activa");
}
let cargaLeaflet;
async function usarReal(){
  cayoEsquema=false;
  cargaLeaflet ??= cargarBiblioteca("libLeaflet");
  await cargaLeaflet;
  if(cayoEsquema) return;
  if(!initLeaflet()){ toast("El mapa real no está disponible (revisa tu conexión); mostrando el esquema."); usarEsquema(); return; }
  $("mapaReal").hidden=false; $("mapaEsquema").hidden=true;
  $("btnMapaReal").classList.add("activa"); $("btnMapaEsquema").classList.remove("activa");
  setTimeout(()=>{mapaL.invalidateSize(); actualizarLeaflet();},60);
}
$("btnMapaReal").addEventListener("click",usarReal);
$("btnMapaEsquema").addEventListener("click",usarEsquema);

