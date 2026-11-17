/* ---------- 28. Mejora tu negocio: alternativas, diagnóstico de 5 niveles, fiscal y modelo 2.5D ----------
   Todo sale del mismo motor: palancas() y probDe() para las alternativas, estimarFiscal() para
   los impuestos, PUNTOS_MADUREZ para los borradores y escenaNegocio() para el dibujo. */
let ultimoMejora=null, escenaModo="hoy", altPrevio=null, madurezLista=false;
const ZONA_ESCENA={corredor:"corredor",centro:"centro",flores:"residencial",heroes:"residencial",popular:"popular",periferia:"periferia"};
const CATEGORIA_GIRO={restaurante:"alimentos",pizzeria:"alimentos",cafeteria:"alimentos",jugueria:"alimentos",panaderia:"alimentos",pasteleria:"alimentos",
  farmacia:"salud",naturista:"salud",dental:"salud",optica:"salud",veterinaria:"salud",consultorio:"salud",
  taller:"taller",refaccionaria:"taller",autolavado:"taller",ferreteria:"taller",
  estetica:"servicios",spa:"servicios",lavanderia:"servicios",gimnasio:"servicios",ciber:"servicios",educacion:"educacion"};
function categoriaGiro(clave){
  if(CATEGORIA_GIRO[clave]) return CATEGORIA_GIRO[clave];
  const m=/^scian_(\d{2})/.exec(clave||"");
  if(m){ const s=m[1]; if(s==="72") return "alimentos"; if(s==="62") return "salud"; if(s==="61") return "educacion"; if(s==="81") return "servicios"; if(s>="31"&&s<="33") return "taller"; }
  return "comercio";
}
function contextoNegocio(){
  const {e,modelo,mc,fin}=ultimoMejora, nombre=negocioActual||"", d=x=>mxn.format(Math.round(x));
  const fiscal=estimarFiscal(e.ventasMes,e.utilMes,e.empleados*e.costoEmpleado);
  const res=$("reserva");
  return {e,modelo,mc,fin,fiscal,
    nombre:nombre||"Tu negocio", N:nombre?"«"+nombre+"»":"tu negocio", conNombre:!!nombre,
    giro:e.giro.n.toLowerCase(), zona:CORTOS[e.zonaKey]||e.zona.n, ticket:d(e.ticket), clientes:Math.round(e.mu),
    clientesDoble:Math.round(e.mu*2), ventasMes:d(e.ventasMes), margenPct:pct(1-e.cvEff), margenUnit:d(e.margenUnit),
    pe:isFinite(e.peDia)?Math.ceil(e.peDia):"más de los que caben hoy en tu escenario", fijos:d(e.fijos), fijos6:d(e.fijos*6), fijos12:d(e.fijos*12),
    fijosSemana:d(e.fijos/4.33), inversion:d(e.inversion), empleadosTxt:e.empleados===1?"1 empleado":e.empleados+" empleados",
    utilNum:e.utilMes, util:d(e.utilMes), utilAnual:d(e.utilMes*12), paybackNum:fin.payback,
    paybackTxt:fin.payback?fin.payback.toFixed(1)+" meses":"un plazo que hoy no se alcanza", mktGasto:d(e.mktGasto||0),
    mktZ:e.mktZ, resZ:e.resZ, formZ:e.formZ, permZ:e.permZ||0, reservaTxt:res.options[res.selectedIndex]?res.options[res.selectedIndex].text:"",
    ventasPor100:e.margenUnit>0?Math.ceil(300/e.margenUnit):"varias", m2:e.superficie, cvPct:pct(e.cvEff), credPct:pct(e.credPct),
    costoEmpleado:d(e.costoEmpleado), regimenTxt:fiscal.regimen==="resico_pf"?"RESICO de personas físicas, si cumples los requisitos":"régimen general, por tu nivel de ingresos",
    isrMes:d(fiscal.isrMes), P:pct(modelo.P), p05:d(mc.p05), merma:pct(e.merma||0), historial:typeof empresa!=="undefined"&&!!empresa};
}
function estadosMadurez(c){
  const est={};
  PUNTOS_MADUREZ.forEach(p=>{ est[p.id]=p.id in respuestasMadurez?respuestasMadurez[p.id]:(p.auto?p.auto(c):0); });
  return est;
}

