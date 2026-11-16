/* ---------- 29. Reporte del negocio: PDF (impresión del navegador) e imagen PNG ----------
   No es una captura del sitio: se arma un documento propio solo con lo relevante del negocio
   (nombre, indicadores, supuestos, gráficas, alternativas, solidez, estimación fiscal y modelo
   2.5D), con la paleta, la greca y las tipografías de COATL. Las gráficas se vuelven a dibujar
   a 3× para que salgan nítidas. Todo ocurre en el navegador. */
const GRAFICAS_REPORTE=[["graficaSupervivencia","Supervivencia a 10 años"],["graficaMC","Utilidad anual simulada (Monte Carlo, 2,000 años)"],
  ["graficaPE","Punto de equilibrio"],["graficaTornado","Qué mueve tu probabilidad"]];
const LOGO_SVG='<svg viewBox="0 0 38 38" aria-hidden="true"><rect width="38" height="38" rx="9" fill="#C8102E"/><path d="M8 27 v-5 h5 v-5 h5 v-5 h12 v5 h-7 v5 h-5 v5 z" fill="#fff"/><circle cx="27.5" cy="14.5" r="1.8" fill="#C8102E"/></svg>';

async function graficasAltaRes(escala){
  const lista=await graficasListas(GRAFICAS_REPORTE.map(g=>g[0]));
  return lista.map(g=>{
    let url;
    try{
      const previo=g.options.devicePixelRatio;
      g.options.devicePixelRatio=escala; g.resize();
      url=g.toBase64Image("image/png",1);
      g.options.devicePixelRatio=previo; g.resize();
    }catch(_){ url=g.canvas.toDataURL("image/png"); }
    return {url, titulo:(GRAFICAS_REPORTE.find(x=>x[0]===g.canvas.id)||[])[1]||""};
  });
}
function datosReporte(){
  if(!ultimoMejora||!ultimoResumen) return null;
  const c=contextoNegocio(), r=ultimoResumen, e=c.e, d=x=>mxn.format(Math.round(x));
  const est=estadosMadurez(c), mad=indiceMadurez(est);
  return {c, r, mad, e,
    titulo:c.nombre, sub:e.giro.n+" · "+c.zona, fecha:new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"}),
    kpis:[["Probabilidad a 3 años",pct(r.P),"rango plausible "+r.rango],["Utilidad mensual",d(r.util),"antes de impuestos"],["ROI anual",pct(r.roi),"sobre la inversión"],
      ["Recuperación",r.payback?r.payback.toFixed(1)+" meses":"—","de la inversión"],["VPN a 3 años",d(r.vpn),"valor presente neto"]],
    supuestos:[["Ticket promedio",c.ticket],["Clientes por día",String(c.clientes)],["Ventas del mes",c.ventasMes],["Costo variable (con merma)",c.cvPct],
      ["Costos fijos del mes",c.fijos],["Empleados",String(e.empleados)],["Inversión inicial",c.inversion],["Financiado con crédito",c.credPct]],
    escenarios:[["Pesimista (percentil 5)",d(r.p05)],["Esperado (mediana)",d(c.mc.p50)],["Optimista (percentil 95)",d(r.p95)],
      ["Punto de equilibrio",isFinite(r.pe)?Math.ceil(r.pe)+" clientes al día":"no alcanzable"]],
    alternativas:palancas(e,c.modelo.P).slice(0,4).map(l=>[l.titulo,pct(c.modelo.P)+" → "+pct(Math.max(c.modelo.P,l.P))+" (+"+(l.lift*100).toFixed(1)+" pts)"]),
    fiscal:[["Ventas del mes (sin IVA)",d(c.fiscal.ventasMes)],["Utilidad antes de impuestos",d(e.utilMes)],
      [c.fiscal.regimen==="resico_pf"?"ISR estimado · RESICO ("+(c.fiscal.tasaResico*100).toFixed(1)+" %)":"ISR estimado · régimen general (30 %)","− "+d(c.fiscal.isrMes)],
      ["Utilidad después de ISR",d(c.fiscal.utilDespues)]]};
}
function htmlReporte(D,graf){
  const t=(filas,cab)=>'<table class="rep-tabla">'+(cab?'<thead><tr><th scope="col">'+cab[0]+'</th><th scope="col">'+cab[1]+'</th></tr></thead>':"")+"<tbody>"+filas.map(([k,v])=>'<tr><th scope="row">'+esc(k)+"</th><td>"+esc(v)+"</td></tr>").join("")+"</tbody></table>";
  return '<header class="rep-cab">'+LOGO_SVG+'<div class="rep-marca">COATL<small>ANÁLISIS TERRITORIAL · COACALCO</small></div><div class="rep-fecha">Reporte del negocio<br>'+esc(D.fecha)+'</div></header>'+
    '<div class="rep-greca"></div>'+
    '<p class="rep-titulo">'+esc(D.titulo)+'</p><p class="rep-sub">'+esc(D.sub)+'</p>'+
    '<div class="rep-kpis">'+D.kpis.map(([k,v,n])=>'<div class="rep-kpi"><span>'+esc(k)+"</span><strong>"+esc(v)+"</strong><em>"+esc(n)+"</em></div>").join("")+"</div>"+
    '<div class="rep-dos"><div class="rep-bloque"><p class="rep-h">Tu escenario</p>'+t(D.supuestos)+'</div>'+
    '<div class="rep-bloque"><p class="rep-h">Un año de operación, tres escenarios</p>'+t(D.escenarios)+
    '<p class="rep-h">Estimación fiscal mensual</p>'+t(D.fiscal)+"</div></div>"+
    (graf.length?'<p class="rep-h">Gráficas del escenario</p><div class="rep-graf">'+graf.map(g=>'<figure><figcaption>'+esc(g.titulo)+'</figcaption><img alt="'+esc(g.titulo)+'" src="'+g.url+'"></figure>').join("")+"</div>":"")+
    '<div class="rep-dos"><div class="rep-bloque"><p class="rep-h">Alternativas para mejorar tu resultado</p>'+
      (D.alternativas.length?'<ol class="rep-lista">'+D.alternativas.map(([a,b])=>"<li><strong>"+a+"</strong><br>"+esc(b)+"</li>").join("")+"</ol>":'<p>El modelo no encuentra palancas con mejora significativa.</p>')+
      '<p class="rep-h">Solidez del negocio: '+D.mad.indice+' de 100 · nivel '+D.mad.nivel+' de 5</p>'+
      (D.mad.pendientes.length?'<ol class="rep-lista">'+D.mad.pendientes.slice(0,4).map(p=>"<li><strong>"+esc(p.t)+".</strong> "+esc(p.b(D.c))+"</li>").join("")+"</ol>":"<p>Diagnóstico completo.</p>")+"</div>"+
    '<div class="rep-bloque"><p class="rep-h">Lo que tu negocio puede llegar a ser</p><figure class="rep-escena">'+escenaNegocio(datosEscena(D.c,5))+"</figure></div></div>"+
    '<footer class="rep-pie">Estimaciones de un modelo educativo bajo supuestos declarados; no constituyen asesoría financiera, fiscal ni legal. La estimación fiscal es orientativa: confírmala con un contador. '+
    'El índice de solidez es una lista de verificación del equipo, no un modelo estadístico. © 2026 Miguel Antonio Cruz García, Bruno Alejandro López Bautista y Alonso Arroyo Cortés · maikolv.github.io/coatl</footer>';
}
async function prepararReporte(){
  if(typeof tVivo!=="undefined"&&tVivo){ clearTimeout(tVivo); calcular(); }
  const D=datosReporte(); if(!D) return null;
  return {D, graf:await graficasAltaRes(3)};
}
$("exportarPDF").addEventListener("click",async()=>{
  const R=await prepararReporte(); if(!R){ toast("Espera a que termine el cálculo y vuelve a intentarlo."); return; }
  const rep=$("reporteNegocio");
  rep.innerHTML=htmlReporte(R.D,R.graf); rep.hidden=false;
  await Promise.all([...rep.querySelectorAll("img")].map(i=>i.decode().catch(()=>{})));
  document.body.classList.add("imprimir-reporte");
  const limpiar=()=>{ document.body.classList.remove("imprimir-reporte"); rep.hidden=true; rep.innerHTML=""; window.removeEventListener("afterprint",limpiar); };
  window.addEventListener("afterprint",limpiar);
  window.print();
});

