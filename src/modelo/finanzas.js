/* COATL · Indicadores financieros (sin DOM). Cifras ANTES de impuestos
   (ISR/RESICO), sin depreciación ni sueldo del dueño. */
function finanzas(e,mc,S){
  const payback = e.utilMes>0 ? e.inversion/e.utilMes : null;   // meses, utilidad determinista
  let vpn=-e.inversion;                                          // inversión en t=0, no ponderada por S
  const flujos=[];
  for(let t=1;t<=3;t++){
    const ventasT=e.ventasMes*12*Math.pow(1+e.crec,t-1);
    const fijosT=e.fijos*12*Math.pow(1+e.inf,t-1);
    const Ut=ventasT*(1-e.cvEff)-fijosT;
    flujos.push(Ut);
    vpn += S[t]*Ut/Math.pow(1+e.r,t);                            // flujo esperado = S(t)·Uₜ
  }
  return {payback, vpn, flujos, roi: mc.media/e.inversion};
}