/* --- Alternativas: las palancas de mayor impacto, con botón para probarlas en el formulario --- */
function pintarAlternativas(c){
  seguro("wAlternativas",()=>{
    const P0=c.modelo.P, L=palancas(c.e,P0).slice(0,4);
    if(!L.length){ $("alternativas").innerHTML=""; estadoWidget("wAlternativas","vacio","Tu escenario ya aprovecha las palancas principales del modelo. Revisa el diagnóstico de abajo."); return false; }
    $("alternativas").innerHTML=L.map(l=>'<div class="alt"><p class="alt-t">'+l.titulo+'</p><p class="alt-q">'+l.que+'</p>'+
      '<p class="alt-p">'+pct(P0)+' → <strong>'+pct(Math.max(P0,l.P))+'</strong> (+'+(l.lift*100).toFixed(1)+' pts)</p>'+
      '<button type="button" class="btn btn-widget" data-alt="'+l.clave+'"'+(l.zonaK?' data-zona="'+l.zonaK+'"':"")+'>Probar en el simulador</button></div>').join("");
  });
}
function aplicarAlternativa(clave, zonaK){
  if(!ultimoMejora) return;
  const e=ultimoMejora.e;
  altPrevio=serializarEscenario();
  const sel=(id,v)=>{ const s=$(id), o=[...s.options].reduce((m,x)=>Math.abs(+x.value-v)<Math.abs(+m.value-v)?x:m); s.value=o.value; };
  const n=(id,v)=>{ const c=$(id); c.value=String(v); c.dispatchEvent(new Event("input",{bubbles:true})); };
  if(clave==="reserva") sel("reserva",0.20);
  else if(clave==="deuda") n("credito",15);
  else if(clave==="margen") n("cvar",Math.max(30,Math.round(e.cv*100-10)));
  else if(clave==="marketing"){ sel("marketing",0.12); n("clientes",Math.round(e.muBase*1.12)); }
  else if(clave==="formalidad") sel("formalidad",0.10);
  else if(clave==="experiencia") sel("experiencia",0.15);
  else if(clave==="diferenciacion"){ sel("competencia",0); sel("marketing",Math.min(0.12,e.mktZ+0.07)); }
  else if(clave==="retencion"){ n("clientes",Math.round(e.muBase*1.07)); n("cvar",Math.max(5,Math.round(e.cv*100-1))); }
  else if(clave==="zona"&&zonaK&&ZONAS[zonaK]){ $("zona").value=zonaK; $("zona").dispatchEvent(new Event("change",{bubbles:true})); }
  calcular();
  $("altDeshacer").hidden=false; $("altDeshacer").focus();
  if(typeof toast==="function") toast("Alternativa aplicada al simulador. Puedes deshacerla.");
}
$("alternativas").addEventListener("click",ev=>{ const b=ev.target.closest("button[data-alt]"); if(b) aplicarAlternativa(b.dataset.alt,b.dataset.zona); });
$("altDeshacer").addEventListener("click",()=>{
  if(altPrevio) cargarEscenario(altPrevio);
  altPrevio=null; $("altDeshacer").hidden=true;
  const b=$("alternativas").querySelector("button"); if(b) b.focus();
});

