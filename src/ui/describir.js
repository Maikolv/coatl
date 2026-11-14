/* ---------- 22. Describe tu situación (texto o voz) → parámetros del simulador ----------
   Dos intérpretes:
   1) Local (por defecto): reglas en español, sin red ni clave. Siempre disponible.
   2) Claude (opcional): si el usuario pega su propia clave de API, se usa el SDK oficial
      @anthropic-ai/sdk con salida estructurada. La clave vive solo en memoria de esta pestaña.
   La voz usa el reconocimiento del navegador (Web Speech API); en Chrome/Edge el audio lo
   procesa el proveedor del navegador, y así se avisa en pantalla. */
const SDK_URL="https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.3.0/+esm";
let claveClaude=null, claveGemini=null;  // una sola caja: sk-ant-… es Claude; cualquier otra, Gemini

function sinAcentos(t){return String(t).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase()}
function cantidad(txt){
  const m=/(\d+(?:[.,]\d+)?)\s*(mil(?:lones?)?|millon(?:es)?|k\b)?/.exec(txt.replace(/\$/g,"").replace(/(\d),(\d{3})\b/g,"$1$2"));
  if(!m) return null;
  let n=Number(m[1].replace(",","."));
  if(m[2]){ if(/^mil$/.test(m[2])||m[2]==="k") n*=1e3; else n*=1e6; }
  return n;
}
/* Busca una cantidad cerca de alguna palabra clave (antes o después). */
function cerca(t, claves){
  for(const c of claves){
    const re=new RegExp("(?:"+c+")[^.;\\d$]{0,28}(\\$?\\s?\\d[\\d.,]*\\s*(?:mil(?:lones?)?|millon(?:es)?|k\\b)?)|(\\$?\\s?\\d[\\d.,]*\\s*(?:mil(?:lones?)?|millon(?:es)?|k\\b)?)\\s*(?:de\\s+)?(?:"+c+")","i");
    const m=re.exec(t); if(m) return cantidad(m[1]||m[2]);
  }
  return null;
}
const ZONAS_CLAVE={corredor:["lopez portillo","corredor","plaza coacalco","power center"],centro:["centro","san francisco","cabecera"],
  flores:["villa de las flores","flores","parque residencial","bosques"],heroes:["heroes","loma bonita","manzanas"],
  popular:["potrero","san rafael","olivo"],periferia:["periferia","norte","habitacional"]};
