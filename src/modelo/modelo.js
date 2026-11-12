/* COATL · Núcleo estadístico puro (sin DOM): probado en tests/. */
/* ---------- 2. Utilidades numéricas ---------- */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function gaussiana(rng){let u=0,v=0;while(u===0)u=rng();while(v===0)v=rng();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
const sigmoide = z => 1/(1+Math.exp(-z));
const acota = (x,a,b)=>Math.min(b,Math.max(a,x));

function derivar(e){
  e.diasMes=e.diasSem*4.33;
  e.cvEff=acota(e.cv+(e.merma||0),0.02,0.95);
  e.rentaEf=e.propio?0:e.renta;
  e.interesMes=e.inversion*e.credPct*e.tasa/12;
  e.fijos=e.rentaEf + e.empleados*e.costoEmpleado + e.otrosFijos + (e.mktGasto||0) + e.interesMes;
  e.ventasMes=e.mu*e.diasMes*e.ticket;
  e.margenUnit=e.ticket*(1-e.cvEff);
  e.utilMes=e.ventasMes*(1-e.cvEff)-e.fijos;
  e.peClientesMes=e.margenUnit>0?e.fijos/e.margenUnit:Infinity;
  e.peDia=e.peClientesMes/e.diasMes;
  e.pePesos=(1-e.cvEff)>0?e.fijos/(1-e.cvEff):Infinity;
  e.ms=e.ventasMes>0?(e.ventasMes-e.pePesos)/e.ventasMes:-1;
  return e;
}

/* ---------- 6. Modelo logístico con contribuciones etiquetadas ---------- */
function modeloLogistico(e){
  const msZ = e.ms>=0.30?0.25 : e.ms>=0.15?0.10 : e.ms>=0?-0.10 : -0.50;
  const deudaZ = e.credPct>=0.6?-0.20 : e.credPct>=0.3?-0.08 : e.credPct>0?0:0.05;
  const contribs=[
    ["Giro ("+e.giro.n+")", e.giro.z],
    ["Zona ("+e.zona.n+")", e.zona.z],
    ["Experiencia en el giro", e.expZ],
    ["Reserva de capital", e.resZ],
    ["Competencia cercana", e.compZ],
    ["Formalidad fiscal", e.formZ],
    ["Marketing", e.mktZ],
    ["Estructura de deuda", deudaZ],
    ["Local propio", e.propio?0.10:0],
    ["Margen de seguridad financiero", msZ]
  ];
  const z=-0.16+contribs.reduce((s,c)=>s+c[1],0);
  return {P:acota(sigmoide(z),0.04,0.93), z, contribs};
}

/* ---------- 7. Curva de supervivencia personalizada ---------- */
function curvaSupervivencia(P){
  const h=Math.log(P)/Math.log(S0[3]);
  return S0.map((s,t)=>t===0?1:Math.pow(s,h));
}

/* ---------- 8. Monte Carlo (2,000 años simulados) ---------- */
function monteCarlo(e){
  /* Cada corrida = un año. Fuentes de variación (supuestos del equipo, ver
     INCERTIDUMBRE en datos.js):
     · choque anual común de demanda (lognormal de media 1): un "mal año" afecta
       a los 12 meses a la vez, por lo que no se compensa al sumar;
     · ruido mensual de clientes y de ticket (independiente por mes);
     · ruido anual en el costo variable (proveedores, merma). */
  const U=INCERTIDUMBRE, rng=mulberry32(SEMILLA), res=new Array(N_SIM);
  for(let i=0;i<N_SIM;i++){
    const fAnual=Math.exp(gaussiana(rng)*U.demandaAnual - U.demandaAnual*U.demandaAnual/2);
    const cvSim=acota(e.cvEff + gaussiana(rng)*U.costoVariable, 0.02, 0.98);
    let total=0;
    for(let m=0;m<12;m++){
      const rampa=Math.pow(1+(e.crec||0), m/12);
      const muM=e.mu*e.estacion[m]*rampa*fAnual;
      const cli=Math.max(0, muM + gaussiana(rng)*U.demandaMensual*muM);
      const tk =Math.max(1, e.ticket + gaussiana(rng)*U.ticket*e.ticket);
      total += cli*e.diasMes*tk*(1-cvSim) - e.fijos;
    }
    res[i]=total;
  }
  res.sort((a,b)=>a-b);
  const media=res.reduce((s,x)=>s+x,0)/N_SIM;
  const sd=Math.sqrt(res.reduce((s,x)=>s+(x-media)**2,0)/(N_SIM-1));
  return {res, media, sd, p025:cuantil(res,.025), p05:cuantil(res,.05), p50:cuantil(res,.5),
          p95:cuantil(res,.95), p975:cuantil(res,.975),
          pPos:res.filter(x=>x>0).length/N_SIM};
}

/* Cuantil empírico con interpolación lineal (tipo 7 de Hyndman–Fan, el de R/NumPy). */
function cuantil(ordenados,p){
  const h=(ordenados.length-1)*p, lo=Math.floor(h), hi=Math.ceil(h);
  return ordenados[lo]+(ordenados[hi]-ordenados[lo])*(h-lo);
}

/* ---------- 8-bis. Rango plausible de P (incertidumbre de los β) ----------
   Los β son supuestos del equipo, no estimaciones con error estándar. Para no
   presentar P como exacta, se perturba z: cada contribución βᵢ con DE relativa
   de 30 % y el intercepto con DE 0.15, y se reportan P5–P95 de P.
   Es un análisis de sensibilidad, NO un intervalo de confianza muestral. */
function rangoP(modelo){
  const U=INCERTIDUMBRE, rng=mulberry32(SEMILLA+1), n=1000, ps=new Array(n);
  for(let i=0;i<n;i++){
    let z=-0.16+gaussiana(rng)*U.intercepto;
    for(const c of modelo.contribs) z+=c[1]*(1+gaussiana(rng)*U.betaRelativa);
    ps[i]=acota(sigmoide(z),0.04,0.93);
  }
  ps.sort((a,b)=>a-b);
  return {p05:cuantil(ps,.05), p50:cuantil(ps,.5), p95:cuantil(ps,.95)};
}

