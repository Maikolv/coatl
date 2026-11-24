/* ---------- Tu opinión (#opinion) ----------
   Sin servidor ni almacenamiento: arma un correo (mailto) con la opinión ya escrita y el
   visitante decide si lo manda desde su propia aplicación de correo. */
(function(){
  const CONTACTO="A660136406@my.uvm.edu.mx";
  const w=document.getElementById("wOpinion"); if(!w) return;
  const f=document.getElementById("opForm"), enviar=document.getElementById("opEnviar"),
        copiar=document.getElementById("opCopiar"), estado=document.getElementById("wOpinion-estado");
  const val=id=>document.getElementById(id).value.trim();
  const calif=()=>{ const r=f.querySelector('input[name="opUtil"]:checked'); return r?r.value:""; };
  const texto=()=>[
    "Opinión sobre COATL (Feria Profesiográfica 2026)",
    "",
    "Utilidad: "+calif()+" de 5",
    "Apartado favorito: "+(val("opApartado")||"—"),
    "Nombre o carrera: "+(val("opNombre")||"—"),
    "",
    "Comentarios:",
    val("opMejora")||"—"
  ].join("\n");
  const pintar=()=>{
    const ok=!!calif();
    enviar.href="mailto:"+CONTACTO+"?subject="+encodeURIComponent("Opinión sobre COATL")+"&body="+encodeURIComponent(texto());
    w.dataset.estado=ok?"listo":"vacio";
    estado.textContent=ok?"Listo: pulsa «Enviar por correo» o copia tu opinión.":"Elige una calificación del 1 al 5.";
  };
  f.addEventListener("input",pintar); f.addEventListener("change",pintar);
  f.addEventListener("submit",ev=>ev.preventDefault());
  enviar.addEventListener("click",ev=>{
    if(calif()) return;
    ev.preventDefault(); w.dataset.estado="error";
    estado.textContent="Falta la calificación: elige del 1 al 5.";
    f.querySelector('input[name="opUtil"]').focus();
  });
  copiar.addEventListener("click",async()=>{
    if(!calif()){ w.dataset.estado="error"; estado.textContent="Falta la calificación: elige del 1 al 5."; return; }
    try{ await navigator.clipboard.writeText(texto()); estado.textContent="Opinión copiada. Pégala en un correo a "+CONTACTO+"."; }
    catch(e){ estado.textContent="No se pudo copiar. Escribe a "+CONTACTO+"."; }
  });
  pintar();
})();