function interpretarLocal(texto){
  const t=sinAcentos(texto), r={}, entendido=[];
  // Giro: nombre exacto del catálogo, o palabra clave
  let mejor=null;
  for(const [k,g] of Object.entries(GIROS)){
    const palabras=sinAcentos(g.n).split(/[^a-z]+/).filter(w=>w.length>4);
    const pts=palabras.filter(w=>t.includes(w.slice(0,Math.max(5,w.length-2)))).length;
    if(pts&&(!mejor||pts>mejor.pts)) mejor={k,pts};
  }
  if(mejor){ r.giro=mejor.k; entendido.push("giro: "+GIROS[mejor.k].n); }
  for(const [k,cs] of Object.entries(ZONAS_CLAVE)) if(cs.some(c=>t.includes(c))){ r.zona=k; entendido.push("zona: "+ZONAS[k].n); break; }
  const num=(campo,claves,et,fmt)=>{const v=cerca(t,claves); if(v!=null&&isFinite(v)){r[campo]=v; entendido.push(et+": "+(fmt?fmt(v):v));}};
  num("clientes",["clientes al dia","clientes diarios","clientes por dia","clientes","personas al dia","ventas al dia"],"clientes/día");
  num("ticket",["ticket","por cliente","cada cliente gasta","consumo promedio","precio promedio"],"ticket",v=>mxn.format(v));
  num("inversion",["inversion","invertir","capital inicial","presupuesto"],"inversión",v=>mxn.format(v));
  num("renta",["renta","alquiler"],"renta",v=>mxn.format(v));
  num("empleados",["empleados","trabajadores","ayudantes","personas trabajando"],"empleados");
  num("costoEmpleado",["sueldo","salario","pago por empleado"],"sueldo por empleado",v=>mxn.format(v));
  num("superficie",["metros cuadrados","m2","metros"],"superficie (m²)");
  num("credito",["% de credito","por ciento de credito","financiado","credito","prestamo"],"% a crédito");
  num("tasa",["tasa","interes"],"tasa anual %");
  const anios=/(\d+)\s*anos? de experiencia|experiencia de (\d+)\s*anos?/.exec(t);
  if(anios){const a=+(anios[1]||anios[2]); r.experiencia=a>5?"0.30":a>=3?"0.15":a>=1?"0":"-0.25"; entendido.push("experiencia: "+a+" años");}
  else if(/sin experiencia|nunca he|primera vez/.test(t)){r.experiencia="-0.25"; entendido.push("experiencia: ninguna");}
  const dias=/(\d)\s*dias (?:a la|por) semana|abro (\d) dias/.exec(t); if(dias){r.dias=String(Math.min(7,Math.max(5,+(dias[1]||dias[2])))); entendido.push("días/semana: "+r.dias);}
  if(/local propio|es mio|propiedad propia|sin renta/.test(t)){r.local="propio"; entendido.push("local propio");}
  if(/mucha competencia|muy competido|saturad/.test(t)){r.competencia="-0.20"; entendido.push("competencia alta");}
  else if(/poca competencia|sin competencia|no hay competencia/.test(t)){r.competencia="0.15"; entendido.push("competencia baja");}
  if(/informal|sin factura|sin registro/.test(t)){r.formalidad="-0.06"; entendido.push("operación informal");}
  if(/redes sociales|facebook|instagram|tiktok|publicidad/.test(t)){r.marketing=/pauta|anuncio|publicidad pagada|whatsapp business/.test(t)?"0.12":"0.05"; entendido.push("marketing en redes");}
  const reserva=/(\d+)\s*meses? de (?:reserva|gastos|ahorro)/.exec(t);
  if(reserva){const m=+reserva[1]; r.reserva=m>12?"0.35":m>=6?"0.20":m>=3?"0":"-0.30"; entendido.push("reserva: "+m+" meses");}
  return {r, entendido};
}
/* Aplica lo interpretado a los controles reales del simulador (con sus límites). */
function aplicarInterpretacion(r){
  const fija=(id,v)=>{const c=$(id); if(c!=null&&v!=null){ c.value=String(v); }};
  if(r.giro&&GIROS[r.giro]){ $("giro").value=r.giro; $("giro").dispatchEvent(new Event("change")); }
  if(r.zona&&ZONAS[r.zona]) $("zona").value=r.zona;
  fija("clientes",r.clientes!=null?Math.round(r.clientes):null); fija("ticket",r.ticket!=null?Math.round(r.ticket):null);
  fija("inversion",r.inversion!=null?Math.round(r.inversion/10000)*10000:null); fija("renta",r.renta!=null?Math.round(r.renta):null);
  fija("empleados",r.empleados); fija("costoEmpleado",r.costoEmpleado); fija("superficie",r.superficie);
  fija("credito",r.credito!=null?Math.round(r.credito/5)*5:null); fija("tasa",r.tasa);
  ["experiencia","dias","local","competencia","formalidad","marketing","reserva"].forEach(k=>{ if(r[k]!=null&&[...$(k).options].some(o=>o.value===String(r[k]))) $(k).value=String(r[k]); });
  ["inversion","credito","cvar","merma"].forEach(id=>$(id).dispatchEvent(new Event("input")));
  calcular();
}
/* Gemini (plan gratuito de Google AI Studio) por REST, sin SDK; store:false = Google no guarda la conversación.
   Lo usan este intérprete y el asistente. */
const MODELOS_GEMINI=["gemini-3.8-flash","gemini-3.5-flash-lite"];  // si el primero no está disponible en la cuenta (404), se usa el segundo
const ERRORES_GEMINI={400:"la clave no es válida; cópiala de nuevo desde AI Studio",401:"la clave no es válida; cópiala de nuevo desde AI Studio",
  403:"la clave no tiene permiso para la API de Gemini; en AI Studio créala para la API de Gemini",429:"se alcanzó el límite del plan gratuito; espera un minuto e intenta de nuevo"};