/* ----- Imagen PNG: lienzo propio a 2× (3200 px de ancho) ----- */
function grecaLienzo(x,x0,y,ancho,alto,color){
  const k=alto/18; x.save(); x.beginPath(); x.rect(x0,y,ancho,alto); x.clip(); x.fillStyle=color;
  for(let px=x0;px<x0+ancho;px+=72*k){
    for(const dx of [0,36]){
      const p=[[0,18],[0,12],[6,12],[6,6],[12,6],[12,0],[24,0],[24,6],[18,6],[18,12],[12,12],[12,18]];
      x.beginPath(); p.forEach(([a,b],i)=>x[i?"lineTo":"moveTo"](px+(dx+a)*k,y+b*k)); x.closePath(); x.fill();
      x.fillRect(px+(dx+28)*k,y+7*k,4*k,4*k);
    }
  }
  x.restore();
}
function rectRedondo(x,a,b,w,h,r){ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); }
function textoAjustado(x,t,a,b,maxW,peso,tam,fam){
  let s=tam; do{ x.font=peso+" "+s+"px "+fam; s-=2; }while(x.measureText(t).width>maxW&&s>14);
  x.fillText(t,a,b);
}
function lineas(x,t,maxW){
  const pal=String(t).split(/\s+/), out=[]; let l="";
  pal.forEach(p=>{ const pr=l?l+" "+p:p; if(x.measureText(pr).width>maxW&&l){ out.push(l); l=p; } else l=pr; });
  if(l) out.push(l); return out;
}
$("exportarPNG").addEventListener("click",async()=>{
  const R=await prepararReporte(); if(!R){ toast("Espera a que termine el cálculo y vuelve a intentarlo."); return; }
  const {D,graf}=R, S=2, W=1600, M=56, DISP="'Bricolage Grotesque',Arial,sans-serif", CUERPO="'Hanken Grotesk',Arial,sans-serif", MONO="'Spline Sans Mono','Courier New',monospace";
  const imgs=await Promise.all(graf.map(g=>new Promise(ok=>{ const im=new Image(); im.onload=()=>ok(im); im.onerror=()=>ok(null); im.src=g.url; })));
  const gh=460, gw=(W-2*M-24)/2, yG=440, filasG=Math.ceil(graf.length/2), yB=yG+filasG*(gh+24)+10, hB=400, alto=yB+hB+90;
  const cv=document.createElement("canvas"); cv.width=W*S; cv.height=alto*S;
  const x=cv.getContext("2d"); x.scale(S,S); x.textBaseline="alphabetic";
  x.fillStyle=COL.hueso; x.fillRect(0,0,W,alto);
  x.fillStyle=COL.rojo; x.fillRect(0,0,W,14);
  // Encabezado: logotipo, marca y fecha
  rectRedondo(x,M,40,68,68,16); x.fillStyle=COL.rojo; x.fill();
  x.save(); x.translate(M,40); x.scale(68/38,68/38); x.fillStyle="#fff"; x.fill(new Path2D("M8 27 v-5 h5 v-5 h5 v-5 h12 v5 h-7 v5 h-5 v5 z"));
  x.fillStyle=COL.rojo; x.beginPath(); x.arc(27.5,14.5,1.8,0,7); x.fill(); x.restore();
  x.fillStyle=COL.tinta; x.font="800 46px "+DISP; x.fillText("COATL",M+88,82);
  x.fillStyle=COL.granate; x.font="600 15px "+MONO; x.fillText("ANÁLISIS TERRITORIAL · COACALCO",M+90,106);
  x.textAlign="right"; x.fillStyle="#6B5457"; x.font="500 17px "+MONO; x.fillText("Reporte del negocio",W-M,74); x.fillText(D.fecha,W-M,100); x.textAlign="left";
  grecaLienzo(x,M,128,W-2*M,18,COL.rojo);
  // Nombre del negocio
  x.fillStyle=COL.tinta; textoAjustado(x,D.titulo,M,214,W-2*M,"800",58,DISP);
  x.fillStyle=COL.granate; x.font="500 26px "+CUERPO; x.fillText(D.sub,M,254);
  // Indicadores
  const kw=(W-2*M-4*18)/5;
  D.kpis.forEach(([k,v,n],i)=>{ const a=M+i*(kw+18), b=286;
    rectRedondo(x,a,b,kw,124,12); x.fillStyle="#fff"; x.fill(); x.strokeStyle="#EFD6D4"; x.lineWidth=1.5; x.stroke();
    x.fillStyle=COL.rojo; x.fillRect(a+12,b,kw-24,6);
    x.fillStyle="#6B5457"; x.font="600 14px "+MONO; x.fillText(k.toUpperCase(),a+18,b+36);
    x.fillStyle=COL.tinta; textoAjustado(x,v,a+18,b+80,kw-36,"800",38,DISP);
    x.fillStyle="#6B5457"; x.font="500 15px "+CUERPO; x.fillText(n,a+18,b+106); });
  // Gráficas
  graf.forEach((g,i)=>{ const a=M+(i%2)*(gw+24), b=yG+Math.floor(i/2)*(gh+24), im=imgs[i];
    rectRedondo(x,a,b,gw,gh,12); x.fillStyle="#fff"; x.fill(); x.strokeStyle="#EFD6D4"; x.stroke();
    x.fillStyle=COL.granate; x.font="700 20px "+CUERPO; x.fillText(g.titulo,a+20,b+36);
    if(im){ const bw=gw-40, bh=gh-70, k=Math.min(bw/im.width,bh/im.height), w=im.width*k, h=im.height*k; x.drawImage(im,a+20+(bw-w)/2,b+52+(bh-h)/2,w,h); } });
  // Alternativas y solidez
  const cw=(W-2*M-24)/2;
  [[M,"Alternativas para mejorar tu resultado"],[M+cw+24,"Solidez y estimación fiscal"]].forEach(([a,t])=>{
    rectRedondo(x,a,yB,cw,hB,12); x.fillStyle="#fff"; x.fill(); x.strokeStyle="#EFD6D4"; x.stroke();
    x.fillStyle=COL.rojo; x.fillRect(a+12,yB,cw-24,6); x.fillStyle=COL.granate; x.font="800 24px "+DISP; x.fillText(t,a+22,yB+46); });
  let y=yB+88;
  (D.alternativas.length?D.alternativas:[["El modelo no encuentra palancas con mejora significativa.",""]]).forEach(([a,b],i)=>{
    x.fillStyle=COL.tinta; x.font="700 19px "+CUERPO; const ls=lineas(x,(D.alternativas.length?(i+1)+". ":"")+a,cw-44).slice(0,2);
    ls.forEach(l=>{ x.fillText(l,M+22,y); y+=25; });
    if(b){ x.fillStyle=COL.rojo; x.font="600 17px "+MONO; x.fillText(b,M+22,y); y+=34; } });
  const a2=M+cw+46; y=yB+92;
  x.fillStyle=COL.rojo; x.font="800 54px "+DISP; x.fillText(String(D.mad.indice),a2,y+8);
  x.fillStyle="#6B5457"; x.font="600 17px "+MONO; x.fillText("DE 100 · NIVEL "+D.mad.nivel+" DE 5",a2+x.measureText("000").width*2.6,y); y+=44;
  if(D.mad.pendientes[0]){ x.fillStyle=COL.tinta; x.font="700 19px "+CUERPO; lineas(x,"Siguiente paso: "+D.mad.pendientes[0].t,cw-66).slice(0,2).forEach(l=>{ x.fillText(l,a2,y); y+=25; }); }
  y+=14; x.strokeStyle="#EFD6D4"; x.beginPath(); x.moveTo(a2,y-16); x.lineTo(M+2*cw+2,y-16); x.stroke();
  D.fiscal.forEach(([k,v],i)=>{ const ult=i===D.fiscal.length-1;
    x.fillStyle=ult?COL.tinta:"#4A3A3C"; x.font=(ult?"800":"500")+" 18px "+CUERPO; x.fillText(k,a2,y+10);
    x.textAlign="right"; x.font=(ult?"800":"600")+" 18px "+MONO; x.fillText(v,M+2*cw+2,y+10); x.textAlign="left"; y+=34; });
  // Pie
  grecaLienzo(x,M,alto-74,W-2*M,9,COL.rosa);
  x.fillStyle="#6B5457"; x.font="400 15px "+CUERPO;
  x.fillText("Estimaciones bajo supuestos declarados; no constituyen asesoría financiera, fiscal ni legal. La estimación fiscal es orientativa.",M,alto-40);
  x.fillText("© 2026 Miguel Antonio Cruz García, Bruno Alejandro López Bautista y Alonso Arroyo Cortés · maikolv.github.io/coatl",M,alto-18);
  const nombreArchivo=D.c.conNombre?"COATL-"+D.titulo.normalize("NFD").replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-").slice(0,40)+".png":"COATL-escenario.png";
  cv.toBlob(blob=>{
    const a=document.createElement("a"); a.download=nombreArchivo;
    a.href=blob?URL.createObjectURL(blob):cv.toDataURL("image/png"); a.click();
    if(blob) setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  },"image/png");
});