/* --- Diagnóstico de solidez: la estructura se crea una vez; después solo cambian textos y estados --- */
function construirMadurez(){
  $("madurezNiveles").innerHTML=NIVELES_MADUREZ.map(nv=>'<details class="mad-nivel"'+(nv.n===1?" open":"")+'><summary>Nivel '+nv.n+' · '+nv.t+' <small>'+nv.s+'</small><span class="mad-pct" id="madPct'+nv.n+'"></span></summary><div class="mad-items">'+
    PUNTOS_MADUREZ.filter(p=>p.n===nv.n).map(p=>'<div class="mad-item" id="mad-'+p.id+'" data-e="0"><h3>'+p.t+'</h3><p class="mad-que">'+p.q+'</p>'+
      '<p class="mad-borrador"><b>Borrador para tu negocio</b><span id="madB-'+p.id+'"></span></p>'+
      '<label>¿Cómo vas? <select data-mad="'+p.id+'"><option value="0">Pendiente</option><option value="1">En proceso</option><option value="2">Listo</option></select></label>'+
      '<span class="mad-auto" id="madA-'+p.id+'"></span></div>').join("")+'</div></details>').join("");
  madurezLista=true;
}
function pintarMadurez(c){
  let r=null;
  seguro("wMadurez",()=>{
    if(!madurezLista) construirMadurez();
    const est=estadosMadurez(c); r=indiceMadurez(est);
    PUNTOS_MADUREZ.forEach(p=>{
      $("madB-"+p.id).textContent=p.b(c);
      const it=$("mad-"+p.id), s=it.querySelector("select");
      it.dataset.e=String(est[p.id]);
      if(document.activeElement!==s) s.value=String(est[p.id]);
      $("madA-"+p.id).textContent=(p.id in respuestasMadurez)||!est[p.id]?"":"Sugerido por tu simulador; cámbialo si no es así.";
    });
    NIVELES_MADUREZ.forEach((nv,i)=>{ $("madPct"+nv.n).textContent=Math.round(r.porNivel[i]*100)+" %"; });
    const sig=r.pendientes[0];
    $("madurezResumen").innerHTML='<div class="mad-indice">'+r.indice+'<small>solidez de 100 · nivel '+r.nivel+' de 5</small></div>'+
      '<div class="mad-barras">'+NIVELES_MADUREZ.map((nv,i)=>'<div class="mad-barra"><span>Nivel '+nv.n+'</span><progress max="100" value="'+Math.round(r.porNivel[i]*100)+'" aria-label="Nivel '+nv.n+', '+nv.t+': '+Math.round(r.porNivel[i]*100)+' por ciento"></progress><span>'+Math.round(r.porNivel[i]*100)+' %</span></div>').join("")+'</div>'+
      '<p class="mad-sig">'+(sig?'<strong>Siguiente paso:</strong> '+esc(sig.t)+' (nivel '+sig.n+'). '+esc(sig.q):'<strong>Diagnóstico completo.</strong> Revisa tus borradores cada trimestre.')+'</p>';
  });
  return r;
}
$("madurezNiveles").addEventListener("change",ev=>{
  const s=ev.target.closest("select[data-mad]"); if(!s) return;
  respuestasMadurez[s.dataset.mad]=+s.value;
  repintarMejora();
});

/* --- Fiscal y contable --- */
function pintarFiscal(c){
  seguro("wFiscal",()=>{
    const f=c.fiscal, e=c.e, d=x=>mxn.format(Math.round(x));
    const fila=(k,v,cl)=>'<tr'+(cl?' class="'+cl+'"':"")+'><th scope="row">'+k+'</th><td>'+v+'</td></tr>';
    const resico=f.regimen==="resico_pf";
    $("fiscalCuerpo").innerHTML='<table class="tabla-fiscal"><caption class="sr-only">Estimación fiscal mensual</caption><tbody>'+
      fila("Ventas del mes (ingresos sin IVA)",d(f.ventasMes))+
      fila("Utilidad antes de impuestos",d(e.utilMes))+
      fila(resico?"ISR estimado · RESICO persona física ("+(f.tasaResico*100).toFixed(1)+" % de los ingresos)":"ISR estimado · régimen general (30 % de la utilidad)","− "+d(f.isrMes))+
      fila("Utilidad después de ISR",d(f.utilDespues),"total")+
      "</tbody></table>"+
      '<p class="nota-widget">'+(resico?"Como persona moral en régimen general pagarías cerca de "+d(f.isrGeneral)+" (30 % de la utilidad).":"Tus ingresos anuales estimados ("+d(f.ingresoAnual)+") superan el tope de 3.5 millones del RESICO para personas físicas.")+
      " IVA a trasladar si todo lo que vendes causa 16 %: "+d(f.ivaTrasladado)+" al mes (lo cobras al cliente y lo enteras; no es ingreso tuyo)."+
      (f.isn>0?" Impuesto sobre nómina del Estado de México (3 %): "+d(f.isn)+" al mes, si tu costo por empleado aún no lo incluye.":"")+"</p>"+
      '<p class="fiscal-h">Lo que debes cumplir</p><ul class="fiscal-lista">'+
      "<li><strong>Alta:</strong> RFC, e.firma y buzón tributario activos; régimen fiscal elegido con tu contador.</li>"+
      "<li><strong>Facturación:</strong> CFDI por cada venta que lo solicite y factura global por el resto.</li>"+
      "<li><strong>Cada mes:</strong> declaración y pago a más tardar el día 17 del mes siguiente; aparta "+d(f.isrMes)+" para el ISR.</li>"+
      "<li><strong>Cada año:</strong> declaración anual (abril para personas físicas, marzo para personas morales).</li>"+
      (e.empleados>0?"<li><strong>Nómina:</strong> alta en el IMSS desde el primer día, cuotas de IMSS e Infonavit, recibos timbrados y aguinaldo.</li>":"")+
      "<li><strong>Contabilidad:</strong> guarda las facturas de tus gastos, separa la cuenta del negocio de la personal y concilia el banco cada mes.</li></ul>";
  });
}

