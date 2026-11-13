/* ---------- 24. Referencia censal por giro (INEGI, Censos Económicos 2019) ----------
   Compara el escenario con los micronegocios reales del mismo giro en Coacalco (datos de
   data/censo/giros.json, scripts/censo_sync.py) y permite aplicar esa referencia. Los valores por
   defecto no cambian: así el escenario de referencia sigue siendo reproducible. */
let CENSO=null, cargaCenso=null;
function refCenso(){ const g=GIROS[$("giro").value]; return CENSO&&g?CENSO.giros[g.base||$("giro").value]||null:null; }
function pintarCenso(){
  const caja=$("censoRef"), r=refCenso();
  if(!r){ caja.hidden=true; return; }
  const e=leerEscenario(), ventas=e.ventasMes*12, veces=ventas/r.ingreso_anual_ue;
  const fila=(c,a,b)=>"<tr><th scope=\"row\">"+c+"</th><td>"+a+"</td><td>"+b+"</td></tr>";
  caja.hidden=false;
  caja.innerHTML='<p class="censo-tit">Contraste con el censo: <b>'+fmtN(r.ue)+'</b> negocios reales del giro <span class="proc proc-oficial">dato oficial</span></p>'+
    '<table class="censo-tabla"><thead><tr><th scope="col">Por negocio</th><th scope="col">Tu escenario</th><th scope="col">Censo · '+esc(r.nivel)+'</th></tr></thead><tbody>'+
    fila("Ventas al año",mxn.format(Math.round(ventas)),mxn.format(r.ingreso_anual_ue))+
    fila("Costo directo",Math.round(e.cv*100)+"%",r.costo_directo_pct+"%")+
    fila("Personas trabajando",(e.empleados+1)+" (con quien lo dirige)",r.personal_ue.toLocaleString("es-MX"))+
    fila("Renta al mes",mxn.format(Math.round(e.rentaEf)),mxn.format(r.renta_mes_ue))+
    "</tbody></table>"+
    '<p class="censo-nota">'+(veces>1.5?"Tus ventas son <b>"+veces.toFixed(1)+" veces</b> las del negocio promedio de este tamaño: revisa clientes y ticket. ":"")+
    "Censo de 2018 en pesos de ese año (no ajustado por inflación); muchos negocios pequeños no pagan renta o la comparten.</p>"+
    '<button type="button" class="btn btn-widget btn-sec" id="censoAplicar">Usar la referencia del censo</button>';
  $("censoAplicar").addEventListener("click",()=>{
    const ee=leerEscenario();
    $("cvar").value=Math.min(90,Math.max(5,Math.round(r.costo_directo_pct)));
    $("clientes").value=Math.max(1,Math.round(r.ingreso_anual_ue/12/ee.diasMes/ee.ticket));
    $("empleados").value=Math.max(0,Math.round(r.personal_ue-1));
    if(r.renta_mes_ue>0) $("renta").value=Math.round(r.renta_mes_ue/100)*100;
    ["cvar","clientes"].forEach(id=>$(id).dispatchEvent(new Event("input")));
    calcular(); pintarCenso(); toast("Escenario ajustado al promedio censal del giro.");
  });
}
async function asegurarCenso(){
  cargaCenso ??= fetch("data/censo/giros.json").then(r=>r.ok?r.json():null).catch(()=>null);
  CENSO=await cargaCenso; pintarCenso();
}
$("giro").addEventListener("change",asegurarCenso);
$("forma").addEventListener("change",()=>{ if(CENSO) pintarCenso(); });
asegurarCenso();
