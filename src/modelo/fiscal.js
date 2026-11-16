/* ---------- 7-bis. Estimación fiscal orientativa (México) ----------
   Puro y sin DOM. NO es asesoría fiscal: sirve para dimensionar el ISR y lo que hay que cumplir.
   · RESICO personas físicas: tasa sobre los ingresos del mes (LISR art. 113-E), hasta 3.5 millones al año.
   · Personas morales, régimen general: 30 % sobre la utilidad fiscal (LISR art. 9).
   · IVA general 16 % (LIVA art. 1): se traslada al cliente; no es ingreso del negocio.
   · Impuesto sobre nómina del Estado de México: 3 % (Código Financiero del Estado de México).
   Se supone que las ventas del simulador son ingresos cobrados sin IVA. */
const RESICO_PF_TABLA=[[25000,0.010],[50000,0.011],[83333.33,0.015],[208333.33,0.020],[3500000,0.025]];
const RESICO_PF_TOPE_ANUAL=3500000, ISR_PM_GENERAL=0.30, IVA_GENERAL=0.16, ISN_EDOMEX=0.03;

function tasaResicoPF(ingresoMes){
  const tramo=RESICO_PF_TABLA.find(([tope])=>ingresoMes<=tope);
  return tramo?tramo[1]:null;
}
function estimarFiscal(ventasMes, utilMes, nominaMes){
  const v=Math.max(0,Number(ventasMes)||0), u=Number(utilMes)||0, nomina=Math.max(0,Number(nominaMes)||0);
  const ingresoAnual=v*12, resicoAplica=ingresoAnual<=RESICO_PF_TOPE_ANUAL;
  const tasaResico=resicoAplica?tasaResicoPF(v):null;
  const isrResico=tasaResico==null?null:v*tasaResico;
  const isrGeneral=Math.max(0,u)*ISR_PM_GENERAL;
  const isrMes=isrResico==null?isrGeneral:isrResico;
  return {ventasMes:v, ingresoAnual, resicoAplica, tasaResico, isrResico, isrGeneral,
    regimen:isrResico==null?"general":"resico_pf", isrMes, utilDespues:u-isrMes,
    ivaTrasladado:v*IVA_GENERAL, isn:nomina*ISN_EDOMEX};
}