/* --- Modelo 2.5D --- */
function datosEscena(c,nivel){
  return {nombre:c.nombre, categoria:categoriaGiro($("giro").value), m2:c.e.superficie, empleados:c.e.empleados,
    clientes:Math.round(c.e.mu), zona:ZONA_ESCENA[c.e.zonaKey]||"residencial", nivel};
}
function ponerEscena(cont,svg){ if(cont.dataset.svg!==svg){ cont.innerHTML=svg; cont.dataset.svg=svg; } }
function pintarEscena(c,nivelHoy){
  seguro("wEscena",()=>{
    const pot=escenaModo==="potencial";
    ponerEscena($("escenaNegocio"),escenaNegocio(datosEscena(c,pot?5:nivelHoy)));
    $("escenaHoy").setAttribute("aria-pressed",String(!pot)); $("escenaPotencial").setAttribute("aria-pressed",String(pot));
    $("escenaNota").textContent=pot
      ?"Así puede verse "+c.N+" al completar los cinco niveles: local ampliado, reparto, segunda sucursal y operación sostenible. Es una ilustración generada con tus datos, no un plano."
      :"Así se ve "+c.N+" hoy según tus datos: "+c.m2+" m², "+c.empleadosTxt+", "+c.clientes+" clientes al día y nivel de solidez "+nivelHoy+" de 5. Cada nivel que completes agrega elementos al dibujo.";
  });
}
$("escenaHoy").addEventListener("click",()=>{ escenaModo="hoy"; repintarMejora(); });
$("escenaPotencial").addEventListener("click",()=>{ escenaModo="potencial"; repintarMejora(); });

/* --- Ficha del negocio en Estrategia --- */
function pintarFicha(c,r){
  seguro("wFichaNegocio",()=>{
    const d=x=>mxn.format(Math.round(x));
    $("fichaDatos").innerHTML="<h3>"+esc(c.nombre)+"</h3><p class=\"nota-widget\">"+esc(c.e.giro.n)+" · "+esc(c.zona)+"</p>"+
      "<dl><div><dt>Probabilidad a 3 años</dt><dd>"+c.P+"</dd></div><div><dt>Solidez</dt><dd>"+r.indice+" / 100</dd></div>"+
      "<div><dt>Nivel</dt><dd>"+r.nivel+" de 5</dd></div><div><dt>Utilidad después de ISR</dt><dd>"+d(c.fiscal.utilDespues)+"</dd></div></dl>"+
      (r.pendientes.length?"<p><strong>Tus siguientes pasos</strong></p><ol>"+r.pendientes.slice(0,3).map(p=>"<li>"+esc(p.t)+" <span class=\"nota-widget\">(nivel "+p.n+")</span></li>").join("")+"</ol>":"<p><strong>Diagnóstico completo.</strong></p>");
    ponerEscena($("fichaEscena"),escenaNegocio(datosEscena(c,5)));
  });
}

function repintarMejora(){
  if(!ultimoMejora) return;
  const c=contextoNegocio();
  $("mejoraNombre").textContent=c.conNombre?"Negocio en revisión: «"+c.nombre+"».":"Ponle nombre a tu negocio al inicio del simulador para personalizar los borradores.";
  pintarAlternativas(c);
  const r=pintarMadurez(c)||indiceMadurez(estadosMadurez(c));
  pintarFiscal(c);
  pintarEscena(c,r.nivel);
  pintarFicha(c,r);
}
function pintarMejora(e,modelo,mc,fin){ ultimoMejora={e,modelo,mc,fin,v:versionCalculo}; repintarMejora(); }
