/* ---------- 25. Asistente COATL: siempre disponible (esquina inferior derecha) ----------
   Responde con el MISMO motor del simulador: estado actual, mejor zona, palancas (FODA),
   ajustes por texto o voz (intérprete local) y navegación. Las preguntas libres las responde
   la IA de COATL (Gemini, clave del proyecto en el servidor; ver describir.js e iaProyecto). */
(function asistente(){
  const caja=document.createElement("div"); caja.className="asis"; caja.id="asistente";
  caja.innerHTML='<button type="button" class="asis-boton" id="asisAbrir" aria-expanded="false" aria-controls="asisPanel" aria-label="Abrir el asistente COATL"><span aria-hidden="true">💬</span><b>Asistente</b></button>'+
    '<section class="asis-panel" id="asisPanel" role="dialog" aria-label="Asistente COATL" hidden>'+
      '<header class="asis-cab"><strong>Asistente COATL</strong><span id="asisModo">'+(IA_ACTIVA?"IA de COATL · Gemini":"local · sin conexión")+'</span><button type="button" class="asis-cerrar" id="asisCerrar" aria-label="Cerrar el asistente">✕</button></header>'+
      '<div class="asis-log" id="asisLog" aria-live="polite"></div>'+
      '<div class="asis-chips" id="asisChips">'+["¿Cómo voy?","¿Qué zona me conviene?","¿Cómo subo mi probabilidad?","Abrir el DENUE"].map(c=>'<button type="button">'+c+'</button>').join("")+'</div>'+
      '<form class="asis-forma" id="asisForma"><label class="sr-only" for="asisTexto">Escribe al asistente</label>'+
        '<input id="asisTexto" autocomplete="off" placeholder="Ej.: farmacia en el Centro con 90 clientes al día">'+
        '<button type="button" class="asis-voz" id="asisVoz" aria-pressed="false" aria-label="Dictar por voz">🎙️</button>'+
        '<button type="submit" class="asis-enviar" aria-label="Enviar">➤</button></form>'+
    '</section>';
  document.body.appendChild(caja);
  const panel=$("asisPanel"), log=$("asisLog"), inp=$("asisTexto"), boton=$("asisAbrir");
  const decir=(html,quien)=>{ const p=document.createElement("p"); p.className="asis-msj "+(quien||"bot"); p.innerHTML=html; log.appendChild(p); log.scrollTop=log.scrollHeight; };
  const abrir=(si)=>{ panel.hidden=!si; boton.setAttribute("aria-expanded",String(si)); caja.classList.toggle("abierto",si); if(si) inp.focus(); };
  boton.addEventListener("click",()=>abrir(panel.hidden));
  $("asisCerrar").addEventListener("click",()=>{ abrir(false); boton.focus(); });
  document.addEventListener("keydown",ev=>{ if(ev.key==="Escape"&&!panel.hidden){ abrir(false); boton.focus(); } });
  decir("Hola. Puedo decirte cómo va tu negocio, qué zona te conviene, cómo subir tu probabilidad, ajustar el simulador con lo que me cuentes (escrito o por voz) o llevarte a cualquier apartado.");

  const pct=x=>(x*100).toFixed(1)+"%";
  const actual=()=>{ const e=leerEscenario(), m=modeloLogistico(e); return {e,P:m.P}; };
  function estado(){ const {e,P}=actual();
    return "<b>"+esc(e.giro.n)+"</b> en <b>"+esc(e.zona.n)+"</b>: probabilidad de seguir abierto a 3 años <b>"+pct(P)+"</b>, utilidad mensual esperada <b>"+mxn.format(Math.round(e.utilMes))+"</b> (antes de impuestos)."; }
  function mejoresZonas(){ const {e}=actual();
    const L=Object.keys(ZONAS).map(k=>({k,P:probDe(Object.assign({},e,{zona:ZONAS[k],zonaKey:k}))})).sort((a,b)=>b.P-a.P);
    return "Para este mismo negocio: "+L.slice(0,3).map((d,i)=>(i+1)+". <b>"+esc(ZONAS[d.k].n)+"</b> "+pct(d.P)+(d.k===e.zonaKey?" (la actual)":"")).join(" · ")+". Las zonas son composiciones del equipo; revisa el mapa en el simulador."; }
  function consejos(){ const {e,P}=actual(), L=palancas(e,P).slice(0,3);
    if(!L.length) return "Tu escenario ya aprovecha las palancas que el modelo mide. Prueba otra zona o un ticket mayor.";
    return "Lo que más sube tu probabilidad: "+L.map(l=>"<b>"+esc(l.titulo)+"</b> (+"+(l.lift*100).toFixed(1)+" pts)").join("; ")+". Detalle en Estrategia."; }
  const DESTINOS=[["denue","denue"],["empresa","empresas"],["estrateg","estrategia"],["foda","estrategia"],["metodolog","metodologia"],["territorio","territorio"],["contexto","territorio"],["legal","legal"],["aviso","legal"],["inicio","inicio"],["simulador","simulador"]];

  async function responder(texto){
    const t=sinAcentos(texto);
    const ir=/(abre|abrir|ir a|llevame|muestrame|ver )/.test(t)&&DESTINOS.find(([w])=>t.includes(w));
    if(ir){ irA(ir[1]); return "Listo, abrí <b>"+esc(VISTAS.find(v=>v.id===ir[1]).titulo)+"</b>."; }
    if(/zona/.test(t)&&/(mejor|conviene|recomienda|cual|donde)/.test(t)) return mejoresZonas();
    if(/(subo|subir|mejor|aument|consejo|estrategia|que hago|recomienda)/.test(t)) return consejos();
    const res=interpretarLocal(texto);
    if(res.entendido.length){ aplicarInterpretacion(res.r); return "Ajusté el simulador ("+res.entendido.map(esc).join(", ")+"). "+estado(); }
    if(/(como voy|probabilidad|utilidad|gano|ganancia|resultado|cuanto)/.test(t)) return estado();
    if(IA_ACTIVA) return esc(await iaProyecto("asistente", texto, contexto())||"Sin respuesta.");
    return "No identifiqué una cifra ni una pregunta que pueda calcular. Prueba: «¿cómo voy?», «¿qué zona me conviene?», «cafetería en Los Héroes con 70 clientes al día» o «abre el DENUE». Las preguntas libres las responde la IA de COATL en el sitio publicado.";
  }
  // Contexto mínimo para la IA: solo el resumen del escenario, nunca archivos de Empresas.
  function contexto(){ const {e,P}=actual();
    return {giro:e.giro.n, zona:e.zona.n, P_3_anios:pct(P), utilidad_mensual:Math.round(e.utilMes), clientes_dia:e.mu, ticket:e.ticket}; }
  async function enviar(texto){
    texto=texto.trim(); if(!texto) return;
    decir(esc(texto),"yo"); inp.value="";
    try{ decir(await responder(texto)); }
    catch(err){ console.warn(err); decir("La IA no respondió: "+esc(String(err.message))+". Sigo disponible en modo local."); }
    $("asisModo").textContent=IA_ACTIVA?"IA de COATL · Gemini":"local · sin conexión";
  }
  $("asisForma").addEventListener("submit",ev=>{ ev.preventDefault(); enviar(inp.value); });
  $("asisChips").addEventListener("click",ev=>{ if(ev.target.tagName==="BUTTON") enviar(ev.target.textContent); });
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition, bv=$("asisVoz");
  if(!SR){ bv.hidden=true; return; }
  let rec=null;
  bv.addEventListener("click",()=>{
    if(rec){ rec.stop(); return; }
    rec=new SR(); rec.lang="es-MX"; rec.interimResults=true;
    rec.onresult=ev=>{ inp.value=[...ev.results].map(x=>x[0].transcript).join(""); };
    rec.onerror=ev=>decir("Dictado: "+esc(ev.error==="not-allowed"?"permiso de micrófono denegado.":ev.error));
    rec.onend=()=>{ rec=null; bv.classList.remove("escuchando"); bv.setAttribute("aria-pressed","false"); enviar(inp.value); };
    rec.start(); bv.classList.add("escuchando"); bv.setAttribute("aria-pressed","true");
  });
})();
