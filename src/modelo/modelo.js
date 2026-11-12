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
  const rng=mulberry32(SEMILLA), res=new Array(N_SIM);
  for(let i=0;i<N_SIM;i++){
    let total=0;
    for(let m=0;m<12;m++){
      const rampa=Math.pow(1+(e.crec||0), m/12);
      const muM=e.mu*e.estacion[m]*rampa;
      const cli=Math.max(0, muM + gaussiana(rng)*0.22*muM);
      const tk =Math.max(1, e.ticket + gaussiana(rng)*0.08*e.ticket);
      total += cli*e.diasMes*tk*(1-e.cvEff) - e.fijos;
    }
    res[i]=total;
  }
  res.sort((a,b)=>a-b);
  const media=res.reduce((s,x)=>s+x,0)/N_SIM;
  const sd=Math.sqrt(res.reduce((s,x)=>s+(x-media)**2,0)/(N_SIM-1));
  const q=p=>res[Math.min(N_SIM-1,Math.floor(p*N_SIM))];
  return {res, media, sd, p025:q(.025), p975:q(.975), p05:q(.05),
          pPos:res.filter(x=>x>0).length/N_SIM};
}

