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
  const orden=[...datosMapa].sort((a,b)=>b.P-a.P);
  $("ranking").innerHTML=orden.map((d,i)=>{
    const med=i===0?"🥇":i===1?"🥈":i===2?"🥉":(i+1)+"°";
    return '<li data-zona="'+d.k+'"><button type="button" class="rk-zona" title="Trasladar el escenario a esta zona"><span class="medalla">'+med+
      '</span><span class="punto" data-color="'+colorP(d.P)+'"></span><span class="rz">'+CORTOS[d.k]+
      '<span class="ru">utilidad esperada '+mxn.format(Math.round(d.util))+'/mes</span></span><span class="rp">'+
      Math.round(d.P*100)+"%</span></button></li>";
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
$("ranking").addEventListener("click",ev=>{
  const li=ev.target.closest("li[data-zona]"); if(li)irAZona(li.dataset.zona);
});

/* ---------- 11-bis. Mapa real de zonas (Leaflet + OpenStreetMap / Esri satélite) ----------
   Una sola función dibuja el mapa en cualquier contenedor: las 70 AGEB urbanas oficiales del INEGI
   (data/ageb/coacalco.json, scripts/ageb_sync.mjs) agrupadas en las seis zonas y coloreadas por P.
   La usan el Simulador (#mapaReal) e Inicio (#mapa25). COORDS_ZONAS solo asigna cada AGEB a una zona
   (ageb_sync.mjs las lee) y sirve de respaldo si el archivo de AGEB no carga. */
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
let AGEB_COACALCO=null, cargaLeaflet=null, cargaAgeb=null;
const MAPAS=[];   // instancias activas: {mapa, capas, alClic, seleccion}
const ESTILO_ZONA={color:"#FFFFFF",weight:2.5,fillColor:"#E9B9BE",fillOpacity:.55};
function crearMapaZonas(id, alClic, opciones={}){
  if(typeof L==="undefined") return null;
  const cont=$(id); if(!cont||cont._mapa) return cont&&cont._mapa;
  const mapa=L.map(id,{scrollWheelZoom:false,center:[19.644,-99.090],zoom:opciones.zoom||13});
  const calles=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:"© Colaboradores de OpenStreetMap"});
  const satelite=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:18,attribution:"Imágenes © Esri, Maxar, Earthstar Geographics"});
  calles.addTo(mapa);
  L.control.layers({"Calles (OpenStreetMap)":calles,"Satélite (fotografía Esri)":satelite},null,{position:"topright"}).addTo(mapa);
  L.control.scale({imperial:false}).addTo(mapa);
  const inst={mapa, capas:{}, alClic, seleccion:opciones.seleccion||(()=>escZonaActual)};
  const crearZona=(k,capa,centro)=>{
    capa.on("click",()=>inst.alClic(k));
    capa.on("mouseover",()=>capa.setStyle({weight:4,fillOpacity:.72}));
    capa.on("mouseout",()=>capa.setStyle({weight:capa._activa?4.5:2.5,fillOpacity:.55}));
    capa.addTo(mapa);
    capa.etiqueta=L.tooltip({permanent:true,direction:"center",className:"lf-et"}).setLatLng(centro).setContent(CORTOS[k]).addTo(mapa);
    inst.capas[k]=capa;
  };
  const dibujar=()=>{
    for(const k in inst.capas){ mapa.removeLayer(inst.capas[k]); mapa.removeLayer(inst.capas[k].etiqueta); }
    inst.capas={};
    for(const k in COORDS_ZONAS){
      const lista=AGEB_COACALCO?AGEB_COACALCO.agebs.filter(a=>a.zona===k):[];
      if(lista.length){
        const g=L.featureGroup(lista.map(a=>L.polygon(a.poligonos,ESTILO_ZONA).bindTooltip("AGEB "+esc(a.ageb)+" · "+fmtN(a.pob)+" hab. (Censo 2020)")));
        crearZona(k,g,g.getBounds().getCenter()); g.resumen=AGEB_COACALCO.resumen[k];
      } else { const p=L.polygon(COORDS_ZONAS[k],ESTILO_ZONA); crearZona(k,p,p.getBounds().getCenter()); }
    }
    actualizarMapa(inst);
    mapa.fitBounds(L.featureGroup(Object.values(inst.capas)).getBounds(),{padding:[14,14]});   // encuadre: solo Coacalco
  };
  dibujar();
  cargaAgeb ??= fetch("data/ageb/coacalco.json").then(r=>r.ok?r.json():null).catch(()=>null);
  cargaAgeb.then(j=>{ if(j&&j.agebs){ AGEB_COACALCO=j; dibujar(); } });
  HITOS.forEach(h=>L.marker(h.ll,{icon:L.divIcon({className:"lf-hito",iconSize:[14,14]}),title:h.t,alt:h.t,keyboard:true}).bindTooltip(h.t).addTo(mapa).getElement()?.setAttribute("aria-label",h.t));
  setTimeout(()=>mapa.invalidateSize(),300);
  cont._mapa=inst; MAPAS.push(inst);
  return inst;
}
function actualizarMapa(inst){
  const sel=inst.seleccion();
  datosMapa.forEach(d=>{
    const pol=inst.capas[d.k]; if(!pol) return;
    pol._activa=(d.k===sel);
    pol.setStyle({fillColor:colorP(d.P),color:pol._activa?"#38070F":"#FFFFFF",weight:pol._activa?4.5:2.5});
    pol.etiqueta.setContent(CORTOS[d.k]+"<br>"+(d.P*100).toFixed(1)+"%");
    pol.bindPopup("<strong>"+d.z.n+"</strong><br>P(éxito a 3 años): <strong>"+(d.P*100).toFixed(1)+"%</strong><br>Utilidad esperada: "+mxn.format(Math.round(d.util))+"/mes<br>Renta ref.: $"+d.z.rm2+"/m²·mes · Afluencia: "+d.z.afl.toFixed(2)+"<br>"+(pol.resumen?"Población 2020 (INEGI): "+fmtN(pol.resumen.pob)+" en "+pol.resumen.agebs+" AGEB<br>":""));
  });
}
function actualizarLeaflet(){ MAPAS.forEach(actualizarMapa); }
/* Carga Leaflet una sola vez y dibuja el mapa; sin conexión, el contenedor explica que el ranking sigue disponible. */
async function montarMapa(id, alClic, opciones){
  cargaLeaflet ??= cargarBiblioteca("libLeaflet");
  const ok=await cargaLeaflet;
  const inst=ok?crearMapaZonas(id, alClic, opciones):null;
  if(!inst){ $(id).classList.add("mapa-sin-red"); $(id).textContent="Sin conexión al mapa: la lista de zonas de al lado conserva los mismos resultados."; return null; }
  setTimeout(()=>{inst.mapa.invalidateSize(); actualizarMapa(inst);},60);
  return inst;
}
function usarReal(){ return montarMapa("mapaReal", irAZona); }
