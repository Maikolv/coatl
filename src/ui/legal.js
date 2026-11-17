/* ---------- 30. Aviso legal sin huecos ----------
   Los artículos se reparten en dos columnas de altura parecida (se mide el alto real de cada uno) y la
   columna más corta termina con una cenefa de grecas en movimiento que ocupa exactamente lo que falta.
   En pantallas angostas hay una sola columna y la cenefa no hace falta. Se recalcula al abrir el apartado
   y al cambiar el tamaño de la ventana. El orden de lectura (§1…§n) no cambia. */
(function equilibrarLegal(){
  const cont=document.querySelector("#legal .metodos"); if(!cont) return;
  const arts=[...cont.querySelectorAll(":scope > article.metodo")]; if(arts.length<2) return;
  const izq=document.createElement("div"), der=document.createElement("div"), relleno=document.createElement("div");
  izq.className=der.className="legal-col"; relleno.className="legal-relleno"; relleno.setAttribute("aria-hidden","true");
  /* Si el espacio que sobra es grande, además de la cenefa se muestra un resumen en lenguaje claro. */
  const resumen=document.createElement("div"); resumen.className="legal-resumen"; resumen.hidden=true;
  resumen.innerHTML='<h3>En resumen</h3><ul>'+
    "<li><strong>Es una herramienta académica:</strong> sus resultados son estimaciones, no asesoría financiera, fiscal ni legal.</li>"+
    "<li><strong>Tus datos se quedan contigo:</strong> el simulador calcula en tu navegador; lo que guardas o subes no sale de tu equipo.</li>"+
    "<li><strong>La IA puede equivocarse:</strong> si contradice al simulador, vale el simulador. No le escribas datos personales.</li>"+
    "<li><strong>La obra tiene autores:</strong> cítala con atribución; no la reproduzcas con fines comerciales sin permiso.</li>"+
    "<li><strong>¿Dudas o correcciones?</strong> Escríbenos en el enlace de contacto del artículo de privacidad.</li></ul>";
  relleno.appendChild(resumen);
  cont.classList.add("legal-equilibrado"); cont.append(izq,der);
  arts.forEach(a=>izq.appendChild(a));
  let anchoPrevio=-1, turno=0;
  function repartir(){
    if(!cont.offsetParent) return;                       // el apartado está oculto: se medirá al abrirlo
    const ancho=cont.clientWidth; if(ancho===anchoPrevio) return; anchoPrevio=ancho;
    relleno.remove();
    arts.forEach(a=>izq.appendChild(a));
    if(matchMedia("(max-width:900px)").matches){ der.hidden=true; return; }
    der.hidden=false;
    const h=arts.map(a=>a.offsetHeight), total=h.reduce((s,v)=>s+v,0);
    let acc=0, corte=1, mejor=Infinity;
    h.forEach((v,i)=>{ acc+=v; const dif=Math.abs(2*acc-total); if(i<h.length-1&&dif<mejor){ mejor=dif; corte=i+1; } });
    arts.forEach((a,i)=>(i<corte?izq:der).appendChild(a));
    /* El relleno va en la columna más corta y mide exactamente lo que le falta para igualar a la otra
       (se mide después de repartir, con márgenes y separaciones reales). */
    const contenido=c=>[...c.children].reduce((s,x)=>s+x.offsetHeight,0)+Math.max(0,c.children.length-1)*parseFloat(getComputedStyle(c).rowGap||0);
    const corta=contenido(izq)<=contenido(der)?izq:der, larga=corta===izq?der:izq, sep=parseFloat(getComputedStyle(corta).rowGap||0);
    const falta=Math.round(contenido(larga)-contenido(corta)-sep);
    if(falta<12) return;                                  // las columnas ya quedan parejas
    corta.appendChild(relleno); relleno.style.height=falta+"px";
    resumen.hidden=false;
    const conResumen=falta>=resumen.offsetHeight+40;      // cabe el resumen: deja de ser solo decoración
    resumen.hidden=!conResumen;
    if(conResumen) relleno.removeAttribute("aria-hidden"); else relleno.setAttribute("aria-hidden","true");
  }
  const pedir=()=>{ clearTimeout(turno); turno=setTimeout(repartir,80); };
  window.addEventListener("resize",pedir); window.addEventListener("hashchange",pedir);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>{ anchoPrevio=-1; pedir(); });
  pedir();
})();
