/* ---------- 20. Empresas: análisis con datos propios, 100 % local ----------
   El archivo se lee con FileReader en este navegador. No existe ninguna petición que lo
   envíe (la CSP solo permite conectar con el propio sitio para leer el DENUE). No se usa
   localStorage: los datos viven en memoria y se borran al recargar o con «Borrar».
   Excel se lee con SheetJS (cdnjs, con SRI), cargado solo si eliges un .xlsx/.xls. */
const XLSX_URL="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
const XLSX_SRI="sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw";
const MAX_BYTES=5*1024*1024, MIN_MESES=6;
let empresa=null;   // único lugar donde viven los datos de la empresa

function normCol(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"")}
const ALIAS={mes:["mes","periodo","fecha","month"],ventas:["ventas","ingresos","venta","ventas_mxn"],clientes:["clientes","tickets","transacciones","clientes_mes"],
  costo_variable:["costo_variable","costos_variables","cv","costo_de_ventas","costo_ventas"],costos_fijos:["costos_fijos","gastos_fijos","fijos","cf"]};
function parseCSV(texto){
  const sep=(texto.split("\n")[0].match(/;/g)||[]).length>(texto.split("\n")[0].match(/,/g)||[]).length?";":",";
  const filas=[]; let fila=[], campo="", q=false;
  for(let i=0;i<texto.length;i++){
    const ch=texto[i];
    if(q){ if(ch==='"'){ if(texto[i+1]==='"'){campo+='"';i++} else q=false } else campo+=ch; }
    else if(ch==='"') q=true;
    else if(ch===sep){ fila.push(campo); campo=""; }
    else if(ch==="\n"||ch==="\r"){ if(ch==="\r"&&texto[i+1]==="\n") i++; fila.push(campo); campo=""; if(fila.some(c=>c.trim()!=="")) filas.push(fila); fila=[]; }
    else campo+=ch;
  }
  fila.push(campo); if(fila.some(c=>c.trim()!=="")) filas.push(fila);
  return filas;
}
function cargarXLSX(){
  if(window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((ok,mal)=>{
    const s=document.createElement("script");
    s.src=XLSX_URL; s.integrity=XLSX_SRI; s.crossOrigin="anonymous"; s.referrerPolicy="no-referrer";
    s.onload=()=>ok(window.XLSX); s.onerror=()=>mal(new Error("No se pudo cargar el lector de Excel; guarda el archivo como CSV."));
    document.head.appendChild(s);
  });
}
const numero=v=>{ if(typeof v==="number") return v; const t=String(v??"").replace(/[$\s]/g,"").replace(/,(?=\d{3}(\D|$))/g,""); return t===""?NaN:Number(t.replace(",",".")); };

function interpretar(filas){
  if(filas.length<2) throw new Error("El archivo no tiene filas de datos.");
  const cab=filas[0].map(normCol), idx={};
  for(const [k,als] of Object.entries(ALIAS)) idx[k]=cab.findIndex(c=>als.includes(c));
  const faltan=["ventas","costo_variable","costos_fijos"].filter(k=>idx[k]<0);
  if(faltan.length) throw new Error("Faltan columnas: "+faltan.join(", ")+". Usa la plantilla.");
  const meses=[];
  filas.slice(1).forEach((f,i)=>{
    const v=numero(f[idx.ventas]), cv=numero(f[idx.costo_variable]), cf=numero(f[idx.costos_fijos]);
    const cl=idx.clientes>=0?numero(f[idx.clientes]):NaN;
    if([v,cv,cf].some(x=>!Number.isFinite(x))) throw new Error("Fila "+(i+2)+": ventas, costo_variable y costos_fijos deben ser números.");
    if(v<0||cv<0||cf<0) throw new Error("Fila "+(i+2)+": no se admiten valores negativos.");
    meses.push({mes:idx.mes>=0?String(f[idx.mes]):String(i+1), ventas:v, cv, cf, clientes:Number.isFinite(cl)&&cl>0?cl:null, util:v-cv-cf});
  });
  if(meses.length<MIN_MESES) throw new Error("Se necesitan al menos "+MIN_MESES+" meses; el archivo tiene "+meses.length+".");
  return meses;
}
function analizar(meses){
  const n=meses.length, media=a=>a.reduce((s,x)=>s+x,0)/a.length;
  const de=a=>{const m=media(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))};
  const ventas=meses.map(m=>m.ventas), util=meses.map(m=>m.util);
  const conCl=meses.filter(m=>m.clientes);
  const totV=ventas.reduce((a,b)=>a+b,0);
  const r={n, ventasMedia:media(ventas), ventasCVrel:de(ventas)/media(ventas), utilMedia:media(util), utilDE:de(util),
    cv:meses.reduce((s,m)=>s+m.cv,0)/(totV||1), fijos:media(meses.map(m=>m.cf)),
    ticket:conCl.length?conCl.reduce((s,m)=>s+m.ventas,0)/conCl.reduce((s,m)=>s+m.clientes,0):null,
    clientesMes:conCl.length?media(conCl.map(m=>m.clientes)):null};
  // Bootstrap de meses: cada año simulado = suma de 12 meses tomados con reemplazo del historial.
  const rng=mulberry32(SEMILLA), anios=new Array(N_SIM);
  for(let i=0;i<N_SIM;i++){ let s=0; for(let k=0;k<12;k++) s+=util[Math.floor(rng()*n)]; anios[i]=s; }
  anios.sort((a,b)=>a-b);
  Object.assign(r,{anios, p05:cuantil(anios,.05), p50:cuantil(anios,.5), p95:cuantil(anios,.95), pPos:anios.filter(x=>x>0).length/N_SIM});
  return r;
}
function svgSerie(meses){
  const W=360,H=160,n=meses.length, mx=Math.max(1,...meses.map(m=>Math.abs(m.util))), y0=H/2, bw=(W-30)/n;
  return '<line x1="20" y1="'+y0+'" x2="'+(W-6)+'" y2="'+y0+'" class="eje"/>'+meses.map((m,i)=>{
    const h=Math.abs(m.util)/mx*(H/2-18), x=22+i*bw, y=m.util>=0?y0-h:y0;
    return '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+Math.max(1,bw-2).toFixed(1)+'" height="'+h.toFixed(1)+'" class="'+(m.util>=0?"pos":"neg")+'"><title>'+String(m.mes).replace(/[<&>"]/g,"")+": "+mxn.format(Math.round(m.util))+'</title></rect>';
  }).join("")+'<text x="22" y="12" class="rot">Utilidad mensual de tu historial</text>';
}
function svgDist(r){
  const W=360,H=160,nb=24,lo=r.anios[0],hi=r.anios[r.anios.length-1],paso=(hi-lo)/nb||1,b=new Array(nb).fill(0);
  r.anios.forEach(x=>b[Math.min(nb-1,Math.floor((x-lo)/paso))]++);
  const mb=Math.max(...b), bw=(W-30)/nb, px=v=>22+(v-lo)/((hi-lo)||1)*(W-30);
  return b.map((c,i)=>{const h=c/mb*(H-40);const centro=lo+paso*(i+.5);return '<rect x="'+(22+i*bw).toFixed(1)+'" y="'+(H-20-h).toFixed(1)+'" width="'+(bw-1).toFixed(1)+'" height="'+h.toFixed(1)+'" class="'+(centro<0?"neg":"pos")+'"/>'}).join("")+
    [["P5",r.p05],["P50",r.p50],["P95",r.p95]].map(([e,v])=>'<line x1="'+px(v).toFixed(1)+'" y1="18" x2="'+px(v).toFixed(1)+'" y2="'+(H-20)+'" class="meta"/><text x="'+px(v).toFixed(1)+'" y="14" text-anchor="middle" class="rot">'+e+'</text>').join("")+
    '<line x1="20" y1="'+(H-20)+'" x2="'+(W-6)+'" y2="'+(H-20)+'" class="eje"/><text x="'+(W-6)+'" y="'+(H-5)+'" text-anchor="end" class="rot">utilidad anual simulada →</text>';
}
function pintarEmpresa(){
  const r=empresa.r, e=leerEscenario(), g=e.giro;
  $("empCifras").innerHTML=
    '<div><span>P(utilidad anual &gt; 0)</span><b>'+pct(r.pPos)+'</b> <span class="proc proc-modelo">tus datos</span></div>'+
    '<div><span>Utilidad anual P5 · P50 · P95</span><b>'+mxn.format(Math.round(r.p05))+" · "+mxn.format(Math.round(r.p50))+" · "+mxn.format(Math.round(r.p95))+'</b></div>'+
    '<div><span>Meses analizados</span><b>'+r.n+'</b>'+(r.n<12?' <span class="proc proc-supuesto">menos de 12: más incertidumbre</span>':"")+'</div>';
  $("empSerie").innerHTML=svgSerie(empresa.meses);
  $("empDist").innerHTML=svgDist(r);
  const fila=(k,tuyo,coatl,nota)=>'<tr><th scope="row">'+k+'</th><td>'+tuyo+'</td><td>'+coatl+'</td><td>'+(nota||"")+'</td></tr>';
  $("empTabla").innerHTML='<caption>Tus datos frente a los supuestos de COATL ('+g.n+')</caption><thead><tr><th scope="col">Indicador</th><th scope="col">Tu historial</th><th scope="col">Supuesto COATL</th><th scope="col">Lectura</th></tr></thead><tbody>'+
    fila("Ticket promedio", r.ticket?mxn.format(Math.round(r.ticket)):"— (sin columna clientes)", mxn.format(g.ticket), "estimación del equipo")+
    fila("Costo variable", pct(r.cv), g.cv+" %", "estimación del equipo")+
    fila("Variabilidad mensual de ventas (DE relativa)", pct(r.ventasCVrel), pct(INCERTIDUMBRE.demandaMensual), "supuesto del Monte Carlo")+
    fila("Costos fijos mensuales", mxn.format(Math.round(r.fijos)), mxn.format(Math.round(e.fijos)), "escenario actual del simulador")+
    fila("Utilidad mensual media", mxn.format(Math.round(r.utilMedia)), mxn.format(Math.round(e.utilMes)), "")+"</tbody>";
  $("empResultados").hidden=false;
  estadoWidget("wEmpresa","listo","Análisis listo. Tus datos siguen solo en este navegador.");
}
async function leerArchivo(file){
  if(!file) return;
  estadoWidget("wEmpresa","cargando","Leyendo «"+file.name+"» en tu navegador…");
  try{
    if(file.size>MAX_BYTES) throw new Error("El archivo pesa más de 5 MB.");
    let filas;
    if(/\.xlsx?$/i.test(file.name)){
      const X=await cargarXLSX(), wb=X.read(await file.arrayBuffer(),{type:"array"});
      filas=X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:true,defval:""});
    } else filas=parseCSV(await file.text());
    const meses=interpretar(filas);
    empresa={meses, r:analizar(meses)};
    pintarEmpresa();
  }catch(err){
    empresa=null; $("empResultados").hidden=true;
    estadoWidget("wEmpresa","error",err.message);
  }
}
$("empArchivo").addEventListener("change",ev=>leerArchivo(ev.target.files[0]));
const zona=document.querySelector(".zona-archivo");
["dragenter","dragover"].forEach(t=>zona.addEventListener(t,ev=>{ev.preventDefault();zona.classList.add("arrastre")}));
["dragleave","drop"].forEach(t=>zona.addEventListener(t,ev=>{ev.preventDefault();zona.classList.remove("arrastre")}));
zona.addEventListener("drop",ev=>leerArchivo(ev.dataTransfer.files[0]));
$("empBorrar").addEventListener("click",()=>{
  empresa=null; $("empArchivo").value=""; $("empResultados").hidden=true;
  ["empCifras","empSerie","empDist","empTabla"].forEach(id=>$(id).innerHTML="");
  estadoWidget("wEmpresa","vacio","Datos borrados de la memoria del navegador.");
});
$("empAplicar").addEventListener("click",()=>{
  if(!empresa) return;
  const r=empresa.r, e=leerEscenario();
  $("cvar").value=Math.round(Math.min(90,Math.max(5,r.cv*100))); $("merma").value=0;
  if(r.ticket) $("ticket").value=Math.round(r.ticket);
  if(r.clientesMes) $("clientes").value=Math.max(1,Math.round(r.clientesMes/(e.diasSem*4.33)));
  const otros=r.fijos-(e.rentaEf+e.empleados*e.costoEmpleado+(e.mktGasto||0)+e.interesMes);
  $("otrosFijos").value=Math.max(0,Math.round(otros/100)*100);
  ["cvar","merma"].forEach(id=>$(id).dispatchEvent(new Event("input")));
  calcular();
  $("simulador").scrollIntoView({behavior:reduceMov()?"auto":"smooth"});
  toast("Simulador ajustado a tus promedios: ticket, costo variable (merma incluida), clientes/día y otros fijos para igualar tus costos fijos.");
});
$("empPlantilla").addEventListener("click",()=>{
  /* Datos de EJEMPLO (no reales) solo para mostrar el formato. */
  const filas=["mes,ventas,clientes,costo_variable,costos_fijos"];
  const base=[178,182,169,190,201,195,188,176,184,199,215,240];
  base.forEach((v,i)=>filas.push("2025-"+String(i+1).padStart(2,"0")+","+v*1000+","+Math.round(v*1000/95)+","+Math.round(v*1000*0.41)+",27000"));
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob(["﻿"+filas.join("\n")],{type:"text/csv"}));
  a.download="COATL-plantilla-empresa.csv"; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
});
