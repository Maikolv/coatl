/* Formatos y atajos de DOM */
const mxn = new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0});
const pct = x => (100*x).toFixed(1).replace(/\.0$/,"") + "%";
const $ = id => document.getElementById(id);

