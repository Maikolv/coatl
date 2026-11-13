/* Formatos y atajos de DOM */
const mxn = new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0});
const pct = x => (100*x).toFixed(1).replace(/\.0$/,"") + "%";
const $ = id => document.getElementById(id);

function cargarBiblioteca(id){
  return new Promise(resolve=>{
    const script=document.createElement("script");
    for(const {name,value} of $(id).content.firstElementChild.attributes) script.setAttribute(name,value);
    script.onload=()=>resolve(true);
    script.onerror=()=>resolve(false);
    document.head.appendChild(script);
  });
}