async function gemini(instrucciones, texto, max, modelo=0){
  let r;
  try{ r=await fetch("https://generativelanguage.googleapis.com/v1beta/interactions",{method:"POST", signal:AbortSignal.timeout(45000),
    headers:{"Content-Type":"application/json","x-goog-api-key":claveGemini},
    body:JSON.stringify({model:MODELOS_GEMINI[modelo], input:texto, system_instruction:instrucciones, store:false, generation_config:{max_output_tokens:max}})}); }
  catch(e){ throw new Error(e.name==="TimeoutError"?"tardó demasiado; revisa tu conexión":"sin conexión con Google"); }
  const j=await r.json().catch(()=>({}));
  if(r.status===404&&modelo+1<MODELOS_GEMINI.length) return gemini(instrucciones, texto, max, modelo+1);
  if(!r.ok) throw Object.assign(new Error(ERRORES_GEMINI[r.status]||(j.error&&j.error.message)||"HTTP "+r.status),{status:r.status});
  return (j.steps||[]).filter(s=>s.type==="model_output").flatMap(s=>s.content||[]).filter(c=>c.type==="text").map(c=>c.text).join("");
}
/* Intérpretes en línea (opcionales, clave del usuario): Claude con esquema estricto, Gemini con JSON pedido en las instrucciones. */
const ESQUEMA_ESCENARIO={type:"object",additionalProperties:false,
  properties:{giro:{type:["string","null"],enum:[...Object.keys(GIROS),null]},zona:{type:["string","null"],enum:[...Object.keys(ZONAS),null]},
    clientes:{type:["number","null"]},ticket:{type:["number","null"]},inversion:{type:["number","null"]},renta:{type:["number","null"]},
    empleados:{type:["number","null"]},costoEmpleado:{type:["number","null"]},superficie:{type:["number","null"]},credito:{type:["number","null"]},
    tasa:{type:["number","null"]},experiencia_anios:{type:["number","null"]},resumen:{type:"string"}},
  required:["giro","zona","clientes","ticket","inversion","renta","empleados","costoEmpleado","superficie","credito","tasa","experiencia_anios","resumen"]};
async function interpretarClaude(texto){
  const {default:Anthropic}=await import(SDK_URL);
  const client=new Anthropic({apiKey:claveClaude, dangerouslyAllowBrowser:true});
  const resp=await client.beta.messages.create({
    model:"claude-opus-5-5", max_tokens:4000,
    betas:["server-side-fallback-2026-07-01"], fallbacks:"default",
    output_config:{effort:"low", format:{type:"json_schema", schema:ESQUEMA_ESCENARIO}},
    system:instruccionesInterprete(),
    messages:[{role:"user",content:texto}]
  });
  if(resp.stop_reason==="refusal") throw new Error("Claude no pudo procesar esta descripción.");
  const bloque=resp.content.find(b=>b.type==="text"); if(!bloque) throw new Error("Respuesta vacía.");
  return deJSON(JSON.parse(bloque.text));
}
async function interpretarGemini(texto){
  const t=await gemini(instruccionesInterprete()+" Responde únicamente con un objeto JSON (sin texto adicional) con las claves: "+ESQUEMA_ESCENARIO.required.join(", ")+".", texto, 1500);
  const m=/\{[\s\S]*\}/.exec(t); if(!m) throw new Error("Gemini no devolvió datos.");
  return deJSON(JSON.parse(m[0]));
}
const instruccionesInterprete=()=>"Convierte la descripción de un negocio en Coacalco de Berriozábal (México) en parámetros del simulador COATL. "+
      "Usa solo lo que la persona dijo; deja en null lo que no mencione. Cantidades en pesos mexicanos; clientes por día; crédito en porcentaje de la inversión; tasa anual en porcentaje. "+
      "Giros válidos: "+Object.entries(GIROS).map(([k,g])=>k+"="+g.n).join("; ")+". Zonas válidas: "+Object.entries(ZONAS).map(([k,z])=>k+"="+z.n).join("; ")+
      ". En «resumen» explica en una frase, en español, qué entendiste.";
// Sin esquema estricto (Gemini) el JSON puede traer tipos raros: solo se aceptan textos en giro/zona y números finitos en lo demás.
function deJSON(j){
  const r={}, entendido=[];
  for(const k of ["giro","zona","clientes","ticket","inversion","renta","empleados","costoEmpleado","superficie","credito","tasa"]){
    const ok=k==="giro"||k==="zona"? typeof j[k]==="string" : Number.isFinite(j[k]);
    if(ok){ r[k]=j[k]; entendido.push(k+": "+j[k]); } }
  if(Number.isFinite(j.experiencia_anios)){const a=j.experiencia_anios; r.experiencia=a>5?"0.30":a>=3?"0.15":a>=1?"0":"-0.25";}
  return {r, entendido, resumen:typeof j.resumen==="string"?j.resumen:""};
}
const ia=()=>claveClaude?"Claude":claveGemini?"Gemini":"";
async function interpretarYAplicar(){
  const texto=$("descTexto").value.trim();
  if(!texto){ estadoWidget("wDescribir","vacio","Escribe o dicta cómo es tu negocio."); return; }
  estadoWidget("wDescribir","cargando", ia()?ia()+" está interpretando tu descripción…":"Interpretando…");
  try{
    const res=claveClaude? await interpretarClaude(texto) : claveGemini? await interpretarGemini(texto) : interpretarLocal(texto);
    if(!res.entendido.length){ estadoWidget("wDescribir","vacio","No identifiqué datos concretos. Prueba con cifras: «cafetería en Los Héroes, 70 clientes al día, ticket de 90 pesos, renta de 8 mil»."); return; }
    aplicarInterpretacion(res.r);
    $("descEntendido").innerHTML='<p class="desc-resumen">'+(res.resumen?esc(res.resumen)+" ":"")+'Ajusté:</p><ul>'+res.entendido.map(x=>"<li>"+esc(x)+"</li>").join("")+"</ul>";
    estadoWidget("wDescribir","listo", "Simulador actualizado"+(ia()?" con "+ia()+".":" con el intérprete local.")+" Revisa y corrige cualquier campo en las pestañas.");
  }catch(err){
    console.warn(err);
    estadoWidget("wDescribir","error", (ia()?ia()+" no respondió: "+(claveGemini?err.message:(err.status||err.message))+". ":"")+"Puedes usar el intérprete local quitando la clave.");
  }
}
$("descAplicar").addEventListener("click",interpretarYAplicar);
$("descClave").addEventListener("change",()=>{ const v=$("descClave").value.trim();
  claveClaude=v.startsWith("sk-ant-")?v:null; claveGemini=v&&!claveClaude?v:null;
  $("descModo").textContent=claveClaude?"Intérprete: Claude (tu clave, solo en esta pestaña)":claveGemini?"Intérprete: Gemini (tu clave, solo en esta pestaña)":"Intérprete: local, sin conexión"; });
$("descOlvidar").addEventListener("click",()=>{ $("descClave").value=""; claveClaude=null; claveGemini=null; $("descModo").textContent="Intérprete: local, sin conexión"; });
/* Voz (Web Speech API) */
(function voz(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition, b=$("descVoz");
  if(!SR){ b.disabled=true; b.title="Tu navegador no permite dictado; escribe la descripción."; b.querySelector("span").textContent="Dictado no disponible"; return; }
  let rec=null, base="";
  b.addEventListener("click",()=>{
    if(rec){ rec.stop(); return; }
    rec=new SR(); rec.lang="es-MX"; rec.interimResults=true; rec.continuous=true; base=$("descTexto").value?$("descTexto").value+" ":"";
    rec.onresult=ev=>{ let txt=""; for(let i=0;i<ev.results.length;i++) txt+=ev.results[i][0].transcript; $("descTexto").value=base+txt; };
    rec.onerror=ev=>{ estadoWidget("wDescribir","error","Dictado: "+(ev.error==="not-allowed"?"permiso de micrófono denegado.":ev.error)); };
    rec.onend=()=>{ rec=null; b.classList.remove("escuchando"); b.setAttribute("aria-pressed","false"); b.querySelector("span").textContent="Dictar"; if($("descTexto").value.trim()) interpretarYAplicar(); };
    rec.start(); b.classList.add("escuchando"); b.setAttribute("aria-pressed","true"); b.querySelector("span").textContent="Escuchando… pulsa para terminar";
  });
})();
