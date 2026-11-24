"use strict";
/* ===== src/datos/datos.js ===== */
/* COATL · Datos de anclaje (giros, zonas, S0, estacionalidad). Sin DOM. */
/* ---------- 1. Parámetros y datos de anclaje ---------- */
/* β de giro y zona (z): ESTIMADOS con el DENUE (scripts/denue_supervivencia.py → data/denue/supervivencia.json).
   Cohorte de 305,313 negocios incorporados al DENUE en la actualización censal de 2019 en el Estado de México
   (4,654 en Coacalco), seguidos a la edición de 2024: regresión logística con errores estándar (ee),
   efectos centrados y contraídos por Bayes empírico, multiplicados por la pendiente de calibración fuera de muestra
   (data/denue/validacion.json). Juguería y pastelería heredan el β de cafetería y panadería (comparten clase SCIAN).
   zEq = supuesto anterior del equipo; fz = fuente del coeficiente. */
const GIROS = {
  abarrotes:    {n:"Abarrotes / minisúper",                ticket:65,  cv:72, dem:120, z: 0.18, ee:0.010, zEq:-0.10, fz:"denue"},
  tortilleria:  {n:"Tortillería",                          ticket:22,  cv:55, dem:260, z: 0.06, ee:0.021, zEq:-0.02, fz:"denue"},
  carniceria:   {n:"Carnicería / pollería",                ticket:140, cv:68, dem:75,  z:-0.00, ee:0.017, zEq: 0.00, fz:"denue"},
  fruteria:     {n:"Frutería y verdulería",                ticket:70,  cv:62, dem:95,  z:-0.19, ee:0.020, zEq:-0.05, fz:"denue"},
  fonda:        {n:"Fonda / cocina económica",             ticket:85,  cv:45, dem:70,  z:-0.23, ee:0.034, zEq:-0.12, fz:"denue"},
  taqueria:     {n:"Taquería / antojitos",                 ticket:95,  cv:40, dem:90,  z:-0.18, ee:0.014, zEq:-0.10, fz:"denue"},
  restaurante:  {n:"Restaurante",                          ticket:180, cv:42, dem:55,  z:-0.14, ee:0.057, zEq:-0.15, fz:"denue"},
  pizzeria:     {n:"Pizzería",                             ticket:160, cv:38, dem:45,  z:-0.28, ee:0.027, zEq:-0.10, fz:"denue"},
  cafeteria:    {n:"Cafetería",                            ticket:95,  cv:38, dem:65,  z:-0.26, ee:0.020, zEq:-0.08, fz:"denue"},
  jugueria:     {n:"Juguería / licuados",                  ticket:55,  cv:35, dem:70,  z:-0.26, ee:0.020, zEq:-0.06, fz:"denue"},
  panaderia:    {n:"Panadería",                            ticket:40,  cv:45, dem:140, z:-0.05, ee:0.025, zEq:-0.02, fz:"denue"},
  pasteleria:   {n:"Pastelería / repostería",              ticket:210, cv:38, dem:30,  z:-0.05, ee:0.025, zEq: 0.00, fz:"denue"},
  papeleria:    {n:"Papelería",                            ticket:55,  cv:60, dem:80,  z: 0.17, ee:0.017, zEq:-0.10, fz:"denue"},
  ciber:        {n:"Ciber / impresiones",                  ticket:35,  cv:25, dem:60,  z:-0.32, ee:0.024, zEq:-0.05, fz:"denue"},
  farmacia:     {n:"Farmacia",                             ticket:160, cv:70, dem:90,  z: 0.19, ee:0.025, zEq: 0.05, fz:"denue"},
  naturista:    {n:"Tienda naturista / suplementos",       ticket:170, cv:52, dem:30,  z:-0.09, ee:0.040, zEq: 0.03, fz:"denue"},
  vinateria:    {n:"Vinatería / licorería",                ticket:180, cv:68, dem:55,  z:-0.06, ee:0.051, zEq: 0.02, fz:"denue"},
  ropa:         {n:"Ropa y calzado",                       ticket:320, cv:55, dem:25,  z:-0.13, ee:0.015, zEq:-0.18, fz:"denue"},
  joyeria:      {n:"Joyería y bisutería",                  ticket:350, cv:52, dem:10,  z:-0.17, ee:0.040, zEq:-0.08, fz:"denue"},
  celulares:    {n:"Celulares y accesorios",               ticket:280, cv:55, dem:28,  z:-0.11, ee:0.035, zEq:-0.02, fz:"denue"},
  tecnologia:   {n:"Tecnología (venta y reparación)",      ticket:380, cv:50, dem:18,  z:-0.19, ee:0.051, zEq: 0.10, fz:"denue"},
  ferreteria:   {n:"Ferretería / tlapalería",              ticket:190, cv:62, dem:40,  z: 0.30, ee:0.030, zEq: 0.06, fz:"denue"},
  refaccionaria:{n:"Refaccionaria automotriz",             ticket:260, cv:58, dem:22,  z: 0.07, ee:0.033, zEq: 0.08, fz:"denue"},
  taller:       {n:"Taller mecánico",                      ticket:850, cv:40, dem:8,   z: 0.18, ee:0.021, zEq: 0.12, fz:"denue"},
  autolavado:   {n:"Autolavado",                           ticket:120, cv:25, dem:28,  z:-0.13, ee:0.044, zEq: 0.04, fz:"denue"},
  estetica:     {n:"Estética / barbería",                  ticket:130, cv:18, dem:28,  z: 0.00, ee:0.013, zEq: 0.08, fz:"denue"},
  spa:          {n:"Spa / salón de uñas",                  ticket:260, cv:22, dem:18,  z: 0.06, zEq: 0.06, fz:"equipo"},
  lavanderia:   {n:"Lavandería",                           ticket:90,  cv:30, dem:45,  z:-0.09, ee:0.031, zEq: 0.02, fz:"denue"},
  gimnasio:     {n:"Gimnasio (mensualidades)",             ticket:480, cv:12, dem:12,  z:-0.14, ee:0.035, zEq: 0.05, fz:"denue"},
  veterinaria:  {n:"Veterinaria / estética canina",        ticket:320, cv:30, dem:16,  z: 0.21, ee:0.053, zEq: 0.12, fz:"denue"},
  dental:       {n:"Consultorio dental",                   ticket:750, cv:22, dem:7,   z: 0.38, ee:0.029, zEq: 0.22, fz:"denue"},
  optica:       {n:"Óptica",                               ticket:950, cv:45, dem:7,   z: 0.17, ee:0.049, zEq: 0.10, fz:"denue"},
  consultorio:  {n:"Consultorio / despacho profesional",   ticket:420, cv:15, dem:10,  z:-0.12, ee:0.029, zEq: 0.20, fz:"denue"},
  educacion:    {n:"Educación (regularización / idiomas)", ticket:350, cv:20, dem:15,  z:-0.47, ee:0.063, zEq: 0.15, fz:"denue"},
  floreria:     {n:"Florería",                             ticket:230, cv:45, dem:14,  z: 0.09, ee:0.038, zEq:-0.04, fz:"denue"}
};
const ZONAS = {
  corredor:  {n:"Corredor Vía López Portillo",                       afl:1.35, rm2:280, z:-0.20, ee:0.062, zEq: 0.30, fz:"denue"},
  centro:    {n:"San Francisco Coacalco (Centro)",                   afl:1.15, rm2:170, z: 0.05, ee:0.040, zEq: 0.12, fz:"denue"},
  flores:    {n:"Villa de las Flores · Parque Res. · Bosques",       afl:1.10, rm2:190, z: 0.23, ee:0.066, zEq: 0.15, fz:"denue"},
  heroes:    {n:"Los Héroes · Loma Bonita · V. de las Manzanas",     afl:1.00, rm2:150, z:-0.21, ee:0.061, zEq: 0.04, fz:"denue"},
  popular:   {n:"El Potrero · San Rafael · El Olivo",                afl:0.90, rm2:110, z: 0.06, ee:0.051, zEq:-0.10, fz:"denue"},
  periferia: {n:"Zonas habitacionales periféricas",                  afl:0.78, rm2:90,  z: 0.17, ee:0.193, zEq:-0.18, fz:"denue"}
};
/* Supervivencia nacional S0(t), t = 0…10 años.
   INEGI, Demografía de los Negocios 1989–2019, tabulado Nal_Tot_CE2019,
   columna p(x), edades 0…9: S0(x+1) = p(x), redondeada a cuatro decimales.
   https://www.inegi.org.mx/contenidos/programas/dn/2019/tabulados/Nal_Tot_CE2019.xlsx */
const S0 = [1, 0.6908, 0.4812, 0.4261, 0.3871, 0.3568, 0.3320, 0.3111, 0.2930, 0.2770, 0.2627];
/* Intercepto calibrado: un escenario neutro reproduce S0(3) nacional → β₀ = logit(0.4261). */
const BETA0 = Math.log(S0[3]/(1-S0[3]));
const ESTACION = {
  estable:   [1,1,1,1,1,1,1,1,1,1,1,1],
  diciembre: [.95,.90,.95,.95,1,1,1,1,1,1.05,1.15,1.35],
  verano:    [.95,.95,1,1,1.05,1.10,1.20,1.25,1.10,.95,.95,1]
};
const N_SIM = 2000, SEMILLA = 20262;


/* Supuestos de incertidumbre del Monte Carlo y del rango de P.
   Son SUPUESTOS DEL EQUIPO (no estimados con datos); se documentan en
   docs/METODOLOGIA.md y en la ficha «Supuestos y limitaciones». */
const INCERTIDUMBRE = {
  demandaMensual: 0.22,  // DE relativa de clientes, independiente por mes
  ticket:         0.08,  // DE relativa del ticket promedio, por mes
  demandaAnual:   0.15,  // DE (log) del choque común del año
  costoVariable:  0.02,  // DE absoluta del costo variable efectivo (2 pp)
  betaRelativa:   0.30,  // DE relativa de cada β para el rango de P
  intercepto:     0.15   // DE del intercepto para el rango de P
};

/* Fotos reales de cada zona: Wikimedia Commons (licencia libre). Recortadas, con contraste y
   nitidez ajustados y convertidas a WebP; la cita se muestra junto a cada foto. */
const FOTOS_ZONAS = {
 "corredor": {
  "src": "assets/img/zonas/corredor.webp",
  "autor": "ArCaRa",
  "licencia": "CC BY 3.0",
  "licenciaUrl": "https://creativecommons.org/licenses/by/3.0",
  "pagina": "https://commons.wikimedia.org/wiki/File:Plaza_Coacalco._-_panoramio.jpg"
 },
 "centro": {
  "src": "assets/img/zonas/centro.webp",
  "autor": "ArCaRa",
  "licencia": "CC BY 3.0",
  "licenciaUrl": "https://creativecommons.org/licenses/by/3.0",
  "pagina": "https://commons.wikimedia.org/wiki/File:C%C3%BApula_octagonal-San_Francisco-Koakalko._-_panoramio.jpg"
 },
 "flores": {
  "src": "assets/img/zonas/flores.webp",
  "autor": "ArCaRa",
  "licencia": "CC BY 3.0",
  "licenciaUrl": "https://creativecommons.org/licenses/by/3.0",
  "pagina": "https://commons.wikimedia.org/wiki/File:Jard%C3%ADn_Triangular_en_villa_de_las_flores_cuidado_con_amor_por_dos_entusiastas_mujeres_de_la_comunidad._-_panoramio.jpg"
 },
 "periferia": {
  "src": "assets/img/zonas/periferia.webp",
  "autor": "ArCaRa",
  "licencia": "CC BY 3.0",
  "licenciaUrl": "https://creativecommons.org/licenses/by/3.0",
  "pagina": "https://commons.wikimedia.org/wiki/File:Ultima_Parcela_en_Coacalco._-_panoramio.jpg"
 },
 "heroes": {
  "src": "assets/img/zonas/heroes.webp",
  "autor": "ArCaRa",
  "licencia": "CC BY 3.0",
  "licenciaUrl": "https://creativecommons.org/licenses/by/3.0",
  "pagina": "https://commons.wikimedia.org/wiki/File:Los_Heroes-Koakalko._-_panoramio.jpg"
 },
 "popular": {
  "src": "assets/img/zonas/popular.webp",
  "autor": "ArCaRa",
  "licencia": "CC BY 3.0",
  "licenciaUrl": "https://creativecommons.org/licenses/by/3.0",
  "pagina": "https://commons.wikimedia.org/wiki/File:Andador_Luis_Donaldo_Colosio._-_panoramio.jpg"
 }
};

/* ===== src/modelo/modelo.js ===== */
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
/* Fuente de cada contribución: "datos" (estimado con microdatos del INEGI), "propio" (sale de los
   números del propio negocio) o "supuesto" (criterio del equipo, sin datos que lo liguen al cierre). */
const TOPE_FINANCIERO=[-0.50, 0.35];   // margen de seguridad + reserva + deuda miden casi lo mismo: no se apilan sin límite
function modeloLogistico(e){
  const msZ = e.ms>=0.30?0.25 : e.ms>=0.15?0.10 : e.ms>=0?-0.10 : -0.50;
  const deudaZ = e.credPct>=0.6?-0.20 : e.credPct>=0.3?-0.08 : e.credPct>0?0:0.05;
  const fin = msZ+e.resZ+deudaZ, ajusteFin = acota(fin, TOPE_FINANCIERO[0], TOPE_FINANCIERO[1]) - fin;
  /* La competencia cercana ya no entra a P: el β de zona (DENUE) ya refleja la densidad de negocios.
     Su efecto llega por la demanda (clientes) y de ahí al margen de seguridad. */
  const contribs=[
    ["Giro ("+e.giro.n+")", e.giro.z, e.giro.fz==="denue"?"datos":"supuesto"],
    ["Zona ("+e.zona.n+")", e.zona.z, e.zona.fz==="denue"?"datos":"supuesto"],
    ["Experiencia en el giro", e.expZ, "supuesto"],
    ["Reserva de capital", e.resZ, "supuesto"],
    ["Formalidad fiscal", e.formZ, "datos"],
    ["Marketing", e.mktZ, "supuesto"],
    ["Estructura de deuda", deudaZ, "supuesto"],
    ["Local propio", e.propio?0.10:0],
    ["Modelo de negocio", e.modZ||0],
    ["Permisos municipales", e.permZ||0],
    ["Modalidad de venta", e.modalZ||0],
    ["Horario extendido", e.horZ||0],
    ["Riesgo de extorsión (cobro de piso)", e.extZ||0],
    ["Resiliencia del emprendedor", e.resilZ||0],
    ["Motivación para emprender", e.motivZ||0],
    ["Margen de seguridad financiero", msZ, "propio"]
  ];
  if(Math.abs(ajusteFin)>1e-9) contribs.push(["Tope del bloque financiero (margen + reserva + deuda)", ajusteFin, "propio"]);
  contribs.forEach(c=>{ if(!c[2]) c[2]="supuesto"; });
  const z=BETA0+contribs.reduce((s,c)=>s+c[1],0);
  const zSupuestos=contribs.filter(c=>c[2]==="supuesto").reduce((s,c)=>s+c[1],0);
  /* P con solo lo medido (datos + números propios): cuánto de P depende de supuestos del equipo. */
  const Pmedido=acota(sigmoide(z-zSupuestos),0.04,0.93);
  return {P:acota(sigmoide(z),0.04,0.93), z, contribs, Pmedido, zSupuestos};
}

/* Meses de gastos fijos que cubre la reserva declarada (límite inferior de cada opción, conservador). */
function mesesReserva(resZ){ return resZ>=0.35?12 : resZ>=0.20?6 : resZ>=0?3 : 1.5; }

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
  const U=INCERTIDUMBRE, rng=mulberry32(SEMILLA), res=new Array(N_SIM), mesVta=new Float64Array(N_SIM*12);
  const caja0=mesesReserva(e.resZ)*e.fijos; let sinCaja=0;
  for(let i=0;i<N_SIM;i++){
    const fAnual=Math.exp(gaussiana(rng)*U.demandaAnual - U.demandaAnual*U.demandaAnual/2);
    const cvSim=acota(e.cvEff + gaussiana(rng)*U.costoVariable, 0.02, 0.98);
    let total=0, quiebra=false;
    for(let m=0;m<12;m++){
      const rampa=Math.pow(1+(e.crec||0), m/12);
      const muM=e.mu*e.estacion[m]*rampa*fAnual;
      const cli=Math.max(0, muM + gaussiana(rng)*U.demandaMensual*muM);
      const tk =Math.max(1, e.ticket + gaussiana(rng)*U.ticket*e.ticket);
      const venta=cli*e.diasMes*tk;
      mesVta[i*12+m]=venta;
      total += venta*(1-cvSim) - e.fijos;
      if(caja0+total<0) quiebra=true;   // la reserva no alcanzó a cubrir las pérdidas acumuladas
    }
    res[i]=total; if(quiebra) sinCaja++;
  }
  res.sort((a,b)=>a-b);
  /* Ventas de UN mes (no el promedio del año): la regla de salida del plan compara meses sueltos.
     falsaAlarma = años simulados en que hay dos meses seguidos bajo el P5 mensual aunque el negocio
     va como lo esperado (el modelo ES el escenario esperado): cuántas veces la regla se activaría por error. */
  const ordenMes=Array.from(mesVta).sort((a,b)=>a-b), p05Mes=cuantil(ordenMes,.05);
  let alarmas=0;
  for(let i=0;i<N_SIM;i++){ for(let m=1;m<12;m++){ if(mesVta[i*12+m-1]<p05Mes && mesVta[i*12+m]<p05Mes){ alarmas++; break; } } }
  const media=res.reduce((s,x)=>s+x,0)/N_SIM;
  const sd=Math.sqrt(res.reduce((s,x)=>s+(x-media)**2,0)/(N_SIM-1));
  return {res, media, sd, p025:cuantil(res,.025), p05:cuantil(res,.05), p50:cuantil(res,.5),
          p95:cuantil(res,.95), p975:cuantil(res,.975),
          pPos:res.filter(x=>x>0).length/N_SIM,
          pSinEfectivo:sinCaja/N_SIM, cajaInicial:caja0,
          ventasMes:{p05:p05Mes, p50:cuantil(ordenMes,.5), falsaAlarma:alarmas/N_SIM}};
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
  if(modelo._rangoP) return modelo._rangoP;   // memo: se consulta varias veces por recálculo
  const U=INCERTIDUMBRE, rng=mulberry32(SEMILLA+1), n=1000, ps=new Array(n);
  for(let i=0;i<n;i++){
    let z=BETA0+gaussiana(rng)*U.intercepto;
    for(const c of modelo.contribs) z+=c[1]*(1+gaussiana(rng)*U.betaRelativa);
    ps[i]=acota(sigmoide(z),0.04,0.93);
  }
  ps.sort((a,b)=>a-b);
  return (modelo._rangoP={p05:cuantil(ps,.05), p50:cuantil(ps,.5), p95:cuantil(ps,.95)});
}


/* ===== src/modelo/finanzas.js ===== */
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

/* ===== src/modelo/fiscal.js ===== */
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

/* ===== src/datos/madurez.js ===== */
/* ---------- 4-bis. Diagnóstico de solidez del negocio: 5 niveles, 30 puntos ----------
   Lista de verificación del equipo (no es un modelo estadístico y no cambia la probabilidad).
   Cada punto trae qué significa en lenguaje llano y un BORRADOR escrito con los datos del
   simulador (c = contexto del negocio). Los textos entre [corchetes] los completa la persona.
   auto(c): sugerencia inicial tomada del simulador (0 pendiente, 1 en proceso, 2 listo). */
const NIVELES_MADUREZ=[
  {n:1, t:"Cimientos vitales", s:"Sin esto, el negocio muere antes de nacer", w:0.35},
  {n:2, t:"Estructura operativa, legal y financiera", s:"Lo que sostiene el crecimiento", w:0.25},
  {n:3, t:"Aceleración y ventajas competitivas", s:"Lo que te separa del promedio", w:0.20},
  {n:4, t:"Consolidación y escala", s:"Lo que construye un líder de su categoría", w:0.12},
  {n:5, t:"Excelencia", s:"Los detalles finales de los negocios extraordinarios", w:0.08}
];
const PUNTOS_MADUREZ=[
  /* ===== Nivel 1 ===== */
  {id:"problema", n:1, t:"Problema real, urgente y costoso",
    q:"Una molestia concreta que tus clientes ya intentan resolver, aunque sea con parches o gastando de más.",
    b:c=>`${c.N} existe porque en ${c.zona} quien busca ${c.giro} hoy tiene que [desplazarse, esperar o pagar de más]. Compruébalo: pregunta a 20 vecinos qué hacen hoy y cuánto les cuesta. Necesitas que al menos ${c.pe} personas al día lo vivan como un problema real: ese es tu punto de equilibrio.`},
  {id:"uvp", n:1, t:"Propuesta de valor única",
    q:"Una frase que explique por qué elegirte a ti y no a lo que ya existe.",
    b:c=>`«${c.nombre}: ${c.giro} en ${c.zona}, [más rápido / más fresco / más cerca / mejor atendido], por ${c.ticket} en promedio». Si no puedes decir en una frase por qué te elegirían sobre los negocios parecidos de la zona, todavía no la tienes.`},
  {id:"mvp", n:1, t:"Producto mínimo viable",
    q:"La versión más pequeña de tu negocio que ya entrega valor y te deja aprender con clientes reales.",
    b:c=>`Antes de comprometer los ${c.inversion} de inversión, prueba ${c.N} en pequeño: [puesto de fin de semana, pedidos por WhatsApp o una carta de 5 productos]. Meta de la prueba: ${c.pe} clientes al día durante 4 semanas seguidas.`},
  {id:"equipo", n:1, t:"Equipo fundador complementario",
    q:"Al menos dos funciones cubiertas: quien hace el producto o servicio y quien lo vende.",
    b:c=>`En ${c.N} hay dos papeles que no pueden quedar vacíos: quien opera (producto, compras y servicio) y quien vende (clientes, redes y cobranza). Con ${c.empleadosTxt} en tu plan, deja por escrito quién decide qué y quién cubre a quién cuando falte.`},
  {id:"validacion", n:1, t:"Validación de mercado y primeros clientes",
    q:"Pruebas de que hay gente dispuesta a pagar: ventas, pedidos apartados o clientes que regresan.",
    b:c=>`Evidencia mínima para ${c.N}: 30 ventas reales o 10 clientes que repiten en un mes. Tu simulador supone ${c.clientes} clientes al día; anota los reales desde el primer día y compáralos cada semana.`,
    auto:c=>c.historial?1:0},
  {id:"monetizacion", n:1, t:"Modelo de negocio y monetización",
    q:"Quién paga, cuánto, cada cuándo y cuánto te queda de cada venta.",
    b:c=>`Quién paga: el cliente de ${c.zona}. Cuánto: ${c.ticket} por compra. Cada cuándo: ${c.clientes} ventas al día, ${c.ventasMes} al mes. Margen bruto: te quedan ${c.margenPct} de cada peso vendido. Equilibrio: ${c.pe} clientes al día.`,
    auto:c=>c.utilNum>0?1:0},
  {id:"runway", n:1, t:"Pista financiera (runway)",
    q:"Dinero suficiente para operar 12 a 18 meses aunque las ventas tarden en llegar.",
    b:c=>`Tus gastos fijos son de ${c.fijos} al mes. Para aguantar 12 meses sin depender de las ventas necesitas ${c.fijos12}; el mínimo sano son 6 meses (${c.fijos6}). En el simulador declaraste una reserva de «${c.reservaTxt}».`,
    auto:c=>c.resZ>=0.2?2:c.resZ>=0?1:0},
  /* ===== Nivel 2 ===== */
  {id:"legal", n:2, t:"Constitución legal y acuerdos entre socios",
    q:"El negocio existe en papel y, si hay socios, las reglas están firmadas antes de que haya dinero.",
    b:c=>`${c.N} puede arrancar como persona física en RESICO o como sociedad (S.A.S. o S. de R.L.). Si hay socios: acuerdo por escrito con porcentajes, aportaciones, quién administra y permanencia mínima (ganar la participación en 4 años, con 1 de espera). Registra la marca «${c.nombre}» en el IMPI.`,
    auto:c=>c.formZ>=0.1?1:0},
  {id:"unit", n:2, t:"Economía por cliente",
    q:"Lo que te deja un cliente a lo largo del tiempo debe ser al menos 3 veces lo que cuesta conseguirlo.",
    b:c=>`Cada venta te deja ${c.margenUnit} de margen. Si un cliente regresa [X] veces al año, vale X × ${c.margenUnit}. Con ${c.mktGasto} de marketing al mes, conseguir un cliente nuevo debe costarte menos de un tercio de ese valor. Tu inversión se recupera en ${c.paybackTxt} (meta: menos de 12 meses).`,
    auto:c=>c.paybackNum&&c.paybackNum<=12?1:0},
  {id:"flujo", n:2, t:"Control del flujo de efectivo",
    q:"Saber cada semana cuánto entra, cuánto sale y cuánto queda.",
    b:c=>`Cada lunes anota: saldo en caja y banco, ventas de la semana y pagos por venir. Tu gasto fijo es de ${c.fijos} al mes (unos ${c.fijosSemana} por semana). Separa la cuenta del negocio de la personal y aparta el ISR estimado: ${c.isrMes} al mes.`},
  {id:"pmf", n:2, t:"Encaje entre producto y mercado",
    q:"El punto en que los clientes regresan solos y te recomiendan sin que pagues publicidad.",
    b:c=>`Señales de que ${c.N} ya encajó: más de 4 de cada 10 clientes regresan en el mes, llegan recomendados y las ventas superan los ${c.clientes} clientes al día que supusiste. Mídelo antes de ampliar el local o abrir otro.`},
  {id:"canal", n:2, t:"Canal de adquisición repetible",
    q:"Una forma de atraer clientes en la que cada peso invertido regresa de manera predecible.",
    b:c=>`Elige un canal y mídelo 8 semanas: en ${c.zona} suelen funcionar [Google Maps, WhatsApp Business, volanteo o alianzas con negocios vecinos]. Regla práctica: cada $100 de publicidad deben traer al menos ${c.ventasPor100} ventas para recuperar tres veces lo invertido.`,
    auto:c=>c.mktZ>=0.12?1:0},
  {id:"infra", n:2, t:"Operación que aguanta crecer",
    q:"Que el negocio no se rompa si de pronto llega mucha más gente.",
    b:c=>`Si mañana llegaran ${c.clientesDoble} clientes al día (el doble), ¿qué se rompe primero en ${c.N}: manos, espacio (${c.m2} m²), proveedores o cobro? Ten terminal bancaria, respaldo de tu información y un proveedor alterno para tu insumo principal.`},
  {id:"feedback", n:2, t:"Retroalimentación continua del cliente",
    q:"Un hábito semanal de preguntar, medir y corregir.",
    b:c=>`Pregunta a 5 clientes por semana: «del 0 al 10, ¿nos recomendarías?» y «¿qué mejorarías?». Con ${c.clientes} clientes al día es una fracción mínima. Convierte la queja que más se repita en la mejora de la semana siguiente.`},
  /* ===== Nivel 3 ===== */
  {id:"moat", n:3, t:"Defensas frente a la competencia",
    q:"Algo que un competidor con más dinero no puede copiarte rápido.",
    b:c=>`Lo difícil de copiar de ${c.N}: tu ubicación en ${c.zona}, la relación con tus clientes frecuentes, una receta o servicio propio y tu marca registrada. Elige una y refuérzala cada mes.`},
  {id:"datos", n:3, t:"Analítica y tablero de métricas",
    q:"Decidir con números que sirven para actuar, no con seguidores ni «me gusta».",
    b:c=>`Tablero semanal de ${c.N} con 5 números: clientes por día (meta ${c.clientes}), ticket promedio (meta ${c.ticket}), costo variable (meta ${c.cvPct}), clientes que regresan y utilidad (meta ${c.util} al mes).`},
  {id:"onboarding", n:3, t:"Venta y primera experiencia sin fricción",
    q:"Que el cliente viva lo mejor de tu negocio en sus primeros minutos.",
    b:c=>`La primera visita a ${c.N} debe salir redonda: atención en menos de [3] minutos, precios a la vista, cobro con tarjeta y transferencia, y un motivo para volver (sello, cupón o mensaje por WhatsApp).`},
  {id:"capital", n:3, t:"Levantamiento de capital inteligente",
    q:"Conseguir dinero con una historia clara, papeles en orden y socios que aporten más que dinero.",
    b:c=>`Hoy financias ${c.credPct} de una inversión de ${c.inversion} con crédito. Antes de pedir más, arma una carpeta con el reporte de COATL, 6 meses de ventas reales y tus estados de cuenta. Prefiere socios o créditos que traigan contactos y experiencia.`},
  {id:"talento", n:3, t:"Contratación de talento",
    q:"Un proceso para contratar gente que haga su parte mejor que tú.",
    b:c=>`Para cubrir tus puestos (${c.empleadosTxt} en tu plan): describe el puesto en media página, haz una prueba práctica pagada de un día y contrata por actitud de servicio. Presupuestas ${c.costoEmpleado} por persona al mes; dalos de alta en el IMSS desde el primer día.`},
  {id:"compliance", n:3, t:"Cumplimiento normativo y fiscal",
    q:"Licencias, impuestos y obligaciones laborales al corriente para que nada frene al negocio.",
    b:c=>`Lista para ${c.N}: RFC y e.firma, régimen fiscal (${c.regimenTxt}), factura por cada venta que la pida, declaración mensual a más tardar el día 17, licencia de funcionamiento municipal, Protección Civil, aviso a COFEPRIS si manejas alimentos o salud, e IMSS de tus empleados.`,
    auto:c=>c.formZ>=0.1&&c.permZ>=0?1:0},
  /* ===== Nivel 4 ===== */
  {id:"cultura", n:4, t:"Cultura documentada y vivida",
    q:"Reglas claras de cómo se trabaja y se trata al cliente, que todos conocen.",
    b:c=>`Tres reglas de ${c.N} escritas y a la vista: cómo tratamos al cliente, qué hacemos cuando algo sale mal y cómo nos avisamos los problemas. Una junta de 15 minutos por semana para revisarlas con el equipo.`},
  {id:"gtm", n:4, t:"Expansión y nuevos canales",
    q:"Abrir nuevos clientes, productos o territorios sin descuidar lo que ya funciona.",
    b:c=>`Siguiente paso de crecimiento para ${c.N}: [entrega a domicilio, segundo turno, ventas a empresas o segunda sucursal]. Ábrelo solo cuando lleves 3 meses seguidos arriba de ${c.clientes} clientes al día.`},
  {id:"gobierno", n:4, t:"Consejo y mentores",
    q:"Personas con experiencia que revisan tus números y te exigen resultados.",
    b:c=>`Busca 2 personas con experiencia (un contador y alguien del giro) y preséntales tus números cada trimestre: probabilidad de ${c.P}, utilidad de ${c.util} al mes y el avance de este diagnóstico.`},
  {id:"marca", n:4, t:"Marca y reputación",
    q:"Ser la referencia de tu giro en tu zona.",
    b:c=>`Que ${c.N} sea la referencia de ${c.giro} en ${c.zona}: ficha de Google con fotos y reseñas respondidas, una publicación útil por semana y presencia en los eventos de la colonia. Las recomendaciones abaratan cada cliente nuevo.`},
  {id:"automatizacion", n:4, t:"Automatización e inteligencia artificial",
    q:"Que las tareas repetitivas no se coman tu tiempo.",
    b:c=>`Automatiza lo repetitivo de ${c.N}: catálogo y respuestas rápidas en WhatsApp Business, punto de venta con inventario, facturación automática y recordatorios de pago. Empieza por la tarea que más horas te quita cada semana.`},
  /* ===== Nivel 5 ===== */
  {id:"diseno", n:5, t:"Diseño y experiencia memorables",
    q:"Cada punto de contacto se ve y se siente cuidado.",
    b:c=>`Cuida cada punto de contacto de ${c.N}: fachada, letrero, empaque, uniforme y redes con los mismos colores y el mismo tono. Que un cliente te reconozca sin leer el nombre.`},
  {id:"resiliencia", n:5, t:"Resiliencia y velocidad de ejecución",
    q:"Capacidad de cambiar de plan en semanas cuando el entorno cambia.",
    b:c=>`Plan B por escrito para tres golpes: ventas 30 % abajo, alza de renta o de insumos y cierre temporal. Tu escenario pesimista deja ${c.p05} al año: decide desde hoy qué recortas primero y cuánto aguantas.`},
  {id:"ecosistema", n:5, t:"Ecosistema y alianzas",
    q:"Que otros negocios ganen cuando tú ganas.",
    b:c=>`Haz que otros ganen con ${c.N}: convenios con negocios de ${c.zona}, proveedores locales, plataformas de reparto y venta a través de terceros. Cada aliado es un canal que no pagas.`},
  {id:"social", n:5, t:"Responsabilidad social y sostenibilidad",
    q:"Prácticas reales con tu gente, tu colonia y el ambiente.",
    b:c=>`Compromisos sencillos y verdaderos: menos desperdicio (tu merma es de ${c.merma}), empleo formal para gente de la zona y una causa local a la que ${c.N} aporte tiempo o producto. Comunícalo sin exagerar.`},
  {id:"salida", n:5, t:"Visión a 7–10 años",
    q:"Saber a dónde va el negocio: crecer, heredarse, franquiciarse o venderse.",
    b:c=>`Decide a dónde va ${c.N}: negocio familiar que reparte utilidades, cadena de sucursales, franquicia o venta a un tercero. Con una utilidad esperada de ${c.utilAnual} al año, ¿cuánto reinviertes y cuánto retiras?`}
];
/* Índice de solidez (0–100) y nivel alcanzado. estados: {id: 0|1|2}. */
function indiceMadurez(estados){
  const porNivel=NIVELES_MADUREZ.map(nv=>{
    const pts=PUNTOS_MADUREZ.filter(p=>p.n===nv.n);
    return pts.reduce((s,p)=>s+(estados[p.id]||0)/2,0)/pts.length;
  });
  const indice=Math.round(100*NIVELES_MADUREZ.reduce((s,nv,i)=>s+nv.w*porNivel[i],0));
  let nivel=0; while(nivel<5 && porNivel[nivel]>=0.7) nivel++;
  const pendientes=PUNTOS_MADUREZ.filter(p=>(estados[p.id]||0)<2);
  return {indice, porNivel, nivel, pendientes};
}

/* ===== src/ui/formato.js ===== */
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


/* ===== src/ui/controles.js ===== */
/* ---------- 3. Poblado de selects y controles ---------- */
(function poblar(){
  const sg=$("giro"), sz=$("zona");
  for(const k in GIROS){const o=document.createElement("option");o.value=k;o.textContent=GIROS[k].n;sg.appendChild(o)}
  sg.value="cafeteria";
  for(const k in ZONAS){const o=document.createElement("option");o.value=k;o.textContent=ZONAS[k].n;sz.appendChild(o)}
  sz.value="heroes";
})();
$("giro").addEventListener("change",()=>{const g=GIROS[$("giro").value];$("ticket").value=g.ticket;$("cvar").value=g.cv;$("vCvar").textContent=g.cv+"%"});
/* Hallazgo 5: los campos arrancan con los valores del giro seleccionado (Cafetería). */
$("giro").dispatchEvent(new Event("change"));
$("inversion").addEventListener("input",()=>$("vInversion").textContent=mxn.format(+$("inversion").value));
$("credito").addEventListener("input",()=>$("vCredito").textContent=$("credito").value+"%");
$("cvar").addEventListener("input",()=>$("vCvar").textContent=$("cvar").value+"%");
$("merma").addEventListener("input",()=>$("vMerma").textContent=(+$("merma").value)+"%");
$("ajustePrecio").addEventListener("input",()=>{const v=+$("ajustePrecio").value;$("vAjuste").textContent=(v>0?"+":"")+v+"%"});
$("sugerirRenta").addEventListener("click",()=>{
  const z=ZONAS[$("zona").value];
  $("renta").value=Math.round(z.rm2*(+$("superficie").value)/100)*100;
  calcular();
});
function factorCompetencia(){return ({"0.15":1.15,"0":1,"-0.20":0.85,"-0.35":0.72})[$("competencia").value]}
$("sugerirClientes").addEventListener("click",()=>{
  const g=GIROS[$("giro").value], z=ZONAS[$("zona").value];
  $("clientes").value=Math.max(1,Math.round(g.dem*z.afl*factorCompetencia()));
  calcular();
});

/* Pestañas: patrón WAI-ARIA (clic, flechas, Inicio/Fin; tabindex móvil). */
const PESTANAS=[...document.querySelectorAll(".pestana")];
function activarPestana(b,foco){
  PESTANAS.forEach(x=>{x.setAttribute("aria-selected","false");x.tabIndex=-1});
  document.querySelectorAll(".cuadro").forEach(x=>x.classList.remove("activo"));
  b.setAttribute("aria-selected","true"); b.tabIndex=0;
  $(b.dataset.cuadro).classList.add("activo");
  if(foco) b.focus();
}
PESTANAS.forEach((b,i)=>{
  b.addEventListener("click",()=>activarPestana(b,false));
  b.addEventListener("keydown",ev=>{
    const n=PESTANAS.length, mapa={ArrowRight:(i+1)%n, ArrowLeft:(i-1+n)%n, Home:0, End:n-1};
    if(ev.key in mapa){ev.preventDefault();activarPestana(PESTANAS[mapa[ev.key]],true)}
  });
});

/* ---------- 4. Retícula del hero (frecuencias INEGI) ---------- */
(function tableroHero(){
  const cont=$("cuadricula-hero");
  for(let i=0;i<100;i++){const c=document.createElement("div");c.className="celda";c.style.animationDelay=(i*8)+"ms";cont.appendChild(c)}
  const etapas=[1,2,3,5,10].map(t=>[t,Math.round(100*S0[t])]);
  let e=0;
  function pinta(){
    const [anio,vivos]=etapas[e];
    $("anio-tablero").textContent=" "+anio;
    [...cont.children].forEach((c,i)=>c.classList.toggle("cerro",i>=vivos));
    e=(e+1)%etapas.length;
  }
  pinta();
  if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(pinta,2800);
})();

/* ---------- 5. Lectura del formulario ---------- */
/* Lee un número respetando los límites min/max del control (hallazgo 1 de Codex):
   evita NaN o VPN infinito con valores manuales o de un enlace manipulado. */
function num(id){
  const c=$(id); let v=Number(c.value);
  if(!Number.isFinite(v)) v=Number(c.defaultValue)||0;
  if(c.min!=="") v=Math.max(Number(c.min),v);
  if(c.max!=="") v=Math.min(Number(c.max),v);
  if(String(v)!==c.value && document.activeElement!==c) c.value=String(v);
  return v;
}
function leerEscenario(){
  const giro=GIROS[$("giro").value]||GIROS.cafeteria, zona=ZONAS[$("zona").value]||ZONAS.heroes;
  const e={
    zonaKey:$("zona").value, giro, zona,
    expZ:+$("experiencia").value, formZ:+$("formalidad").value, mktZ:+$("marketing").value,
    compZ:+$("competencia").value, resZ:+$("reserva").value,
    modZ:+$("modeloNegocio").value||0, permZ:+$("permisos").value||0,
    modalZ:+$("modalidad").value||0, horZ:+$("horario").value||0,
    extZ:+$("extorsion").value||0, resilZ:+$("resiliencia").value||0, motivZ:+$("motivacion").value||0,
    empleados:num("empleados"), costoEmpleado:num("costoEmpleado"),
    propio:$("local").value==="propio", superficie:num("superficie"),
    inversion:num("inversion"), credPct:num("credito")/100, tasa:num("tasa")/100,
    renta:num("renta"), ticket:Math.max(1,num("ticket")), cv:num("cvar")/100,
    otrosFijos:num("otrosFijos")+num("cobroPiso")+(typeof sumaExtras==="function"?sumaExtras():0),   // la cuota de extorsión es un costo fijo más
    mu:Math.max(1,num("clientes")), diasSem:+$("dias").value||6,
    estacion:ESTACION[$("estacionalidad").value]||ESTACION.estable, r:num("descuento")/100,
    merma:num("merma")/100, mktGasto:num("mktGasto"),
    crec:num("crecimiento")/100, inf:num("inflacion")/100,
    ajustePrecio:num("ajustePrecio")/100, elasticidad:+$("elasticidad").value||-1
  };
  /* Precio vs. mercado con elasticidad constante (hallazgo 2 de Codex):
     ticket′ = ticket·(1+a),  μ′ = μ·(1+a)^ε. Con a = 0 (por defecto) no cambia nada. */
  e.ticketBase=e.ticket; e.muBase=e.mu;
  e.ticket=e.ticketBase*(1+e.ajustePrecio);
  e.mu=Math.max(1,e.muBase*Math.pow(1+e.ajustePrecio,e.elasticidad));
  return derivar(e);
}


/* ===== src/ui/resultados.js ===== */
/* ---------- 9. Render de resultados ---------- */
let ultimoP=0, ultimoNivel="";
/* vpn: se conoce hasta terminar el Monte Carlo. Con P alta pero VPN negativo el negocio puede seguir abierto
   sin recuperar la inversión a 3 años: no se celebra ni se llama «sólido». */
function pintarVeredicto(P, vpn){
  const p100=Math.round(P*100), el=$("probNum"), de=ultimoP;
  const t0=performance.now(), dur=650;
  function paso(t){
    const k=Math.min(1,(t-t0)/dur), v=de+(P-de)*(1-Math.pow(1-k,3));
    el.textContent=(v*100).toFixed(1)+"%";
    if(k<1)requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
  ultimoP=P;
  $("aguja").style.transform="translateX(-50%) rotate("+(-90+P*180)+"deg)";
  const sem=$("semaforo");
  let nivel;
  const pierde = vpn!=null && vpn<0;
  if(P>=0.65 && pierde){nivel="medio";sem.className="semaforo medio";sem.textContent="Sobrevive, pero no recupera la inversión"}
  else if(P>=0.65){nivel="alto";sem.className="semaforo alto";sem.textContent="Escenario sólido"}
  else if(P>=0.45){nivel="medio";sem.className="semaforo medio";sem.textContent="Escenario condicionado"}
  else {nivel="bajo";sem.className="semaforo bajo";sem.textContent="Escenario frágil"}
  if(vpn!=null&&nivel==="alto"&&ultimoNivel!=="alto"&&ultimoNivel!=="")fiesta();   // solo con el resultado completo
  if(vpn!=null) ultimoNivel=nivel;
  const mg=$("miniGrid");
  if(!mg.children.length){for(let i=0;i<100;i++){const c=document.createElement("div");c.className="celda";mg.appendChild(c)}}
  [...mg.children].forEach((c,i)=>c.classList.toggle("viva",i<p100));
  $("miniLeyenda").textContent="De 100 escenarios como el tuyo, ≈"+p100+" llegarían operando al año 3"+(pierde?", aunque a tu tasa de descuento la inversión no se recupera en ese plazo.":" y rentables.");
}
function fiesta(){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const capa=$("confeti"); capa.innerHTML="";
  const colores=["#C8102E","#E2233F","#7A0C1F","#FFC9CF","#FFFFFF"];
  for(let i=0;i<38;i++){
    const s=document.createElement("span");s.className="confeti";
    const c=colores[Math.floor(Math.random()*colores.length)];
    s.style.background=c;
    if(c==="#FFFFFF")s.style.border="1.5px solid #C8102E";
    s.style.left=(3+Math.random()*94)+"%";
    s.style.animationDelay=(Math.random()*0.35)+"s";
    s.style.animationDuration=(1+Math.random()*0.8)+"s";
    if(Math.random()<0.4)s.style.borderRadius="50%";
    capa.appendChild(s);
  }
  setTimeout(()=>{capa.innerHTML=""},2400);
}

/* Validación fuera de muestra (data/denue/validacion.json); el build la inserta. */
const VALIDACION={"que_se_valida":"Probabilidad de seguir en el DENUE a 5 años (alta 2019-11 → edición 2024-11) para negocios de Coacalco de los giros de COATL, con giro estimado sin Coacalco y zona por validación cruzada de 5 grupos.","n":2562,"observado":0.506,"predicho_promedio":0.355,"brier":0.2691,"brier_constante":0.25,"brier_nivel_corregido":0.2463,"desplazamiento_nivel_logit":0.637,"pendiente_calibracion":0.794,"auc":0.576,"deciles":[{"decil":1,"n":257,"predicho":0.244,"predicho_nivel_corregido":0.378,"observado":0.428},{"decil":2,"n":249,"predicho":0.281,"predicho_nivel_corregido":0.426,"observado":0.386},{"decil":3,"n":263,"predicho":0.301,"predicho_nivel_corregido":0.449,"observado":0.414},{"decil":4,"n":252,"predicho":0.317,"predicho_nivel_corregido":0.468,"observado":0.464},{"decil":5,"n":252,"predicho":0.336,"predicho_nivel_corregido":0.489,"observado":0.552},{"decil":6,"n":262,"predicho":0.359,"predicho_nivel_corregido":0.514,"observado":0.569},{"decil":7,"n":258,"predicho":0.378,"predicho_nivel_corregido":0.535,"observado":0.484},{"decil":8,"n":240,"predicho":0.41,"predicho_nivel_corregido":0.568,"observado":0.575},{"decil":9,"n":271,"predicho":0.427,"predicho_nivel_corregido":0.585,"observado":0.572},{"decil":10,"n":258,"predicho":0.493,"predicho_nivel_corregido":0.647,"observado":0.616}],"lectura":"COATL predice en promedio 36% a 5 años y en el DENUE siguió el 51%. Con el nivel corregido, la Brier mejora 1.5% sobre un pronóstico constante; AUC 0.58 (0.5 = azar). Giro y zona ordenan el riesgo un poco mejor que el azar; no predicen negocio por negocio.","mejora_sobre_constante":0.0148};

function pintarKPIs(e,mc,S,modelo){
  const f=finanzas(e,mc,S), rp=rangoP(modelo);
  const datos=[
    ["Probabilidad a 3 años: rango plausible", pct(rp.p05)+" a "+pct(rp.p95), "P5–P95 al perturbar los β (sensibilidad, no intervalo muestral)"],
    ["Utilidad mensual esperada", mxn.format(Math.round(e.utilMes)), "modelo determinista de costo–volumen, antes de impuestos"],
    ["P(utilidad anual > 0)", pct(mc.pPos), "frecuencia empírica en 2,000 corridas"],
    ["Riesgo de quedarse sin efectivo (año 1)", mc.pSinEfectivo==null?"—":pct(mc.pSinEfectivo), "años simulados en que las pérdidas acumuladas superan tu reserva (≈ "+mxn.format(Math.round(mc.cajaInicial||0))+")"],
    ["Probabilidad con solo lo medido", pct(modelo.Pmedido), "sin los supuestos del equipo (experiencia, reserva, marketing, deuda…): "+((modelo.P-modelo.Pmedido)>=0?"+":"−")+Math.abs((modelo.P-modelo.Pmedido)*100).toFixed(1)+" pts dependen de supuestos"],
    ["Utilidad anual P5 · P50 · P95", mxn.format(Math.round(mc.p05))+" · "+mxn.format(Math.round(mc.p50))+" · "+mxn.format(Math.round(mc.p95)), "escenarios pesimista, mediano y optimista del Monte Carlo"],
    ["Punto de equilibrio", isFinite(e.peDia)?Math.ceil(e.peDia)+" clientes/día":"No alcanzable", mxn.format(Math.round(e.pePesos))+" en ventas mensuales"],
    ["Margen de seguridad", pct(e.ms), e.ms>=0?"ventas por encima del equilibrio":"ventas por debajo del equilibrio"],
    ["ROI anual esperado", pct(f.roi), "utilidad anual media del Monte Carlo / inversión, antes de impuestos"],
    ["Recuperación (payback)", f.payback?f.payback.toFixed(1)+" meses":"No se recupera", "inversión / utilidad mensual determinista"],
    ["VPN a 3 años ("+(e.r*100).toFixed(1).replace(/.0$/,"")+"%)", mxn.format(Math.round(f.vpn)), "flujos con crecimiento g e inflación π, ponderados por S(t); sin valor terminal"]
  ];
  $("kpis").innerHTML=datos.map(d=>'<div class="kpi"><div class="v">'+d[1]+'</div><div class="k">'+d[0]+'</div><div class="d">'+d[2]+"</div></div>").join("");
  return f.vpn;
}

function pintarLectura(e,mc,modelo,vpn){
  const P=modelo.P, frases=[];
  frases.push("La probabilidad estimada de éxito a 3 años es de <strong>"+pct(P)+"</strong>, frente al <strong>42.6%</strong> de supervivencia nacional a 3 años (INEGI, 1989–2019): tu escenario está "+(P>S0[3]?"por encima":"por debajo")+" de la media. Al perturbar los supuestos del modelo, P se mueve entre <strong>"+pct(rangoP(modelo).p05)+"</strong> y <strong>"+pct(rangoP(modelo).p95)+"</strong>: léelo como orden de magnitud, no como cifra exacta.");
  const ordenados=[...modelo.contribs].sort((a,b)=>a[1]-b[1]);
  const peor=ordenados[0], mejor=ordenados[ordenados.length-1];
  if(peor[1]<0) frases.push("La variable que más resta es <strong>"+peor[0].toLowerCase()+"</strong> (β = "+peor[1].toFixed(2)+"); es el primer candidato para el análisis de sensibilidad.");
  if(mejor[1]>0) frases.push("La variable que más suma es <strong>"+mejor[0].toLowerCase()+"</strong> (β = +"+mejor[1].toFixed(2)+").");
  if(mc.pSinEfectivo!=null) frases.push("Con la reserva que declaraste (≈ "+mxn.format(Math.round(mc.cajaInicial))+"), en el <strong>"+pct(mc.pSinEfectivo)+"</strong> de los años simulados las pérdidas acumuladas se la acaban antes de cumplir 12 meses. Este dato sale de tus propios números, no de un supuesto del equipo.");
  if(VALIDACION) frases.push("Contra lo que pasó de verdad: con negocios de Coacalco que el modelo no usó para estimarse, giro y zona ordenan el riesgo apenas mejor que el azar (AUC "+VALIDACION.auc.toFixed(2)+"; 0.5 = azar). Por eso P orienta, pero no predice tu caso.");
  frases.push("En la simulación Monte Carlo, el "+pct(mc.pPos)+" de los 2,000 años simulados terminó con utilidad positiva; la utilidad anual media fue de "+mxn.format(Math.round(mc.media))+" con desviación estándar de "+mxn.format(Math.round(mc.sd))+".");
  if(isFinite(e.peDia)) frases.push("Necesitas ≈<strong>"+Math.ceil(e.peDia)+" clientes/día</strong> para el punto de equilibrio y esperas "+Math.round(e.mu)+"; el margen de seguridad es de "+pct(e.ms)+".");
  else frases.push("Con este ticket y costo variable el margen de contribución es nulo o negativo: <strong>no existe punto de equilibrio alcanzable</strong>; revisa precio y costos antes que cualquier otra variable.");
  frases.push(vpn>0?"El VPN a 3 años es positivo ("+mxn.format(Math.round(vpn))+"): el proyecto crea valor por encima de tu tasa de descuento.":"El VPN a 3 años es negativo ("+mxn.format(Math.round(vpn))+"): a tu tasa de descuento, el proyecto aún no compensa la inversión.");
  $("lecturaLista").innerHTML=frases.map(f=>"<li>"+f+"</li>").join("");
  $("lecturaPanel").hidden=false;
}

/* ---------- 10. Gráficas ---------- */
let cargaChart;
function cargarChart(){
  return cargaChart ??= cargarBiblioteca("libChart").then(ok=>{
    if(!ok) return false;
    Chart.defaults.font.family='"Hanken Grotesk",Arial,sans-serif';
    Chart.defaults.color="#4A3A3C";
    Chart.defaults.plugins.legend.labels.boxWidth=14;
    Chart.defaults.animation=false;
    return true;
  });
}

function graficasContexto(){
  graficar($("graficaUE"),{type:"bar",data:{
    labels:["2013","2018","2020"],
    datasets:[{label:"Unidades económicas",data:[8517,9710,11018],
      backgroundColor:["#E9B9BE","#C8102E","#7A0C1F"],borderRadius:8,maxBarThickness:90}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.parsed.y.toLocaleString("es-MX")+" unidades"}}},
      scales:{y:{beginAtZero:true,grid:{color:"#F4E2E1"}},x:{grid:{display:false}}}}});
  graficar($("graficaSectores"),{type:"doughnut",data:{
    labels:["Comercio al por menor","Servicios","Manufactura","Otros"],
    datasets:[{data:[45.9,45.0,6.0,3.0],backgroundColor:["#C8102E","#7A0C1F","#E2233F","#E9B9BE"],borderColor:"#fff",borderWidth:3}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:"58%",
      plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:c=>c.label+": "+c.parsed+"% del padrón"}}}}});
}

/* Plugin de Chart.js: líneas verticales en los percentiles del Monte Carlo. */
/* Crea la gráfica una vez y después solo actualiza datos y opciones (sin animación):
   recrear las 6 gráficas en cada recálculo dominaba el tiempo de bloqueo. */
const GRAF={}, PENDIENTES=new Map();
const ioGraficas=new IntersectionObserver(es=>{
  const visibles=es.filter(en=>en.isIntersecting).map(en=>en.target.id);
  if(visibles.length) graficasListas(visibles);
},{rootMargin:"200px 0px"});
/* La primera vez la gráfica se crea solo cuando su lienzo se acerca a la vista. */
function graficar(lienzo,cfg){
  const prev=GRAF[lienzo.id];
  if(prev && prev.config.type===cfg.type){ prev.data=cfg.data; prev.options=cfg.options; prev.update("none"); return prev; }
  if(prev){ prev.destroy(); delete GRAF[lienzo.id]; }
  if(!PENDIENTES.has(lienzo)) ioGraficas.observe(lienzo);
  PENDIENTES.set(lienzo,cfg);
}
/* Para exportar: crea en el acto las gráficas pendientes. */
async function graficasListas(ids){
  const disponible=await cargarChart();
  return ids.map(id=>{const c=$(id); if(!GRAF[id]&&PENDIENTES.has(c)){ioGraficas.unobserve(c);if(disponible)GRAF[id]=new Chart(c,PENDIENTES.get(c));PENDIENTES.delete(c)} return GRAF[id]}).filter(Boolean);
}
graficasContexto();
const PLUGIN_PERCENTILES={id:"lineasPercentil",afterDatasetsDraw(ch,_a,o){
    const marcas=o.marcas||[], lo=o.lo, paso=o.paso;
    const {ctx,chartArea:a,scales:{x}}=ch, n=ch.data.labels.length;
    ctx.save(); ctx.setLineDash([5,4]); ctx.strokeStyle="#38070F"; ctx.fillStyle="#38070F";
    ctx.font="600 11px 'Spline Sans Mono',monospace"; ctx.textAlign="center";
    marcas.forEach(([et,v])=>{
      const idx=(v-lo)/paso-0.5, px=x.getPixelForValue(0)+(x.getPixelForValue(n-1)-x.getPixelForValue(0))*idx/(n-1||1);
      ctx.beginPath(); ctx.moveTo(px,a.top+14); ctx.lineTo(px,a.bottom); ctx.stroke(); ctx.fillText(et,px,a.top+10);
    });
    ctx.restore();
  }};
function pintarGraficas(e,mc,S,modelo){
  const rp=rangoP(modelo), Sbajo=curvaSupervivencia(rp.p05), Salto=curvaSupervivencia(rp.p95);
  const anios=[...Array(11).keys()];
  graficar($("graficaSupervivencia"),{type:"line",data:{
    labels:anios.map(a=>"Año "+a),
    datasets:[
      {label:"Banda alta (P95 de P)",data:Salto.map(x=>+(100*x).toFixed(1)),borderColor:"rgba(200,16,46,.25)",borderWidth:1,pointRadius:0,tension:.35,fill:false},
      {label:"Banda baja (P5 de P)",data:Sbajo.map(x=>+(100*x).toFixed(1)),borderColor:"rgba(200,16,46,.25)",borderWidth:1,backgroundColor:"rgba(200,16,46,.14)",pointRadius:0,tension:.35,fill:"-1"},
      {label:"Tu escenario",data:S.map(x=>+(100*x).toFixed(1)),borderColor:"#C8102E",tension:.35,pointRadius:3,fill:false},
      {label:"Promedio nacional (INEGI)",data:S0.map(x=>+(100*x).toFixed(1)),borderColor:"#9B6A6E",borderDash:[6,5],pointRadius:0,tension:.35}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{tooltip:{callbacks:{label:c=>c.dataset.label+": "+c.parsed.y+"% sigue operando"}}},
      scales:{y:{min:0,max:100,ticks:{callback:v=>v+"%"},grid:{color:"#F4E2E1"}},x:{grid:{display:false}}}}});

  const nb=22, lo=mc.res[0], hi=mc.res[N_SIM-1], paso=(hi-lo)/nb||1;
  const bins=new Array(nb).fill(0);
  mc.res.forEach(x=>bins[Math.min(nb-1,Math.floor((x-lo)/paso))]++);
  const centros=bins.map((_,i)=>lo+paso*(i+0.5));
  graficar($("graficaMC"),{type:"bar",data:{
    labels:centros.map(c=>mxn.format(Math.round(c/1000)*1000)),
    datasets:[{label:"Años simulados",data:bins,
      backgroundColor:centros.map(c=>c<0?"#E2233F":(c<mc.p05||c>mc.p95)?"#E9B9BE":"#7A0C1F"),borderRadius:3,categoryPercentage:1,barPercentage:.96}]},
    plugins:[PLUGIN_PERCENTILES],
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{lineasPercentil:{marcas:[["P5",mc.p05],["P50",mc.p50],["P95",mc.p95]],lo,paso},legend:{display:false},tooltip:{callbacks:{title:i=>"Utilidad ≈ "+i[0].label,label:c=>c.parsed.y+" de 2,000 corridas"}}},
      scales:{y:{beginAtZero:true,grid:{color:"#F4E2E1"},title:{display:true,text:"Frecuencia"}},
              x:{ticks:{maxTicksLimit:6,maxRotation:0},grid:{display:false}}}}});

  const maxX=Math.max(Math.ceil(e.peDia*2),Math.ceil(e.mu*1.4),10);
  const xs=[...Array(13).keys()].map(i=>Math.round(maxX*i/12));
  graficar($("graficaPE"),{type:"line",data:{
    datasets:[
      {label:"Ingresos mensuales",data:xs.map(x=>({x,y:x*e.diasMes*e.ticket})),borderColor:"#1F7A4D",pointRadius:0,tension:0},
      {label:"Costos totales",data:xs.map(x=>({x,y:e.fijos+x*e.diasMes*e.ticket*e.cvEff})),borderColor:"#C8102E",pointRadius:0,tension:0},
      {label:"Punto de equilibrio",data:isFinite(e.peDia)?[{x:e.peDia,y:e.pePesos}]:[],type:"scatter",
       backgroundColor:"#38070F",pointRadius:7,pointStyle:"rectRot"}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{tooltip:{callbacks:{label:c=>c.dataset.label+": "+(c.dataset.type==="scatter"?Math.ceil(e.peDia)+" clientes/día":mxn.format(Math.round(c.parsed.y)))}}},
      scales:{y:{ticks:{callback:v=>"$"+(v/1000).toFixed(0)+"k"},grid:{color:"#F4E2E1"},title:{display:true,text:"Pesos / mes"}},
              x:{type:"linear",min:0,max:maxX,title:{display:true,text:"Clientes por día"},grid:{display:false}}}}});
}


/* ===== src/ui/widgets.js ===== */
/* ---------- 17. Widgets de análisis (todos derivados del propio modelo) ---------- */
const COL={rojo:"#C8102E",granate:"#7A0C1F",rosa:"#E9B9BE",hueso:"#FBF6F3",tinta:"#38070F"};

/* Etiquetas largas en varias líneas (Chart.js acepta arreglos) para que no se corten a la izquierda. */
function partirEtiqueta(t,max=16){ const out=[]; let l="";
  for(const w of t.split(" ")){ if((l+" "+w).trim().length>max&&l){ out.push(l); l=w; } else l=(l+" "+w).trim(); }
  if(l) out.push(l); return out.length>1?out:t; }
/* Tornado: contribución βᵢ de cada variable a z, ordenada por magnitud. */
function pintarTornado(modelo){
  const c=[...modelo.contribs].filter(x=>x[1]!==0).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));
  const datos=c.length?c:[["Todas las variables en posición neutra",0]];
  graficar($("graficaTornado"),{type:"bar",data:{
    labels:datos.map(x=>partirEtiqueta(x[0].replace(/ \(.+\)$/,""))),
    datasets:[{label:"β (aporte a z)",data:datos.map(x=>+x[1].toFixed(2)),
      backgroundColor:datos.map(x=>x[1]<0?COL.rojo:COL.granate),borderRadius:4}]},
    options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:t=>"β = "+(t.parsed.x>0?"+":"")+t.parsed.x.toFixed(2)}}},
      scales:{x:{grid:{color:"#F4E2E1"},title:{display:true,text:"Aporte a z (unidades logit)"}},y:{grid:{display:false},ticks:{autoSkip:false}}}}});
}

/* Comparador de zonas: el mismo negocio evaluado en las 6 zonas (usa datosMapa del mapa). */
function pintarComparadorZonas(){
  const filas=[...datosMapa].sort((a,b)=>b.P-a.P).map(d=>
    "<tr"+(d.k===escZonaActual?' class="actual"':"")+'><th scope="row">'+CORTOS[d.k]+"</th><td>"+pct(d.P)+
    "</td><td>"+mxn.format(Math.round(d.util))+"</td><td>$"+d.z.rm2+"</td><td>"+d.z.afl.toFixed(2)+"</td></tr>").join("");
  $("comparadorZonas").innerHTML="<caption>Comparador de zonas para tu mismo negocio</caption>"+
    '<thead><tr><th scope="col">Zona</th><th scope="col">P (3 años)</th><th scope="col">Utilidad/mes</th><th scope="col">Renta m²</th><th scope="col">Afluencia</th></tr></thead><tbody>'+filas+"</tbody>";
}

/* Escenarios guardados (solo en memoria: no se guarda nada en el navegador ni se envía). */
const guardados=[];
let ultimoResumen=null;
function resumenEscenario(e,modelo,mc,f){
  const rp=rangoP(modelo);
  return {nombre:e.giro.n+" · "+CORTOS[e.zonaKey], negocio:negocioActual, P:modelo.P, rango:pct(rp.p05)+"–"+pct(rp.p95),
    util:e.utilMes, p05:mc.p05, p95:mc.p95, pe:e.peDia, roi:f.roi, payback:f.payback, vpn:f.vpn, hash:serializarEscenario()};
}
function pintarComparador(){
  const t=$("tablaComparar"), cap='<caption class="sr-only">Escenarios guardados</caption>';
  if(!guardados.length){t.innerHTML=cap+'<tbody><tr><td class="vacio">Aún no hay escenarios guardados.</td></tr></tbody>';return}
  const fila=(et,fn)=>'<tr><th scope="row">'+et+"</th>"+guardados.map(g=>"<td>"+fn(g)+"</td>").join("")+"</tr>";
  t.innerHTML=cap+'<thead><tr><th scope="col">Métrica</th>'+
    guardados.map((g,i)=>'<th scope="col"><a href="#'+g.hash+'" data-cargar="'+i+'">'+String.fromCharCode(65+i)+". "+esc(g.nombre)+"</a></th>").join("")+"</tr></thead><tbody>"+
    fila("P a 3 años",g=>pct(g.P))+fila("Rango plausible",g=>g.rango)+
    fila("Utilidad/mes",g=>mxn.format(Math.round(g.util)))+
    fila("Utilidad anual P5–P95",g=>mxn.format(Math.round(g.p05))+" a "+mxn.format(Math.round(g.p95)))+
    fila("Equilibrio",g=>isFinite(g.pe)?Math.ceil(g.pe)+" clientes/día":"No alcanzable")+
    fila("ROI anual",g=>pct(g.roi))+fila("Payback",g=>g.payback?g.payback.toFixed(1)+" meses":"—")+
    fila("VPN 3 años",g=>mxn.format(Math.round(g.vpn)))+"</tbody>";
}
$("guardarEsc").addEventListener("click",()=>{
  /* Resuelve un recálculo pendiente para no guardar métricas viejas (hallazgo 7 de Codex). */
  if(typeof tVivo!=="undefined") clearTimeout(tVivo);
  calcular();
  if(!ultimoResumen)return;
  if(guardados.length>=3)guardados.shift();
  guardados.push(Object.assign({},ultimoResumen));
  pintarComparador();
  toast("Escenario guardado para comparar ("+guardados.length+"/3).");
});
$("limpiarEsc").addEventListener("click",()=>{guardados.length=0;pintarComparador()});
$("tablaComparar").addEventListener("click",ev=>{
  const a=ev.target.closest("a[data-cargar]"); if(!a)return;
  ev.preventDefault(); cargarEscenario(guardados[+a.dataset.cargar].hash);
});

/* Compartir por URL: todas las variables del formulario en el fragmento (#), nunca en el servidor. */
const camposForma=()=>[...$("forma").querySelectorAll("input[id],select[id]")];
function serializarEscenario(){
  const p=new URLSearchParams();
  camposForma().forEach(c=>p.set(c.id,c.type==="checkbox"?(c.checked?"1":"0"):c.value));
  return "e="+encodeURIComponent(p.toString());
}
function cargarEscenario(hash){
  const m=/(?:^#?|&)e=([^&]+)/.exec(hash||""); if(!m)return false;
  let p; try{p=new URLSearchParams(decodeURIComponent(m[1]))}catch(_){return false}
  camposForma().forEach(c=>{
    if(!p.has(c.id))return;
    const v=p.get(c.id);
    if(c.type==="checkbox")c.checked=v==="1";
    else if(c.tagName==="SELECT"){if([...c.options].some(o=>o.value===v))c.value=v}
    else{const n=Number(v);if(Number.isFinite(n))c.value=String(n)}
  });
  ["inversion","credito","cvar","merma"].forEach(id=>$(id).dispatchEvent(new Event("input")));
  calcular();
  return true;
}
$("compartirURL").addEventListener("click",async()=>{
  const frag="#"+serializarEscenario(), url=location.origin+location.pathname+frag;
  history.replaceState(null,"",frag);
  let ok=false; try{await navigator.clipboard.writeText(url);ok=true}catch(_){}
  $("notaCompartir").textContent=ok?"Enlace copiado al portapapeles.":"Copia este enlace: "+url;
});

/* Exportar reporte (PDF e imagen): ver src/ui/reporte.js. */

/* Alternativa textual de las gráficas para lectores de pantalla (WCAG 1.1.1). */
function describirGraficas(e,modelo,mc,S){
  const rp=rangoP(modelo), sb=curvaSupervivencia(rp.p05), sa=curvaSupervivencia(rp.p95);
  const tor=[...modelo.contribs].filter(c=>c[1]!==0).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))
    .map(c=>c[0].replace(/ (.+)$/,"")+" "+(c[1]>0?"+":"")+c[1].toFixed(2)).join("; ");
  $("descGraficas").textContent=
    "Supervivencia: año 1 "+pct(S[1])+", año 3 "+pct(S[3])+" (banda "+pct(sb[3])+" a "+pct(sa[3])+"), año 5 "+pct(S[5])+", año 10 "+pct(S[10])+
    ". Monte Carlo: P5 "+mxn.format(Math.round(mc.p05))+", mediana "+mxn.format(Math.round(mc.p50))+", P95 "+mxn.format(Math.round(mc.p95))+
    ". Punto de equilibrio: "+(isFinite(e.peDia)?Math.ceil(e.peDia)+" clientes por día":"no alcanzable")+
    ". Aportes β al modelo logístico: "+(tor||"todas las variables neutras")+".";
}
function pintarWidgets(e,modelo,mc,S){
  describirGraficas(e,modelo,mc,S);
  pintarTornado(modelo);
  pintarComparadorZonas();
  pintarComparador();
}

/* ===== src/mapa/mapa.js ===== */
/* ---------- 11. Mapa de probabilidad por zona ---------- */
const CORTOS={
  corredor:"Corredor López Portillo", centro:"Centro S. Francisco",
  flores:"Villa de las Flores", heroes:"Héroes · Loma Bonita",
  popular:"Potrero · San Rafael", periferia:"Periferia norte"
};
function colorP(p){
  const tope=[[0.04,[200,16,46]],[0.45,[232,162,63]],[0.65,[31,122,77]],[0.93,[17,90,55]]];
  p=acota(p,0.04,0.93);
  let i=0; while(i<tope.length-2 && p>tope[i+1][0]) i++;
  const [pa,ca]=tope[i],[pb,cb]=tope[i+1], k=(p-pa)/(pb-pa);
  const c=ca.map((v,j)=>Math.round(v+(cb[j]-v)*k));
  return "rgb("+c[0]+","+c[1]+","+c[2]+")";
}
let datosMapa=[], escZonaActual="heroes";
/* Traslada el mismo negocio a otra zona: renta de referencia y demanda escalada
   por afluencia. Se usa en el mapa, el comparador y el plan FODA (hallazgo 3 de Codex). */
function trasladarZona(e,k){
  const c=Object.assign({},e);
  c.zonaKey=k; c.zona=ZONAS[k];
  c.renta=e.propio?0:Math.round(ZONAS[k].rm2*e.superficie/100)*100;
  c.mu=Math.max(1,e.mu/e.zona.afl*ZONAS[k].afl);
  return derivar(c);
}
function pintarMapa(e,modelo){
  datosMapa=Object.keys(ZONAS).map(k=>{
    if(k===e.zonaKey) return {k,z:ZONAS[k],P:modelo.P,util:e.utilMes};
    const c=trasladarZona(e,k);
    return {k,z:ZONAS[k],P:modeloLogistico(c).P,util:c.utilMes};
  });
  escZonaActual=e.zonaKey;
  const orden=[...datosMapa].sort((a,b)=>b.P-a.P);
  $("ranking").innerHTML=orden.map((d,i)=>{
    const med=i===0?"🥇":i===1?"🥈":i===2?"🥉":(i+1)+"°";
    return '<li data-zona="'+d.k+'"><button type="button" class="rk-zona" title="Trasladar el escenario a esta zona"><span class="medalla">'+med+
      '</span><span class="punto" data-color="'+colorP(d.P)+'"></span><span class="rz">'+CORTOS[d.k]+
      '<span class="ru">utilidad esperada '+mxn.format(Math.round(d.util))+'/mes</span></span><span class="rp">'+
      Math.round(d.P*100)+"%</span></button></li>";
  }).join("");
  document.querySelectorAll("#ranking .punto[data-color]").forEach(s=>{s.style.background=s.dataset.color});
  const mejor=orden[0], actual=datosMapa.find(d=>d.k===e.zonaKey);
  $("recomendacion").innerHTML = mejor.k===e.zonaKey
    ? "Tu zona actual (<strong>"+CORTOS[mejor.k]+"</strong>) es la de mayor probabilidad para este escenario. Buena ubicación."
    : "Este mismo negocio en <strong>"+CORTOS[mejor.k]+"</strong> ganaría "+Math.round((mejor.P-actual.P)*100)+
      " puntos de probabilidad frente a tu zona actual (ajustando renta y afluencia). Haz clic en el mapa para probarla.";
  actualizarLeaflet();
}
function irAZona(k){
  const e=leerEscenario(), muN=e.muBase/e.zona.afl;
  $("zona").value=k;
  if(!e.propio) $("renta").value=Math.round(ZONAS[k].rm2*e.superficie/100)*100;
  $("clientes").value=Math.max(1,Math.round(muN*ZONAS[k].afl));
  calcular();
  toast("Escenario trasladado a "+CORTOS[k]+": renta y demanda ajustadas a la zona.");
}
$("ranking").addEventListener("click",ev=>{
  const li=ev.target.closest("li[data-zona]"); if(li)irAZona(li.dataset.zona);
});

/* ---------- 11-bis. Mapa real de zonas (Leaflet + OpenStreetMap / Esri satélite) ----------
   Una sola función dibuja el mapa en cualquier contenedor: las 70 AGEB urbanas oficiales del INEGI
   (data/ageb/coacalco.json, scripts/ageb_sync.mjs) agrupadas en las seis zonas y coloreadas por P.
   La usan el Simulador (#mapaReal) e Inicio (#mapa25). COORDS_ZONAS solo asigna cada AGEB a una zona
   (ageb_sync.mjs las lee) y sirve de respaldo si el archivo de AGEB no carga. */
const COORDS_ZONAS={
  popular:  [[19.617,-99.130],[19.617,-99.104],[19.648,-99.104],[19.650,-99.118],[19.640,-99.130]],
  centro:   [[19.629,-99.104],[19.629,-99.084],[19.650,-99.084],[19.648,-99.104]],
  flores:   [[19.629,-99.084],[19.629,-99.058],[19.654,-99.058],[19.654,-99.084],[19.650,-99.084]],
  corredor: [[19.6185,-99.124],[19.6185,-99.058],[19.629,-99.058],[19.629,-99.124]],
  heroes:   [[19.650,-99.118],[19.650,-99.084],[19.668,-99.084],[19.668,-99.112]],
  periferia:[[19.654,-99.084],[19.654,-99.050],[19.676,-99.050],[19.676,-99.084]]
};
const HITOS=[
  {ll:[19.6377,-99.0937],t:"Palacio Municipal de Coacalco (referencia aproximada)"},
  {ll:[19.6253,-99.0906],t:"Power Center Coacalco (referencia aproximada)"},
  {ll:[19.6262,-99.1079],t:"Plaza Cosmopol (referencia aproximada)"}
];
let AGEB_COACALCO=null, cargaLeaflet=null, cargaAgeb=null;
const MAPAS=[];   // instancias activas: {mapa, capas, alClic, seleccion}
const ESTILO_ZONA={color:"#FFFFFF",weight:2.5,fillColor:"#E9B9BE",fillOpacity:.55};
function crearMapaZonas(id, alClic, opciones={}){
  if(typeof L==="undefined") return null;
  const cont=$(id); if(!cont||cont._mapa) return cont&&cont._mapa;
  const mapa=L.map(id,{scrollWheelZoom:false,center:[19.644,-99.090],zoom:opciones.zoom||13});
  const calles=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:"© Colaboradores de OpenStreetMap"});
  const satelite=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:18,attribution:"Imágenes © Esri, Maxar, Earthstar Geographics"});
  calles.addTo(mapa);
  L.control.layers({"Calles (OpenStreetMap)":calles,"Satélite (fotografía Esri)":satelite},null,{position:"topright"}).addTo(mapa);
  L.control.scale({imperial:false}).addTo(mapa);
  const inst={mapa, capas:{}, alClic, seleccion:opciones.seleccion||(()=>escZonaActual)};
  const crearZona=(k,capa,centro)=>{
    capa.on("click",()=>inst.alClic(k));
    capa.on("mouseover",()=>capa.setStyle({weight:4,fillOpacity:.72}));
    capa.on("mouseout",()=>capa.setStyle({weight:capa._activa?4.5:2.5,fillOpacity:.55}));
    capa.addTo(mapa);
    capa.etiqueta=L.tooltip({permanent:true,direction:"center",className:"lf-et"}).setLatLng(centro).setContent(CORTOS[k]).addTo(mapa);
    inst.capas[k]=capa;
  };
  const dibujar=()=>{
    for(const k in inst.capas){ mapa.removeLayer(inst.capas[k]); mapa.removeLayer(inst.capas[k].etiqueta); }
    inst.capas={};
    for(const k in COORDS_ZONAS){
      const lista=AGEB_COACALCO?AGEB_COACALCO.agebs.filter(a=>a.zona===k):[];
      if(lista.length){
        const g=L.featureGroup(lista.map(a=>L.polygon(a.poligonos,ESTILO_ZONA).bindTooltip("AGEB "+esc(a.ageb)+" · "+fmtN(a.pob)+" hab. (Censo 2020)")));
        crearZona(k,g,g.getBounds().getCenter()); g.resumen=AGEB_COACALCO.resumen[k];
      } else { const p=L.polygon(COORDS_ZONAS[k],ESTILO_ZONA); crearZona(k,p,p.getBounds().getCenter()); }
    }
    actualizarMapa(inst);
    mapa.fitBounds(L.featureGroup(Object.values(inst.capas)).getBounds(),{padding:[14,14]});   // encuadre: solo Coacalco
  };
  dibujar();
  cargaAgeb ??= fetch("data/ageb/coacalco.json").then(r=>r.ok?r.json():null).catch(()=>null);
  cargaAgeb.then(j=>{ if(j&&j.agebs){ AGEB_COACALCO=j; dibujar(); } });
  HITOS.forEach(h=>L.marker(h.ll,{icon:L.divIcon({className:"lf-hito",iconSize:[14,14]}),title:h.t,alt:h.t,keyboard:true}).bindTooltip(h.t).addTo(mapa).getElement()?.setAttribute("aria-label",h.t));
  setTimeout(()=>mapa.invalidateSize(),300);
  cont._mapa=inst; MAPAS.push(inst);
  return inst;
}
function actualizarMapa(inst){
  const sel=inst.seleccion();
  datosMapa.forEach(d=>{
    const pol=inst.capas[d.k]; if(!pol) return;
    pol._activa=(d.k===sel);
    pol.setStyle({fillColor:colorP(d.P),color:pol._activa?"#38070F":"#FFFFFF",weight:pol._activa?4.5:2.5});
    pol.etiqueta.setContent(CORTOS[d.k]+"<br>"+(d.P*100).toFixed(1)+"%");
    pol.bindPopup("<strong>"+d.z.n+"</strong><br>P(éxito a 3 años): <strong>"+(d.P*100).toFixed(1)+"%</strong><br>Utilidad esperada: "+mxn.format(Math.round(d.util))+"/mes<br>Renta ref.: $"+d.z.rm2+"/m²·mes · Afluencia: "+d.z.afl.toFixed(2)+"<br>"+(pol.resumen?"Población 2020 (INEGI): "+fmtN(pol.resumen.pob)+" en "+pol.resumen.agebs+" AGEB<br>":""));
  });
}
function actualizarLeaflet(){ MAPAS.forEach(actualizarMapa); }
/* Carga Leaflet una sola vez y dibuja el mapa; sin conexión, el contenedor explica que el ranking sigue disponible. */
async function montarMapa(id, alClic, opciones){
  cargaLeaflet ??= cargarBiblioteca("libLeaflet");
  const ok=await cargaLeaflet;
  const inst=ok?crearMapaZonas(id, alClic, opciones):null;
  if(!inst){ $(id).classList.add("mapa-sin-red"); $(id).textContent="Sin conexión al mapa: la lista de zonas de al lado conserva los mismos resultados."; return null; }
  setTimeout(()=>{inst.mapa.invalidateSize(); actualizarMapa(inst);},60);
  return inst;
}
function usarReal(){ return montarMapa("mapaReal", irAZona); }

/* ===== src/ui/explorar.js ===== */
/* ---------- 18. Recorrido exploratorio: widgets con pregunta, interacción y respuesta ----------
   Todos usan las MISMAS funciones del motor (derivar, modeloLogistico, curvaSupervivencia,
   rangoP, monteCarlo) sobre el escenario del formulario: para entradas equivalentes dan los
   mismos números que el simulador. Cada widget expone su estado en data-estado
   (cargando · listo · vacio · error) y su texto en #<id>-estado. */

const reduceMov = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function estadoWidget(id, estado, msj){
  const w=$(id); if(!w) return;
  w.dataset.estado=estado;
  const s=$(id+"-estado"); if(s) s.textContent = msj || ({cargando:"Calculando…", listo:"", vacio:"Sin datos para este escenario.", error:"No se pudo calcular; los demás resultados siguen disponibles."})[estado];
}
function seguro(id, fn){
  try{ const r=fn(); if(r!==false) estadoWidget(id,"listo"); }
  catch(err){ console.warn("COATL · widget "+id, err); estadoWidget(id,"error"); }
}
let ultimoEsc=null, ultimoModelo=null, ultimoMC=null, ultimoS=null;

/* ===== Inicio · widget demostrativo ===== */
function pintarDemo(){
  seguro("wDemo",()=>{
    if(!ultimoEsc) return false;
    const mu=+$("demoClientes").value;
    $("demoClientesV").textContent=mu;
    const e=derivar(Object.assign({},ultimoEsc,{mu}));
    const P=modeloLogistico(e).P;
    $("demoP").textContent=pct(P);
    $("demoU").textContent=mxn.format(Math.round(e.utilMes));
    $("demoPE").textContent=isFinite(e.peDia)?Math.ceil(e.peDia)+" clientes/día":"No alcanzable";
    const tope=200;
    $("demoBarra").style.width=Math.min(100,mu/tope*100)+"%";
    const pe=isFinite(e.peDia)?Math.min(100,e.peDia/tope*100):100;
    $("demoBarraPE").style.left=pe+"%";
    $("demoMarcaPE").style.left=pe+"%";
    $("demoBarra").classList.toggle("bajo-equilibrio", isFinite(e.peDia) && mu<e.peDia);
    $("demoAbrir").textContent="Abrir el simulador con "+mu+" clientes/día →";
  });
}
$("demoClientes").addEventListener("input",pintarDemo);
$("demoAbrir").addEventListener("click",()=>{
  $("clientes").value=$("demoClientes").value;
  calcular();
  irA("simulador");
  $("clientes").focus({preventScroll:true});
  toast("Simulador abierto con "+$("clientes").value+" clientes/día.");
});

/* ===== Inicio · mapa real de zonas ===== */
/* El mismo mapa del Simulador (crearMapaZonas, mapa.js): AGEB oficiales del INEGI agrupadas en seis zonas,
   coloreadas por P a 3 años. Aquí un clic elige la zona para la ficha; el botón la lleva al simulador. */
let zona25=null, mapaInicio=null;
const observarMapaInicio=new IntersectionObserver(async ([e])=>{
  if(!e.isIntersecting) return; observarMapaInicio.disconnect();
  mapaInicio=await montarMapa("mapa25", elegirZona25, {seleccion:()=>zona25, zoom:12});
},{rootMargin:"300px 0px"});
observarMapaInicio.observe($("mapa25"));
function pintarMapa25(){
  seguro("wMapa",()=>{
    if(!datosMapa.length) { estadoWidget("wMapa","vacio"); return false; }
    if(!zona25 || !ZONAS[zona25]) zona25=escZonaActual;
    if(mapaInicio) actualizarMapa(mapaInicio);
    const lista=$("mapa25Lista");
    lista.innerHTML=[...datosMapa].sort((a,b)=>b.P-a.P).map(d=>
      '<li role="option" id="z25-'+d.k+'" data-zona="'+d.k+'" aria-selected="'+(d.k===zona25)+'"><span class="punto" data-color="'+colorP(d.P)+'"></span>'+CORTOS[d.k]+'<span class="rp">'+pct(d.P)+'</span></li>').join("");
    lista.querySelectorAll(".punto[data-color]").forEach(s=>{s.style.background=s.dataset.color});
    lista.setAttribute("aria-activedescendant","z25-"+zona25);
    pintarFicha25();
  });
}
function elegirZona25(k){ zona25=k; pintarMapa25(); }
function pintarFicha25(){
  const d=datosMapa.find(x=>x.k===zona25); if(!d) return;
  const f=FOTOS_ZONAS[d.k];
  $("mapa25Ficha").innerHTML=(f?'<figure class="foto-cita ficha-foto"><img src="'+f.src+'" alt="Vista de '+d.z.n+'" loading="lazy"><figcaption><a href="'+f.pagina+'" target="_blank" rel="noopener">'+f.autor+'</a> · <a href="'+f.licenciaUrl+'" target="_blank" rel="noopener">'+f.licencia+'</a></figcaption></figure>':'')+'<div class="ficha-datos"><h3>'+d.z.n+'</h3><dl>'+
    '<div><dt>P a 3 años (este negocio aquí)</dt><dd>'+pct(d.P)+' <span class="proc proc-modelo">resultado del modelo</span></dd></div>'+
    '<div><dt>Utilidad mensual esperada</dt><dd>'+mxn.format(Math.round(d.util))+' <span class="proc proc-modelo">resultado del modelo</span></dd></div>'+
    '<div><dt>Afluencia relativa</dt><dd>'+d.z.afl.toFixed(2)+' (1.00 = promedio) <span class="proc proc-supuesto">estimación del equipo</span></dd></div>'+
    '<div><dt>Renta de referencia</dt><dd>$'+d.z.rm2+'/m²·mes <span class="proc proc-supuesto">estimación del equipo</span></dd></div>'+
    '<div><dt>Ajuste β de la zona</dt><dd>'+(d.z.z>0?"+":"")+d.z.z.toFixed(2)+(d.z.fz==="denue"?' ± '+d.z.ee.toFixed(2)+' <span class="proc proc-oficial">estimado con el DENUE</span>':' <span class="proc proc-supuesto">estimación del equipo</span>')+'</dd></div></dl></div>';
  $("mapa25Abrir").textContent=d.k===escZonaActual?"Esta ya es la zona del simulador ↓":"Abrir el simulador en "+CORTOS[d.k]+" →";
}
$("mapa25Lista").addEventListener("click",ev=>{const li=ev.target.closest("li[data-zona]"); if(li) elegirZona25(li.dataset.zona)});
$("mapa25Lista").addEventListener("keydown",ev=>{
  const orden=[...$("mapa25Lista").querySelectorAll("li[data-zona]")].map(li=>li.dataset.zona);
  let i=orden.indexOf(zona25);
  if(ev.key==="ArrowDown"||ev.key==="ArrowRight") i=Math.min(orden.length-1,i+1);
  else if(ev.key==="ArrowUp"||ev.key==="ArrowLeft") i=Math.max(0,i-1);
  else if(ev.key==="Home") i=0; else if(ev.key==="End") i=orden.length-1;
  else if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();$("mapa25Abrir").click();return}
  else return;
  ev.preventDefault(); elegirZona25(orden[i]);
});
$("mapa25Abrir").addEventListener("click",()=>{
  if(zona25 && zona25!==escZonaActual) irAZona(zona25);
  irA("simulador");
});


/* ===== Simulador · escenario vigente y restablecer ===== */
function marcarPendiente(){
  const v=$("escVigente"); if(!v) return;
  v.dataset.estado="pendiente";
  $("evEstado").textContent=ultimoEsc?"Recalculando… se muestra la última simulación válida":"Recalculando…";
}
function marcarVigente(e){
  const v=$("escVigente"); if(!v) return;
  v.dataset.estado="vigente";
  $("evEstado").textContent="Escenario vigente";
  $("evNombre").textContent=e.giro.n+" · "+CORTOS[e.zonaKey]+" · "+Math.round(e.muBase||e.mu)+" clientes/día";
  $("evHora").textContent="calculado "+new Date().toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
}
$("restablecer").addEventListener("click",()=>{
  $("forma").reset();
  /* Las opciones de giro y zona se crean por JS: reset() las deja en la primera; se fijan a la referencia. */
  $("giro").value="cafeteria"; $("zona").value="heroes"; $("giro").dispatchEvent(new Event("change"));
  ["inversion","credito","cvar","merma","ajustePrecio"].forEach(id=>$(id).dispatchEvent(new Event("input")));
  history.replaceState(null,"",location.pathname);
  calcular();
  toast("Escenario de referencia restablecido (Cafetería · Los Héroes).");
});

/* ===== Resultados · supervivencia por año con capas ===== */
function pintarSupervivencia(){
  seguro("wSup",()=>{
    if(!ultimoS) return false;
    const t=+$("supAnio").value, rp=rangoP(ultimoModelo);
    const sb=curvaSupervivencia(rp.p05), sa=curvaSupervivencia(rp.p95);
    $("supAnioV").textContent=t;
    $("supCapas").innerHTML=
      '<div class="capa25 contexto" data-v="'+S0[t]+'"><span>Nacional (INEGI)</span><b>'+pct(S0[t])+'</b></div>'+
      '<div class="capa25 banda" data-a="'+sb[t]+'" data-b="'+sa[t]+'"><span>Sensibilidad P5–P95</span><b>'+pct(sb[t])+' – '+pct(sa[t])+'</b></div>'+
      '<div class="capa25 resultado" data-v="'+ultimoS[t]+'"><span>Tu escenario</span><b>'+pct(ultimoS[t])+'</b></div>';
    $("supCapas").querySelectorAll(".capa25[data-v]").forEach(c=>c.style.setProperty("--v",(+c.dataset.v*100).toFixed(1)));
    const b=$("supCapas").querySelector(".banda"); b.style.setProperty("--a",(sb[t]*100).toFixed(1)); b.style.setProperty("--b",(sa[t]*100).toFixed(1));
    $("supTabla").innerHTML='<caption class="sr-only">Supervivencia por año</caption><thead><tr><th scope="col">Año</th><th scope="col">Tu escenario</th><th scope="col">P5–P95</th><th scope="col">Nacional</th></tr></thead><tbody>'+
      [1,2,3,5,10].map(a=>'<tr'+(a===t?' class="actual"':"")+'><th scope="row">'+a+'</th><td>'+pct(ultimoS[a])+'</td><td>'+pct(sb[a])+'–'+pct(sa[a])+'</td><td>'+pct(S0[a])+'</td></tr>').join("")+"</tbody>";
  });
}
$("supAnio").addEventListener("input",pintarSupervivencia);

/* ===== Resultados · Monte Carlo: probabilidad de superar una meta (ECDF) ===== */
function pintarMeta(){
  seguro("wMC",()=>{
    if(!ultimoMC || !ultimoMC.res.length) return false;
    if(!metaTocada) $("mcMeta").value=Math.round(ultimoMC.p50/10000)*10000;   // arranca en la mediana simulada
    const r=ultimoMC.res, n=r.length, meta=Number($("mcMeta").value);
    if(!Number.isFinite(meta)){ estadoWidget("wMC","vacio","Escribe una meta numérica en pesos."); return false; }
    let k=0; while(k<n && r[k]<=meta) k++;
    const prob=(n-k)/n;
    $("mcRespuesta").textContent="En "+(n-k).toLocaleString("es-MX")+" de "+n.toLocaleString("es-MX")+" años simulados ("+pct(prob)+") la utilidad anual supera "+mxn.format(meta)+".";
    const lo=r[0], hi=r[n-1], W=320, H=150, px=v=>20+(v-lo)/((hi-lo)||1)*(W-30), py=q=>H-20-q*(H-35);
    let d="M"+px(lo)+","+py(1);
    for(let i=0;i<n;i+=20) d+=" L"+px(r[i]).toFixed(1)+","+py(1-i/n).toFixed(1);
    d+=" L"+px(hi)+","+py(0);
    const mx=Math.max(20,Math.min(W-10,px(meta)));
    $("mcEcdf").innerHTML='<title>Probabilidad de superar cada nivel de utilidad anual</title>'+
      '<line x1="20" y1="'+(H-20)+'" x2="'+(W-10)+'" y2="'+(H-20)+'" class="eje"/><line x1="20" y1="15" x2="20" y2="'+(H-20)+'" class="eje"/>'+
      '<path d="'+d+'" class="curva"/>'+
      '<line x1="'+mx+'" y1="15" x2="'+mx+'" y2="'+(H-20)+'" class="meta"/>'+
      '<circle cx="'+mx+'" cy="'+py(prob)+'" r="4" class="punto-meta"/>'+
      '<text x="22" y="12" class="rot">P(U &gt; meta)</text><text x="'+(W-10)+'" y="'+(H-5)+'" text-anchor="end" class="rot">utilidad anual →</text>'+
      '<text x="'+mx+'" y="'+(H-6)+'" text-anchor="middle" class="rot">meta</text>';
  });
}
let metaTocada=false;
$("mcMeta").addEventListener("input",()=>{metaTocada=true;pintarMeta()});

/* ===== Resultados · superficie de sensibilidad 2.5D (dos supuestos a la vez) ===== */
const EJES={
  mu:{n:"Clientes por día", u:"clientes/día", get:e=>e.mu, set:(e,v)=>{e.mu=Math.max(1,v)}, fmt:v=>Math.round(v)},
  ticket:{n:"Ticket promedio", u:"MXN", get:e=>e.ticket, set:(e,v)=>{e.ticket=Math.max(1,v)}, fmt:v=>"$"+Math.round(v)},
  cv:{n:"Costo variable", u:"%", get:e=>e.cv*100, set:(e,v)=>{e.cv=Math.min(.9,Math.max(.05,v/100))}, fmt:v=>v.toFixed(0)+" %"},
  renta:{n:"Renta mensual", u:"MXN", get:e=>e.renta, set:(e,v)=>{e.renta=Math.max(0,v)}, fmt:v=>"$"+Math.round(v).toLocaleString("es-MX")}
};
const NSUP=9;
let celdaSel=null, supLeer=null;
/* Delegación: un solo manejador para las 81 celdas (antes 3 por celda; costaba ~360 ms en móvil lento). */
$("supRejilla").addEventListener("click",ev=>{const c=ev.target.closest(".celda25"); if(c&&supLeer){supLeer(c);c.focus()}});
$("supRejilla").addEventListener("focusin",ev=>{const c=ev.target.closest(".celda25"); if(c&&supLeer) supLeer(c)});
$("supRejilla").addEventListener("keydown",ev=>{
  const c=ev.target.closest(".celda25"); if(!c) return;
  const mov={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[ev.key]; if(!mov) return;
  ev.preventDefault();
  const ni=Math.max(0,Math.min(NSUP-1,+c.dataset.i+mov[0])), nj=Math.max(0,Math.min(NSUP-1,+c.dataset.j+mov[1]));
  const sig=$("supRejilla").querySelector('.celda25[data-i="'+ni+'"][data-j="'+nj+'"]');
  c.tabIndex=-1; sig.tabIndex=0; sig.focus();
});
function valoresEje(base){ const v=[]; for(let i=0;i<NSUP;i++) v.push(base*(0.6+0.8*i/(NSUP-1))); return v; }
function evaluar(ex,vx,ey,vy){
  const c=Object.assign({},ultimoEsc); EJES[ex].set(c,vx); EJES[ey].set(c,vy); derivar(c);
  return {P:modeloLogistico(c).P, U:c.utilMes};
}
function pintarSuperficie(){
  seguro("wSuperficie",()=>{
    if(!ultimoEsc) return false;
    let ex=$("supEjeX").value, ey=$("supEjeY").value;
    if(ex===ey){ estadoWidget("wSuperficie","vacio","Elige dos supuestos distintos para los ejes."); $("supRejilla").innerHTML=""; return false; }
    if(ultimoEsc.propio && (ex==="renta"||ey==="renta")){ estadoWidget("wSuperficie","vacio","Con local propio la renta es 0: elige otro supuesto."); $("supRejilla").innerHTML=""; return false; }
    const salida=$("supSalida").value, X=valoresEje(EJES[ex].get(ultimoEsc)), Y=valoresEje(EJES[ey].get(ultimoEsc));
    const val=Y.map(vy=>X.map(vx=>evaluar(ex,vx,ey,vy)[salida]));
    const plano=val.flat(), mn=Math.min(...plano), mxv=Math.max(...plano);
    const fmt=v=>salida==="P"?pct(v):mxn.format(Math.round(v));
    const rej=$("supRejilla");
    rej.style.setProperty("--n",NSUP);
    rej.innerHTML=[...Y.keys()].reverse().map(j=>'<div role="row">'+X.map((vx,i)=>{
      const v=val[j][i], k=(mxv-mn)?(v-mn)/(mxv-mn):0.5, centro=(i===4&&j===4);
      return '<button type="button" role="gridcell" class="celda25'+(centro?" centro":"")+'" data-i="'+i+'" data-j="'+j+'" data-k="'+k.toFixed(3)+'" tabindex="'+(centro?0:-1)+'" aria-label="'+EJES[ex].n+' '+EJES[ex].fmt(vx)+', '+EJES[ey].n+' '+EJES[ey].fmt(Y[j])+': '+fmt(v)+'"></button>';
    }).join("")+"</div>").join("");
    rej.querySelectorAll(".celda25").forEach(c=>{
      const k=+c.dataset.k; c.style.setProperty("--k",k); c.style.setProperty("--color",salida==="P"?colorP(val[+c.dataset.j][+c.dataset.i]):colorP(0.04+0.89*k));
    });
    const leer=c=>{
      const i=+c.dataset.i, j=+c.dataset.j; celdaSel=[i,j];
      const prev=rej.querySelector(".celda25.sel"); if(prev) prev.classList.remove("sel"); c.classList.add("sel");
      $("supLectura").textContent=EJES[ex].n+" = "+EJES[ex].fmt(X[i])+" ("+EJES[ex].u+") y "+EJES[ey].n+" = "+EJES[ey].fmt(Y[j])+" ("+EJES[ey].u+") → "+($("supSalida").selectedOptions[0].text)+": "+fmt(val[j][i])+".";
      $("supCorte").innerHTML='<caption>Corte en '+EJES[ey].n.toLowerCase()+' = '+EJES[ey].fmt(Y[j])+'</caption><thead><tr><th scope="col">'+EJES[ex].n+'</th><th scope="col">'+$("supSalida").selectedOptions[0].text+'</th></tr></thead><tbody>'+
        X.map((vx,ii)=>'<tr'+(ii===i?' class="actual"':"")+'><th scope="row">'+EJES[ex].fmt(vx)+'</th><td>'+fmt(val[j][ii])+'</td></tr>').join("")+"</tbody>";
    };
    supLeer=leer;
    const [ci,cj]=celdaSel&&celdaSel[0]<NSUP?celdaSel:[4,4];
    leer(rej.querySelector('.celda25[data-i="'+ci+'"][data-j="'+cj+'"]'));
  });
}
["supSalida","supEjeX","supEjeY"].forEach(id=>$(id).addEventListener("change",()=>{celdaSel=null;pintarSuperficie()}));
$("supPlano").addEventListener("change",()=>$("supEscena").classList.toggle("plana",$("supPlano").checked));
if(reduceMov()){ $("supPlano").checked=true; $("supEscena").classList.add("plana"); }

/* ===== Metodología · trazabilidad del resultado a su fuente ===== */
const TRAZA=[
  {id:"P", r:"Probabilidad a 3 años (P)", v:()=>ultimoModelo?pct(ultimoModelo.P):"—", formula:"P = 1/(1+e^(−z)), z = β₀ + Σβᵢxᵢ",
   vars:"Giro, zona, experiencia, reserva, formalidad, marketing, deuda, local, margen de seguridad (la competencia entra por los clientes, no a P), modelo de negocio, permisos, modalidad, horario",
   fuente:"β₀: INEGI, Demografía de los Negocios (tabla 1989–2019, S₀(3) = 0.426)", periodo:"1989–2019", tipo:"resultado", sup:"β de giro y zona estimados con el DENUE 2019→2024; los demás βᵢ son estimación del equipo", url:"https://www.inegi.org.mx/contenidos/programas/dn/2021/doc/Nota_Demo_Negocios.pdf"},
  {id:"rango", r:"Rango plausible de P (P5–P95)", v:()=>ultimoModelo?pct(rangoP(ultimoModelo).p05)+" – "+pct(rangoP(ultimoModelo).p95):"—", formula:"βᵢ·(1+0.30ε), β₀+0.15ε; 1,000 sorteos",
   vars:"Los mismos βᵢ del modelo logístico", fuente:"Análisis de sensibilidad del equipo (no es un intervalo muestral)", periodo:"—", tipo:"resultado", sup:"Desviaciones de 30 % y 0.15: estimación del equipo", url:""},
  {id:"S", r:"Curva de supervivencia S(t)", v:()=>ultimoS?"S(5) = "+pct(ultimoS[5]):"—", formula:"S(t) = S₀(t)^h, h = ln P / ln S₀(3)",
   vars:"P y la tabla nacional S₀(t)", fuente:"INEGI, tabulado nacional de supervivencia (t = 1…10)", periodo:"1989–2019", tipo:"dato oficial + supuesto", sup:"Tabla nacional aplicada a Coacalco sin ajuste municipal", url:"https://www.inegi.org.mx/contenidos/programas/dn/2019/tabulados/Nal_Tot_CE2019.xlsx"},
  {id:"U", r:"Utilidad mensual esperada", v:()=>ultimoEsc?mxn.format(Math.round(ultimoEsc.utilMes)):"—", formula:"U = μ·días·t̄·(1−cv′) − CF",
   vars:"Clientes/día, días, ticket, costo variable + merma, renta, nómina, otros fijos, marketing, intereses", fuente:"Entradas del usuario; ticket y CV por giro como valor inicial", periodo:"Mes típico", tipo:"resultado", sup:"Ticket, CV y demanda por giro: estimación del equipo", url:""},
  {id:"MC", r:"Utilidad anual P5 · P50 · P95", v:()=>ultimoMC?mxn.format(Math.round(ultimoMC.p05))+" · "+mxn.format(Math.round(ultimoMC.p50))+" · "+mxn.format(Math.round(ultimoMC.p95)):"—", formula:"2,000 años; F ~ LogN; clientes ~ N(μF,(0.22μF)²); ticket ~ N(t̄,(0.08t̄)²)",
   vars:"Utilidad, estacionalidad, crecimiento g", fuente:"Simulación Monte Carlo (mulberry32, semilla 20262)", periodo:"12 meses", tipo:"resultado", sup:"σ de 22 %, 8 %, 15 % y 2 pp: estimación del equipo", url:""},
  {id:"VPN", r:"VPN a 3 años", v:()=>ultimoEsc&&ultimoMC&&ultimoS?mxn.format(Math.round(finanzas(ultimoEsc,ultimoMC,ultimoS).vpn)):"—", formula:"VPN = −I₀ + Σ S(t)·Uₜ/(1+r)ᵗ",
   vars:"Inversión, tasa de descuento r, crecimiento g, inflación π, S(t)", fuente:"Entradas del usuario + S(t)", periodo:"3 años", tipo:"resultado", sup:"Antes de impuestos; sin valor terminal", url:""},
  {id:"sector", r:"Distribución sectorial", v:()=>"45.9 % comercio al por menor", formula:"Conteo de establecimientos por SCIAN / total",
   vars:"11,554 establecimientos de Coacalco", fuente:"INEGI, DENUE 05/2026", periodo:"Mayo 2026 (descarga 12-nov-2026)", tipo:"dato oficial", sup:"—", url:"https://www.inegi.org.mx/app/mapa/denue/"},
  {id:"pob", r:"Población de Coacalco", v:()=>"293,444", formula:"—", vars:"—", fuente:"INEGI, Censo de Población y Vivienda", periodo:"2020", tipo:"dato oficial", sup:"—", url:"https://www.inegi.org.mx/programas/ccpv/2020/"},
  {id:"zona", r:"Afluencia y renta por zona", v:()=>ultimoEsc?ultimoEsc.zona.afl.toFixed(2)+" · $"+ultimoEsc.zona.rm2+"/m²":"—", formula:"μ_zona = μ·afl_zona/afl_actual; renta = rm2·m²",
   vars:"Zona y superficie", fuente:"Sin fuente oficial (el DENUE no mide afluencia ni rentas)", periodo:"—", tipo:"supuesto", sup:"Estimación del equipo, editable", url:""}
];
let trazaSel="P";
function pintarTraza(){
  seguro("wTraza",()=>{
    const l=$("trazaLista");
    l.innerHTML=TRAZA.map(t=>'<li role="option" id="tz-'+t.id+'" data-id="'+t.id+'" aria-selected="'+(t.id===trazaSel)+'"><span>'+t.r+'</span><b>'+t.v()+'</b></li>').join("");
    l.setAttribute("aria-activedescendant","tz-"+trazaSel);
    const t=TRAZA.find(x=>x.id===trazaSel);
    const enlace=t.url?' <a href="'+t.url+'" target="_blank" rel="noopener">abrir fuente ↗</a>':"";
    $("trazaRuta").innerHTML='<ol class="traza-pasos">'+
      '<li><span class="paso">Resultado</span><strong>'+t.r+'</strong> = '+t.v()+'</li>'+
      '<li><span class="paso">Fórmula</span><code>'+t.formula+'</code></li>'+
      '<li><span class="paso">Variables</span>'+t.vars+'</li>'+
      '<li><span class="paso">Fuente</span>'+t.fuente+enlace+'</li>'+
      '<li><span class="paso">Periodo</span>'+t.periodo+'</li>'+
      '<li><span class="paso">Supuesto</span>'+t.sup+' <span class="proc proc-'+(t.tipo==="dato oficial"?"oficial":t.tipo==="supuesto"?"supuesto":"modelo")+'">'+t.tipo+'</span></li></ol>';
  });
}
$("trazaLista").addEventListener("click",ev=>{const li=ev.target.closest("li[data-id]"); if(li){trazaSel=li.dataset.id;pintarTraza()}});
$("trazaLista").addEventListener("keydown",ev=>{
  const ids=TRAZA.map(t=>t.id); let i=ids.indexOf(trazaSel);
  if(ev.key==="ArrowDown") i=Math.min(ids.length-1,i+1); else if(ev.key==="ArrowUp") i=Math.max(0,i-1);
  else if(ev.key==="Home") i=0; else if(ev.key==="End") i=ids.length-1; else return;
  ev.preventDefault(); trazaSel=ids[i]; pintarTraza();
});

/* Punto de entrada desde calcular() (tarea diferida, después del mapa). */
function pintarExplorar(e,modelo,mc,S){
  ultimoEsc=e; ultimoModelo=modelo; ultimoMC=mc; ultimoS=S;
  if(!tVivo && !solicitudCalculo) marcarVigente(e);
  if(document.activeElement!==$("demoClientes")) $("demoClientes").value=Math.round(e.muBase||e.mu);
  pintarDemo(); pintarMapa25(); pintarSupervivencia(); pintarMeta(); pintarSuperficie(); pintarTraza();
}

/* Carruseles de fotos (Inicio y Territorio). En pantallas anchas se ven tres fotos a la vez; avanzan
   solos cada 6 s, se detienen con el botón de pausa, al pasar el cursor o el foco, y si la persona
   pidió menos movimiento. Flechas ← → con la pista enfocada. */
let movimientoPausado=false;
document.querySelectorAll(".carrusel").forEach(cont=>{
  const pista=cont.querySelector(".car-pista"), slides=[...pista.children], puntos=[...cont.querySelectorAll(".car-punto")];
  if(!slides.length) return;
  /* Las fotos fuera de la vista horizontal no se cargan solas (lazy en pista con scroll):
     al acercarse el carrusel se piden todas, así ninguna diapositiva aparece en blanco. */
  new IntersectionObserver((ents,obs)=>{ if(ents.some(e=>e.isIntersecting)){ pista.querySelectorAll('img[loading="lazy"]').forEach(im=>im.loading="eager"); obs.disconnect(); } },{rootMargin:"600px 0px"}).observe(cont);
  let actual=0, pausado=matchMedia("(prefers-reduced-motion: reduce)").matches, encima=false, marco=0;
  const visibles=()=>Math.max(1,Math.round(pista.clientWidth/slides[0].offsetWidth));
  const marcar=i=>{ actual=i; puntos.forEach((p,k)=>p.setAttribute("aria-current",k===i?"true":"false")); };
  const ir=i=>{ const tope=slides.length-visibles(); i=i>tope?0:i<0?tope:i; marcar(i);
    pista.scrollTo({left:slides[i].offsetLeft-slides[0].offsetLeft, behavior:pausado||movimientoPausado?"auto":"smooth"}); };
  pista.addEventListener("scroll",()=>{ cancelAnimationFrame(marco); marco=requestAnimationFrame(()=>{
    const paso=slides.length>1?slides[1].offsetLeft-slides[0].offsetLeft:1; marcar(Math.min(slides.length-1,Math.round(pista.scrollLeft/paso))); }); },{passive:true});
  marcar(0);
  cont.querySelector(".car-ant").addEventListener("click",()=>ir(actual-1));
  cont.querySelector(".car-sig").addEventListener("click",()=>ir(actual+1));
  puntos.forEach(p=>p.addEventListener("click",()=>ir(Math.min(+p.dataset.i,slides.length-visibles()))));
  pista.addEventListener("keydown",ev=>{ if(ev.key==="ArrowRight"){ev.preventDefault();ir(actual+1);} if(ev.key==="ArrowLeft"){ev.preventDefault();ir(actual-1);} });
  const btn=cont.querySelector(".car-pausa");
  const pintarPausa=()=>{ btn.setAttribute("aria-pressed",String(pausado)); btn.textContent=pausado?"▶":"❚❚"; btn.setAttribute("aria-label",pausado?"Reanudar el carrusel":"Pausar el carrusel"); };
  btn.addEventListener("click",()=>{ pausado=!pausado; pintarPausa(); }); pintarPausa();
  ["mouseenter","focusin"].forEach(t=>cont.addEventListener(t,()=>encima=true));
  ["mouseleave","focusout"].forEach(t=>cont.addEventListener(t,()=>encima=false));
  setInterval(()=>{ if(!pausado&&!movimientoPausado&&!encima&&!document.hidden&&cont.offsetParent) ir(actual+1); },6000);
});
/* Pausa global del movimiento decorativo (grecas, modelo 2.5D y carruseles): WCAG 2.2.2. */
(function pausaMovimiento(){
  const b=$("pausaMovimiento"); if(!b) return;
  try{ movimientoPausado=sessionStorage.getItem("coatl-sin-movimiento")==="1"; }catch(_){}
  const pintar=()=>{ document.body.classList.toggle("sin-movimiento",movimientoPausado); b.setAttribute("aria-pressed",String(movimientoPausado)); b.textContent=movimientoPausado?"▶ Reanudar el movimiento":"❚❚ Pausar el movimiento"; };
  b.addEventListener("click",()=>{ movimientoPausado=!movimientoPausado; try{ sessionStorage.setItem("coatl-sin-movimiento",movimientoPausado?"1":"0"); }catch(_){} pintar(); });
  pintar();
})();

/* ===== src/ui/denue.js ===== */
/* ---------- 19. DENUE nacional (datos reales del INEGI, sincronizados) ----------
   Lee los agregados que genera scripts/denue_sync.py en data/denue/. Solo conteos.
   Si los archivos no están (p. ej. la versión artifact), el widget muestra «sin datos»
   y el resto del sitio sigue funcionando. */
const DENUE={base:"data/denue/", meta:null, nac:null, giros:null, clases:null, ent:{}};
const fmtN=n=>Number(n).toLocaleString("es-MX");
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
async function jsonDenue(ruta){
  const r=await fetch(DENUE.base+ruta,{cache:"no-cache"});
  if(!r.ok) throw new Error(ruta+" → HTTP "+r.status);
  return r.json();
}
function barras(ol, pares, total, max=12){
  const top=pares.slice(0,max), mayor=Math.max(1,...top.map(p=>p[1]));
  ol.innerHTML=top.map(([et,n,extra])=>'<li><span class="db-et">'+esc(et)+'</span><span class="db-barra" data-v="'+(n/mayor*100).toFixed(1)+'"></span><span class="db-n">'+fmtN(n)+(total?' <small>('+(n/total*100).toFixed(1)+' %)</small>':"")+(extra||"")+'</span></li>').join("")||'<li class="vacio">Sin registros.</li>';
  ol.querySelectorAll(".db-barra").forEach(b=>b.style.setProperty("--v",b.dataset.v));
}
const ESTRATOS_ORDEN=["0 a 5 personas","6 a 10 personas","11 a 30 personas","31 a 50 personas","51 a 100 personas","101 a 250 personas","251 y más personas"];
async function cargarDenue(){
  try{
    [DENUE.meta,DENUE.nac,DENUE.giros,DENUE.clases]=await Promise.all(["meta.json","nacional.json","giros.json","clases.json"].map(jsonDenue));
  }catch(err){
    console.warn("COATL · DENUE no disponible:",err.message);
    estadoWidget("wDenue","vacio","Los datos del DENUE no están disponibles en esta versión. Consulta el sitio publicado: https://maikolv.github.io/coatl/#denue");
    pintarCompetenciaDenue(); return;
  }
  const se=$("denueEnt");
  se.innerHTML=Object.entries(DENUE.nac.entidades).sort((a,b)=>a[0].localeCompare(b[0])).map(([k,v])=>'<option value="'+k+'">'+k+" · "+esc(v.nombre)+"</option>").join("");
  se.value=DENUE.nac.entidades["15"]?"15":se.options[0].value;
  const m=DENUE.meta, f=new Date(m.sincronizado);
  $("denueMeta").innerHTML="Fuente: "+m.fuente+' (<a href="'+m.url+'" target="_blank" rel="noopener">descarga oficial</a>). Sincronizado el '+f.toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})+" · "+fmtN(m.total_establecimientos)+" establecimientos en "+fmtN(m.municipios)+" municipios de "+m.entidades+" entidades.";
  await poblarMunicipios("020");
  pintarCompetenciaDenue();
}
async function poblarMunicipios(prefer){
  const ee=$("denueEnt").value;
  const muns=Object.values(DENUE.nac.municipios).filter(x=>x.ent===ee).sort((a,b)=>a.nombre.localeCompare(b.nombre,"es"));
  $("denueMun").innerHTML='<option value="">Toda la entidad</option>'+muns.map(x=>'<option value="'+x.mun+'">'+esc(x.nombre)+"</option>").join("");
  if(prefer && muns.some(x=>x.mun===prefer)) $("denueMun").value=prefer;
  await pintarDenue();
}
async function pintarDenue(){
  const ee=$("denueEnt").value, mm=$("denueMun").value;
  estadoWidget("wDenue","cargando","Cargando "+(DENUE.nac.entidades[ee]||{}).nombre+"…");
  try{
    if(!DENUE.ent[ee]) DENUE.ent[ee]=await jsonDenue("ent/"+ee+".json");
    const E=DENUE.ent[ee], muns=mm?[E[mm]]:Object.values(E);
    if(!muns.length||!muns[0]){estadoWidget("wDenue","vacio");return}
    const suma=k=>{const c={};muns.forEach(x=>Object.entries(x[k]||{}).forEach(([a,n])=>c[a]=(c[a]||0)+n));return c};
    const clases=suma("clases"), estr=suma("estratos"), altas=suma("altas");
    const total=Object.values(clases).reduce((a,b)=>a+b,0);
    const sect={}; Object.entries(clases).forEach(([c,n])=>{const s=DENUE.meta.sectores_scian[c.slice(0,2)]||("Sector "+c.slice(0,2));sect[s]=(sect[s]||0)+n});
    const lugar=mm?E[mm].nombre+", "+DENUE.nac.entidades[ee].nombre:DENUE.nac.entidades[ee].nombre;
    const pobl=(ee==="15"&&mm==="020")?' · <span class="proc proc-oficial">293,444 hab. (Censo 2020): '+(total/293444*1000).toFixed(1)+" por cada 1,000</span>":"";
    $("denueCifras").innerHTML='<div><span>Establecimientos en '+esc(lugar)+'</span><b>'+fmtN(total)+"</b>"+pobl+"</div>"+
      '<div><span>Actividades distintas (clases SCIAN)</span><b>'+fmtN(Object.keys(clases).length)+"</b></div>"+
      '<div><span>Micro (0 a 5 personas)</span><b>'+(total?((estr["0 a 5 personas"]||0)/total*100).toFixed(1):0)+" %</b></div>";
    barras($("denueSectores"),Object.entries(sect).sort((a,b)=>b[1]-a[1]),total,10);
    barras($("denueEstratos"),ESTRATOS_ORDEN.filter(k=>estr[k]).map(k=>[k,estr[k]]),total,7);
    const anios=Object.entries(altas).filter(([a])=>/^\d{4}$/.test(a)&&+a>=2010).sort();
    barras($("denueAltas"),anios.map(([a,n])=>[a,n]),0,20);
    const q=$("denueBusca").value.trim().toLowerCase();
    let cl=Object.entries(clases).map(([c,n])=>[c+" · "+(DENUE.clases[c]||"Clase "+c),n]);
    if(q) cl=cl.filter(([t])=>t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").includes(q.normalize("NFD").replace(/[̀-ͯ]/g,"")));
    barras($("denueClases"),cl.sort((a,b)=>b[1]-a[1]),total,q?40:15);
    if(q && !cl.length) estadoWidget("wDenue","vacio","Ninguna actividad coincide con «"+q+"».");
    else estadoWidget("wDenue","listo");
  }catch(err){ console.warn(err); estadoWidget("wDenue","error"); }
}
$("denueEnt").addEventListener("change",()=>poblarMunicipios());
$("denueMun").addEventListener("change",pintarDenue);
let tBusca=null; $("denueBusca").addEventListener("input",()=>{clearTimeout(tBusca);tBusca=setTimeout(pintarDenue,200)});

/* Competencia registrada en el DENUE para el giro del simulador (Coacalco = 15020). */
function pintarCompetenciaDenue(){
  const el=$("compDenue"); if(!el) return;
  const g=$("giro").value, codigos=DENUE.meta&&DENUE.meta.giros_scian[g];
  if(!DENUE.giros||!codigos){ el.textContent=""; return; }
  if(!codigos.length){ el.innerHTML='DENUE: este giro no tiene una clase SCIAN propia; no hay conteo oficial.'; return; }
  const n=(DENUE.giros["15020"]||{})[g]||0;
  const comp=Object.entries(DENUE.meta.clases_compartidas||{}).filter(([c,gs])=>codigos.includes(c)&&gs.length>1).map(([c])=>c);
  el.innerHTML='DENUE: <strong>'+fmtN(n)+'</strong> establecimientos de este giro en todo Coacalco (SCIAN '+codigos.join(", ")+(comp.length?"; clase compartida con otro giro":"")+'). El selector de arriba es la competencia <em>cercana</em> a tu local.';
}
$("giro").addEventListener("change",pintarCompetenciaDenue);
if("IntersectionObserver" in window){
  const io=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)){ io.disconnect(); cargarDenue(); } },{rootMargin:"600px 0px"});
  io.observe($("denue")); io.observe($("simulador"));
  window.addEventListener("hashchange",()=>{ if(!DENUE.meta) cargarDenue(); },{once:true});
} else cargarDenue();

/* ===== src/ui/empresas.js ===== */
/* ---------- 20. Empresas: análisis con datos propios, 100 % local ----------
   El archivo se lee con FileReader en este navegador. No existe ninguna petición que lo
   envíe (la CSP solo permite conectar con el propio sitio para leer el DENUE). No se usa
   localStorage: los datos viven en memoria y se borran al recargar o con «Borrar».
   Excel se lee con SheetJS (cdnjs, con SRI), cargado solo si eliges un .xlsx/.xls. */
const XLSX_URL="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
const XLSX_SRI="sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw";
const MAX_BYTES=5*1024*1024, MIN_MESES=6;
let empresa=null;   // único lugar donde viven los datos de la empresa

function normCol(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"")}
const ALIAS={mes:["mes","periodo","fecha","month"],ventas:["ventas","ingresos","venta","ventas_mxn"],clientes:["clientes","tickets","transacciones","clientes_mes"],
  costo_variable:["costo_variable","costos_variables","cv","costo_de_ventas","costo_ventas"],costos_fijos:["costos_fijos","gastos_fijos","fijos","cf"]};
function parseCSV(texto){
  const sep=(texto.split("\n")[0].match(/;/g)||[]).length>(texto.split("\n")[0].match(/,/g)||[]).length?";":",";
  const filas=[]; let fila=[], campo="", q=false;
  for(let i=0;i<texto.length;i++){
    const ch=texto[i];
    if(q){ if(ch==='"'){ if(texto[i+1]==='"'){campo+='"';i++} else q=false } else campo+=ch; }
    else if(ch==='"') q=true;
    else if(ch===sep){ fila.push(campo); campo=""; }
    else if(ch==="\n"||ch==="\r"){ if(ch==="\r"&&texto[i+1]==="\n") i++; fila.push(campo); campo=""; if(fila.some(c=>c.trim()!=="")) filas.push(fila); fila=[]; }
    else campo+=ch;
  }
  fila.push(campo); if(fila.some(c=>c.trim()!=="")) filas.push(fila);
  return filas;
}
function cargarXLSX(){
  if(window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((ok,mal)=>{
    const s=document.createElement("script");
    s.src=XLSX_URL; s.integrity=XLSX_SRI; s.crossOrigin="anonymous"; s.referrerPolicy="no-referrer";
    s.onload=()=>ok(window.XLSX); s.onerror=()=>mal(new Error("No se pudo cargar el lector de Excel; guarda el archivo como CSV."));
    document.head.appendChild(s);
  });
}
const numero=v=>{ if(typeof v==="number") return v; const t=String(v??"").replace(/[$\s]/g,"").replace(/,(?=\d{3}(\D|$))/g,""); return t===""?NaN:Number(t.replace(",",".")); };

function interpretar(filas){
  /* La plantilla de Excel trae título y guía arriba: el encabezado es la primera fila (de las 20 iniciales) que nombra «ventas». */
  const iCab=filas.slice(0,20).findIndex(f=>f.map(normCol).some(c=>ALIAS.ventas.includes(c)));
  if(iCab>0) filas=filas.slice(iCab);
  if(filas.length<2) throw new Error("El archivo no tiene filas de datos. Llena la hoja «Datos» de la plantilla.");
  const cab=filas[0].map(normCol), idx={};
  for(const [k,als] of Object.entries(ALIAS)) idx[k]=cab.findIndex(c=>als.includes(c));
  const faltan=["ventas","costo_variable","costos_fijos"].filter(k=>idx[k]<0);
  if(faltan.length) throw new Error("Faltan columnas: "+faltan.join(", ")+". Usa la plantilla.");
  const meses=[];
  filas.slice(1).forEach((f,i)=>{
    if([idx.ventas,idx.costo_variable,idx.costos_fijos].every(k=>String(f[k]??"").trim()==="")) return;   // fila sin capturar (plantilla)
    const v=numero(f[idx.ventas]), cv=numero(f[idx.costo_variable]), cf=numero(f[idx.costos_fijos]);
    const cl=idx.clientes>=0?numero(f[idx.clientes]):NaN;
    if([v,cv,cf].some(x=>!Number.isFinite(x))) throw new Error("Fila "+(i+2)+": ventas, costo_variable y costos_fijos deben ser números.");
    if(v<0||cv<0||cf<0) throw new Error("Fila "+(i+2)+": no se admiten valores negativos.");
    meses.push({mes:idx.mes>=0?String(f[idx.mes]):String(i+1), ventas:v, cv, cf, clientes:Number.isFinite(cl)&&cl>0?cl:null, util:v-cv-cf});
  });
  if(meses.length<MIN_MESES) throw new Error("Se necesitan al menos "+MIN_MESES+" meses; el archivo tiene "+meses.length+".");
  return meses;
}
function analizar(meses){
  const n=meses.length, media=a=>a.reduce((s,x)=>s+x,0)/a.length;
  const de=a=>{const m=media(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))};
  const ventas=meses.map(m=>m.ventas), util=meses.map(m=>m.util);
  const conCl=meses.filter(m=>m.clientes);
  const totV=ventas.reduce((a,b)=>a+b,0);
  const r={n, ventasMedia:media(ventas), ventasCVrel:de(ventas)/media(ventas), utilMedia:media(util), utilDE:de(util),
    cv:meses.reduce((s,m)=>s+m.cv,0)/(totV||1), fijos:media(meses.map(m=>m.cf)),
    ticket:conCl.length?conCl.reduce((s,m)=>s+m.ventas,0)/conCl.reduce((s,m)=>s+m.clientes,0):null,
    clientesMes:conCl.length?media(conCl.map(m=>m.clientes)):null};
  // Bootstrap de meses: cada año simulado = suma de 12 meses tomados con reemplazo del historial.
  const rng=mulberry32(SEMILLA), anios=new Array(N_SIM);
  for(let i=0;i<N_SIM;i++){ let s=0; for(let k=0;k<12;k++) s+=util[Math.floor(rng()*n)]; anios[i]=s; }
  anios.sort((a,b)=>a-b);
  Object.assign(r,{anios, p05:cuantil(anios,.05), p50:cuantil(anios,.5), p95:cuantil(anios,.95), pPos:anios.filter(x=>x>0).length/N_SIM});
  return r;
}
function svgSerie(meses){
  const W=360,H=160,n=meses.length, mx=Math.max(1,...meses.map(m=>Math.abs(m.util))), y0=H/2, bw=(W-30)/n;
  return '<line x1="20" y1="'+y0+'" x2="'+(W-6)+'" y2="'+y0+'" class="eje"/>'+meses.map((m,i)=>{
    const h=Math.abs(m.util)/mx*(H/2-18), x=22+i*bw, y=m.util>=0?y0-h:y0;
    return '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+Math.max(1,bw-2).toFixed(1)+'" height="'+h.toFixed(1)+'" class="'+(m.util>=0?"pos":"neg")+'"><title>'+String(m.mes).replace(/[<&>"]/g,"")+": "+mxn.format(Math.round(m.util))+'</title></rect>';
  }).join("")+'<text x="22" y="12" class="rot">Utilidad mensual de tu historial</text>';
}
function svgDist(r){
  const W=360,H=160,nb=24,lo=r.anios[0],hi=r.anios[r.anios.length-1],paso=(hi-lo)/nb||1,b=new Array(nb).fill(0);
  r.anios.forEach(x=>b[Math.min(nb-1,Math.floor((x-lo)/paso))]++);
  const mb=Math.max(...b), bw=(W-30)/nb, px=v=>22+(v-lo)/((hi-lo)||1)*(W-30);
  return b.map((c,i)=>{const h=c/mb*(H-40);const centro=lo+paso*(i+.5);return '<rect x="'+(22+i*bw).toFixed(1)+'" y="'+(H-20-h).toFixed(1)+'" width="'+(bw-1).toFixed(1)+'" height="'+h.toFixed(1)+'" class="'+(centro<0?"neg":"pos")+'"/>'}).join("")+
    [["P5",r.p05],["P50",r.p50],["P95",r.p95]].map(([e,v])=>'<line x1="'+px(v).toFixed(1)+'" y1="18" x2="'+px(v).toFixed(1)+'" y2="'+(H-20)+'" class="meta"/><text x="'+px(v).toFixed(1)+'" y="14" text-anchor="middle" class="rot">'+e+'</text>').join("")+
    '<line x1="20" y1="'+(H-20)+'" x2="'+(W-6)+'" y2="'+(H-20)+'" class="eje"/><text x="'+(W-6)+'" y="'+(H-5)+'" text-anchor="end" class="rot">utilidad anual simulada →</text>';
}
function pintarEmpresa(){
  const r=empresa.r, e=leerEscenario(), g=e.giro;
  $("empCifras").innerHTML=
    '<div><span>P(utilidad anual &gt; 0)</span><b>'+pct(r.pPos)+'</b> <span class="proc proc-modelo">tus datos</span></div>'+
    '<div><span>Utilidad anual P5 · P50 · P95</span><b>'+mxn.format(Math.round(r.p05))+" · "+mxn.format(Math.round(r.p50))+" · "+mxn.format(Math.round(r.p95))+'</b></div>'+
    '<div><span>Meses analizados</span><b>'+r.n+'</b>'+(r.n<12?' <span class="proc proc-supuesto">menos de 12: más incertidumbre</span>':"")+'</div>';
  const fis=estimarFiscal(r.ventasMedia,r.utilMedia,0), nota=$("empFiscal");
  nota.hidden=false;
  nota.textContent="Fiscal (orientativo): con tus ventas reales promedio de "+mxn.format(Math.round(r.ventasMedia))+" al mes, el ISR estimado sería de "+mxn.format(Math.round(fis.isrMes))+
    (fis.regimen==="resico_pf"?" en RESICO de personas físicas ("+(fis.tasaResico*100).toFixed(1)+" % de los ingresos)":" en régimen general (30 % de la utilidad; tus ingresos superan el tope del RESICO)")+
    ", y tu utilidad promedio después de ISR, "+mxn.format(Math.round(fis.utilDespues))+" al mes. Confírmalo con un contador."+(typeof negocioActual!=="undefined"&&negocioActual?" Negocio: «"+negocioActual+"».":"");
  $("empSerie").innerHTML=svgSerie(empresa.meses);
  $("empDist").innerHTML=svgDist(r);
  const fila=(k,tuyo,coatl,nota)=>'<tr><th scope="row">'+k+'</th><td>'+tuyo+'</td><td>'+coatl+'</td><td>'+(nota||"")+'</td></tr>';
  $("empTabla").innerHTML='<caption>Tus datos frente a los supuestos de COATL ('+g.n+')</caption><thead><tr><th scope="col">Indicador</th><th scope="col">Tu historial</th><th scope="col">Supuesto COATL</th><th scope="col">Lectura</th></tr></thead><tbody>'+
    fila("Ticket promedio", r.ticket?mxn.format(Math.round(r.ticket)):"— (sin columna clientes)", mxn.format(g.ticket), "estimación del equipo")+
    fila("Costo variable", pct(r.cv), g.cv+" %", "estimación del equipo")+
    fila("Variabilidad mensual de ventas (DE relativa)", pct(r.ventasCVrel), pct(INCERTIDUMBRE.demandaMensual), "supuesto del Monte Carlo")+
    fila("Costos fijos mensuales", mxn.format(Math.round(r.fijos)), mxn.format(Math.round(e.fijos)), "escenario actual del simulador")+
    fila("Utilidad mensual media", mxn.format(Math.round(r.utilMedia)), mxn.format(Math.round(e.utilMes)), "")+"</tbody>";
  $("empResultados").hidden=false;
  estadoWidget("wEmpresa","listo","Análisis listo. Tus datos siguen solo en este navegador.");
}
async function leerArchivo(file){
  if(!file) return;
  estadoWidget("wEmpresa","cargando","Leyendo «"+file.name+"» en tu navegador…");
  try{
    if(file.size>MAX_BYTES) throw new Error("El archivo pesa más de 5 MB.");
    let filas;
    if(/\.xlsx?$/i.test(file.name)){
      const X=await cargarXLSX(), wb=X.read(await file.arrayBuffer(),{type:"array"});
      const hoja=wb.SheetNames.find(n=>normCol(n)==="datos")||wb.SheetNames[0];
      filas=X.utils.sheet_to_json(wb.Sheets[hoja],{header:1,raw:true,defval:""}).filter(f=>f.some(c=>String(c).trim()!==""));
    } else filas=parseCSV(await file.text());
    const meses=interpretar(filas);
    empresa={meses, r:analizar(meses)};
    pintarEmpresa();
  }catch(err){
    empresa=null; $("empResultados").hidden=true;
    estadoWidget("wEmpresa","error",err.message);
  }
}
$("empArchivo").addEventListener("change",ev=>leerArchivo(ev.target.files[0]));
const zona=document.querySelector(".zona-archivo");
["dragenter","dragover"].forEach(t=>zona.addEventListener(t,ev=>{ev.preventDefault();zona.classList.add("arrastre")}));
["dragleave","drop"].forEach(t=>zona.addEventListener(t,ev=>{ev.preventDefault();zona.classList.remove("arrastre")}));
zona.addEventListener("drop",ev=>leerArchivo(ev.dataTransfer.files[0]));
$("empBorrar").addEventListener("click",()=>{
  empresa=null; $("empArchivo").value=""; $("empResultados").hidden=true;
  ["empCifras","empSerie","empDist","empTabla"].forEach(id=>$(id).innerHTML="");
  $("empFiscal").hidden=true; $("empFiscal").textContent="";
  estadoWidget("wEmpresa","vacio","Datos borrados de la memoria del navegador.");
});
$("empAplicar").addEventListener("click",()=>{
  if(!empresa) return;
  const r=empresa.r, e=leerEscenario();
  $("cvar").value=Math.round(Math.min(90,Math.max(5,r.cv*100))); $("merma").value=0;
  if(r.ticket) $("ticket").value=Math.round(r.ticket);
  if(r.clientesMes) $("clientes").value=Math.max(1,Math.round(r.clientesMes/(e.diasSem*4.33)));
  const otros=r.fijos-(e.rentaEf+e.empleados*e.costoEmpleado+(e.mktGasto||0)+e.interesMes);
  $("otrosFijos").value=Math.max(0,Math.round(otros/100)*100);
  ["cvar","merma"].forEach(id=>$(id).dispatchEvent(new Event("input")));
  calcular();
  irA("simulador");
  toast("Simulador ajustado a tus promedios: ticket, costo variable (merma incluida), clientes/día y otros fijos para igualar tus costos fijos.");
});
$("empPlantilla").addEventListener("click",()=>{
  /* Datos de EJEMPLO (no reales) solo para mostrar el formato. */
  const filas=["mes,ventas,clientes,costo_variable,costos_fijos"];
  const base=[178,182,169,190,201,195,188,176,184,199,215,240];
  base.forEach((v,i)=>filas.push("2025-"+String(i+1).padStart(2,"0")+","+v*1000+","+Math.round(v*1000/95)+","+Math.round(v*1000*0.41)+",27000"));
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob(["﻿"+filas.join("\n")],{type:"text/csv"}));
  a.download="COATL-plantilla-empresa.csv"; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
});

/* ===== src/ui/giros_scian.js ===== */
/* ---------- 23. Todas las actividades del SCIAN como giros + costos ilimitados ----------
   El catálogo viene del DENUE (data/denue/clases.json, más de 900 clases). Una actividad
   que no es uno de los 35 giros calibrados hereda ticket, costo variable, demanda y β de su
   giro COATL más cercano (por subsector SCIAN), rotulado «estimación del equipo». Su
   competencia en Coacalco es el conteo real del DENUE para esa clase. */
const PLANTILLA_SCIAN=[  // prefijo SCIAN → giro COATL de referencia (más específico primero)
  ["3118","panaderia"],["3118","tortilleria"],["311","panaderia"],["31","taller"],["32","taller"],["33","taller"],
  ["4611","abarrotes"],["4612","vinateria"],["461","abarrotes"],["462","abarrotes"],["463","ropa"],["4641","farmacia"],["4642","optica"],["464","farmacia"],
  ["4651","joyeria"],["465","papeleria"],["4662","celulares"],["466","tecnologia"],["467","ferreteria"],["468","refaccionaria"],["469","celulares"],
  ["7225","restaurante"],["722","fonda"],["721","consultorio"],["713","gimnasio"],["71","gimnasio"],
  ["8111","taller"],["811","tecnologia"],["8121","estetica"],["8122","lavanderia"],["812","estetica"],["81","consultorio"],
  ["62","consultorio"],["61","educacion"],["54","consultorio"],["53","consultorio"],["56","lavanderia"],["51","ciber"],["52","consultorio"],["43","abarrotes"]
];
function plantillaDe(codigo){ const p=PLANTILLA_SCIAN.find(([pre])=>codigo.startsWith(pre)); return p?p[1]:"abarrotes"; }
async function catalogoSCIAN(){
  if(DENUE.clases) return DENUE.clases;
  try{ DENUE.clases=await jsonDenue("clases.json"); }catch(_){ DENUE.clases=null; }
  return DENUE.clases;
}
function crearGiroScian(codigo,cat){
  const clave="scian_"+codigo, base=plantillaDe(codigo);
  if(!GIROS[clave]) GIROS[clave]=Object.assign({},GIROS[base],{n:cat[codigo]+" (SCIAN "+codigo+")", scian:codigo, base});
  return clave;
}
async function usarActividad(codigo){
  const cat=await catalogoSCIAN(); if(!cat||!cat[codigo]) return false;
  const propio=Object.entries((DENUE.meta&&DENUE.meta.giros_scian)||{}).find(([,cs])=>cs.length===1&&cs[0]===codigo);
  if(propio){ $("giro").value=propio[0]; $("giro").dispatchEvent(new Event("change")); calcular(); return true; }
  const base=plantillaDe(codigo), clave=crearGiroScian(codigo,cat);
  if(!$("giro").querySelector('option[value="'+clave+'"]')){   // no repetir si ya está en la lista de Coacalco
    const o=document.createElement("option"); o.value=clave; o.textContent="SCIAN "+codigo+" · "+cat[codigo];
    $("giroScianGrupo").appendChild(o);
  }
  $("giro").value=clave; $("giro").dispatchEvent(new Event("change")); calcular();
  $("giroNota").innerHTML='Parámetros de referencia de <strong>'+esc(GIROS[base].n)+'</strong> <span class="proc proc-supuesto">estimación del equipo</span>; ajústalos en Finanzas y Operación.';
  return true;
}
(async function prepararBuscador(){
  const opt=document.createElement("optgroup"); opt.label="Actividades agregadas (SCIAN y giros propios)"; opt.id="giroScianGrupo"; $("giro").appendChild(opt);
  $("giro").addEventListener("change",()=>{ if(!GIROS[$("giro").value]||!GIROS[$("giro").value].scian) $("giroNota").textContent=""; });
  const inp=$("giroBusca"), lista=$("giroOpciones");
  inp.addEventListener("focus",async()=>{
    const cat=await catalogoSCIAN();
    if(!cat){ $("giroNota").textContent="El catálogo SCIAN no está disponible en esta versión."; return; }
    if(!lista.children.length) lista.innerHTML=Object.entries(cat).map(([c,n])=>'<option value="'+c+' · '+esc(n)+'">').join("");
    $("giroTotal").textContent=Object.keys(cat).length.toLocaleString("es-MX")+" actividades";
  },{once:true});
  inp.addEventListener("change",async()=>{ const v=inp.value.trim(), m=/^(\d{6})/.exec(v); if(m?await usarActividad(m[1]):(v.length>2&&usarGiroPropio(v))) inp.value=""; });
})();

/* Giro con cualquier nombre (sin límite): hereda la plantilla del giro COATL que más se parezca. */
function usarGiroPropio(nombre){
  const base=interpretarLocal(nombre).r.giro||"abarrotes", clave="propio_"+sinAcentos(nombre).replace(/[^a-z0-9]+/g,"_").slice(0,40);
  if(!GIROS[clave]){
    GIROS[clave]=Object.assign({},GIROS[base],{n:nombre.slice(0,80), base});
    const o=document.createElement("option"); o.value=clave; o.textContent=nombre.slice(0,80)+" (giro propio)"; $("giroScianGrupo").appendChild(o);
  }
  $("giro").value=clave; $("giro").dispatchEvent(new Event("change")); calcular();
  $("giroNota").innerHTML="Giro propio con parámetros de referencia de <strong>"+esc(GIROS[base].n)+"</strong> <span class=\"proc proc-supuesto\">estimación del equipo</span>; ajústalos en Finanzas y Operación.";
  return true;
}

/* Competencia real en Coacalco para una actividad SCIAN agregada (clase exacta). */
async function competenciaScian(g){
  if(!g||!g.scian) return null;
  try{ if(!DENUE.ent["15"]) DENUE.ent["15"]=await jsonDenue("ent/15.json"); }catch(_){ return null; }
  return ((DENUE.ent["15"]["020"]||{}).clases||{})[g.scian]||0;
}
const _pcd=pintarCompetenciaDenue;
pintarCompetenciaDenue=async function(){
  const g=GIROS[$("giro").value];
  if(g&&g.scian){ const n=await competenciaScian(g); if(n!=null) $("compDenue").innerHTML='DENUE: <strong>'+fmtN(n)+'</strong> establecimientos de la clase SCIAN '+g.scian+' en todo Coacalco.'; return; }
  _pcd();
};

/* Costos fijos adicionales ilimitados (variables definidas por el usuario). */
function sumaExtras(){ return [...document.querySelectorAll("#extrasLista input[type=number]")].reduce((s,i)=>s+Math.max(0,Number(i.value)||0),0); }
function agregarExtra(nombre,monto){
  const li=document.createElement("li"), id="x"+Math.random().toString(36).slice(2,8);
  li.innerHTML='<label class="sr-only" for="'+id+'n">Concepto</label><input type="text" id="'+id+'n" placeholder="Concepto (p. ej. licencia de software)" value="'+esc(nombre||"")+'">'+
    '<label class="sr-only" for="'+id+'m">Monto mensual</label><input type="number" id="'+id+'m" min="0" step="100" value="'+(monto||0)+'" inputmode="numeric">'+
    '<button type="button" class="quitar" aria-label="Quitar este costo">✕</button>';
  li.querySelector(".quitar").addEventListener("click",()=>{ li.remove(); actualizarExtras(); calcular(); });
  $("extrasLista").appendChild(li); li.querySelector("input").focus();
}
function actualizarExtras(){ $("extrasTotal").textContent=mxn.format(sumaExtras()); }
$("extrasAgregar").addEventListener("click",()=>{ agregarExtra("",0); actualizarExtras(); });
$("extrasLista").addEventListener("input",()=>{ actualizarExtras(); });
$("forma").addEventListener("reset",()=>{ $("extrasLista").innerHTML=""; actualizarExtras(); });
$("giro").addEventListener("change",()=>pintarCompetenciaDenue());

/* Todas las actividades que existen hoy en Coacalco (DENUE, municipio 15-020), ordenadas por número de negocios.
   Se cargan cuando el navegador está libre; al elegir una, hereda la plantilla de su giro COATL más cercano. */
(async function giroCoacalco(){
  await new Promise(r=>(window.requestIdleCallback||setTimeout)(r,{timeout:2500}));
  let mun, cat;
  try{ [mun,cat]=await Promise.all([jsonDenue("coacalco.json"), catalogoSCIAN()]); }catch(_){ return; }
  if(!mun||!cat) return;
  const sel=$("giro"), grupo=document.createElement("optgroup");
  const filas=Object.entries(mun.clases).filter(([c])=>cat[c]).sort((a,b)=>b[1]-a[1]);
  grupo.label="Actividades presentes en Coacalco · "+filas.length+" (DENUE)"; grupo.id="giroCoacalcoGrupo";
  grupo.innerHTML=filas.map(([c,n])=>'<option value="scian_'+c+'">'+esc(cat[c])+' · '+n.toLocaleString("es-MX")+(n===1?" negocio":" negocios")+'</option>').join("");
  sel.insertBefore(grupo,$("giroScianGrupo"));
  // Al elegir una, la entrada de GIROS se crea antes que los demás oyentes de «change» la lean.
  sel.addEventListener("change",()=>{ const v=sel.value; if(v.startsWith("scian_")&&!GIROS[v]) crearGiroScian(v.slice(6),cat); },{capture:true});
  sel.addEventListener("change",()=>{ const v=sel.value; if(v.startsWith("scian_")&&grupo.querySelector('option[value="'+v+'"]'))
    $("giroNota").innerHTML="Actividad real en Coacalco (DENUE). Parámetros de referencia de <strong>"+esc(GIROS[GIROS[v].base].n)+"</strong> <span class=\"proc proc-supuesto\">estimación del equipo</span>; ajústalos en Finanzas y Operación."; });
})();

/* ===== src/ui/censo.js ===== */
/* ---------- 24. Referencia censal por giro (INEGI, Censos Económicos 2019) ----------
   Compara el escenario con los micronegocios reales del mismo giro en Coacalco (datos de
   data/censo/giros.json, scripts/censo_sync.py) y permite aplicar esa referencia. Los valores por
   defecto no cambian: así el escenario de referencia sigue siendo reproducible. */
let CENSO=null, cargaCenso=null;
function refCenso(){ const g=GIROS[$("giro").value]; return CENSO&&g?CENSO.giros[g.base||$("giro").value]||null:null; }
function pintarCenso(){
  const caja=$("censoRef"), r=refCenso();
  if(!r){ caja.hidden=true; return; }
  const e=leerEscenario(), ventas=e.ventasMes*12, veces=ventas/r.ingreso_anual_ue;
  const fila=(c,a,b)=>"<tr><th scope=\"row\">"+c+"</th><td>"+a+"</td><td>"+b+"</td></tr>";
  caja.hidden=false;
  caja.innerHTML='<p class="censo-tit">Contraste con el censo: <b>'+fmtN(r.ue)+'</b> negocios reales del giro <span class="proc proc-oficial">dato oficial</span></p>'+
    '<table class="censo-tabla"><thead><tr><th scope="col">Por negocio</th><th scope="col">Tu escenario</th><th scope="col">Censo · '+esc(r.nivel)+'</th></tr></thead><tbody>'+
    fila("Ventas al año",mxn.format(Math.round(ventas)),mxn.format(r.ingreso_anual_ue))+
    fila("Costo directo",Math.round(e.cv*100)+"%",r.costo_directo_pct+"%")+
    fila("Personas trabajando",(e.empleados+1)+" (con quien lo dirige)",r.personal_ue.toLocaleString("es-MX"))+
    fila("Renta al mes",mxn.format(Math.round(e.rentaEf)),mxn.format(r.renta_mes_ue))+
    "</tbody></table>"+
    '<p class="censo-nota">'+(veces>1.5?"Tus ventas son <b>"+veces.toFixed(1)+" veces</b> las del negocio promedio de este tamaño: revisa clientes y ticket. ":"")+
    "Censo de 2018 en pesos de ese año (no ajustado por inflación); muchos negocios pequeños no pagan renta o la comparten.</p>"+
    '<button type="button" class="btn btn-widget btn-sec" id="censoAplicar">Usar la referencia del censo</button>';
  $("censoAplicar").addEventListener("click",()=>{
    const ee=leerEscenario();
    $("cvar").value=Math.min(90,Math.max(5,Math.round(r.costo_directo_pct)));
    $("clientes").value=Math.max(1,Math.round(r.ingreso_anual_ue/12/ee.diasMes/ee.ticket));
    $("empleados").value=Math.max(0,Math.round(r.personal_ue-1));
    if(r.renta_mes_ue>0) $("renta").value=Math.round(r.renta_mes_ue/100)*100;
    ["cvar","clientes"].forEach(id=>$(id).dispatchEvent(new Event("input")));
    calcular(); pintarCenso(); toast("Escenario ajustado al promedio censal del giro.");
  });
}
async function asegurarCenso(){
  cargaCenso ??= fetch("data/censo/giros.json").then(r=>r.ok?r.json():null).catch(()=>null);
  CENSO=await cargaCenso; pintarCenso();
}
$("giro").addEventListener("change",asegurarCenso);
$("forma").addEventListener("change",()=>{ if(CENSO) pintarCenso(); });
asegurarCenso();

/* ===== src/ui/describir.js ===== */
/* ---------- 22. Describe tu situación (texto o voz) → parámetros del simulador ----------
   Dos intérpretes:
   1) IA de COATL (Gemini, clave del proyecto en el servidor): por defecto en el sitio publicado.
   2) Local: reglas en español, sin red. Respaldo automático si la IA no responde.
   La voz usa el reconocimiento del navegador (Web Speech API). */

function sinAcentos(t){return String(t).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase()}
function cantidad(txt){
  const m=/(\d+(?:[.,]\d+)?)\s*(mil(?:lones?)?|millon(?:es)?|k\b)?/.exec(txt.replace(/\$/g,"").replace(/(\d),(\d{3})\b/g,"$1$2"));
  if(!m) return null;
  let n=Number(m[1].replace(",","."));
  if(m[2]){ if(/^mil$/.test(m[2])||m[2]==="k") n*=1e3; else n*=1e6; }
  return n;
}
/* Busca una cantidad cerca de alguna palabra clave (antes o después). */
function cerca(t, claves){
  for(const c of claves){
    const re=new RegExp("(?:"+c+")[^.;\\d$]{0,28}(\\$?\\s?\\d[\\d.,]*\\s*(?:mil(?:lones?)?|millon(?:es)?|k\\b)?)|(\\$?\\s?\\d[\\d.,]*\\s*(?:mil(?:lones?)?|millon(?:es)?|k\\b)?)\\s*(?:de\\s+)?(?:"+c+")","i");
    const m=re.exec(t); if(m) return cantidad(m[1]||m[2]);
  }
  return null;
}
const ZONAS_CLAVE={corredor:["lopez portillo","corredor","plaza coacalco","power center"],centro:["centro","san francisco","cabecera"],
  flores:["villa de las flores","flores","parque residencial","bosques"],heroes:["heroes","loma bonita","manzanas"],
  popular:["potrero","san rafael","olivo"],periferia:["periferia","norte","habitacional"]};
function interpretarLocal(texto){
  const t=sinAcentos(texto), r={}, entendido=[];
  // Giro: nombre exacto del catálogo, o palabra clave
  let mejor=null;
  for(const [k,g] of Object.entries(GIROS)){
    const palabras=sinAcentos(g.n).split(/[^a-z]+/).filter(w=>w.length>4);
    const pts=palabras.filter(w=>t.includes(w.slice(0,Math.max(5,w.length-2)))).length;
    if(pts&&(!mejor||pts>mejor.pts)) mejor={k,pts};
  }
  if(mejor){ r.giro=mejor.k; entendido.push("giro: "+GIROS[mejor.k].n); }
  for(const [k,cs] of Object.entries(ZONAS_CLAVE)) if(cs.some(c=>t.includes(c))){ r.zona=k; entendido.push("zona: "+ZONAS[k].n); break; }
  const num=(campo,claves,et,fmt)=>{const v=cerca(t,claves); if(v!=null&&isFinite(v)){r[campo]=v; entendido.push(et+": "+(fmt?fmt(v):v));}};
  num("clientes",["clientes al dia","clientes diarios","clientes por dia","clientes","personas al dia","ventas al dia"],"clientes/día");
  num("ticket",["ticket","por cliente","cada cliente gasta","consumo promedio","precio promedio"],"ticket",v=>mxn.format(v));
  num("inversion",["inversion","invertir","capital inicial","presupuesto"],"inversión",v=>mxn.format(v));
  num("renta",["renta","alquiler"],"renta",v=>mxn.format(v));
  num("empleados",["empleados","trabajadores","ayudantes","personas trabajando"],"empleados");
  num("costoEmpleado",["sueldo","salario","pago por empleado"],"sueldo por empleado",v=>mxn.format(v));
  num("superficie",["metros cuadrados","m2","metros"],"superficie (m²)");
  num("credito",["% de credito","por ciento de credito","financiado","credito","prestamo"],"% a crédito");
  num("tasa",["tasa","interes"],"tasa anual %");
  const anios=/(\d+)\s*anos? de experiencia|experiencia de (\d+)\s*anos?/.exec(t);
  if(anios){const a=+(anios[1]||anios[2]); r.experiencia=a>5?"0.30":a>=3?"0.15":a>=1?"0":"-0.25"; entendido.push("experiencia: "+a+" años");}
  else if(/sin experiencia|nunca he|primera vez/.test(t)){r.experiencia="-0.25"; entendido.push("experiencia: ninguna");}
  const dias=/(\d)\s*dias (?:a la|por) semana|abro (\d) dias/.exec(t); if(dias){r.dias=String(Math.min(7,Math.max(5,+(dias[1]||dias[2])))); entendido.push("días/semana: "+r.dias);}
  if(/local propio|es mio|propiedad propia|sin renta/.test(t)){r.local="propio"; entendido.push("local propio");}
  if(/mucha competencia|muy competido|saturad/.test(t)){r.competencia="-0.20"; entendido.push("competencia alta");}
  else if(/poca competencia|sin competencia|no hay competencia/.test(t)){r.competencia="0.15"; entendido.push("competencia baja");}
  if(/informal|sin factura|sin registro/.test(t)){r.formalidad="-0.13"; entendido.push("operación informal");}
  if(/cobro de piso|extorsi|me cobran cuota|derecho de piso/.test(t)){r.extorsion="-0.45"; entendido.push("riesgo de extorsión en la zona");}
  if(/por necesidad|me quede sin (trabajo|empleo)|me corrieron|desemplead/.test(t)){r.motivacion="-0.10"; entendido.push("emprende por necesidad");}
  if(/estres|agotad|cansad|ansiedad/.test(t)){r.resiliencia="-0.15"; entendido.push("desgaste emocional");}
  if(/redes sociales|facebook|instagram|tiktok|publicidad/.test(t)){r.marketing=/pauta|anuncio|publicidad pagada|whatsapp business/.test(t)?"0.12":"0.05"; entendido.push("marketing en redes");}
  const reserva=/(\d+)\s*meses? de (?:reserva|gastos|ahorro)/.exec(t);
  if(reserva){const m=+reserva[1]; r.reserva=m>12?"0.35":m>=6?"0.20":m>=3?"0":"-0.30"; entendido.push("reserva: "+m+" meses");}
  return {r, entendido};
}
/* Aplica lo interpretado a los controles reales del simulador (con sus límites). */
function aplicarInterpretacion(r){
  const fija=(id,v)=>{const c=$(id); if(c!=null&&v!=null){ c.value=String(v); }};
  if(r.giro&&GIROS[r.giro]){ $("giro").value=r.giro; $("giro").dispatchEvent(new Event("change")); }
  if(r.zona&&ZONAS[r.zona]) $("zona").value=r.zona;
  fija("clientes",r.clientes!=null?Math.round(r.clientes):null); fija("ticket",r.ticket!=null?Math.round(r.ticket):null);
  fija("inversion",r.inversion!=null?Math.round(r.inversion/10000)*10000:null); fija("renta",r.renta!=null?Math.round(r.renta):null);
  fija("empleados",r.empleados); fija("costoEmpleado",r.costoEmpleado); fija("superficie",r.superficie);
  fija("credito",r.credito!=null?Math.round(r.credito/5)*5:null); fija("tasa",r.tasa);
  ["experiencia","dias","local","competencia","formalidad","marketing","reserva","extorsion","motivacion","resiliencia"].forEach(k=>{ if(r[k]!=null&&[...$(k).options].some(o=>o.value===String(r[k]))) $(k).value=String(r[k]); });
  ["inversion","credito","cvar","merma"].forEach(id=>$(id).dispatchEvent(new Event("input")));
  calcular();
}
/* IA del proyecto (Gemini) a través del intermediario de COATL (servicios/ia, Vercel).
   La clave es del proyecto y vive en el servidor: el visitante no necesita ninguna.
   IA_URL la inyecta el build; fuera del sitio publicado (pruebas, copia local) la IA se activa con ?ia=1. */
const IA_URL="https://coatl-ia.vercel.app/api/coatl";
const IA_ACTIVA=!!IA_URL && (location.hostname.endsWith("github.io") || new URLSearchParams(location.search).has("ia"));
async function iaProyecto(modo, texto, contexto){
  let r;
  try{ r=await fetch(IA_URL,{method:"POST", signal:AbortSignal.timeout(30000), headers:{"Content-Type":"application/json"},
    body:JSON.stringify({modo, texto, contexto})}); }
  catch(e){ throw new Error(e.name==="TimeoutError"?"tardó demasiado; revisa tu conexión":"sin conexión con el servicio de IA"); }
  const j=await r.json().catch(()=>({}));
  if(!r.ok) throw Object.assign(new Error(j.error||"error "+r.status),{status:r.status});
  return String(j.texto||"");
}
/* Intérprete con Gemini: JSON pedido en las instrucciones y validado aquí (deJSON) antes de tocar el simulador. */
const CLAVES_ESCENARIO=["giro","zona","clientes","ticket","inversion","renta","empleados","costoEmpleado","superficie","credito","tasa","experiencia_anios","resumen"];
async function interpretarIA(texto){
  const catalogo="Giros válidos: "+Object.entries(GIROS).map(([k,g])=>k+"="+g.n).join("; ")+". Zonas válidas: "+Object.entries(ZONAS).map(([k,z])=>k+"="+z.n).join("; ")+
    ". Claves del JSON: "+CLAVES_ESCENARIO.join(", ")+".";
  const t=await iaProyecto("interprete", texto, catalogo);
  const m=/\{[\s\S]*\}/.exec(t); if(!m) throw new Error("la IA no devolvió datos");
  return deJSON(JSON.parse(m[0]));
}
// Sin esquema estricto el JSON puede traer tipos raros: solo se aceptan textos en giro/zona y números finitos en lo demás.
function deJSON(j){
  const r={}, entendido=[];
  for(const k of ["giro","zona","clientes","ticket","inversion","renta","empleados","costoEmpleado","superficie","credito","tasa"]){
    const ok=k==="giro"||k==="zona"? typeof j[k]==="string" : Number.isFinite(j[k]);
    if(ok){ r[k]=j[k]; entendido.push(k+": "+j[k]); } }
  if(Number.isFinite(j.experiencia_anios)){const a=j.experiencia_anios; r.experiencia=a>5?"0.30":a>=3?"0.15":a>=1?"0":"-0.25";}
  return {r, entendido, resumen:typeof j.resumen==="string"?j.resumen:""};
}
async function interpretarYAplicar(){
  const texto=$("descTexto").value.trim();
  if(!texto){ estadoWidget("wDescribir","vacio","Escribe o dicta cómo es tu negocio."); return; }
  estadoWidget("wDescribir","cargando", IA_ACTIVA?"La IA de COATL está interpretando tu descripción…":"Interpretando…");
  let res, conIA=IA_ACTIVA, aviso="";
  if(IA_ACTIVA){
    try{ res=await interpretarIA(texto); }
    catch(err){ console.warn(err); conIA=false; aviso="La IA no respondió ("+err.message+"); usé el intérprete local. "; }
  }
  if(!res || !res.entendido.length){ res=interpretarLocal(texto); conIA=false; }   // respaldo: reglas locales
  if(!res.entendido.length){ estadoWidget("wDescribir","vacio",aviso+"No identifiqué datos concretos. Prueba con cifras: «cafetería en Los Héroes, 70 clientes al día, ticket de 90 pesos, renta de 8 mil»."); return; }
  aplicarInterpretacion(res.r);
  $("descEntendido").innerHTML='<p class="desc-resumen">'+(res.resumen?esc(res.resumen)+" ":"")+'Ajusté:</p><ul>'+res.entendido.map(x=>"<li>"+esc(x)+"</li>").join("")+"</ul>";
  estadoWidget("wDescribir","listo", aviso+"Simulador actualizado"+(conIA?" con la IA de COATL (Gemini).":" con el intérprete local.")+" Revisa y corrige cualquier campo en las pestañas.");
}
$("descAplicar").addEventListener("click",interpretarYAplicar);
$("descModo").textContent=IA_ACTIVA?"Intérprete: IA de COATL (Gemini) · respaldo local sin conexión":"Intérprete: local, sin conexión";
/* Voz (Web Speech API) */
(function voz(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition, b=$("descVoz");
  if(!SR){ b.disabled=true; b.title="Tu navegador no permite dictado; escribe la descripción."; b.querySelector("span").textContent="Dictado no disponible"; return; }
  let rec=null, base="";
  b.addEventListener("click",()=>{
    if(rec){ rec.stop(); return; }
    rec=new SR(); rec.lang="es-MX"; rec.interimResults=true; rec.continuous=true; base=$("descTexto").value?$("descTexto").value+" ":"";
    rec.onresult=ev=>{ let txt=""; for(let i=0;i<ev.results.length;i++) txt+=ev.results[i][0].transcript; $("descTexto").value=base+txt; };
    rec.onerror=ev=>{ estadoWidget("wDescribir","error","Dictado: "+(ev.error==="not-allowed"?"permiso de micrófono denegado.":ev.error)); };
    rec.onend=()=>{ rec=null; b.classList.remove("escuchando"); b.setAttribute("aria-pressed","false"); b.querySelector("span").textContent="Dictar"; if($("descTexto").value.trim()) interpretarYAplicar(); };
    rec.start(); b.classList.add("escuchando"); b.setAttribute("aria-pressed","true"); b.querySelector("span").textContent="Escuchando… pulsa para terminar";
  });
})();

/* ===== src/ui/paginas.js ===== */
/* ---------- 21. Páginas: cada apartado se abre como una página propia ----------
   Una sola app (index.html autocontenido) con vistas por apartado. La dirección usa el
   identificador del apartado (#simulador, #denue…), así que los enlaces de siempre siguen
   funcionando y se pueden compartir; «atrás» y «adelante» del navegador también.
   ?vista=todo muestra todo en una sola página (útil para imprimir y para las pruebas). */
const VISTAS=[
  {id:"inicio",      titulo:"Inicio",        secciones:["inicio","explorar"]},
  {id:"territorio",  titulo:"Territorio",    secciones:["contexto"]},
  {id:"denue",       titulo:"DENUE nacional",secciones:["denue"]},
  {id:"simulador",   titulo:"Simulador",     secciones:["simulador","mejora"]},
  {id:"empresas",    titulo:"Para empresas", secciones:["empresas"]},
  {id:"estrategia",  titulo:"Estrategia",    secciones:["estrategia"]},
  {id:"metodologia", titulo:"Metodología",   secciones:["metodologia","trazabilidad","lectura"]},
  {id:"legal",       titulo:"Aviso legal",   secciones:["legal"]}
];
const TODO=new URLSearchParams(location.search).get("vista")==="todo";
const TITULO_BASE=document.title;
let vistaActual=null;
/* Pestañas dentro del proyecto: cada apartado que abres queda como pestaña (cambiar y cerrar,
   como en un navegador). La lista dura lo que la sesión de esta ventana. */
let abiertas=[]; try{ abiertas=JSON.parse(sessionStorage.getItem('coatl-pestanas'))||[]; }catch(_){}
abiertas=abiertas.filter(id=>VISTAS.some(v=>v.id===id));
// La tira se pega debajo de la barra superior si esta es fija; en horizontal bajo, la barra se desplaza y la tira va arriba.
function fijarTope(){ const tira=document.getElementById('pestanasApp'), nav=document.querySelector('.nav'); if(!tira||!nav) return;
  tira.style.top=(getComputedStyle(nav).position==='sticky'?nav.offsetHeight:0)+'px'; }
window.addEventListener('resize',fijarTope);
function pintarPestanas(){
  const tira=document.getElementById('pestanasApp'); if(!tira) return;
  fijarTope();
  try{ sessionStorage.setItem('coatl-pestanas',JSON.stringify(abiertas)); }catch(_){}
  tira.innerHTML=abiertas.map(id=>{const v=VISTAS.find(x=>x.id===id), act=id===vistaActual;
    return '<div class="pa-tab'+(act?' activa':'')+'" data-id="'+id+'"><button type="button" class="pa-mover" data-mover="'+id+'" aria-label="Mover la pestaña '+v.titulo+' (flechas izquierda y derecha, o arrastrar)" title="Arrastra para cambiar el orden">⠿</button><a href="#'+id+'"'+(act?' aria-current="page"':'')+'>'+v.titulo+'</a>'+
      '<button type="button" data-cerrar="'+id+'" aria-label="Cerrar la pestaña '+v.titulo+'">✕</button></div>';}).join('');
  const act=tira.querySelector('.activa'); if(act) tira.scrollLeft=act.offsetLeft-tira.clientWidth/2+act.offsetWidth/2;
}
/* Reordenar pestañas: arrastrar el asa ⠿ (ratón o dedo, pointer events) o flechas ←/→ con el asa enfocada.
   El orden se guarda en la sesión junto con la lista. */
function moverPestana(id, destino){
  const i=abiertas.indexOf(id); if(i<0) return;
  destino=Math.max(0,Math.min(abiertas.length-1,destino)); if(destino===i){ pintarPestanas(); return; }
  abiertas.splice(i,1); abiertas.splice(destino,0,id); pintarPestanas();
  document.querySelector('[data-mover="'+id+'"]')?.focus();
  const aviso=$("avisoPestanas"); if(aviso) aviso.textContent=VISTAS.find(v=>v.id===id).titulo+": posición "+(destino+1)+" de "+abiertas.length;
}
(function arrastrePestanas(){
  const tira=$("pestanasApp"); if(!tira) return;
  let arr=null;
  const destinoEn=x=>[...tira.querySelectorAll(".pa-tab")].filter(t=>t!==arr.el).filter(t=>{const r=t.getBoundingClientRect(); return x>r.left+r.width/2;}).length;
  tira.addEventListener("pointerdown",ev=>{
    const h=ev.target.closest("[data-mover]"); if(!h) return;
    ev.preventDefault(); h.setPointerCapture(ev.pointerId);
    arr={id:h.dataset.mover, x0:ev.clientX, el:h.closest(".pa-tab")}; arr.el.classList.add("arrastrando");
  });
  tira.addEventListener("pointermove",ev=>{
    if(!arr) return; arr.el.style.transform="translateX("+(ev.clientX-arr.x0)+"px)";
    const d=destinoEn(ev.clientX); tira.querySelectorAll(".pa-tab").forEach(t=>t.classList.remove("destino"));
    const otros=[...tira.querySelectorAll(".pa-tab")].filter(t=>t!==arr.el); (otros[d]||otros[otros.length-1])?.classList.add("destino");
  });
  const soltar=ev=>{ if(!arr) return; const {id}=arr, d=ev.type==="pointerup"?destinoEn(ev.clientX):abiertas.indexOf(id); arr=null; moverPestana(id,d); };
  tira.addEventListener("pointerup",soltar); tira.addEventListener("pointercancel",soltar);
  tira.addEventListener("keydown",ev=>{
    const h=ev.target.closest("[data-mover]"); if(!h) return;
    const i=abiertas.indexOf(h.dataset.mover);
    if(ev.key==="ArrowLeft"){ ev.preventDefault(); moverPestana(h.dataset.mover,i-1); }
    else if(ev.key==="ArrowRight"){ ev.preventDefault(); moverPestana(h.dataset.mover,i+1); }
  });
})();
document.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-cerrar]'); if(!b) return;
  const id=b.dataset.cerrar, i=abiertas.indexOf(id); abiertas.splice(i,1);
  if(id===vistaActual) irA(abiertas[Math.min(i,abiertas.length-1)]||'inicio'); else pintarPestanas();
});
VISTAS.forEach(v=>v.secciones.forEach(s=>{const el=$(s); if(el) el.dataset.pagina=v.id}));
function vistaDe(id){
  const directa=VISTAS.find(v=>v.id===id); if(directa) return directa;   // «#territorio» no es id de ningún elemento
  const el=id&&document.getElementById(id);
  const sec=el&&el.closest("[data-pagina]");
  return sec?VISTAS.find(v=>v.id===sec.dataset.pagina):null;
}
function mostrarVista(v, destino, desplazar){
  if(TODO){ if(destino&&desplazar) destino.scrollIntoView({behavior:reduceMov()?"auto":"smooth"}); return; }
  const cambio=vistaActual!==v.id;
  vistaActual=v.id;
  if(!abiertas.includes(v.id)) abiertas.push(v.id);
  pintarPestanas();
  document.querySelectorAll("[data-pagina]").forEach(s=>{ s.hidden=s.dataset.pagina!==v.id; });
  document.querySelectorAll(".nav-links a[data-vista]").forEach(a=>{
    const activo=a.dataset.vista===v.id; a.classList.toggle("activa",activo);
    if(activo) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current");
  });
  document.title=(v.id==="inicio"?"":v.titulo+" · ")+TITULO_BASE;
  if(cambio){
    document.body.classList.remove("vista-entra"); void document.body.offsetWidth; document.body.classList.add("vista-entra");
    window.dispatchEvent(new Event("resize"));             // gráficas y mapa recalculan su tamaño
    if(typeof mapaL!=="undefined"&&mapaL&&mapaL.invalidateSize) setTimeout(()=>mapaL.invalidateSize(),60);
  }
  if(desplazar){
    if(destino&&destino.dataset.pagina!==v.id&&!v.secciones.includes(destino.id)) destino.scrollIntoView({behavior:"auto"});
    else window.scrollTo({top:0,behavior:"auto"});
  }
}
function enrutar(desplazar, hash){
  let h=""; try{ h=decodeURIComponent((hash==null?location.hash:hash).slice(1)); }catch(_){}
  if(/(^|&)[er]=/.test(h)){ mostrarVista(VISTAS.find(v=>v.id==="simulador"),null,false); return; }   // escenario compartido
  const v=vistaDe(h)||VISTAS[0];
  mostrarVista(v, h?document.getElementById(h):null, desplazar);
}
/* Navegar a un apartado desde el código (botones «Abrir el simulador», etc.). */
function irA(id){
  if(location.hash==="#"+id) enrutar(true);
  else location.hash=id;
}
/* Se enruta con la dirección de CADA evento (newURL): si dos navegaciones llegan seguidas, location.hash
   ya vale la última cuando se atiende la primera y la página intermedia perdía su pestaña. */
window.addEventListener("hashchange",ev=>{ let h=null; try{ h=new URL(ev.newURL).hash; }catch(_){} enrutar(true,h); });
if(TODO) document.body.classList.add("vista-todo");
enrutar(false);

/* ===== src/ui/asistente.js ===== */
/* ---------- 25. Asistente COATL: siempre disponible (esquina inferior derecha) ----------
   Responde con el MISMO motor del simulador: estado actual, mejor zona, palancas (FODA),
   ajustes por texto o voz (intérprete local) y navegación. Las preguntas libres las responde
   la IA de COATL (Gemini, clave del proyecto en el servidor; ver describir.js e iaProyecto). */
(function asistente(){
  const caja=document.createElement("div"); caja.className="asis"; caja.id="asistente";
  caja.innerHTML='<button type="button" class="asis-boton" id="asisAbrir" aria-expanded="false" aria-controls="asisPanel" aria-label="Abrir el asistente COATL"><svg class="asis-icono" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M9 4h30a6 6 0 0 1 6 6v21a6 6 0 0 1-6 6H21l-10 8 2.4-8H9a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6z" fill="#FBF6F3"/><circle cx="14" cy="15" r="3.6" fill="#C8102E"/><circle cx="24" cy="15" r="3.6" fill="#C8102E"/><circle cx="34" cy="15" r="3.6" fill="#C8102E"/><path d="M8 31h4v-7h8v5h-4m4 2h4v-7h8v5h-4m4 2h4v-7h4" fill="none" stroke="#C8102E" stroke-width="2.4" stroke-linejoin="miter"/></svg><b>Asistente</b></button>'+
    '<section class="asis-panel" id="asisPanel" role="dialog" aria-label="Asistente COATL" hidden>'+
      '<header class="asis-cab"><strong>Asistente COATL</strong><span id="asisModo">'+(IA_ACTIVA?"IA de COATL · Gemini":"local · sin conexión")+'</span><button type="button" class="asis-cerrar" id="asisCerrar" aria-label="Cerrar el asistente">✕</button></header>'+
      '<div class="asis-log" id="asisLog" aria-live="polite"></div>'+
      '<div class="asis-chips" id="asisChips">'+["¿Cómo voy?","¿Qué zona me conviene?","¿Cómo subo mi probabilidad?","Abrir el DENUE"].map(c=>'<button type="button">'+c+'</button>').join("")+'</div>'+
      '<form class="asis-forma" id="asisForma"><label class="sr-only" for="asisTexto">Escribe al asistente</label>'+
        '<input id="asisTexto" autocomplete="off" placeholder="Ej.: farmacia en el Centro con 90 clientes al día">'+
        '<button type="button" class="asis-voz" id="asisVoz" aria-pressed="false" aria-label="Dictar por voz"><img class="ico-mic" src="assets/img/iconos/microfono.webp" alt="" width="149" height="192"></button>'+
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

/* ===== src/ui/escena25.js ===== */
/* ---------- 27. Modelo 2.5D del negocio (SVG isométrico, sin WebGL) ----------
   Función pura: mismos datos => mismo dibujo. Solo atributos de presentación y clases (la CSP no
   admite style=""). Las animaciones viven en estilos-explorar.css (clases e25-*).
   Ilustración generada con apoyo de Codex (GPT) a partir de un encargo del equipo y revisada
   por el equipo: paleta, greca y niveles de solidez de COATL. */
function escenaNegocio(o) {
  o = o && typeof o === "object" ? o : {};
  const C = {
    rojo: "#C8102E", granate: "#7A0C1F", hueso: "#FBF6F3", tinta: "#2A0A0F",
    rosa: "#F4E2E1", medio: "#E9B9BE", claro: "#FFC9CF", verde: "#1F7A4D",
    ambar: "#D9902F", gris: "#6B5457", piedra: "#B9A6A8"
  };
  const categorias = {
    alimentos: "alimentos", comercio: "comercio", servicios: "servicios",
    salud: "salud", educacion: "educación", taller: "taller"
  };
  const zonas = {
    corredor: "corredor con avenida y paradero", centro: "centro con plaza y kiosco",
    residencial: "zona residencial con árboles y casas", popular: "calle popular con puestos",
    periferia: "periferia con lote y campo"
  };
  const tiene = (obj, clave) => Object.prototype.hasOwnProperty.call(obj, clave);
  const categoria = tiene(categorias, o.categoria) ? o.categoria : "comercio";
  const zona = tiene(zonas, o.zona) ? o.zona : "residencial";
  const numero = (v, defecto, min, max) =>
    Math.max(min, Math.min(max, typeof v === "number" && Number.isFinite(v) ? v : defecto));
  const m2 = numero(o.m2, 80, 20, 400);
  const empleados = Math.round(numero(o.empleados, 2, 0, 12));
  const clientes = Math.round(numero(o.clientes, 35, 0, Number.MAX_SAFE_INTEGER));
  const nivel = Math.round(numero(o.nivel, 0, 0, 5));
  const limpio = Array.from(typeof o.nombre === "string" ? o.nombre.normalize("NFC") : "Mi negocio")
    .filter(c => {
      const n = c.codePointAt(0);
      return n === 9 || n === 10 || n === 13 || (n >= 32 && n <= 55295) ||
        (n >= 57344 && n <= 65533) || (n >= 65536 && n <= 1114111);
    }).join("").replace(/\s+/g, " ").trim() || "Mi negocio";
  const letras = Array.from(limpio);
  const nombre = letras.length > 22 ? letras.slice(0, 21).join("") + "…" : limpio;
  const xml = s => String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
  const r = n => String(Number(n.toFixed(1)));
  const iso = (x, y, z = 0) => [360 + x - y, 165 + (x + y) / 2 - z];
  const puntos = a => a.map(p => p.map(r).join(",")).join(" ");
  const s = [];
  const poner = t => s.push(t);
  const pol = (p, fill, extra = "") =>
    poner(`<polygon points="${puntos(p)}" fill="${fill}" ${extra}/>`);
  const suelo = (x, y, w, d, fill, z = 0, extra = "") =>
    pol([iso(x, y, z), iso(x + w, y, z), iso(x + w, y + d, z), iso(x, y + d, z)], fill, extra);
  const linea = (a, b, color, ancho = 1, extra = "") =>
    poner(`<path d="M${a.map(r).join(" ")}L${b.map(r).join(" ")}" fill="none" stroke="${color}" stroke-width="${r(ancho)}" stroke-linecap="round" ${extra}/>`);
  const elipse = (p, rx, ry, fill, extra = "") =>
    poner(`<ellipse cx="${r(p[0])}" cy="${r(p[1])}" rx="${r(rx)}" ry="${r(ry)}" fill="${fill}" ${extra}/>`);
  function caja(x, y, z, w, d, h, colores) {
    const [arriba, frente, lado] = colores;
    pol([iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)], frente);
    pol([iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)], lado);
    suelo(x, y, w, d, arriba, z + h);
  }
  function placa(x, y, z, w, h, fill, extra = "") {
    pol([iso(x, y, z), iso(x + w, y, z), iso(x + w, y, z + h), iso(x, y, z + h)], fill, extra);
  }
  function lateral(x, y, z, d, h, fill) {
    pol([iso(x, y, z), iso(x, y + d, z), iso(x, y + d, z + h), iso(x, y, z + h)], fill);
  }
  function texto(t, x, y, z, tam, color, ancho, extra = "") {
    const p = iso(x, y, z);
    poner(`<text transform="matrix(1 .5 0 1 ${r(p[0])} ${r(p[1])})" fill="${color}" font-size="${r(tam)}" text-anchor="middle"${ancho ? ` textLength="${r(ancho)}" lengthAdjust="spacingAndGlyphs"` : ""} ${extra}>${xml(t)}</text>`);
  }
  function greca(x, y, z, largo, piso) {
    let d = "";
    for (let i = 0; i + 18 <= largo; i += 18) {
      const tramo = [[0, 0], [0, 8], [6, 8], [6, 3], [12, 3], [12, 8], [18, 8], [18, 0]];
      tramo.forEach(([a, b], j) => {
        const p = iso(x + i + a, y + (piso ? b : 0), z + (piso ? 0 : b));
        d += `${j ? "L" : "M"}${p.map(r).join(" ")}`;
      });
    }
    poner(`<path class="e25-greca" d="${d}" fill="none" stroke="${piso ? C.granate : C.hueso}" stroke-width="1.6" stroke-linejoin="miter"/>`);
  }
  function persona(x, y, uniforme = false, indice = 0, escala = 1) {
    const p = iso(x, y), camisa = uniforme ? C.rojo : [C.granate, C.gris, C.rojo, C.medio][indice % 4];
    poner(`<g class="e25-persona" transform="translate(${r(p[0])} ${r(p[1])}) scale(${r(escala)})">`);
    elipse([3, 0], 8, 3, C.tinta, 'opacity=".13"');
    poner(`<path d="M-3-9L-4-1M3-9L4-1" fill="none" stroke="${C.tinta}" stroke-width="3" stroke-linecap="round"/>`);
    poner(`<rect x="-6" y="-25" width="12" height="18" rx="6" fill="${camisa}"/>`);
    poner(`<path d="M-6-20L-8-12M6-20L8-13" fill="none" stroke="${C.medio}" stroke-width="3" stroke-linecap="round"/>`);
    poner(`<circle cx="0" cy="-31" r="5.6" fill="${C.medio}"/><path d="M-5-33Q0-39 5-33" fill="${C.tinta}"/>`);
    if (uniforme) poner(`<rect x="1" y="-22" width="3" height="3" rx=".6" fill="${C.hueso}"/>`);
    poner("</g>");
  }
  function arbol(x, y, k = 1) {
    const p = iso(x, y);
    elipse([p[0] + 8, p[1] + 2], 20 * k, 8 * k, C.tinta, 'opacity=".1"');
    caja(x - 8, y - 8, 0, 16, 16, 5, [C.rosa, C.medio, C.piedra]);
    linea(iso(x, y, 4), iso(x, y, 34 * k), C.gris, 4 * k);
    elipse(iso(x, y, 40 * k), 20 * k, 23 * k, C.verde);
    elipse(iso(x - 7 * k, y, 46 * k), 12 * k, 15 * k, C.hueso, 'opacity=".13"');
  }
  function casa(x, y, w = 43, d = 34) {
    caja(x, y, 0, w, d, 32, [C.rosa, C.hueso, C.piedra]);
    caja(x - 3, y - 3, 32, w + 6, d + 6, 5, [C.medio, C.granate, C.gris]);
    placa(x + 8, y + d + .2, 0, 12, 23, C.gris);
    placa(x + w - 17, y + d + .2, 13, 10, 10, C.medio);
  }
  const [w, d, h] = m2 <= 60 ? [126, 90, 92] : m2 <= 150 ? [154, 108, 104] : [180, 128, 114];
  const bx = 62, by = 52, bf = by + d, ex = bx + w;
  const publico = clientes <= 20 ? 1 : clientes <= 60 ? 3 : clientes <= 120 ? 5 : 8;
  const descripcion = `${nombre}, negocio de ${categorias[categoria]} en ${zonas[zona]}, nivel ${nivel} de madurez. Local de ${r(m2)} metros cuadrados; ${empleados} empleados, ${Math.min(6, empleados)} representados; ${clientes} clientes al día, representados por ${publico} personas en la banqueta. Ilustración conceptual; escala y afluencia visual: estimación del equipo.`;
  poner(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 480" role="img" font-family="Bricolage Grotesque, Arial, sans-serif" stroke-linejoin="round">`);
  poner(`<title>${xml(nombre)}: negocio de ${categorias[categoria]} en ${xml(zonas[zona])}, nivel ${nivel}</title><desc>${xml(descripcion)}</desc>`);
  poner(`<rect width="720" height="480" fill="${C.hueso}"/>`);
  for (const [x, y, k] of [[116, 76, 1], [572, 61, .8]]) {
    poner(`<g class="e25-nube" transform="translate(${x} ${y}) scale(${k})" fill="${C.rosa}">`);
    poner('<path d="M-36 9C-42-4-26-13-16-8C-12-30 21-29 25-9C45-14 53 11 35 15H-25Q-34 15-36 9Z"/></g>');
  }
  elipse([370, 378], 276, 68, C.granate, 'opacity=".045"');
  caja(-25, -25, -7, 330, 300, 7, [C.rosa, C.medio, C.piedra]);
  for (let x = -25; x <= 305; x += 22) linea(iso(x, -25), iso(x, 275), C.piedra, .5, 'opacity=".38"');
  for (let y = -25; y <= 275; y += 20) linea(iso(-25, y), iso(305, y), C.piedra, .5, 'opacity=".38"');
  if (zona === "periferia") {
    suelo(-22, -22, 165, 65, C.medio);
    for (let i = 0; i < 8; i++) linea(iso(-12 + i * 20, -17), iso(-12 + i * 20, 36), C.gris, .8, 'opacity=".35"');
    for (let i = 0; i < 10; i++) {
      const x = -8 + i * 14, y = 9 + i % 3 * 8;
      linea(iso(x, y), iso(x - 2, y, 5), C.verde, 1.5);
      linea(iso(x, y), iso(x + 3, y, 4), C.verde, 1.5);
    }
    caja(264, 25, 0, 3, 3, 24, [C.piedra, C.gris, C.granate]);
    placa(249, 29, 16, 32, 12, C.hueso);
    texto("LOTE", 265, 29.2, 20, 6, C.gris, 23);
  }
  if (zona === "residencial") { casa(-12, -15); casa(94, -22, 48, 30); arbol(1, 97); arbol(277, 43, .9); }
  if (zona === "centro") {
    caja(-4, 65, 0, 48, 43, 5, [C.hueso, C.piedra, C.gris]);
    for (const [x, y] of [[1, 70], [36, 70], [1, 100], [36, 100]]) caja(x, y, 5, 3, 3, 31, [C.hueso, C.medio, C.granate]);
    caja(-8, 61, 36, 56, 51, 4, [C.medio, C.rojo, C.granate]);
    pol([iso(-8, 61, 40), iso(48, 61, 40), iso(20, 86, 59)], C.rosa);
    pol([iso(48, 61, 40), iso(48, 112, 40), iso(20, 86, 59)], C.granate);
    pol([iso(-8, 112, 40), iso(48, 112, 40), iso(20, 86, 59)], C.rojo);
    arbol(274, 45, .8);
  }
  suelo(-25, 234, 330, 41, C.gris, .2);
  if (zona === "corredor") {
    for (let x = -14; x < 300; x += 39) suelo(x, 253, 22, 1.5, C.hueso, .4);
    caja(267, 139, 0, 30, 5, 9, [C.medio, C.granate, C.gris]);
    for (const x of [266, 296]) caja(x, 141, 0, 2, 2, 46, [C.piedra, C.gris, C.granate]);
    caja(262, 135, 46, 39, 18, 3, [C.rosa, C.rojo, C.granate]);
    placa(270, 153.2, 31, 22, 13, C.hueso);
    texto("PARADERO", 281, 153.4, 35, 4.5, C.granate, 19);
    poner('<g class="e25-vehiculo">');
    caja(140, 244, 4, 42, 20, 12, [C.rosa, C.rojo, C.granate]);
    caja(151, 246, 16, 22, 16, 9, [C.rosa, C.medio, C.gris]);
    for (const x of [149, 175]) elipse(iso(x, 264.3, 4), 5, 5, C.tinta);
    poner("</g>");
  }
  caja(-25, 196, .5, 330, 38, 3, [C.hueso, C.piedra, C.gris]);
  for (let x = -25; x <= 305; x += 22) linea(iso(x, 196, 3.6), iso(x, 234, 3.6), C.piedra, .6);
  if (zona === "popular") {
    for (const x of [-12, 263]) {
      caja(x, 112, 0, 33, 26, 18, [C.medio, C.hueso, C.granate]);
      caja(x - 3, 108, 38, 39, 34, 3, [C.rosa, C.rojo, C.granate]);
      for (const a of [0, 30]) linea(iso(x + a, 137), iso(x + a, 137, 39), C.gris, 1.5);
      for (let j = 0; j < 3; j++) caja(x + 3 + j * 9, 117, 18, 7, 12, 5, [C.claro, C.rojo, C.granate]);
    }
  }
  greca(-19, 264, .6, 318, true);
  if (nivel >= 4) {
    linea(iso(ex, by + 12, 1), iso(231, 14, 1), C.rojo, 2, 'stroke-dasharray="4 5"');
    caja(198, -12, 0, 64, 46, 48, [C.rosa, C.hueso, C.medio]);
    caja(195, -15, 48, 70, 52, 4, [C.medio, C.rojo, C.granate]);
    placa(205, 34.3, 3, 21, 24, C.gris);
    placa(202, 34.4, 31, 56, 12, C.granate);
    texto("SUCURSAL 02", 230, 34.6, 34, 6, C.hueso, 49);
  }
  const huella = [iso(bx, by), iso(ex, by), iso(ex, bf), iso(bx, bf)];
  pol(huella.map(([x, y]) => [x + 23, y + 12]), C.tinta, 'opacity=".12"');
  caja(bx, by, 0, w, d, h, [C.rosa, C.hueso, C.medio]);
  caja(bx - 2, by - 2, h, w + 4, d + 4, 4, [C.hueso, C.piedra, C.gris]);
  lateral(ex + .2, by + 16, 27, d - 35, 39, C.granate);
  lateral(ex + .4, by + 20, 31, d - 43, 31, C.piedra);
  for (let j = 1; j < 4; j++) linea(iso(ex + .6, by + 20 + (d - 43) * j / 4, 31), iso(ex + .6, by + 20 + (d - 43) * j / 4, 62), C.hueso, 1.5);
  placa(bx + 13, bf + .3, 5, w - 26, h - 37, C.granate);
  placa(bx + 17, bf + .5, 8, w - 34, h - 44, C.tinta);
  placa(bx + 13, bf + .8, h - 51, w - 26, 19, C.piedra);
  for (let z = h - 49; z < h - 32; z += 3) linea(iso(bx + 14, bf + 1, z), iso(ex - 14, bf + 1, z), C.gris, .7);
  linea(iso(bx + 13, bf + 1, 5), iso(bx + 13, bf + 1, h - 32), C.gris, 2);
  linea(iso(ex - 13, bf + 1, 5), iso(ex - 13, bf + 1, h - 32), C.gris, 2);
  for (let i = 0, n = Math.min(6, empleados); i < n; i++)
    persona(bx + 26 + i * (w - 52) / Math.max(1, n - 1), bf + 2, nivel >= 4, i, .8);
  placa(bx + 7, bf + 1.2, h - 27, w - 14, 21, nivel >= 2 ? C.granate : C.rojo);
  texto(nombre, bx + w / 2, bf + 1.5, h - 20, 10, C.hueso, Math.min(w - 25, Array.from(nombre).length * 6), 'font-weight="700"');
  if (nivel >= 1) {
    caja(bx - 5, bf - 4, h - 36, w + 10, 25, 4, [C.rojo, C.rojo, C.granate]);
    for (let x = bx - 5; x < ex + 5; x += 22) suelo(x, bf - 4, Math.min(10, ex + 5 - x), 25, C.rosa, h - 31.8);
    placa(bx - 5, bf + 21.2, h - 42, w + 10, 10, C.granate);
    greca(bx - 3, bf + 21.5, h - 41, w + 6, false);
    caja(bx + 16, bf + 5, 0, w - 32, 13, 20, [C.rosa, C.rojo, C.granate]);
    caja(bx + 13, bf + 3, 20, w - 26, 17, 3, [C.hueso, C.medio, C.gris]);
    placa(bx - 8, bf + 29, 4, 23, 29, C.gris, `stroke="${C.granate}" stroke-width="2"`);
    texto("PRECIOS", bx + 3.5, bf + 29.3, 25, 4.5, C.hueso, 18);
    texto("CONSULTA", bx + 3.5, bf + 29.3, 17, 4, C.hueso, 17);
    texto("AQUÍ", bx + 3.5, bf + 29.3, 10, 5, C.hueso, 12);
  }
  if (nivel >= 2) {
    linea(iso(bx + 11, bf + 2, h - 8), iso(ex - 11, bf + 2, h - 8), C.ambar, 2, 'class="e25-luz"');
    caja(ex - 42, bf + 10, 23, 13, 8, 5, [C.gris, C.granate, C.tinta]);
    placa(ex - 40, bf + 18.2, 25, 9, 5, C.rosa);
    placa(ex - 27, bf + 1.8, 30, 19, 15, C.medio);
    texto("NEGOCIO", ex - 17.5, bf + 2, 39, 3.2, C.granate, 16);
    texto("FORMAL", ex - 17.5, bf + 2, 33, 3.5, C.granate, 15);
    caja(ex - 6, bf - 2, h - 8, 9, 5, 5, [C.hueso, C.gris, C.tinta]);
    elipse(iso(ex + 3, bf + 3.3, h - 5.5), 1.8, 1.8, C.tinta);
  }
  if (nivel >= 3) {
    caja(bx + 15, by + 8, h + 4, w * .64, d * .56, 46, [C.hueso, C.rosa, C.medio]);
    caja(bx + 12, by + 5, h + 50, w * .64 + 6, d * .56 + 6, 3, [C.hueso, C.rojo, C.granate]);
    placa(bx + 24, by + 8 + d * .56 + .3, h + 17, w * .64 - 18, 21, C.granate);
    for (let i = 1; i < 4; i++) linea(iso(bx + 24 + (w * .64 - 18) * i / 4, by + 8 + d * .56 + .5, h + 17), iso(bx + 24 + (w * .64 - 18) * i / 4, by + 8 + d * .56 + .5, h + 38), C.medio, 2);
    lateral(ex + .8, by + 24, 30, 35, 29, C.tinta);
    for (let i = 0; i < 4; i++) lateral(ex + 1, by + 29 + i * 7, 34, 4, 6 + i * 4, C.claro);
    poner('<g class="e25-vehiculo">');
    for (const x of [ex + 4, ex + 30]) { elipse(iso(x, bf + 21, 6), 7, 7, C.tinta); elipse(iso(x, bf + 21, 6), 3, 3, C.piedra); }
    caja(ex + 4, bf + 13, 10, 24, 9, 8, [C.rojo, C.rojo, C.granate]);
    caja(ex + 1, bf + 10, 18, 13, 13, 12, [C.hueso, C.medio, C.granate]);
    linea(iso(ex + 28, bf + 19, 7), iso(ex + 24, bf + 19, 27), C.gris, 2);
    linea(iso(ex + 20, bf + 19, 27), iso(ex + 28, bf + 19, 27), C.tinta, 2);
    poner("</g>");
  }
  if (nivel >= 5) {
    for (let i = 0; i < 2; i++) {
      caja(bx + 20 + i * 29, by + 13, h + 53, 25, 22, 3, [C.gris, C.granate, C.tinta]);
      for (let j = 1; j < 3; j++) linea(iso(bx + 20 + i * 29 + j * 8, by + 13, h + 56.2), iso(bx + 20 + i * 29 + j * 8, by + 35, h + 56.2), C.piedra, .8);
      linea(iso(bx + 20 + i * 29, by + 24, h + 56.2), iso(bx + 45 + i * 29, by + 24, h + 56.2), C.piedra, .8);
    }
    lateral(ex + 1, bf - 29, 9, 24, 55, C.gris);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++)
      elipse(iso(ex + 1.5, bf - 25 + j * 8, 15 + i * 10), 4.5, 3.2, C.verde);
    const a = iso(bx + 14, by + 13, h + 80), b = iso(bx - 1, by + 13, h + 69), c = iso(bx + 27, by + 13, h + 66);
    linea(iso(bx + 14, by + 13, h + 53), a, C.gris, 2);
    linea(a, b, C.rojo, 1.4); linea(b, c, C.rojo, 1.4); linea(c, a, C.rojo, 1.4);
    for (const p of [a, b, c]) elipse(p, 3, 3, C.rojo, `stroke="${C.hueso}" stroke-width="1"`);
    linea(iso(ex - 5, bf - 6, h + 4), iso(ex - 5, bf - 6, h + 43), C.gris, 1.8);
    placa(ex - 5, bf - 6, h + 24, 22, 17, C.rojo);
    texto("MX", ex + 6, bf - 5.8, h + 29, 7, C.hueso, 14, 'font-weight="700"');
  }
  const ox = bx + w * .55, oy = nivel >= 3 ? by + d * .48 : by + d * .42;
  const oz = h + (nivel >= 3 ? 56 : 7), op = iso(ox, oy, oz);
  poner('<g class="e25-flota">');
  caja(ox - 18, oy - 13, oz - 3, 36, 26, 3, [C.hueso, C.medio, C.gris]);
  if (categoria === "alimentos") {
    poner(`<path d="M${r(op[0] + 11)} ${r(op[1] - 22)}c20-1 19 20 0 17" fill="none" stroke="${C.granate}" stroke-width="5"/>`);
    poner(`<path d="M${r(op[0] - 14)} ${r(op[1] - 26)}v18c0 12 28 12 28 0v-18Z" fill="${C.rojo}"/>`);
    elipse([op[0], op[1] - 26], 14, 7, C.rosa);
    elipse([op[0], op[1] - 26], 10, 4.5, C.granate);
    for (const dx of [-6, 5]) poner(`<path class="e25-humo" d="M${r(op[0] + dx)} ${r(op[1] - 35)}c-7-7 7-10 0-18" fill="none" stroke="${C.piedra}" stroke-width="2" stroke-linecap="round"/>`);
  } else if (categoria === "comercio") {
    caja(ox - 13, oy - 8, oz, 18, 15, 22, [C.rosa, C.rojo, C.granate]);
    caja(ox + 4, oy - 2, oz, 12, 12, 15, [C.hueso, C.medio, C.granate]);
    for (const [x, y, z] of [[ox - 4, oy + 7, oz + 22], [ox + 10, oy + 10, oz + 15]]) {
      const p = iso(x, y, z);
      poner(`<path d="M${r(p[0] - 4)} ${r(p[1])}v-5q4-7 8 4v5" fill="none" stroke="${C.granate}" stroke-width="1.8"/>`);
    }
  } else if (categoria === "educacion") {
    caja(ox - 19, oy - 11, oz, 38, 24, 5, [C.rojo, C.rosa, C.granate]);
    pol([iso(ox - 17, oy - 9, oz + 6), iso(ox, oy - 9, oz + 12), iso(ox, oy + 11, oz + 12), iso(ox - 17, oy + 11, oz + 6)], C.hueso);
    pol([iso(ox, oy - 9, oz + 12), iso(ox + 17, oy - 9, oz + 6), iso(ox + 17, oy + 11, oz + 6), iso(ox, oy + 11, oz + 12)], C.rosa);
    for (let i = 0; i < 3; i++) linea(iso(ox + 4, oy - 4 + i * 5, oz + 10.6), iso(ox + 14, oy - 4 + i * 5, oz + 7.1), C.piedra, .8);
  } else {
    const silueta = categoria === "salud" ? [[-5, 0], [5, 0], [5, 10], [15, 10], [15, 20], [5, 20], [5, 30], [-5, 30], [-5, 20], [-15, 20], [-15, 10], [-5, 10]]
      : categoria === "taller" ? [[-11, 0], [-16, 5], [2, 23], [0, 31], [6, 37], [13, 38], [7, 31], [12, 26], [19, 32], [18, 24], [12, 19], [6, 19]]
      : [[-12, 3], [-8, 0], [1, 15], [13, 32], [16, 37], [10, 34], [-2, 20]];
    const frente = silueta.map(([x, z]) => iso(ox + x, oy + 3, oz + z));
    const atras = silueta.map(([x, z]) => iso(ox + x, oy - 2, oz + z));
    pol(atras, C.rosa);
    for (let i = 0; i < frente.length; i++) pol([atras[i], atras[(i + 1) % frente.length], frente[(i + 1) % frente.length], frente[i]], C.granate);
    pol(frente, categoria === "taller" ? C.gris : C.rojo);
    if (categoria === "servicios") {
      linea(iso(ox + 10, oy + 3.2, oz + 3), iso(ox - 14, oy + 3.2, oz + 35), C.gris, 5);
      for (const x of [-10, 10]) elipse(iso(ox + x, oy + 3.4, oz + 3), 5, 6, C.hueso, `stroke="${C.granate}" stroke-width="3"`);
      elipse(iso(ox, oy + 3.5, oz + 17), 2, 2, C.hueso);
    }
  }
  poner("</g>");
  for (let i = 0; i < publico; i++) persona(26 + i * 35, 214 + (i % 2) * 8, false, i + 1, .9);
  poner("</svg>");
  return s.join("");
}

/* ===== src/ui/negocios.js ===== */
/* ---------- 26. Mi negocio: nombre y negocios guardados, AISLADOS por usuario ----------
   COATL no tiene servidor ni cuentas, así que el aislamiento ocurre en el propio navegador:
   · Sin perfil: lo que guardas vive solo en ESTA pestaña (sessionStorage) y se borra al cerrarla.
   · Con perfil (usuario + clave): tus negocios se guardan CIFRADOS (AES-GCM de 256 bits; la llave se deriva
     de tu clave con PBKDF2-SHA-256, 250,000 iteraciones). En el almacenamiento solo queda un identificador
     derivado del usuario y datos ilegibles: otra persona en el mismo equipo no ve ni los nombres de tus negocios
     sin tu clave. El perfil se cierra solo tras 15 minutos sin actividad, al pulsar «Salir» o al cerrar la pestaña.
   Nada se envía a ningún servidor ni viaja en el enlace para compartir. Se guardan las variables del formulario
   y las respuestas del diagnóstico; nunca los archivos del apartado «Para empresas». */
const MAX_NEGOCIOS=20, CLAVE_SESION="coatl-negocios-sesion", PREFIJO_PERFIL="coatl-perfil-", ITER_PBKDF2=250000, INACTIVIDAD_MS=15*60*1000;
let negocioActual="", respuestasMadurez={};
let perfil=null;   // {usuario, id, llave, sal, negocios[]} mientras la sesión del perfil está abierta (solo en memoria)
let temporizadorPerfil=0;

const limpiarNombre=t=>String(t||"").replace(/\s+/g," ").trim().slice(0,60);
const valido=l=>Array.isArray(l)?l.filter(n=>n&&typeof n.nombre==="string"&&typeof n.esc==="string").slice(0,MAX_NEGOCIOS):[];
const b64=bytes=>{ let s=""; new Uint8Array(bytes).forEach(b=>{ s+=String.fromCharCode(b); }); return btoa(s); };
const deB64=t=>Uint8Array.from(atob(t),c=>c.charCodeAt(0));
const CIFRADO=!!(window.crypto&&crypto.subtle&&window.isSecureContext);

async function idDeUsuario(usuario){
  const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("coatl-perfil:"+usuario.toLowerCase()));
  return b64(h).replace(/[^A-Za-z0-9]/g,"").slice(0,24);
}
async function derivarLlave(clave,sal){
  const base=await crypto.subtle.importKey("raw",new TextEncoder().encode(clave),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",salt:sal,iterations:ITER_PBKDF2,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
async function cifrar(llave,datos){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const c=await crypto.subtle.encrypt({name:"AES-GCM",iv},llave,new TextEncoder().encode(JSON.stringify(datos)));
  return {iv:b64(iv), datos:b64(c)};
}
async function descifrar(llave,reg){
  const p=await crypto.subtle.decrypt({name:"AES-GCM",iv:deB64(reg.iv)},llave,deB64(reg.datos));
  return JSON.parse(new TextDecoder().decode(p));
}

// ---------- Almacén según el modo ----------
function leerSesion(){ try{ return valido(JSON.parse(sessionStorage.getItem(CLAVE_SESION))); }catch(_){ return []; } }
function escribirSesion(l){ try{ sessionStorage.setItem(CLAVE_SESION,JSON.stringify(l)); return true; }catch(_){ return false; } }
function leerNegocios(){ return perfil?perfil.negocios:leerSesion(); }
async function escribirNegocios(l){
  if(!perfil) return escribirSesion(l);
  try{
    const reg=await cifrar(perfil.llave,l);
    localStorage.setItem(PREFIJO_PERFIL+perfil.id,JSON.stringify({v:1,sal:b64(perfil.sal),iter:ITER_PBKDF2,...reg}));
    perfil.negocios=l; return true;
  }catch(_){ return false; }
}
/* Migración: la v11 guardaba sin usuario (clave «coatl-negocios»). Esos negocios no pueden atribuirse a nadie,
   así que se retiran del almacenamiento compartido y quedan solo en esta pestaña para que su dueño los guarde en su perfil. */
(function migrarSinUsuario(){
  try{
    const viejos=valido(JSON.parse(localStorage.getItem("coatl-negocios")));
    localStorage.removeItem("coatl-negocios");
    if(viejos.length){ const l=leerSesion(); viejos.forEach(n=>{ if(!l.some(x=>x.nombre===n.nombre)) l.push(n); }); escribirSesion(l.slice(0,MAX_NEGOCIOS));
      setTimeout(()=>avisoNegocio("Se encontraron "+viejos.length+" negocios guardados sin usuario: ahora están solo en esta pestaña. Entra a tu perfil y guárdalos ahí, o se borrarán al cerrarla."),0); }
  }catch(_){}
})();

// ---------- Interfaz ----------
function pintarPerfil(){
  const abierto=!!perfil;
  $("perfilUsuario").disabled=abierto; $("perfilClave").disabled=abierto;
  $("perfilEntrar").hidden=abierto; $("perfilSalir").hidden=!abierto;
  $("perfilEstado").textContent=abierto?"Perfil abierto: «"+perfil.usuario+"». Tus negocios se guardan cifrados en este navegador."
    :CIFRADO?"Sin perfil: lo que guardes vive solo en esta pestaña. Entra con un usuario y una clave para conservarlo en este equipo, protegido.":
    "Este navegador no permite cifrar (se necesita una conexión segura): lo que guardes vive solo en esta pestaña.";
  $("perfilEntrar").disabled=!CIFRADO;
}
function pintarListaNegocios(seleccion){
  const sel=$("negocioLista"), l=leerNegocios();
  sel.textContent="";
  const o0=document.createElement("option"); o0.value="";
  o0.textContent=l.length?"— Elige un negocio guardado ("+l.length+") —":perfil?"— Tu perfil aún no tiene negocios —":"— Ninguno en esta pestaña —"; sel.appendChild(o0);
  l.forEach(n=>{ const o=document.createElement("option"); o.value=n.nombre; o.textContent=n.nombre+(n.fecha?" · "+n.fecha:""); sel.appendChild(o); });
  sel.value=seleccion&&l.some(n=>n.nombre===seleccion)?seleccion:"";
  $("negocioEliminar").disabled=!sel.value;
}
function avisoNegocio(t){ $("negocioNota").textContent=t; }
function cambioDeNombre(){
  negocioActual=limpiarNombre($("negocioNombre").value);
  if(typeof ultimoResumen!=="undefined"&&ultimoResumen) ultimoResumen.negocio=negocioActual;
  if(typeof repintarMejora==="function") repintarMejora();
}
function reiniciarInactividad(){ clearTimeout(temporizadorPerfil); if(perfil) temporizadorPerfil=setTimeout(()=>{ cerrarPerfil(); avisoNegocio("Tu perfil se cerró tras 15 minutos sin actividad."); },INACTIVIDAD_MS); }
["pointerdown","keydown"].forEach(t=>document.addEventListener(t,()=>{ if(perfil) reiniciarInactividad(); },{passive:true}));
function cerrarPerfil(){
  perfil=null; clearTimeout(temporizadorPerfil);
  $("perfilClave").value=""; pintarPerfil(); pintarListaNegocios("");
}

async function entrarPerfil(){
  const usuario=limpiarNombre($("perfilUsuario").value).slice(0,40), clave=$("perfilClave").value;
  if(!usuario||clave.length<4){ avisoNegocio("Escribe un usuario y una clave de al menos 4 caracteres."); (usuario?$("perfilClave"):$("perfilUsuario")).focus(); return; }
  $("perfilEntrar").disabled=true; avisoNegocio("Abriendo tu perfil…");
  try{
    const id=await idDeUsuario(usuario), crudo=localStorage.getItem(PREFIJO_PERFIL+id);
    let sal, negocios=[], nuevo=false;
    if(crudo){
      const reg=JSON.parse(crudo); sal=deB64(reg.sal);
      const llave=await derivarLlave(clave,sal);
      try{ negocios=valido(await descifrar(llave,reg)); }catch(_){ avisoNegocio("Usuario o clave incorrectos."); $("perfilClave").select(); return; }
      perfil={usuario,id,llave,sal,negocios};
    }else{
      sal=crypto.getRandomValues(new Uint8Array(16)); nuevo=true;
      perfil={usuario,id,llave:await derivarLlave(clave,sal),sal,negocios:[]};
    }
    // Lo guardado en esta pestaña sin perfil se pasa al perfil (y deja de estar en la pestaña).
    const sesion=leerSesion();
    if(sesion.length){ const l=[...perfil.negocios]; sesion.forEach(n=>{ if(!l.some(x=>x.nombre===n.nombre)&&l.length<MAX_NEGOCIOS) l.push(n); }); await escribirNegocios(l); try{ sessionStorage.removeItem(CLAVE_SESION); }catch(_){} }
    else if(nuevo) await escribirNegocios([]);
    $("perfilClave").value=""; pintarPerfil(); pintarListaNegocios(""); reiniciarInactividad();
    avisoNegocio(nuevo?"Perfil nuevo creado para «"+usuario+"». Recuerda tu clave: sin ella no se pueden abrir tus negocios.":"Bienvenido, «"+usuario+"»: "+perfil.negocios.length+" negocio(s) guardado(s).");
  }catch(err){ perfil=null; avisoNegocio("No se pudo abrir el perfil en este navegador."); }
  finally{ $("perfilEntrar").disabled=!CIFRADO; }
}
$("perfilEntrar").addEventListener("click",entrarPerfil);
$("perfilClave").addEventListener("keydown",ev=>{ if(ev.key==="Enter"){ ev.preventDefault(); entrarPerfil(); } });
$("perfilSalir").addEventListener("click",()=>{ const u=perfil&&perfil.usuario; cerrarPerfil(); avisoNegocio("Saliste del perfil «"+u+"». Tus negocios siguen cifrados en este equipo."); $("perfilUsuario").focus(); });
window.addEventListener("pagehide",()=>{ perfil=null; });

$("negocioNombre").addEventListener("input",cambioDeNombre);
$("negocioGuardar").addEventListener("click",async()=>{
  const nombre=limpiarNombre($("negocioNombre").value);
  if(!nombre){ avisoNegocio("Escribe primero el nombre de tu negocio para poder guardarlo."); $("negocioNombre").focus(); return; }
  const l=[...leerNegocios()], i=l.findIndex(n=>n.nombre.toLowerCase()===nombre.toLowerCase());
  const reg={nombre, esc:serializarEscenario(), madurez:Object.assign({},respuestasMadurez), fecha:new Date().toLocaleDateString("es-MX")};
  if(i>=0) l[i]=reg; else { if(l.length>=MAX_NEGOCIOS){ avisoNegocio("Ya tienes "+MAX_NEGOCIOS+" negocios guardados: elimina uno para guardar otro."); return; } l.push(reg); }
  if(!(await escribirNegocios(l))){ avisoNegocio("Este navegador no permite guardar (modo privado o almacenamiento bloqueado). Usa «Copiar enlace» para conservar tu escenario."); return; }
  pintarListaNegocios(nombre);
  avisoNegocio("«"+nombre+"» "+(i>=0?"actualizado":"guardado")+(perfil?" en tu perfil, cifrado en este equipo.":" solo en esta pestaña: entra con tu usuario para conservarlo.")+" No se envió a ningún servidor.");
  if(typeof toast==="function") toast("Negocio guardado: "+nombre);
});
$("negocioLista").addEventListener("change",()=>{
  const n=leerNegocios().find(x=>x.nombre===$("negocioLista").value);
  $("negocioEliminar").disabled=!n;
  if(!n) return;
  $("negocioNombre").value=n.nombre; negocioActual=n.nombre;
  respuestasMadurez={};
  if(n.madurez&&typeof n.madurez==="object") for(const [k,v] of Object.entries(n.madurez)) if(v===0||v===1||v===2) respuestasMadurez[k]=v;
  if(!cargarEscenario(n.esc)) calcular();
  avisoNegocio("Cargaste «"+n.nombre+"». Los cambios que hagas no se guardan hasta que pulses «Guardar negocio».");
});
$("negocioEliminar").addEventListener("click",async()=>{
  const nombre=$("negocioLista").value; if(!nombre) return;
  await escribirNegocios(leerNegocios().filter(n=>n.nombre!==nombre));
  pintarListaNegocios("");
  avisoNegocio("«"+nombre+"» se eliminó"+(perfil?" de tu perfil.":" de esta pestaña."));
  $("negocioLista").focus();
});
pintarPerfil();
pintarListaNegocios("");

/* ===== src/ui/mejora.js ===== */
/* ---------- 28. Mejora tu negocio: alternativas, diagnóstico de 5 niveles, fiscal y modelo 2.5D ----------
   Todo sale del mismo motor: palancas() y probDe() para las alternativas, estimarFiscal() para
   los impuestos, PUNTOS_MADUREZ para los borradores y escenaNegocio() para el dibujo. */
let ultimoMejora=null, escenaModo="hoy", altPrevio=null, madurezLista=false;
const ZONA_ESCENA={corredor:"corredor",centro:"centro",flores:"residencial",heroes:"residencial",popular:"popular",periferia:"periferia"};
const CATEGORIA_GIRO={restaurante:"alimentos",pizzeria:"alimentos",cafeteria:"alimentos",jugueria:"alimentos",panaderia:"alimentos",pasteleria:"alimentos",
  farmacia:"salud",naturista:"salud",dental:"salud",optica:"salud",veterinaria:"salud",consultorio:"salud",
  taller:"taller",refaccionaria:"taller",autolavado:"taller",ferreteria:"taller",
  estetica:"servicios",spa:"servicios",lavanderia:"servicios",gimnasio:"servicios",ciber:"servicios",educacion:"educacion"};
function categoriaGiro(clave){
  if(CATEGORIA_GIRO[clave]) return CATEGORIA_GIRO[clave];
  const m=/^scian_(\d{2})/.exec(clave||"");
  if(m){ const s=m[1]; if(s==="72") return "alimentos"; if(s==="62") return "salud"; if(s==="61") return "educacion"; if(s==="81") return "servicios"; if(s>="31"&&s<="33") return "taller"; }
  return "comercio";
}
function contextoNegocio(){
  const {e,modelo,mc,fin}=ultimoMejora, nombre=negocioActual||"", d=x=>mxn.format(Math.round(x));
  const fiscal=estimarFiscal(e.ventasMes,e.utilMes,e.empleados*e.costoEmpleado);
  const res=$("reserva");
  return {e,modelo,mc,fin,fiscal,
    nombre:nombre||"Tu negocio", N:nombre?"«"+nombre+"»":"tu negocio", conNombre:!!nombre,
    giro:e.giro.n.toLowerCase(), zona:CORTOS[e.zonaKey]||e.zona.n, ticket:d(e.ticket), clientes:Math.round(e.mu),
    clientesDoble:Math.round(e.mu*2), ventasMes:d(e.ventasMes), margenPct:pct(1-e.cvEff), margenUnit:d(e.margenUnit),
    pe:isFinite(e.peDia)?Math.ceil(e.peDia):"más de los que caben hoy en tu escenario", fijos:d(e.fijos), fijos6:d(e.fijos*6), fijos12:d(e.fijos*12),
    fijosSemana:d(e.fijos/4.33), inversion:d(e.inversion), empleadosTxt:e.empleados===1?"1 empleado":e.empleados+" empleados",
    utilNum:e.utilMes, util:d(e.utilMes), utilAnual:d(e.utilMes*12), paybackNum:fin.payback,
    paybackTxt:fin.payback?fin.payback.toFixed(1)+" meses":"un plazo que hoy no se alcanza", mktGasto:d(e.mktGasto||0),
    mktZ:e.mktZ, resZ:e.resZ, formZ:e.formZ, permZ:e.permZ||0, reservaTxt:res.options[res.selectedIndex]?res.options[res.selectedIndex].text:"",
    ventasPor100:e.margenUnit>0?Math.ceil(300/e.margenUnit):"varias", m2:e.superficie, cvPct:pct(e.cvEff), credPct:pct(e.credPct),
    costoEmpleado:d(e.costoEmpleado), regimenTxt:fiscal.regimen==="resico_pf"?"RESICO de personas físicas, si cumples los requisitos":"régimen general, por tu nivel de ingresos",
    isrMes:d(fiscal.isrMes), P:pct(modelo.P), p05:d(mc.p05), merma:pct(e.merma||0), historial:typeof empresa!=="undefined"&&!!empresa};
}
function estadosMadurez(c){
  const est={};
  PUNTOS_MADUREZ.forEach(p=>{ est[p.id]=p.id in respuestasMadurez?respuestasMadurez[p.id]:(p.auto?p.auto(c):0); });
  return est;
}

/* --- Alternativas: las palancas de mayor impacto, con botón para probarlas en el formulario --- */
function pintarAlternativas(c){
  seguro("wAlternativas",()=>{
    const P0=c.modelo.P, L=palancas(c.e,P0).slice(0,4);
    if(!L.length){ $("alternativas").innerHTML=""; estadoWidget("wAlternativas","vacio","Tu escenario ya aprovecha las palancas principales del modelo. Revisa el diagnóstico de abajo."); return false; }
    $("alternativas").innerHTML=L.map(l=>'<div class="alt"><p class="alt-t">'+l.titulo+'</p><p class="alt-q">'+l.que+'</p>'+
      '<p class="alt-p">'+pct(P0)+' → <strong>'+pct(Math.max(P0,l.P))+'</strong> (+'+(l.lift*100).toFixed(1)+' pts)</p>'+
      '<button type="button" class="btn btn-widget" data-alt="'+l.clave+'"'+(l.zonaK?' data-zona="'+l.zonaK+'"':"")+'>Probar en el simulador</button></div>').join("");
  });
}
function aplicarAlternativa(clave, zonaK){
  if(!ultimoMejora) return;
  const e=ultimoMejora.e;
  altPrevio=serializarEscenario();
  const sel=(id,v)=>{ const s=$(id), o=[...s.options].reduce((m,x)=>Math.abs(+x.value-v)<Math.abs(+m.value-v)?x:m); s.value=o.value; };
  const n=(id,v)=>{ const c=$(id); c.value=String(v); c.dispatchEvent(new Event("input",{bubbles:true})); };
  if(clave==="reserva") sel("reserva",0.20);
  else if(clave==="deuda") n("credito",15);
  else if(clave==="margen") n("cvar",Math.max(30,Math.round(e.cv*100-10)));
  else if(clave==="marketing"){ sel("marketing",0.12); n("clientes",Math.round(e.muBase*1.12)); }
  else if(clave==="formalidad") sel("formalidad",0.10);
  else if(clave==="experiencia") sel("experiencia",0.15);
  else if(clave==="diferenciacion"){ sel("competencia",0); sel("marketing",Math.min(0.12,e.mktZ+0.07)); }
  else if(clave==="retencion"){ n("clientes",Math.round(e.muBase*1.07)); n("cvar",Math.max(5,Math.round(e.cv*100-1))); }
  else if(clave==="zona"&&zonaK&&ZONAS[zonaK]){ $("zona").value=zonaK; $("zona").dispatchEvent(new Event("change",{bubbles:true})); }
  calcular();
  $("altDeshacer").hidden=false; $("altDeshacer").focus();
  if(typeof toast==="function") toast("Alternativa aplicada al simulador. Puedes deshacerla.");
}
$("alternativas").addEventListener("click",ev=>{ const b=ev.target.closest("button[data-alt]"); if(b) aplicarAlternativa(b.dataset.alt,b.dataset.zona); });
$("altDeshacer").addEventListener("click",()=>{
  if(altPrevio) cargarEscenario(altPrevio);
  altPrevio=null; $("altDeshacer").hidden=true;
  const b=$("alternativas").querySelector("button"); if(b) b.focus();
});

/* --- Diagnóstico de solidez: la estructura se crea una vez; después solo cambian textos y estados --- */
function construirMadurez(){
  $("madurezNiveles").innerHTML=NIVELES_MADUREZ.map(nv=>'<details class="mad-nivel"'+(nv.n===1?" open":"")+'><summary>Nivel '+nv.n+' · '+nv.t+' <small>'+nv.s+'</small><span class="mad-pct" id="madPct'+nv.n+'"></span></summary><div class="mad-items">'+
    PUNTOS_MADUREZ.filter(p=>p.n===nv.n).map(p=>'<div class="mad-item" id="mad-'+p.id+'" data-e="0"><h3>'+p.t+'</h3><p class="mad-que">'+p.q+'</p>'+
      '<p class="mad-borrador"><b>Borrador para tu negocio</b><span id="madB-'+p.id+'"></span></p>'+
      '<label>¿Cómo vas? <select data-mad="'+p.id+'"><option value="0">Pendiente</option><option value="1">En proceso</option><option value="2">Listo</option></select></label>'+
      '<span class="mad-auto" id="madA-'+p.id+'"></span></div>').join("")+'</div></details>').join("");
  madurezLista=true;
}
function pintarMadurez(c){
  let r=null;
  seguro("wMadurez",()=>{
    if(!madurezLista) construirMadurez();
    const est=estadosMadurez(c); r=indiceMadurez(est);
    PUNTOS_MADUREZ.forEach(p=>{
      $("madB-"+p.id).textContent=p.b(c);
      const it=$("mad-"+p.id), s=it.querySelector("select");
      it.dataset.e=String(est[p.id]);
      if(document.activeElement!==s) s.value=String(est[p.id]);
      $("madA-"+p.id).textContent=(p.id in respuestasMadurez)||!est[p.id]?"":"Sugerido por tu simulador; cámbialo si no es así.";
    });
    NIVELES_MADUREZ.forEach((nv,i)=>{ $("madPct"+nv.n).textContent=Math.round(r.porNivel[i]*100)+" %"; });
    const sig=r.pendientes[0];
    $("madurezResumen").innerHTML='<div class="mad-indice">'+r.indice+'<small>solidez de 100 · nivel '+r.nivel+' de 5</small></div>'+
      '<div class="mad-barras">'+NIVELES_MADUREZ.map((nv,i)=>'<div class="mad-barra"><span>Nivel '+nv.n+'</span><progress max="100" value="'+Math.round(r.porNivel[i]*100)+'" aria-label="Nivel '+nv.n+', '+nv.t+': '+Math.round(r.porNivel[i]*100)+' por ciento"></progress><span>'+Math.round(r.porNivel[i]*100)+' %</span></div>').join("")+'</div>'+
      '<p class="mad-sig">'+(sig?'<strong>Siguiente paso:</strong> '+esc(sig.t)+' (nivel '+sig.n+'). '+esc(sig.q):'<strong>Diagnóstico completo.</strong> Revisa tus borradores cada trimestre.')+'</p>';
  });
  return r;
}
$("madurezNiveles").addEventListener("change",ev=>{
  const s=ev.target.closest("select[data-mad]"); if(!s) return;
  respuestasMadurez[s.dataset.mad]=+s.value;
  repintarMejora();
});

/* --- Fiscal y contable --- */
function pintarFiscal(c){
  seguro("wFiscal",()=>{
    const f=c.fiscal, e=c.e, d=x=>mxn.format(Math.round(x));
    const fila=(k,v,cl)=>'<tr'+(cl?' class="'+cl+'"':"")+'><th scope="row">'+k+'</th><td>'+v+'</td></tr>';
    const resico=f.regimen==="resico_pf";
    $("fiscalCuerpo").innerHTML='<table class="tabla-fiscal"><caption class="sr-only">Estimación fiscal mensual</caption><tbody>'+
      fila("Ventas del mes (ingresos sin IVA)",d(f.ventasMes))+
      fila("Utilidad antes de impuestos",d(e.utilMes))+
      fila(resico?"ISR estimado · RESICO persona física ("+(f.tasaResico*100).toFixed(1)+" % de los ingresos)":"ISR estimado · régimen general (30 % de la utilidad)","− "+d(f.isrMes))+
      fila("Utilidad después de ISR",d(f.utilDespues),"total")+
      "</tbody></table>"+
      '<p class="nota-widget">'+(resico?"Como persona moral en régimen general pagarías cerca de "+d(f.isrGeneral)+" (30 % de la utilidad).":"Tus ingresos anuales estimados ("+d(f.ingresoAnual)+") superan el tope de 3.5 millones del RESICO para personas físicas.")+
      " IVA a trasladar si todo lo que vendes causa 16 %: "+d(f.ivaTrasladado)+" al mes (lo cobras al cliente y lo enteras; no es ingreso tuyo)."+
      (f.isn>0?" Impuesto sobre nómina del Estado de México (3 %): "+d(f.isn)+" al mes, si tu costo por empleado aún no lo incluye.":"")+"</p>"+
      '<p class="fiscal-h">Lo que debes cumplir</p><ul class="fiscal-lista">'+
      "<li><strong>Alta:</strong> RFC, e.firma y buzón tributario activos; régimen fiscal elegido con tu contador.</li>"+
      "<li><strong>Facturación:</strong> CFDI por cada venta que lo solicite y factura global por el resto.</li>"+
      "<li><strong>Cada mes:</strong> declaración y pago a más tardar el día 17 del mes siguiente; aparta "+d(f.isrMes)+" para el ISR.</li>"+
      "<li><strong>Cada año:</strong> declaración anual (abril para personas físicas, marzo para personas morales).</li>"+
      (e.empleados>0?"<li><strong>Nómina:</strong> alta en el IMSS desde el primer día, cuotas de IMSS e Infonavit, recibos timbrados y aguinaldo.</li>":"")+
      "<li><strong>Contabilidad:</strong> guarda las facturas de tus gastos, separa la cuenta del negocio de la personal y concilia el banco cada mes.</li></ul>";
  });
}

/* --- Modelo 2.5D --- */
function datosEscena(c,nivel){
  return {nombre:c.nombre, categoria:categoriaGiro($("giro").value), m2:c.e.superficie, empleados:c.e.empleados,
    clientes:Math.round(c.e.mu), zona:ZONA_ESCENA[c.e.zonaKey]||"residencial", nivel};
}
function ponerEscena(cont,svg){ if(cont.dataset.svg!==svg){ cont.innerHTML=svg; cont.dataset.svg=svg; } }
function pintarEscena(c,nivelHoy){
  seguro("wEscena",()=>{
    const pot=escenaModo==="potencial";
    ponerEscena($("escenaNegocio"),escenaNegocio(datosEscena(c,pot?5:nivelHoy)));
    $("escenaHoy").setAttribute("aria-pressed",String(!pot)); $("escenaPotencial").setAttribute("aria-pressed",String(pot));
    $("escenaNota").textContent=pot
      ?"Así puede verse "+c.N+" al completar los cinco niveles: local ampliado, reparto, segunda sucursal y operación sostenible. Es una ilustración generada con tus datos, no un plano."
      :"Así se ve "+c.N+" hoy según tus datos: "+c.m2+" m², "+c.empleadosTxt+", "+c.clientes+" clientes al día y nivel de solidez "+nivelHoy+" de 5. Cada nivel que completes agrega elementos al dibujo.";
  });
}
$("escenaHoy").addEventListener("click",()=>{ escenaModo="hoy"; repintarMejora(); });
$("escenaPotencial").addEventListener("click",()=>{ escenaModo="potencial"; repintarMejora(); });

/* --- Ficha del negocio en Estrategia --- */
function pintarFicha(c,r){
  seguro("wFichaNegocio",()=>{
    const d=x=>mxn.format(Math.round(x));
    $("fichaDatos").innerHTML="<h3>"+esc(c.nombre)+"</h3><p class=\"nota-widget\">"+esc(c.e.giro.n)+" · "+esc(c.zona)+"</p>"+
      "<dl><div><dt>Probabilidad a 3 años</dt><dd>"+c.P+"</dd></div><div><dt>Solidez</dt><dd>"+r.indice+" / 100</dd></div>"+
      "<div><dt>Nivel</dt><dd>"+r.nivel+" de 5</dd></div><div><dt>Utilidad después de ISR</dt><dd>"+d(c.fiscal.utilDespues)+"</dd></div></dl>"+
      (r.pendientes.length?"<p><strong>Tus siguientes pasos</strong></p><ol>"+r.pendientes.slice(0,3).map(p=>"<li>"+esc(p.t)+" <span class=\"nota-widget\">(nivel "+p.n+")</span></li>").join("")+"</ol>":"<p><strong>Diagnóstico completo.</strong></p>");
    ponerEscena($("fichaEscena"),escenaNegocio(datosEscena(c,5)));
  });
}

function repintarMejora(){
  if(!ultimoMejora) return;
  const c=contextoNegocio();
  $("mejoraNombre").textContent=c.conNombre?"Negocio en revisión: «"+c.nombre+"».":"Ponle nombre a tu negocio al inicio del simulador para personalizar los borradores.";
  pintarAlternativas(c);
  const r=pintarMadurez(c)||indiceMadurez(estadosMadurez(c));
  pintarFiscal(c);
  pintarEscena(c,r.nivel);
  pintarFicha(c,r);
}
function pintarMejora(e,modelo,mc,fin){ ultimoMejora={e,modelo,mc,fin,v:versionCalculo}; repintarMejora(); }

/* ===== assets/vendor/qrcode-generator-1.4.4.js ===== */
//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  if (typeof define === 'function' && define.amd) {
      define([], factory);
  } else if (typeof exports === 'object') {
      module.exports = factory();
  }
}(function () {
    return qrcode;
}));

/* ===== src/ui/reporte.js ===== */
/* ---------- 29. Reportes: negocio (simulador), plan (estrategia) y reporte completo con QR ----------
   Ningún reporte es una captura del sitio: se arma un documento propio con lo relevante del negocio,
   con la paleta, la greca y las tipografías de COATL. Las gráficas se vuelven a dibujar a 3×.
   · «negocio»: indicadores, supuestos, gráficas, alternativas, solidez, fiscal y modelo 2.5D.
   · «plan»: FODA, plan priorizado, plan combinado, impacto y control, calendario de 90 días.
   · «completo»: los dos anteriores. Es el que abre el código QR en el teléfono (?reporte=1#r=…).
   El QR lleva el resultado DENTRO del enlace (fragmento #r, que el navegador no envía al servidor):
   solo viajan las variables que cambiaste, el nombre del negocio, tus respuestas del diagnóstico y
   las acciones marcadas del plan. Todo se calcula otra vez en el teléfono con el mismo motor. */
const GRAFICAS_REPORTE=[["graficaSupervivencia","Supervivencia a 10 años"],["graficaMC","Utilidad anual simulada (Monte Carlo, 2,000 años)"],
  ["graficaPE","Punto de equilibrio"],["graficaTornado","Qué mueve tu probabilidad"]];
const LOGO_SVG='<svg viewBox="0 0 38 38" aria-hidden="true"><rect width="38" height="38" rx="9" fill="#C8102E"/><path d="M8 27 v-5 h5 v-5 h5 v-5 h12 v5 h-7 v5 h-5 v5 z" fill="#fff"/><circle cx="27.5" cy="14.5" r="1.8" fill="#C8102E"/></svg>';
/* Dirección del sitio para el QR: la propia página si está publicada en cualquier dominio; si se abre en el equipo
   (localhost, 127.0.0.1 o archivo), la dirección canónica que declara la página (<link rel="canonical">), porque un
   teléfono no puede abrir «localhost». Si el sitio cambia de dominio basta con actualizar el canonical de src/index.html. */
const URL_PUBLICA=(document.querySelector('link[rel="canonical"]')||{}).href||"https://maikolv.github.io/coatl/";
const SITIO_LOCAL=location.protocol==="file:"||/^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0)$/.test(location.hostname)||/\.(local|test|localhost)$/.test(location.hostname);
const VISTA_REPORTE=new URLSearchParams(location.search).get("reporte")==="1";
const valorCampo=c=>c.type==="checkbox"?(c.checked?"1":"0"):c.value;
/* Estado inicial del formulario (escenario de referencia): el QR solo codifica lo que difiere de él. */
const FORMA_BASE=new Map(camposForma().map(c=>[c.id,valorCampo(c)]));

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
  const c=contextoNegocio(), r=ultimoResumen, e=c.e, d=x=>mxn.format(Math.round(x)), P0=c.modelo.P;
  const est=estadosMadurez(c), mad=indiceMadurez(est);
  const L=palancas(e,P0);
  const elegidas=(typeof planSel!=="undefined"&&planSel?L.filter(l=>planSel.includes(l.clave)):L.slice(0,3));
  const Pplan=pPlan(e, elegidas, P0);
  return {c, r, mad, e, L, elegidas, Pplan, foda:clasificarFODA(e,c.modelo), fac:factoresImpacto(c.modelo),
    titulo:c.nombre, sub:e.giro.n+" · "+c.zona, fecha:new Date().toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"}),
    kpis:[["Probabilidad a 3 años",pct(r.P),"rango plausible "+r.rango],["Utilidad mensual",d(r.util),"antes de impuestos"],["ROI anual",pct(r.roi),"sobre la inversión"],
      ["Recuperación",r.payback?r.payback.toFixed(1)+" meses":"—","de la inversión"],["VPN a 3 años",d(r.vpn),"valor presente neto"]],
    kpisPlan:[["Probabilidad actual",pct(P0),"rango plausible "+r.rango],["Con tu plan",pct(Pplan),elegidas.length+(elegidas.length===1?" acción marcada":" acciones marcadas")],
      ["Brecha que cierras","+"+((Pplan-P0)*100).toFixed(1)+" pts","puntos de probabilidad"],["Solidez",mad.indice+" / 100","nivel "+mad.nivel+" de 5"],
      ["Utilidad tras ISR",d(c.fiscal.utilDespues),"estimación mensual"]],
    supuestos:[["Ticket promedio",c.ticket],["Clientes por día",String(c.clientes)],["Ventas del mes",c.ventasMes],["Costo variable (con merma)",c.cvPct],
      ["Costos fijos del mes",c.fijos],["Empleados",String(e.empleados)],["Inversión inicial",c.inversion],["Financiado con crédito",c.credPct]],
    escenarios:[["Pesimista (percentil 5)",d(r.p05)],["Esperado (mediana)",d(c.mc.p50)],["Optimista (percentil 95)",d(r.p95)],
      ["Punto de equilibrio",isFinite(r.pe)?Math.ceil(r.pe)+" clientes al día":"no alcanzable"]],
    alternativas:L.slice(0,4).map(l=>[l.titulo,pct(P0)+" → "+pct(Math.max(P0,l.P))+" (+"+(l.lift*100).toFixed(1)+" pts)"]),
    fiscal:[["Ventas del mes (sin IVA)",d(c.fiscal.ventasMes)],["Utilidad antes de impuestos",d(e.utilMes)],
      [c.fiscal.regimen==="resico_pf"?"ISR estimado · RESICO ("+(c.fiscal.tasaResico*100).toFixed(1)+" %)":"ISR estimado · régimen general (30 %)","− "+d(c.fiscal.isrMes)],
      ["Utilidad después de ISR",d(c.fiscal.utilDespues)]]};
}
const tablaRep=(filas,cab)=>'<table class="rep-tabla">'+(cab?"<thead><tr>"+cab.map(t=>'<th scope="col">'+t+"</th>").join("")+"</tr></thead>":"")+"<tbody>"+
  filas.map(f=>"<tr>"+f.map((v,i)=>i?"<td>"+esc(v)+"</td>":'<th scope="row">'+esc(v)+"</th>").join("")+"</tr>").join("")+"</tbody></table>";
const cabeceraRep=(D,tipo)=>'<header class="rep-cab">'+LOGO_SVG+'<div class="rep-marca">COATL<small>ANÁLISIS TERRITORIAL · COACALCO</small></div><div class="rep-fecha">'+tipo+"<br>"+esc(D.fecha)+"</div></header>"+
  '<div class="rep-greca"></div><p class="rep-titulo">'+esc(D.titulo)+'</p><p class="rep-sub">'+esc(D.sub)+"</p>";
const kpisRep=l=>'<div class="rep-kpis">'+l.map(([k,v,n])=>'<div class="rep-kpi"><span>'+esc(k)+"</span><strong>"+esc(v)+"</strong><em>"+esc(n)+"</em></div>").join("")+"</div>";
const PIE_REP='<footer class="rep-pie">Estimaciones de un modelo educativo bajo supuestos declarados; no constituyen asesoría financiera, fiscal ni legal. La estimación fiscal es orientativa: confírmala con un contador. '+
  'El índice de solidez es una lista de verificación del equipo, no un modelo estadístico. © 2026 Miguel Antonio Cruz García, Bruno Alejandro López Bautista y Alonso Arroyo Cortés · maikolv.github.io/coatl</footer>';

function cuerpoNegocio(D,graf){
  return kpisRep(D.kpis)+
    '<div class="rep-dos"><div class="rep-bloque"><p class="rep-h">Tu escenario</p>'+tablaRep(D.supuestos)+'</div>'+
    '<div class="rep-bloque"><p class="rep-h">Un año de operación, tres escenarios</p>'+tablaRep(D.escenarios)+
    '<p class="rep-h">Estimación fiscal mensual</p>'+tablaRep(D.fiscal)+"</div></div>"+
    (graf.length?'<p class="rep-h">Gráficas del escenario</p><div class="rep-graf">'+graf.map(g=>'<figure><figcaption>'+esc(g.titulo)+'</figcaption><img alt="'+esc(g.titulo)+'" src="'+g.url+'"></figure>').join("")+"</div>":"")+
    '<div class="rep-dos"><div class="rep-bloque"><p class="rep-h">Alternativas para mejorar tu resultado</p>'+
      (D.alternativas.length?'<ol class="rep-lista">'+D.alternativas.map(([a,b])=>"<li><strong>"+a+"</strong><br>"+esc(b)+"</li>").join("")+"</ol>":"<p>El modelo no encuentra palancas con mejora significativa.</p>")+
      '<p class="rep-h">Solidez del negocio: '+D.mad.indice+" de 100 · nivel "+D.mad.nivel+" de 5</p>"+
      (D.mad.pendientes.length?'<ol class="rep-lista">'+D.mad.pendientes.slice(0,4).map(p=>"<li><strong>"+esc(p.t)+".</strong> "+esc(p.b(D.c))+"</li>").join("")+"</ol>":"<p>Diagnóstico completo.</p>")+"</div>"+
    '<div class="rep-bloque"><p class="rep-h">Lo que tu negocio puede llegar a ser</p><figure class="rep-escena">'+escenaNegocio(datosEscena(D.c,5))+"</figure></div></div>";
}
function cuerpoPlan(D){
  const P0=D.c.modelo.P, lista=(arr,vacio)=>"<ul class=\"rep-lista\">"+(arr.length?arr.map(([nom])=>"<li>"+esc(String(nom).replace(/<[^>]*>/g,""))+"</li>").join(""):"<li>"+vacio+"</li>")+"</ul>";
  const celda=(t,f)=>'<div class="rep-caja"><p class="rep-caja-t">'+t+"</p>"+(f.length?'<ul class="rep-lista">'+[...f].sort((a,b)=>b.imp-a.imp).map(x=>"<li>"+esc(x.n)+" <strong>"+(x.b<0?"−":"+")+(x.imp*100).toFixed(1)+" pts</strong></li>").join("")+"</ul>":"<p>Ninguno</p>")+"</div>";
  const alto=f=>f.imp>=0.03, conHitos=D.elegidas.filter(l=>HITOS_PLAN[l.clave]);
  return kpisRep(D.kpisPlan)+
    '<p class="rep-h">Diagnóstico FODA de tu escenario</p><div class="rep-foda">'+
      '<div class="rep-caja"><p class="rep-caja-t">Fortalezas · lo que ya juega a tu favor</p>'+lista(D.foda.F,"Aún no destacan fortalezas claras.")+"</div>"+
      '<div class="rep-caja"><p class="rep-caja-t">Oportunidades · palancas del entorno</p>'+lista(D.foda.O,"Sin oportunidades externas evidentes.")+"</div>"+
      '<div class="rep-caja"><p class="rep-caja-t">Debilidades · lo que te resta y sí controlas</p>'+lista(D.foda.D,"Sin debilidades internas marcadas.")+"</div>"+
      '<div class="rep-caja"><p class="rep-caja-t">Amenazas · riesgos del entorno</p>'+lista(D.foda.A,"Sin amenazas externas marcadas.")+"</div></div>"+
    '<p class="rep-h">Plan de acción priorizado</p>'+
      (D.L.length?'<table class="rep-tabla rep-plan"><thead><tr><th scope="col">#</th><th scope="col">Acción</th><th scope="col">Qué hacer</th><th scope="col">Probabilidad</th></tr></thead><tbody>'+
        D.L.map((l,i)=>"<tr><td>"+(i+1)+"</td><th scope=\"row\">"+l.titulo+(D.elegidas.includes(l)?" ✓":"")+"</th><td>"+l.que+"</td><td>"+pct(P0)+" → "+pct(Math.max(P0,l.P))+"<br>+"+(l.lift*100).toFixed(1)+" pts</td></tr>").join("")+"</tbody></table>"+
        '<p class="rep-nota">✓ = acciones marcadas en tu plan. Aplicadas juntas, el modelo estima <strong>'+pct(P0)+" → "+pct(D.Pplan)+"</strong> (+"+((D.Pplan-P0)*100).toFixed(1)+" pts). Los puntos no se suman por separado: los efectos se combinan en la curva logística.</p>"
        :"<p>El modelo no encuentra palancas con mejora significativa: escenario muy sólido.</p>")+
    '<p class="rep-h">Qué factores pesan más y cuáles controlas</p><div class="rep-foda">'+
      celda("Controlas · impacto alto",D.fac.filter(f=>f.ctrl&&alto(f)))+celda("Externo · impacto alto",D.fac.filter(f=>!f.ctrl&&alto(f)))+
      celda("Controlas · impacto bajo",D.fac.filter(f=>f.ctrl&&!alto(f)))+celda("Externo · impacto bajo",D.fac.filter(f=>!f.ctrl&&!alto(f)))+"</div>"+
      '<p class="rep-nota">Impacto = puntos de probabilidad que cambiarían si ese factor fuera neutro. La probabilidad de que ocurra cada riesgo no está medida.</p>'+
    '<p class="rep-h">Plan por etapas con criterios de salida</p><ol class="rep-lista">'+etapasPlan(D.e,D.c.mc).map(x=>"<li><strong>"+x.t+".</strong> "+x.d+" <em>Criterio de salida: "+x.salida+"</em></li>").join("")+"</ol>"+
      '<p class="rep-nota">Ningún modelo asegura que un negocio sobreviva. Este plan acota la pérdida; las acciones de arriba cuentan la mitad del efecto que da el modelo, porque sus coeficientes son asociación o supuesto, no efecto probado.</p>'+
    (conHitos.length?'<p class="rep-h">Calendario de 90 días</p><div class="rep-cal">'+["Días 1 a 30","Días 31 a 60","Días 61 a 90"].map((t,m)=>
        '<div class="rep-caja"><p class="rep-caja-t">'+t+'</p><ul class="rep-lista">'+conHitos.map(l=>"<li>"+HITOS_PLAN[l.clave].m[m]+"</li>").join("")+"</ul></div>").join("")+"</div>"+
      '<p class="rep-h">Indicadores de seguimiento</p><ul class="rep-lista">'+conHitos.map(l=>"<li><strong>"+l.titulo+":</strong> "+HITOS_PLAN[l.clave].kpi+"</li>").join("")+"</ul>":"")+
    (D.mad.pendientes.length?'<p class="rep-h">Siguientes pasos de solidez</p><ol class="rep-lista">'+D.mad.pendientes.slice(0,5).map(p=>"<li><strong>"+esc(p.t)+" (nivel "+p.n+").</strong> "+esc(p.b(D.c))+"</li>").join("")+"</ol>":"");
}
function htmlReporte(D,graf,modo){
  if(modo==="plan") return cabeceraRep(D,"Plan del negocio")+cuerpoPlan(D)+PIE_REP;
  if(modo==="completo") return cabeceraRep(D,"Reporte completo")+'<p class="rep-parte">Parte 1 · Resultado del simulador</p>'+cuerpoNegocio(D,graf)+
    '<p class="rep-parte rep-salto">Parte 2 · Estrategia y plan de acción</p>'+cuerpoPlan(D)+PIE_REP;
  return cabeceraRep(D,"Reporte del negocio")+cuerpoNegocio(D,graf)+PIE_REP;
}
async function prepararReporte(conGraficas){
  if(typeof tVivo!=="undefined"&&tVivo){ clearTimeout(tVivo); calcular(); }
  const D=datosReporte(); if(!D) return null;
  return {D, graf:conGraficas===false?[]:await graficasAltaRes(3)};
}
async function imprimirReporte(modo){
  const R=await prepararReporte(modo!=="plan"); if(!R){ toast("Espera a que termine el cálculo y vuelve a intentarlo."); return; }
  const rep=$("reporteNegocio");
  rep.innerHTML=htmlReporte(R.D,R.graf,modo); rep.hidden=false;
  await Promise.all([...rep.querySelectorAll("img")].map(i=>i.decode().catch(()=>{})));
  document.body.classList.add("imprimir-reporte");
  const limpiar=()=>{ document.body.classList.remove("imprimir-reporte"); if(!VISTA_REPORTE){ rep.hidden=true; rep.innerHTML=""; } window.removeEventListener("afterprint",limpiar); };
  window.addEventListener("afterprint",limpiar);
  window.print();
}
$("exportarPDF").addEventListener("click",()=>imprimirReporte("negocio"));
$("imprimirPlan").addEventListener("click",()=>imprimirReporte("plan"));

/* ----- Resultado en un enlace (para el QR) ----- */
function codificarResultado(){
  const p=new URLSearchParams();
  camposForma().forEach(c=>{ if(FORMA_BASE.has(c.id)&&valorCampo(c)!==FORMA_BASE.get(c.id)) p.set(c.id,valorCampo(c)); });
  const g=$("giro").value;
  if(/^propio_/.test(g)&&GIROS[g]) p.set("_g",GIROS[g].n);
  if(negocioActual) p.set("_n",negocioActual);
  const m=PUNTOS_MADUREZ.map(x=>x.id in respuestasMadurez?String(respuestasMadurez[x.id]):"-").join("");
  if(/[012]/.test(m)) p.set("_m",m);
  if(typeof planSel!=="undefined"&&planSel) p.set("_p",planSel.join("."));
  const x=typeof sumaExtras==="function"?sumaExtras():0; if(x>0) p.set("_x",String(Math.round(x)));
  let b=""; new TextEncoder().encode(p.toString()).forEach(v=>{ b+=String.fromCharCode(v); });
  return btoa(b).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function enlaceResultado(reporte){
  const base=SITIO_LOCAL?URL_PUBLICA:location.origin+location.pathname;
  return base+(reporte?"?reporte=1":"")+"#r="+codificarResultado();
}
async function cargarResultado(hash){
  const m=/(?:^#?|&)r=([A-Za-z0-9_-]+)/.exec(hash||""); if(!m) return false;
  let p;
  try{ const bin=atob(m[1].replace(/-/g,"+").replace(/_/g,"/")); p=new URLSearchParams(new TextDecoder().decode(Uint8Array.from(bin,ch=>ch.charCodeAt(0)))); }catch(_){ return false; }
  const g=p.get("giro")||"";
  if(/^scian_\d{6}$/.test(g)&&typeof usarActividad==="function"){ try{ await usarActividad(g.slice(6)); }catch(_){} }
  else if(p.get("_g")&&typeof usarGiroPropio==="function") usarGiroPropio(limpiarNombre(p.get("_g")).slice(0,80));
  const todo=new URLSearchParams();
  FORMA_BASE.forEach((v,id)=>todo.set(id,p.has(id)?p.get(id):v));
  if(p.get("_g")) todo.set("giro",$("giro").value);
  const x=Number(p.get("_x"));
  if(x>0&&typeof agregarExtra==="function"){ $("extrasLista").innerHTML=""; agregarExtra("Costos propios (del enlace)",Math.min(Math.round(x),10000000)); actualizarExtras(); }
  const nombre=limpiarNombre(p.get("_n")); $("negocioNombre").value=nombre; negocioActual=nombre;
  respuestasMadurez={}; const mm=p.get("_m")||"";
  PUNTOS_MADUREZ.forEach((pt,i)=>{ if(/[012]/.test(mm[i]||"")) respuestasMadurez[pt.id]=+mm[i]; });
  if(p.has("_p")) planSel=p.get("_p").split(".").filter(k=>/^[a-z]{3,20}$/.test(k));
  cargarEscenario("e="+encodeURIComponent(todo.toString()));   // valida cada campo: opciones existentes y números dentro de sus límites
  return true;
}

/* ----- Código QR (biblioteca qrcode-generator, MIT, incluida en el sitio: funciona sin conexión) ----- */
function dibujarQR(lienzo,texto){
  const q=qrcode(0,"M"); q.addData(texto,"Byte"); q.make();
  const n=q.getModuleCount(), margen=4, t=Math.floor(lienzo.width/(n+2*margen)), o=Math.floor((lienzo.width-t*n)/2), x=lienzo.getContext("2d");
  x.fillStyle="#fff"; x.fillRect(0,0,lienzo.width,lienzo.height); x.fillStyle="#38070F";
  for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(q.isDark(r,c)) x.fillRect(o+c*t,o+r*t,t,t);
  return n;
}
function abrirQR(){
  if(typeof tVivo!=="undefined"&&tVivo){ clearTimeout(tVivo); calcular(); }
  const url=enlaceResultado(true), dlg=$("dlgQR"); dlg.dataset.url=url;
  try{ dibujarQR($("qrLienzo"),url); $("qrLienzo").hidden=false;
    $("qrNota").textContent="El código lleva tu resultado dentro del propio enlace ("+url.length+" caracteres): no se sube a ningún servidor. En el teléfono, pulsa «Guardar como PDF»."+(/^(scian_|propio_)/.test($("giro").value)?" Tu giro personalizado viaja con sus parámetros actuales.":""); }
  catch(_){ $("qrLienzo").hidden=true; $("qrNota").textContent="Tu escenario es demasiado largo para un código QR. Usa «Reporte completo en PDF» o «Copiar el enlace»."; }
  if(dlg.showModal) dlg.showModal(); else dlg.setAttribute("open","");
}
["qrResultado","qrPlan"].forEach(id=>$(id).addEventListener("click",abrirQR));
$("qrCerrar").addEventListener("click",()=>$("dlgQR").close());
$("qrCopiar").addEventListener("click",async()=>{
  const url=$("dlgQR").dataset.url||enlaceResultado(true); let ok=false;
  try{ await navigator.clipboard.writeText(url); ok=true; }catch(_){}
  $("qrNota").textContent=ok?"Enlace copiado al portapapeles.":"Copia este enlace: "+url;
});
$("qrPDF").addEventListener("click",()=>{ $("dlgQR").close(); imprimirReporte("completo"); });

/* ----- Vista de reporte (?reporte=1#r=…): lo que abre el QR en el teléfono ----- */
async function mostrarVistaReporte(valido){
  const rep=$("reporteNegocio"), barra=$("repBarra");
  document.body.classList.add("vista-reporte"); barra.hidden=false; rep.hidden=false;
  $("repAbrir").href=location.pathname+location.hash;
  if(!valido){ rep.innerHTML='<p class="rep-titulo">Este enlace no contiene un resultado válido</p><p class="rep-sub">Abre COATL y genera de nuevo tu código desde «Llevarme todo mi resultado».</p>'; return; }
  rep.innerHTML='<p class="rep-sub" role="status">Calculando tu reporte con el motor de COATL…</p>';
  const v=versionCalculo;
  for(let i=0;i<200&&!(ultimoMejora&&ultimoMejora.v>=v&&!solicitudCalculo&&ultimoResumen);i++) await new Promise(r=>setTimeout(r,150));
  const R=await prepararReporte(true);
  if(!R){ rep.innerHTML='<p class="rep-sub">No se pudo calcular el reporte. Recarga la página.</p>'; return; }
  rep.innerHTML=htmlReporte(R.D,R.graf,"completo");
  rep.dataset.listo="1";
  document.title="Reporte de "+R.D.titulo+" · COATL";
}
$("repGuardar").addEventListener("click",()=>window.print());
setTimeout(async()=>{ const ok=await cargarResultado(location.hash); if(VISTA_REPORTE) mostrarVistaReporte(ok); },0);

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
  const R=await prepararReporte(true); if(!R){ toast("Espera a que termine el cálculo y vuelve a intentarlo."); return; }
  const {D,graf}=R, S=2, W=1600, M=56, DISP="'Bricolage Grotesque',Arial,sans-serif", CUERPO="'Hanken Grotesk',Arial,sans-serif", MONO="'Spline Sans Mono','Courier New',monospace";
  const imgs=await Promise.all(graf.map(g=>new Promise(ok=>{ const im=new Image(); im.onload=()=>ok(im); im.onerror=()=>ok(null); im.src=g.url; })));
  const gh=460, gw=(W-2*M-24)/2, yG=440, filasG=Math.ceil(graf.length/2), yB=yG+filasG*(gh+24)+10, hB=400, alto=yB+hB+90;
  const cv=document.createElement("canvas"); cv.width=W*S; cv.height=alto*S;
  const x=cv.getContext("2d"); x.scale(S,S); x.textBaseline="alphabetic";
  x.fillStyle=COL.hueso; x.fillRect(0,0,W,alto);
  x.fillStyle=COL.rojo; x.fillRect(0,0,W,14);
  rectRedondo(x,M,40,68,68,16); x.fillStyle=COL.rojo; x.fill();
  x.save(); x.translate(M,40); x.scale(68/38,68/38); x.fillStyle="#fff"; x.fill(new Path2D("M8 27 v-5 h5 v-5 h5 v-5 h12 v5 h-7 v5 h-5 v5 z"));
  x.fillStyle=COL.rojo; x.beginPath(); x.arc(27.5,14.5,1.8,0,7); x.fill(); x.restore();
  x.fillStyle=COL.tinta; x.font="800 46px "+DISP; x.fillText("COATL",M+88,82);
  x.fillStyle=COL.granate; x.font="600 15px "+MONO; x.fillText("ANÁLISIS TERRITORIAL · COACALCO",M+90,106);
  x.textAlign="right"; x.fillStyle="#6B5457"; x.font="500 17px "+MONO; x.fillText("Reporte del negocio",W-M,74); x.fillText(D.fecha,W-M,100); x.textAlign="left";
  grecaLienzo(x,M,128,W-2*M,18,COL.rojo);
  x.fillStyle=COL.tinta; textoAjustado(x,D.titulo,M,214,W-2*M,"800",58,DISP);
  x.fillStyle=COL.granate; x.font="500 26px "+CUERPO; x.fillText(D.sub,M,254);
  const kw=(W-2*M-4*18)/5;
  D.kpis.forEach(([k,v,n],i)=>{ const a=M+i*(kw+18), b=286;
    rectRedondo(x,a,b,kw,124,12); x.fillStyle="#fff"; x.fill(); x.strokeStyle="#EFD6D4"; x.lineWidth=1.5; x.stroke();
    x.fillStyle=COL.rojo; x.fillRect(a+12,b,kw-24,6);
    x.fillStyle="#6B5457"; x.font="600 14px "+MONO; x.fillText(k.toUpperCase(),a+18,b+36);
    x.fillStyle=COL.tinta; textoAjustado(x,v,a+18,b+80,kw-36,"800",38,DISP);
    x.fillStyle="#6B5457"; x.font="500 15px "+CUERPO; x.fillText(n,a+18,b+106); });
  graf.forEach((g,i)=>{ const a=M+(i%2)*(gw+24), b=yG+Math.floor(i/2)*(gh+24), im=imgs[i];
    rectRedondo(x,a,b,gw,gh,12); x.fillStyle="#fff"; x.fill(); x.strokeStyle="#EFD6D4"; x.stroke();
    x.fillStyle=COL.granate; x.font="700 20px "+CUERPO; x.fillText(g.titulo,a+20,b+36);
    if(im){ const bw=gw-40, bh=gh-70, k=Math.min(bw/im.width,bh/im.height), w=im.width*k, h=im.height*k; x.drawImage(im,a+20+(bw-w)/2,b+52+(bh-h)/2,w,h); } });
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
  const anchoIndice=x.measureText(String(D.mad.indice)).width;
  x.fillStyle="#6B5457"; x.font="600 17px "+MONO; x.fillText("DE 100 · NIVEL "+D.mad.nivel+" DE 5",a2+anchoIndice+18,y); y+=44;
  if(D.mad.pendientes[0]){ x.fillStyle=COL.tinta; x.font="700 19px "+CUERPO; lineas(x,"Siguiente paso: "+D.mad.pendientes[0].t,cw-66).slice(0,2).forEach(l=>{ x.fillText(l,a2,y); y+=25; }); }
  y+=14; x.strokeStyle="#EFD6D4"; x.beginPath(); x.moveTo(a2,y-16); x.lineTo(M+2*cw+2,y-16); x.stroke();
  D.fiscal.forEach(([k,v],i)=>{ const ult=i===D.fiscal.length-1;
    x.fillStyle=ult?COL.tinta:"#4A3A3C"; x.font=(ult?"800":"500")+" 18px "+CUERPO; x.fillText(k,a2,y+10);
    x.textAlign="right"; x.font=(ult?"800":"600")+" 18px "+MONO; x.fillText(v,M+2*cw+2,y+10); x.textAlign="left"; y+=34; });
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

/* ===== src/ui/legal.js ===== */
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

/* ===== src/ui/app.js ===== */
/* ---------- 12. Dinámica: aviso, dado y cálculo en vivo ---------- */
let tToast=null;
function toast(msj){
  const t=$("toastCOATL"); t.textContent=msj; t.classList.add("activa");
  clearTimeout(tToast); tToast=setTimeout(()=>t.classList.remove("activa"),2800);
}
const ALE=a=>a[Math.floor(Math.random()*a.length)];
function aleSelect(id){const s=$(id);s.selectedIndex=Math.floor(Math.random()*s.options.length)}
$("dado").addEventListener("click",()=>{
  const ic=document.querySelector("#dado .ic");
  ic.classList.remove("gira"); void ic.offsetWidth; ic.classList.add("gira");
  $("giro").value=ALE(Object.keys(GIROS)); $("giro").dispatchEvent(new Event("change"));
  $("zona").value=ALE(Object.keys(ZONAS));
  ["experiencia","formalidad","marketing","competencia","reserva","local","dias","estacionalidad"].forEach(aleSelect);
  $("empleados").value=Math.floor(Math.random()*6);
  $("superficie").value=20+5*Math.floor(Math.random()*33);
  $("inversion").value=10000*Math.round((80000+Math.random()*1420000)/10000);
  $("vInversion").textContent=mxn.format(+$("inversion").value);
  $("credito").value=5*Math.floor(Math.random()*15);
  $("vCredito").textContent=$("credito").value+"%";
  $("tasa").value=18+Math.round(Math.random()*18);
  $("otrosFijos").value=500*Math.round((3000+Math.random()*9000)/500);
  $("merma").value=(Math.round(Math.random()*16)/2).toFixed(1);
  $("vMerma").textContent=(+$("merma").value)+"%";
  $("mktGasto").value=250*Math.round(Math.random()*20);
  $("crecimiento").value=Math.round(Math.random()*40)/2;
  $("inflacion").value=(3+Math.round(Math.random()*8)/2).toFixed(1);
  $("sugerirRenta").click(); $("sugerirClientes").click();
  calcular();
  toast("🎲 Escenario sorpresa generado: revisa qué variables lo hacen fuerte o frágil.");
});
let tVivo=null;
/* Indicador «cálculo listo» para quien automatiza o prueba el sitio: <html data-calculo="pendiente|listo">.
   Pasa a «listo» cuando terminó el cálculo de la última versión, se pintaron todos los apartados y acabó la
   animación del contador; data-calculo-version cuenta los cálculos terminados. */
function estadoCalculo(estado){ document.documentElement.dataset.calculo=estado; }
estadoCalculo("pendiente");
["input","change"].forEach(ev=>$("forma").addEventListener(ev,()=>{
  solicitudCalculo=null;
  estadoCalculo("pendiente");
  marcarPendiente();
  clearTimeout(tVivo); tVivo=setTimeout(calcular,220);
}));

/* ---------- 13. Transiciones de aparición al hacer scroll ---------- */
(function revelar(){
  const sel=".cifra,.panel,.metodo,.limitaciones,.seccion>.folio,.seccion>.titulo,.seccion>.intro,.intro-flex>.intro,.ilustracion";
  const els=[...document.querySelectorAll(sel)];
  const porPadre=new Map();
  els.forEach(el=>{
    el.classList.add("revela");
    const n=porPadre.get(el.parentElement)||0;
    el.style.transitionDelay=Math.min(n*70,350)+"ms";
    porPadre.set(el.parentElement,n+1);
  });
  const io=new IntersectionObserver(entradas=>entradas.forEach(en=>{
    if(en.isIntersecting){en.target.classList.add("visible");io.unobserve(en.target)}
  }),{threshold:.12,rootMargin:"0px 0px -40px 0px"});
  els.forEach(e=>io.observe(e));
})();

/* ---------- 13b. Motor FODA y plan de acción en tiempo real ---------- */
/* Cada palanca: clona el escenario, mejora UNA variable, vuelve a correr el
   modelo y mide el salto real de probabilidad (ΔP). Es análisis de
   sensibilidad honesto convertido en recomendaciones accionables. */
function probDe(e2){ return modeloLogistico(derivar(e2)).P; }
/* Las palancas usan β que son asociación (giro, zona y formalidad, medidos con datos) o supuesto del
   equipo, nunca efecto causal probado: el plan cuenta solo la MITAD del salto que da el modelo. */
const FACTOR_PLAN=0.5;
const EVIDENCIA_PALANCA={formalidad:"Asociación medida con datos (ENOE)", zona:"Asociación medida con datos (DENUE)"};
function evidenciaPalanca(clave){ return EVIDENCIA_PALANCA[clave]||"Supuesto del equipo"; }
function efectoPlan(P0, P1){ return P0+Math.max(0,P1-P0)*FACTOR_PLAN; }
function pPlan(e, lista, P0){ return lista.length?efectoPlan(P0, probDe(aplicarPalancas(e,lista))):P0; }
function clon(e){ return Object.assign({}, e); }

function palancas(e, P0){
  const L=[];
  // 1 · Reserva de capital de trabajo
  if(e.resZ < 0.20){
    const c=clon(e); c.resZ=0.20;
    L.push({clave:"reserva", titulo:"Construir 6 meses de capital de trabajo",
      que:"Aparta una reserva líquida equivalente a medio año de gastos fijos antes de operar al límite.",
      base:"El <b>JPMorgan Chase Institute</b> halló que el negocio pequeño mediano sostiene apenas ~27 días de liquidez; con más días de reserva, un mal mes no obliga a cerrar. Cuánto baja el riesgo de cierre no está medido en México: el β es supuesto del equipo.",
      tasa:"Supuesto: menos cierres por falta de efectivo", P:probDe(c)});
  }
  // 2 · Desapalancar
  if(e.credPct >= 0.30){
    const c=clon(e); c.credPct=0.15;
    L.push({clave:"deuda", titulo:"Reducir el apalancamiento por debajo del 30%",
      que:"Financia una mayor parte con capital propio o reinversión; baja el porcentaje a crédito y renegocia la tasa.",
      base:"La carga financiera fija convierte cualquier caída de ventas en pérdida. Cuánto sube el riesgo de cierre con la deuda no está medido en México: el β es supuesto del equipo.",
      tasa:"Menor costo fijo mensual", P:probDe(c)});
  }
  // 3 · Margen de contribución (costo variable / proveedores / precio)
  if(e.cv > 0.40){
    const c=clon(e); c.cv=Math.max(0.30, e.cv-0.10);
    L.push({clave:"margen", titulo:"Subir el margen: renegociar proveedores o ajustar precio",
      que:"Negocia compras por volumen, reduce mermas o ajusta el precio para bajar el costo variable ~10 puntos.",
      base:"Cada punto de margen de contribución reduce el punto de equilibrio y amplía el margen de seguridad financiero, que el modelo penaliza fuertemente cuando es bajo.",
      tasa:"Punto de equilibrio más bajo", P:probDe(c)});
  }
  // 4 · Marketing digital
  if(e.mktZ < 0.12){
    const c=clon(e); c.mktZ=0.12; c.mu=Math.round(e.mu*1.12);
    L.push({clave:"marketing", titulo:"Activar marketing digital (redes + WhatsApp Business)",
      que:"Pasa de presencia orgánica básica a una estrategia activa con pauta local y catálogo en WhatsApp Business.",
      base:"El comercio electrónico en México creció más de <b>20% anual</b> (AMVO); una presencia digital activa amplía el alcance a un costo de adquisición bajo frente a medios tradicionales.",
      tasa:"Supuesto del equipo: +12 % de clientes", P:probDe(c)});
  }
  // 5 · Formalización
  if(e.formZ < 0.10){
    const c=clon(e); c.formZ=0.10;
    L.push({clave:"formalidad", titulo:"Formalizarte ante SAT e IMSS desde el inicio",
      que:"Regístrate formalmente: habilita facturación, acceso a crédito y proveedores y clientes empresariales.",
      base:"En el panel de la <b>ENOE</b> (INEGI), los negocios jóvenes formales siguen operando un año después con más frecuencia que los informales (ver Metodología). Es asociación: los negocios que ya van bien suelen formalizarse, así que no prueba que formalizarte cause la diferencia.",
      tasa:"Medido: los formales siguen más", P:probDe(c)});
  }
  // 6 · Retención de clientes
  {
    const c=clon(e); c.mu=Math.round(e.mu*1.07); c.cv=Math.max(0.05, e.cv-0.01);
    const pc=probDe(c);
    if(pc>P0+0.001) L.push({clave:"retencion", titulo:"Programa de fidelización y recompra",
      que:"Tarjeta de lealtad, seguimiento por WhatsApp y atención post-venta para elevar la frecuencia de compra.",
      base:"<b>Bain & Company</b> (Reichheld): aumentar la retención de clientes un 5% puede elevar las utilidades entre <b>25% y 95%</b>; retener cuesta 5–7× menos que adquirir.",
      tasa:"Bain: utilidades, no supervivencia", P:pc});
  }
  // 7 · Mejor zona (del mapa)
  if(typeof datosMapa!=="undefined" && datosMapa.length){
    const mejor=[...datosMapa].sort((a,b)=>b.P-a.P)[0];
    if(mejor && mejor.k!==e.zonaKey && mejor.P>P0+0.005){
      L.push({clave:"zona", titulo:"Ubicarte en "+CORTOS[mejor.k],
        que:"Para este mismo negocio, esa zona ofrece mejor relación entre afluencia y renta. Evalúa el traslado o ábrela ahí.",
        base:"La supervivencia por zona se midió con el DENUE (2019 a 2024). Además, el índice de afluencia de cada zona, estimación del equipo, cambia los clientes esperados.",
        tasa:"Medido: supervivencia por zona (DENUE)", P:mejor.P, esZona:true, zonaK:mejor.k});
    }
  }
  // 8 · Diferenciación ante competencia
  if(e.compZ <= -0.20){
    const c=clon(e); c.compZ=0; c.mktZ=Math.min(0.12, e.mktZ+0.07);
    L.push({clave:"diferenciacion", titulo:"Diferenciarte ante la competencia saturada",
      que:"Define una propuesta de valor única (especialidad, horario, servicio) que te saque de competir solo por precio.",
      base:"En zonas con 5+ competidores directos, la guerra de precios erosiona el margen; la diferenciación sostiene el ticket y la lealtad.",
      tasa:"Supuesto: defiende el ticket promedio", P:probDe(c)});
  }
  // 9 · Capacitación / experiencia
  if(e.expZ < 0.15){
    const c=clon(e); c.expZ=0.15;
    L.push({clave:"experiencia", titulo:"Capacitación y mentoría en el giro",
      que:"Toma formación específica del giro o busca un mentor; reduce los errores costosos de los primeros meses.",
      base:"La experiencia previa del fundador correlaciona con la supervivencia del negocio; según la tabla del INEGI, la mayoría de los cierres ocurre en los primeros tres años. Cuánto ayuda la experiencia no está medido en México.",
      tasa:"Supuesto: menos errores en el año 1", P:probDe(c)});
  }
  return L.map(l=>{ const P=efectoPlan(P0,l.P); return {...l, P, lift:P-P0, evid:evidenciaPalanca(l.clave)}; }).filter(l=>l.lift>0.0005).sort((a,b)=>b.lift-a.lift);
}

function clasificarFODA(e, modelo){
  const INT={"Experiencia en el giro":1,"Reserva de capital":1,"Formalidad fiscal":1,"Marketing":1,
    "Estructura de deuda":1,"Local propio":1,"Margen de seguridad financiero":1,
    "Resiliencia del emprendedor":1,"Motivación para emprender":1};
  const F=[],O=[],D=[],A=[];
  modelo.contribs.forEach(([nom,beta])=>{
    const interno = Object.keys(INT).some(k=>nom.startsWith(k));
    if(interno){
      if(beta>0.04) F.push([nom,beta]);
      else if(beta<-0.04) D.push([nom,beta]);
    }else{ // externo: giro, zona, competencia
      if(beta>0.04) O.push([nom,beta]);
      else if(beta<-0.04) A.push([nom,beta]);
    }
  });
  // Externos adicionales no logísticos
  if(e.crec>0.05) O.push(["Mercado en crecimiento ("+(e.crec*100).toFixed(0)+"% anual)",e.crec]);
  if(e.crec<0) A.push(["Mercado en contracción",e.crec]);
  if(e.inf>=0.06) A.push(["Inflación alta erosiona el margen ("+(e.inf*100).toFixed(1)+"%)",-e.inf]);
  if(e.ms>=0.20) F.push(["Opera con holgura sobre el equilibrio",e.ms]);
  else if(e.ms<0.05) A.push(["Opera muy cerca del punto de equilibrio",-1]);
  if(typeof datosMapa!=="undefined" && datosMapa.length){
    const mejor=[...datosMapa].sort((a,b)=>b.P-a.P)[0];
    if(mejor && mejor.k!==e.zonaKey && mejor.P>modelo.P+0.01)
      O.push(["Existe una zona con mayor probabilidad ("+CORTOS[mejor.k]+")",mejor.P]);
  }
  return {F,O,D,A};
}

function pintarTriplete(mc){
  const u=[
    {c:"pes", et:"Pesimista · P5", v:mc.p05, d:"5% de los años caen por debajo"},
    {c:"base", et:"Esperado · mediana", v:mc.p50, d:"la mitad de los años queda por encima y la mitad por debajo"},
    {c:"opt", et:"Optimista · P95", v:mc.p95, d:"5% de los años superan esto"}
  ];
  $("triplete").innerHTML=u.map(x=>'<div class="universo '+x.c+'"><span class="et">'+x.et+
    '</span><div class="v">'+mxn.format(Math.round(x.v))+'</div><div class="d">'+x.d+"</div></div>").join("");
}

function liUL(arr, vacio){
  if(!arr.length) return '<li class="vacio">'+vacio+"</li>";
  return arr.map(([nom])=>'<li><span class="factor">'+esc(nom)+"</span></li>").join("");   // el nombre del giro puede venir del usuario (giro propio)
}

/* Aplica varias palancas a la vez sobre una copia del escenario (la usan el techo del plan y el simulador de plan). */
function aplicarPalancas(e, lista){
  let c=clon(e);
  lista.forEach(l=>{
    if(l.clave==="reserva")c.resZ=0.20;
    if(l.clave==="deuda")c.credPct=0.15;
    if(l.clave==="margen")c.cv=Math.max(0.30,c.cv-0.10);
    if(l.clave==="marketing"){c.mktZ=0.12;c.mu=Math.round(c.mu*1.12);}
    if(l.clave==="formalidad")c.formZ=0.10;
    if(l.clave==="experiencia")c.expZ=0.15;
    if(l.clave==="diferenciacion"){c.compZ=0;c.mktZ=Math.min(0.12,c.mktZ+0.07);}
    if(l.clave==="retencion"){c.mu=Math.round(c.mu*1.07);c.cv=Math.max(0.05,c.cv-0.01);}
  });
  /* El traslado de zona se aplica al final para escalar la demanda ya ajustada. */
  const z=lista.find(l=>l.clave==="zona"); if(z) c=trasladarZona(c,z.zonaK);
  return c;
}
function pintarFODA(e, modelo, mc){
  const P0=modelo.P;
  pintarTriplete(mc);
  const f=clasificarFODA(e, modelo);
  $("fodaF").innerHTML=liUL(f.F,"Aún no destacan fortalezas claras: trabaja el plan de acción.");
  $("fodaO").innerHTML=liUL(f.O,"Sin oportunidades externas evidentes en este escenario.");
  $("fodaD").innerHTML=liUL(f.D,"Sin debilidades internas marcadas. ¡Bien!");
  $("fodaA").innerHTML=liUL(f.A,"Sin amenazas externas marcadas en este escenario.");

  const L=palancas(e, P0);
  // Techo realista: aplicar simultáneamente las 3 palancas de mayor impacto
  const techo = pPlan(e, L.slice(0,3), P0);
  $("fodaP").textContent=(P0*100).toFixed(1)+"%";
  $("fodaTecho").textContent="potencial con el plan: "+(techo*100).toFixed(1)+"%";
  // Balance FODA: cuántos factores hay en cada cuadrante y cuánto pesan (Σβ) los internos frente a los externos.
  [["fbF",f.F],["fbO",f.O],["fbD",f.D],["fbA",f.A]].forEach(([id,l])=>{ $(id).textContent=l.length; });
  const mayorA=[...f.A].sort((x,y)=>x[1]-y[1])[0], aFavor=f.F.length+f.O.length, enContra=f.D.length+f.A.length;
  $("fbNota").innerHTML="Brecha al potencial: <strong>+"+((techo-P0)*100).toFixed(1)+" pts</strong> · factores a favor <strong>"+aFavor+"</strong> frente a <strong>"+enContra+"</strong> en contra. "+
    (mayorA?"Amenaza principal: <strong>"+esc(mayorA[0])+"</strong>.":"Sin amenazas externas marcadas.");

  pintarHerramientasPlan(e, modelo, L, P0);
  seguro("wEtapas",()=>{
    $("etapas").innerHTML=etapasPlan(e, mc).map(x=>'<li><p class="cal-t">'+x.t+'</p><p>'+x.d+'</p><p class="etapa-salida"><strong>Criterio de salida:</strong> '+x.salida+'</p></li>').join("");
  });
  if(!L.length){
    $("acciones").innerHTML='<div class="accion"><div class="rank">✓</div><div class="cuerpo"><h3>Escenario muy sólido</h3><p class="que">El modelo no encuentra palancas con mejora significativa: tu configuración ya es robusta. Mantén la reserva de capital y vigila la competencia y la inflación.</p></div><div class="impacto"><div class="lift">—</div><div class="lift-k">sin brecha</div></div></div>';
    $("planCierre").innerHTML="<b>Lectura:</b> conserva la disciplina financiera; incluso con probabilidad alta, la cola izquierda del Monte Carlo existe. Reevalúa el plan si cambian renta, competencia o inflación.";
    return;
  }
  $("acciones").innerHTML=L.slice(0,5).map((l,i)=>{
    const dp=(l.lift*100).toFixed(1);
    const proy=(l.P*100).toFixed(1);
    const accZona = l.esZona ? ' data-irzona="'+l.zonaK+'"' : '';
    const cursor = l.esZona ? ' data-clic="1"' : '';   // cursor vía CSS: la CSP no permite style="" en línea
    return '<div class="accion"'+accZona+cursor+'><div class="rank">'+(i+1)+'</div><div class="cuerpo"><h3>'+
      l.titulo+'</h3><p class="que">'+l.que+'</p><p class="base">'+l.base+
      '</p><span class="tasa">Referencia: '+l.tasa+'</span> <span class="evid">'+l.evid+' · efecto contado a la mitad</span></div><div class="impacto"><div class="lift">+'+dp+
      '</div><div class="lift-k">puntos de prob.</div><div class="proy">→ '+proy+'%</div></div></div>';
  }).join("");
  // clic en acción de zona traslada el escenario
  document.querySelectorAll('.accion[data-irzona]').forEach(a=>{
    a.addEventListener("click",()=>irAZona(a.dataset.irzona));
  });
  const top=L[0];
  $("planCierre").innerHTML="<b>Prioridad #1:</b> "+top.titulo.toLowerCase()+
    " es la palanca de mayor impacto en tu escenario (+"+(top.lift*100).toFixed(1)+
    " puntos). Aplicando las tres primeras acciones, la probabilidad estimada subiría de <b>"+
    (P0*100).toFixed(1)+"%</b> a <b>"+(techo*100).toFixed(1)+"%</b>. Recuerda: son estimaciones del modelo bajo supuestos declarados, no garantías.";
}

/* ---------- 14. Orquestación ---------- */
$("forma").addEventListener("submit",ev=>ev.preventDefault()); /* sin botón: solo cálculo en vivo */
let versionCalculo=0, solicitudCalculo=null;
let workerActivo=crearWorkerCalculo();
function crearWorkerCalculo(){
  if(typeof Worker!=="function") return null;
  let url;
  try{
    url=URL.createObjectURL(new Blob(["/* COATL · Datos de anclaje (giros, zonas, S0, estacionalidad). Sin DOM. */\n/* ---------- 1. Parámetros y datos de anclaje ---------- */\n/* β de giro y zona (z): ESTIMADOS con el DENUE (scripts/denue_supervivencia.py → data/denue/supervivencia.json).\n   Cohorte de 305,313 negocios incorporados al DENUE en la actualización censal de 2019 en el Estado de México\n   (4,654 en Coacalco), seguidos a la edición de 2024: regresión logística con errores estándar (ee),\n   efectos centrados y contraídos por Bayes empírico, multiplicados por la pendiente de calibración fuera de muestra\n   (data/denue/validacion.json). Juguería y pastelería heredan el β de cafetería y panadería (comparten clase SCIAN).\n   zEq = supuesto anterior del equipo; fz = fuente del coeficiente. */\nconst GIROS = {\n  abarrotes:    {n:\"Abarrotes / minisúper\",                ticket:65,  cv:72, dem:120, z: 0.18, ee:0.010, zEq:-0.10, fz:\"denue\"},\n  tortilleria:  {n:\"Tortillería\",                          ticket:22,  cv:55, dem:260, z: 0.06, ee:0.021, zEq:-0.02, fz:\"denue\"},\n  carniceria:   {n:\"Carnicería / pollería\",                ticket:140, cv:68, dem:75,  z:-0.00, ee:0.017, zEq: 0.00, fz:\"denue\"},\n  fruteria:     {n:\"Frutería y verdulería\",                ticket:70,  cv:62, dem:95,  z:-0.19, ee:0.020, zEq:-0.05, fz:\"denue\"},\n  fonda:        {n:\"Fonda / cocina económica\",             ticket:85,  cv:45, dem:70,  z:-0.23, ee:0.034, zEq:-0.12, fz:\"denue\"},\n  taqueria:     {n:\"Taquería / antojitos\",                 ticket:95,  cv:40, dem:90,  z:-0.18, ee:0.014, zEq:-0.10, fz:\"denue\"},\n  restaurante:  {n:\"Restaurante\",                          ticket:180, cv:42, dem:55,  z:-0.14, ee:0.057, zEq:-0.15, fz:\"denue\"},\n  pizzeria:     {n:\"Pizzería\",                             ticket:160, cv:38, dem:45,  z:-0.28, ee:0.027, zEq:-0.10, fz:\"denue\"},\n  cafeteria:    {n:\"Cafetería\",                            ticket:95,  cv:38, dem:65,  z:-0.26, ee:0.020, zEq:-0.08, fz:\"denue\"},\n  jugueria:     {n:\"Juguería / licuados\",                  ticket:55,  cv:35, dem:70,  z:-0.26, ee:0.020, zEq:-0.06, fz:\"denue\"},\n  panaderia:    {n:\"Panadería\",                            ticket:40,  cv:45, dem:140, z:-0.05, ee:0.025, zEq:-0.02, fz:\"denue\"},\n  pasteleria:   {n:\"Pastelería / repostería\",              ticket:210, cv:38, dem:30,  z:-0.05, ee:0.025, zEq: 0.00, fz:\"denue\"},\n  papeleria:    {n:\"Papelería\",                            ticket:55,  cv:60, dem:80,  z: 0.17, ee:0.017, zEq:-0.10, fz:\"denue\"},\n  ciber:        {n:\"Ciber / impresiones\",                  ticket:35,  cv:25, dem:60,  z:-0.32, ee:0.024, zEq:-0.05, fz:\"denue\"},\n  farmacia:     {n:\"Farmacia\",                             ticket:160, cv:70, dem:90,  z: 0.19, ee:0.025, zEq: 0.05, fz:\"denue\"},\n  naturista:    {n:\"Tienda naturista / suplementos\",       ticket:170, cv:52, dem:30,  z:-0.09, ee:0.040, zEq: 0.03, fz:\"denue\"},\n  vinateria:    {n:\"Vinatería / licorería\",                ticket:180, cv:68, dem:55,  z:-0.06, ee:0.051, zEq: 0.02, fz:\"denue\"},\n  ropa:         {n:\"Ropa y calzado\",                       ticket:320, cv:55, dem:25,  z:-0.13, ee:0.015, zEq:-0.18, fz:\"denue\"},\n  joyeria:      {n:\"Joyería y bisutería\",                  ticket:350, cv:52, dem:10,  z:-0.17, ee:0.040, zEq:-0.08, fz:\"denue\"},\n  celulares:    {n:\"Celulares y accesorios\",               ticket:280, cv:55, dem:28,  z:-0.11, ee:0.035, zEq:-0.02, fz:\"denue\"},\n  tecnologia:   {n:\"Tecnología (venta y reparación)\",      ticket:380, cv:50, dem:18,  z:-0.19, ee:0.051, zEq: 0.10, fz:\"denue\"},\n  ferreteria:   {n:\"Ferretería / tlapalería\",              ticket:190, cv:62, dem:40,  z: 0.30, ee:0.030, zEq: 0.06, fz:\"denue\"},\n  refaccionaria:{n:\"Refaccionaria automotriz\",             ticket:260, cv:58, dem:22,  z: 0.07, ee:0.033, zEq: 0.08, fz:\"denue\"},\n  taller:       {n:\"Taller mecánico\",                      ticket:850, cv:40, dem:8,   z: 0.18, ee:0.021, zEq: 0.12, fz:\"denue\"},\n  autolavado:   {n:\"Autolavado\",                           ticket:120, cv:25, dem:28,  z:-0.13, ee:0.044, zEq: 0.04, fz:\"denue\"},\n  estetica:     {n:\"Estética / barbería\",                  ticket:130, cv:18, dem:28,  z: 0.00, ee:0.013, zEq: 0.08, fz:\"denue\"},\n  spa:          {n:\"Spa / salón de uñas\",                  ticket:260, cv:22, dem:18,  z: 0.06, zEq: 0.06, fz:\"equipo\"},\n  lavanderia:   {n:\"Lavandería\",                           ticket:90,  cv:30, dem:45,  z:-0.09, ee:0.031, zEq: 0.02, fz:\"denue\"},\n  gimnasio:     {n:\"Gimnasio (mensualidades)\",             ticket:480, cv:12, dem:12,  z:-0.14, ee:0.035, zEq: 0.05, fz:\"denue\"},\n  veterinaria:  {n:\"Veterinaria / estética canina\",        ticket:320, cv:30, dem:16,  z: 0.21, ee:0.053, zEq: 0.12, fz:\"denue\"},\n  dental:       {n:\"Consultorio dental\",                   ticket:750, cv:22, dem:7,   z: 0.38, ee:0.029, zEq: 0.22, fz:\"denue\"},\n  optica:       {n:\"Óptica\",                               ticket:950, cv:45, dem:7,   z: 0.17, ee:0.049, zEq: 0.10, fz:\"denue\"},\n  consultorio:  {n:\"Consultorio / despacho profesional\",   ticket:420, cv:15, dem:10,  z:-0.12, ee:0.029, zEq: 0.20, fz:\"denue\"},\n  educacion:    {n:\"Educación (regularización / idiomas)\", ticket:350, cv:20, dem:15,  z:-0.47, ee:0.063, zEq: 0.15, fz:\"denue\"},\n  floreria:     {n:\"Florería\",                             ticket:230, cv:45, dem:14,  z: 0.09, ee:0.038, zEq:-0.04, fz:\"denue\"}\n};\nconst ZONAS = {\n  corredor:  {n:\"Corredor Vía López Portillo\",                       afl:1.35, rm2:280, z:-0.20, ee:0.062, zEq: 0.30, fz:\"denue\"},\n  centro:    {n:\"San Francisco Coacalco (Centro)\",                   afl:1.15, rm2:170, z: 0.05, ee:0.040, zEq: 0.12, fz:\"denue\"},\n  flores:    {n:\"Villa de las Flores · Parque Res. · Bosques\",       afl:1.10, rm2:190, z: 0.23, ee:0.066, zEq: 0.15, fz:\"denue\"},\n  heroes:    {n:\"Los Héroes · Loma Bonita · V. de las Manzanas\",     afl:1.00, rm2:150, z:-0.21, ee:0.061, zEq: 0.04, fz:\"denue\"},\n  popular:   {n:\"El Potrero · San Rafael · El Olivo\",                afl:0.90, rm2:110, z: 0.06, ee:0.051, zEq:-0.10, fz:\"denue\"},\n  periferia: {n:\"Zonas habitacionales periféricas\",                  afl:0.78, rm2:90,  z: 0.17, ee:0.193, zEq:-0.18, fz:\"denue\"}\n};\n/* Supervivencia nacional S0(t), t = 0…10 años.\n   INEGI, Demografía de los Negocios 1989–2019, tabulado Nal_Tot_CE2019,\n   columna p(x), edades 0…9: S0(x+1) = p(x), redondeada a cuatro decimales.\n   https://www.inegi.org.mx/contenidos/programas/dn/2019/tabulados/Nal_Tot_CE2019.xlsx */\nconst S0 = [1, 0.6908, 0.4812, 0.4261, 0.3871, 0.3568, 0.3320, 0.3111, 0.2930, 0.2770, 0.2627];\n/* Intercepto calibrado: un escenario neutro reproduce S0(3) nacional → β₀ = logit(0.4261). */\nconst BETA0 = Math.log(S0[3]/(1-S0[3]));\nconst ESTACION = {\n  estable:   [1,1,1,1,1,1,1,1,1,1,1,1],\n  diciembre: [.95,.90,.95,.95,1,1,1,1,1,1.05,1.15,1.35],\n  verano:    [.95,.95,1,1,1.05,1.10,1.20,1.25,1.10,.95,.95,1]\n};\nconst N_SIM = 2000, SEMILLA = 20262;\n\n\n/* Supuestos de incertidumbre del Monte Carlo y del rango de P.\n   Son SUPUESTOS DEL EQUIPO (no estimados con datos); se documentan en\n   docs/METODOLOGIA.md y en la ficha «Supuestos y limitaciones». */\nconst INCERTIDUMBRE = {\n  demandaMensual: 0.22,  // DE relativa de clientes, independiente por mes\n  ticket:         0.08,  // DE relativa del ticket promedio, por mes\n  demandaAnual:   0.15,  // DE (log) del choque común del año\n  costoVariable:  0.02,  // DE absoluta del costo variable efectivo (2 pp)\n  betaRelativa:   0.30,  // DE relativa de cada β para el rango de P\n  intercepto:     0.15   // DE del intercepto para el rango de P\n};\n\n/* Fotos reales de cada zona: Wikimedia Commons (licencia libre). Recortadas, con contraste y\n   nitidez ajustados y convertidas a WebP; la cita se muestra junto a cada foto. */\nconst FOTOS_ZONAS = {\n \"corredor\": {\n  \"src\": \"assets/img/zonas/corredor.webp\",\n  \"autor\": \"ArCaRa\",\n  \"licencia\": \"CC BY 3.0\",\n  \"licenciaUrl\": \"https://creativecommons.org/licenses/by/3.0\",\n  \"pagina\": \"https://commons.wikimedia.org/wiki/File:Plaza_Coacalco._-_panoramio.jpg\"\n },\n \"centro\": {\n  \"src\": \"assets/img/zonas/centro.webp\",\n  \"autor\": \"ArCaRa\",\n  \"licencia\": \"CC BY 3.0\",\n  \"licenciaUrl\": \"https://creativecommons.org/licenses/by/3.0\",\n  \"pagina\": \"https://commons.wikimedia.org/wiki/File:C%C3%BApula_octagonal-San_Francisco-Koakalko._-_panoramio.jpg\"\n },\n \"flores\": {\n  \"src\": \"assets/img/zonas/flores.webp\",\n  \"autor\": \"ArCaRa\",\n  \"licencia\": \"CC BY 3.0\",\n  \"licenciaUrl\": \"https://creativecommons.org/licenses/by/3.0\",\n  \"pagina\": \"https://commons.wikimedia.org/wiki/File:Jard%C3%ADn_Triangular_en_villa_de_las_flores_cuidado_con_amor_por_dos_entusiastas_mujeres_de_la_comunidad._-_panoramio.jpg\"\n },\n \"periferia\": {\n  \"src\": \"assets/img/zonas/periferia.webp\",\n  \"autor\": \"ArCaRa\",\n  \"licencia\": \"CC BY 3.0\",\n  \"licenciaUrl\": \"https://creativecommons.org/licenses/by/3.0\",\n  \"pagina\": \"https://commons.wikimedia.org/wiki/File:Ultima_Parcela_en_Coacalco._-_panoramio.jpg\"\n },\n \"heroes\": {\n  \"src\": \"assets/img/zonas/heroes.webp\",\n  \"autor\": \"ArCaRa\",\n  \"licencia\": \"CC BY 3.0\",\n  \"licenciaUrl\": \"https://creativecommons.org/licenses/by/3.0\",\n  \"pagina\": \"https://commons.wikimedia.org/wiki/File:Los_Heroes-Koakalko._-_panoramio.jpg\"\n },\n \"popular\": {\n  \"src\": \"assets/img/zonas/popular.webp\",\n  \"autor\": \"ArCaRa\",\n  \"licencia\": \"CC BY 3.0\",\n  \"licenciaUrl\": \"https://creativecommons.org/licenses/by/3.0\",\n  \"pagina\": \"https://commons.wikimedia.org/wiki/File:Andador_Luis_Donaldo_Colosio._-_panoramio.jpg\"\n }\n};\n\n/* COATL · Núcleo estadístico puro (sin DOM): probado en tests/. */\n/* ---------- 2. Utilidades numéricas ---------- */\nfunction mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}\nfunction gaussiana(rng){let u=0,v=0;while(u===0)u=rng();while(v===0)v=rng();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}\nconst sigmoide = z => 1/(1+Math.exp(-z));\nconst acota = (x,a,b)=>Math.min(b,Math.max(a,x));\n\nfunction derivar(e){\n  e.diasMes=e.diasSem*4.33;\n  e.cvEff=acota(e.cv+(e.merma||0),0.02,0.95);\n  e.rentaEf=e.propio?0:e.renta;\n  e.interesMes=e.inversion*e.credPct*e.tasa/12;\n  e.fijos=e.rentaEf + e.empleados*e.costoEmpleado + e.otrosFijos + (e.mktGasto||0) + e.interesMes;\n  e.ventasMes=e.mu*e.diasMes*e.ticket;\n  e.margenUnit=e.ticket*(1-e.cvEff);\n  e.utilMes=e.ventasMes*(1-e.cvEff)-e.fijos;\n  e.peClientesMes=e.margenUnit>0?e.fijos/e.margenUnit:Infinity;\n  e.peDia=e.peClientesMes/e.diasMes;\n  e.pePesos=(1-e.cvEff)>0?e.fijos/(1-e.cvEff):Infinity;\n  e.ms=e.ventasMes>0?(e.ventasMes-e.pePesos)/e.ventasMes:-1;\n  return e;\n}\n\n/* ---------- 6. Modelo logístico con contribuciones etiquetadas ---------- */\n/* Fuente de cada contribución: \"datos\" (estimado con microdatos del INEGI), \"propio\" (sale de los\n   números del propio negocio) o \"supuesto\" (criterio del equipo, sin datos que lo liguen al cierre). */\nconst TOPE_FINANCIERO=[-0.50, 0.35];   // margen de seguridad + reserva + deuda miden casi lo mismo: no se apilan sin límite\nfunction modeloLogistico(e){\n  const msZ = e.ms>=0.30?0.25 : e.ms>=0.15?0.10 : e.ms>=0?-0.10 : -0.50;\n  const deudaZ = e.credPct>=0.6?-0.20 : e.credPct>=0.3?-0.08 : e.credPct>0?0:0.05;\n  const fin = msZ+e.resZ+deudaZ, ajusteFin = acota(fin, TOPE_FINANCIERO[0], TOPE_FINANCIERO[1]) - fin;\n  /* La competencia cercana ya no entra a P: el β de zona (DENUE) ya refleja la densidad de negocios.\n     Su efecto llega por la demanda (clientes) y de ahí al margen de seguridad. */\n  const contribs=[\n    [\"Giro (\"+e.giro.n+\")\", e.giro.z, e.giro.fz===\"denue\"?\"datos\":\"supuesto\"],\n    [\"Zona (\"+e.zona.n+\")\", e.zona.z, e.zona.fz===\"denue\"?\"datos\":\"supuesto\"],\n    [\"Experiencia en el giro\", e.expZ, \"supuesto\"],\n    [\"Reserva de capital\", e.resZ, \"supuesto\"],\n    [\"Formalidad fiscal\", e.formZ, \"datos\"],\n    [\"Marketing\", e.mktZ, \"supuesto\"],\n    [\"Estructura de deuda\", deudaZ, \"supuesto\"],\n    [\"Local propio\", e.propio?0.10:0],\n    [\"Modelo de negocio\", e.modZ||0],\n    [\"Permisos municipales\", e.permZ||0],\n    [\"Modalidad de venta\", e.modalZ||0],\n    [\"Horario extendido\", e.horZ||0],\n    [\"Riesgo de extorsión (cobro de piso)\", e.extZ||0],\n    [\"Resiliencia del emprendedor\", e.resilZ||0],\n    [\"Motivación para emprender\", e.motivZ||0],\n    [\"Margen de seguridad financiero\", msZ, \"propio\"]\n  ];\n  if(Math.abs(ajusteFin)>1e-9) contribs.push([\"Tope del bloque financiero (margen + reserva + deuda)\", ajusteFin, \"propio\"]);\n  contribs.forEach(c=>{ if(!c[2]) c[2]=\"supuesto\"; });\n  const z=BETA0+contribs.reduce((s,c)=>s+c[1],0);\n  const zSupuestos=contribs.filter(c=>c[2]===\"supuesto\").reduce((s,c)=>s+c[1],0);\n  /* P con solo lo medido (datos + números propios): cuánto de P depende de supuestos del equipo. */\n  const Pmedido=acota(sigmoide(z-zSupuestos),0.04,0.93);\n  return {P:acota(sigmoide(z),0.04,0.93), z, contribs, Pmedido, zSupuestos};\n}\n\n/* Meses de gastos fijos que cubre la reserva declarada (límite inferior de cada opción, conservador). */\nfunction mesesReserva(resZ){ return resZ>=0.35?12 : resZ>=0.20?6 : resZ>=0?3 : 1.5; }\n\n/* ---------- 7. Curva de supervivencia personalizada ---------- */\nfunction curvaSupervivencia(P){\n  const h=Math.log(P)/Math.log(S0[3]);\n  return S0.map((s,t)=>t===0?1:Math.pow(s,h));\n}\n\n/* ---------- 8. Monte Carlo (2,000 años simulados) ---------- */\nfunction monteCarlo(e){\n  /* Cada corrida = un año. Fuentes de variación (supuestos del equipo, ver\n     INCERTIDUMBRE en datos.js):\n     · choque anual común de demanda (lognormal de media 1): un \"mal año\" afecta\n       a los 12 meses a la vez, por lo que no se compensa al sumar;\n     · ruido mensual de clientes y de ticket (independiente por mes);\n     · ruido anual en el costo variable (proveedores, merma). */\n  const U=INCERTIDUMBRE, rng=mulberry32(SEMILLA), res=new Array(N_SIM), mesVta=new Float64Array(N_SIM*12);\n  const caja0=mesesReserva(e.resZ)*e.fijos; let sinCaja=0;\n  for(let i=0;i\u003cN_SIM;i++){\n    const fAnual=Math.exp(gaussiana(rng)*U.demandaAnual - U.demandaAnual*U.demandaAnual/2);\n    const cvSim=acota(e.cvEff + gaussiana(rng)*U.costoVariable, 0.02, 0.98);\n    let total=0, quiebra=false;\n    for(let m=0;m\u003c12;m++){\n      const rampa=Math.pow(1+(e.crec||0), m/12);\n      const muM=e.mu*e.estacion[m]*rampa*fAnual;\n      const cli=Math.max(0, muM + gaussiana(rng)*U.demandaMensual*muM);\n      const tk =Math.max(1, e.ticket + gaussiana(rng)*U.ticket*e.ticket);\n      const venta=cli*e.diasMes*tk;\n      mesVta[i*12+m]=venta;\n      total += venta*(1-cvSim) - e.fijos;\n      if(caja0+total\u003c0) quiebra=true;   // la reserva no alcanzó a cubrir las pérdidas acumuladas\n    }\n    res[i]=total; if(quiebra) sinCaja++;\n  }\n  res.sort((a,b)=>a-b);\n  /* Ventas de UN mes (no el promedio del año): la regla de salida del plan compara meses sueltos.\n     falsaAlarma = años simulados en que hay dos meses seguidos bajo el P5 mensual aunque el negocio\n     va como lo esperado (el modelo ES el escenario esperado): cuántas veces la regla se activaría por error. */\n  const ordenMes=Array.from(mesVta).sort((a,b)=>a-b), p05Mes=cuantil(ordenMes,.05);\n  let alarmas=0;\n  for(let i=0;i\u003cN_SIM;i++){ for(let m=1;m\u003c12;m++){ if(mesVta[i*12+m-1]\u003cp05Mes && mesVta[i*12+m]\u003cp05Mes){ alarmas++; break; } } }\n  const media=res.reduce((s,x)=>s+x,0)/N_SIM;\n  const sd=Math.sqrt(res.reduce((s,x)=>s+(x-media)**2,0)/(N_SIM-1));\n  return {res, media, sd, p025:cuantil(res,.025), p05:cuantil(res,.05), p50:cuantil(res,.5),\n          p95:cuantil(res,.95), p975:cuantil(res,.975),\n          pPos:res.filter(x=>x>0).length/N_SIM,\n          pSinEfectivo:sinCaja/N_SIM, cajaInicial:caja0,\n          ventasMes:{p05:p05Mes, p50:cuantil(ordenMes,.5), falsaAlarma:alarmas/N_SIM}};\n}\n\n/* Cuantil empírico con interpolación lineal (tipo 7 de Hyndman–Fan, el de R/NumPy). */\nfunction cuantil(ordenados,p){\n  const h=(ordenados.length-1)*p, lo=Math.floor(h), hi=Math.ceil(h);\n  return ordenados[lo]+(ordenados[hi]-ordenados[lo])*(h-lo);\n}\n\n/* ---------- 8-bis. Rango plausible de P (incertidumbre de los β) ----------\n   Los β son supuestos del equipo, no estimaciones con error estándar. Para no\n   presentar P como exacta, se perturba z: cada contribución βᵢ con DE relativa\n   de 30 % y el intercepto con DE 0.15, y se reportan P5–P95 de P.\n   Es un análisis de sensibilidad, NO un intervalo de confianza muestral. */\nfunction rangoP(modelo){\n  if(modelo._rangoP) return modelo._rangoP;   // memo: se consulta varias veces por recálculo\n  const U=INCERTIDUMBRE, rng=mulberry32(SEMILLA+1), n=1000, ps=new Array(n);\n  for(let i=0;i\u003cn;i++){\n    let z=BETA0+gaussiana(rng)*U.intercepto;\n    for(const c of modelo.contribs) z+=c[1]*(1+gaussiana(rng)*U.betaRelativa);\n    ps[i]=acota(sigmoide(z),0.04,0.93);\n  }\n  ps.sort((a,b)=>a-b);\n  return (modelo._rangoP={p05:cuantil(ps,.05), p50:cuantil(ps,.5), p95:cuantil(ps,.95)});\n}\n\n\n// El build incluye este código y el motor en el mismo Blob.\nself.onmessage = ({data: {id, e, modelo}}) => {\n  self.postMessage({id, mc: monteCarlo(e), rango: rangoP(modelo)});\n};\n"],{type:"text/javascript"}));
    const worker=new Worker(url);
    worker.onmessage=({data:{id,mc,rango}})=>{
      if(id===solicitudCalculo?.id) terminarCalculo(solicitudCalculo,mc,rango);
    };
    worker.onerror=ev=>{
      ev.preventDefault();
      usarCalculoSincrono(worker);
    };
    worker.onmessageerror=()=>usarCalculoSincrono(worker);
    return worker;
  }catch{
    return null;
  }finally{
    if(url) URL.revokeObjectURL(url);
  }
}
function usarCalculoSincrono(worker){
  worker?.terminate();
  workerActivo=null;
  if(solicitudCalculo) terminarCalculo(solicitudCalculo,monteCarlo(solicitudCalculo.e));
}
function calcular(){
  clearTimeout(tVivo);
  tVivo=null;
  const e=leerEscenario();
  const modelo=modeloLogistico(e);
  solicitudCalculo={id:++versionCalculo,e,modelo};
  estadoCalculo("pendiente");
  if(workerActivo){
    pintarVeredicto(modelo.P);   // la probabilidad logística es inmediata: se muestra sin esperar al Monte Carlo
    marcarPendiente();
    try{
      workerActivo.postMessage(solicitudCalculo);
      return;
    }catch{
      usarCalculoSincrono(workerActivo);
      return;
    }
  }
  usarCalculoSincrono(null);
}
function terminarCalculo({id,e,modelo},mc,rango){
  solicitudCalculo=null;
  if(rango) modelo._rangoP=rango;
  const S=curvaSupervivencia(modelo.P);
  const vpn=pintarKPIs(e,mc,S,modelo);
  pintarVeredicto(modelo.P, vpn);
  pintarLectura(e,mc,modelo,vpn);
  const fin=finanzas(e,mc,S);
  ultimoResumen=resumenEscenario(e,modelo,mc,fin);
  /* Lo que está fuera de la vista se pinta en tareas separadas (<50 ms cada una)
     para no bloquear el hilo principal; una versión nueva cancela la anterior. */
  [()=>pintarGraficas(e,mc,S,modelo), ()=>pintarMapa(e,modelo), ()=>pintarFODA(e,modelo,mc), ()=>pintarWidgets(e,modelo,mc,S), ()=>pintarExplorar(e,modelo,mc,S), ()=>pintarMejora(e,modelo,mc,fin)]
    .forEach(f=>setTimeout(()=>{ if(id===versionCalculo) f(); },0));
  setTimeout(()=>{ if(id===versionCalculo&&!solicitudCalculo&&!tVivo){ estadoCalculo("listo"); document.documentElement.dataset.calculoVersion=String(id); } },700);   // 650 ms dura el contador animado
}
/* ---------- 15. Barra de progreso y navegación activa ---------- */
(function navViva(){
  const barra=$("progreso");
  window.addEventListener("scroll",()=>{
    const h=document.documentElement;
    barra.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+"%";
  },{passive:true});
  const enlaces=[...document.querySelectorAll('.nav-links a[href^="#"]')];
  const io=new IntersectionObserver(es=>{
    es.forEach(en=>{
      if(!en.isIntersecting) return;
      enlaces.forEach(a=>a.classList.toggle("activa",a.getAttribute("href")==="#"+en.target.id));
    });
  },{rootMargin:"-35% 0px -55% 0px"});
  ["contexto","simulador","mapa","estrategia","metodologia","lectura","legal","creditos"].forEach(id=>{
    const s=$(id); if(s) io.observe(s);
  });
})();

/* ---------- 16. Arranque ---------- */
const observarMapa=new IntersectionObserver(([entrada])=>{
  if(!entrada.isIntersecting) return;
  observarMapa.disconnect();
  if(!$("mapaReal").hidden) usarReal();
},{rootMargin:"200px 0px"});
observarMapa.observe($("mapa"));

/* Escenario inicial: el del enlace compartido (#e=...) o el de referencia. */
if(!cargarEscenario(location.hash)) calcular();

/* Formulario fijo (sticky) junto a los resultados: si cabe, se pega debajo de la barra; si es más alto que
   la pantalla, se pega por su borde inferior. Así nunca se ve una columna vacía al recorrer los resultados. */
(function formaFija(){
  const forma=$("forma"), nav=document.querySelector(".nav"), tira=$("pestanasApp");
  const ajustar=()=>{
    const arriba=(nav&&getComputedStyle(nav).position==="sticky"?nav.offsetHeight:0)+(tira?tira.offsetHeight:0)+16;
    document.documentElement.style.setProperty("--tope-forma",Math.min(arriba,innerHeight-forma.offsetHeight-16)+"px");
  };
  new ResizeObserver(ajustar).observe(forma);
  addEventListener("resize",ajustar); ajustar();
})();

/* ---------- 13-bis. Herramientas del plan (Estrategia) ---------- */
// Hitos de 90 días e indicador de seguimiento por palanca: sugerencias del equipo, no datos.
const HITOS_PLAN={
  reserva:{m:["Separar 1 mes de gastos fijos en una cuenta aparte","Llegar a 3 meses de reserva","Llegar a 6 meses de reserva"],kpi:"Meses de gastos fijos cubiertos por la reserva (meta: 6)"},
  deuda:{m:["Renegociar plazo o tasa del crédito","Reducir el crédito con aportación propia","Deuda de 15 % o menos de la inversión"],kpi:"Crédito como % de la inversión (meta: 15 % o menos)"},
  margen:{m:["Cotizar con 3 proveedores","Ajustar recetas o mezcla de productos","Costo variable 10 puntos menor"],kpi:"Costo variable como % de la venta"},
  marketing:{m:["Perfil de Google y redes con fotos y horario","Promoción medible (cupón o código)","12 % más clientes por día"],kpi:"Clientes por día (promedio semanal)"},
  formalidad:{m:["Alta en el SAT (RESICO)","Registro patronal en el IMSS","Facturar y operar formalmente"],kpi:"Trámites completados (de 3)"},
  experiencia:{m:["Elegir curso o mentoría del giro","Completar la capacitación","Aplicar 3 mejoras aprendidas"],kpi:"Horas de capacitación y mejoras aplicadas"},
  diferenciacion:{m:["Definir qué te hace distinto","Ajustar oferta y comunicación","Medir ventas del producto distintivo"],kpi:"% de ventas del producto o servicio distintivo"},
  retencion:{m:["Programa de lealtad sencillo","Registrar clientes recurrentes","7 % más clientes que regresan"],kpi:"Clientes que regresan en 30 días"},
  zona:{m:["Visitar locales disponibles en la zona sugerida","Comparar renta y afluencia en campo","Decidir la ubicación"],kpi:"Renta por m² y peatones por hora"}
};
let planSel=null;
/* Impacto de cada factor = puntos de probabilidad que cambiarían si fuera neutro (β = 0); ctrl = depende del negocio. */
function factoresImpacto(modelo){
  const INT=["Experiencia","Reserva","Formalidad","Marketing","Estructura de deuda","Local propio","Margen de seguridad","Resiliencia","Motivación","Modelo de negocio","Permisos","Modalidad","Horario"];
  const sig=x=>1/(1+Math.exp(-x)), z=modelo.z;
  return modelo.contribs.filter(c=>Math.abs(c[1])>0.001).map(([n,b])=>({n:n.replace(/ \(.+\)$/,""), b, imp:Math.abs(sig(z)-sig(z-b)), ctrl:INT.some(k=>n.startsWith(k))}));
}
/* Plan por etapas con criterios de salida. No promete que el negocio sobreviva: acota la pérdida.
   Cada meta sale de los números del propio negocio (punto de equilibrio, inversión, reserva) y del Monte Carlo. */
function etapasPlan(e, mc){
  const peDia=isFinite(e.peDia)?Math.ceil(e.peDia):null, vm=mc.ventasMes||{};
  return [
    {t:"Antes de invertir · prueba de demanda (2 a 4 semanas)",
     d:peDia?"Vende en pequeño (pedidos, puesto temporal o preventa). Meta: <strong>"+peDia+" clientes al día</strong>, tu punto de equilibrio. Si no la alcanzas, no abras todavía: ajusta precio, giro o zona y repite la prueba.":"Con este precio y costo variable no hay punto de equilibrio: corrige precio o costos antes de cualquier prueba.",
     salida:"Sin la meta de clientes, no se abre."},
    {t:"Inversión por tramos (meses 0 a 3)",
     d:"Compromete como máximo <strong>"+mxn.format(Math.round(e.inversion*0.40))+"</strong> (40 % de la inversión) antes de ver el mes 3. Renta flexible, equipo usado o rentado, sin remodelación definitiva.",
     salida:"El resto de la inversión solo se libera si el mes 3 pasa la revisión."},
    {t:"Revisiones en los meses 3, 6 y 12",
     d:"Compara las ventas de cada mes con lo que simula el modelo para un mes: mediana <strong>"+mxn.format(Math.round(vm.p50||0))+"</strong>, escenario malo P5 <strong>"+mxn.format(Math.round(vm.p05||0))+"</strong>. Un mes bajo el P5 puede ser mala suerte; dos seguidos ya es señal. Aun si el negocio va como se esperaba, esta regla se activa por error en el <strong>"+pct(vm.falsaAlarma||0)+"</strong> de los años: revisa la causa antes de cerrar.",
     salida:"Dos meses seguidos por debajo del P5 mensual: ajusta a fondo; si el tercero sigue abajo, cierra."},
    {t:"Pérdida máxima decidida desde el día uno",
     d:"Tu reserva (≈ <strong>"+mxn.format(Math.round(mc.cajaInicial||0))+"</strong>) es el tope de lo que estás dispuesto a perder, y nada más. Con tus números, la probabilidad de agotarla en el primer año es de <strong>"+pct(mc.pSinEfectivo||0)+"</strong>.",
     salida:"Si las pérdidas acumuladas alcanzan la reserva, se cierra; no se pide crédito para cubrirlas."},
    {t:"Con datos reales, vuelve a calcular",
     d:"Desde el mes 3, carga tu historial en <strong>Para empresas</strong>: P y los escenarios se recalculan con tus ventas, no con supuestos.",
     salida:"Las decisiones de los meses 6 y 12 usan tus datos."}
  ];
}
function pintarHerramientasPlan(e, modelo, L, P0){
  // Simulador de plan: mismas palancas, aplicadas juntas con aplicarPalancas()
  seguro("wPlan",()=>{
    if(!L.length){ $("planOpciones").innerHTML=""; $("planRes").innerHTML=""; estadoWidget("wPlan","vacio","Tu escenario no tiene palancas con mejora significativa."); return false; }
    const claves=L.map(l=>l.clave);
    if(!planSel || !planSel.every(c=>claves.includes(c))) planSel=claves.slice(0,3);
    const foco=document.activeElement&&document.activeElement.closest("#planOpciones")?document.activeElement.value:null;
    $("planOpciones").innerHTML=L.map(l=>'<label class="plan-op"><input type="checkbox" value="'+l.clave+'"'+(planSel.includes(l.clave)?" checked":"")+'> '+l.titulo+' <span class="plan-dp">+'+(l.lift*100).toFixed(1)+' pts sola</span></label>').join("");
    if(foco){ const f=$("planOpciones").querySelector("input[value=\""+foco+"\"]"); if(f) f.focus(); }
    const elegidas=L.filter(l=>planSel.includes(l.clave));
    const Pplan=pPlan(e, elegidas, P0);
    $("planRes").innerHTML='<span class="plan-p">'+(P0*100).toFixed(1)+'% → <strong>'+(Pplan*100).toFixed(1)+'%</strong></span> con '+elegidas.length+(elegidas.length===1?" acción":" acciones")+' (+'+((Pplan-P0)*100).toFixed(1)+' pts)';
  });
  // Matriz de impacto y control: ΔP si el factor fuera neutro
  seguro("wRiesgo",()=>{
    const fac=factoresImpacto(modelo);
    if(!fac.length){ estadoWidget("wRiesgo","vacio","Todos los factores están en posición neutra."); return false; }
    const alto=f=>f.imp>=0.03;
    const celda=(t,f)=>'<div class="mr-celda"><p class="mr-t">'+t+'</p><ul>'+(f.length?f.sort((a,b)=>b.imp-a.imp).map(x=>'<li class="'+(x.b<0?"neg":"pos")+'">'+esc(x.n)+' <span>'+(x.b<0?"−":"+")+(x.imp*100).toFixed(1)+' pts</span></li>').join(""):'<li class="vacio">Ninguno</li>')+"</ul></div>";
    $("matrizRiesgo").innerHTML=celda("Controlas · impacto alto",fac.filter(f=>f.ctrl&&alto(f)))+celda("Externo · impacto alto",fac.filter(f=>!f.ctrl&&alto(f)))+
      celda("Controlas · impacto bajo",fac.filter(f=>f.ctrl&&!alto(f)))+celda("Externo · impacto bajo",fac.filter(f=>!f.ctrl&&!alto(f)));
  });
  // Calendario de 90 días e indicadores de las acciones marcadas
  seguro("wCalendario",()=>{
    const elegidas=L.filter(l=>planSel&&planSel.includes(l.clave)&&HITOS_PLAN[l.clave]);
    if(!elegidas.length){ $("calendario").innerHTML=""; estadoWidget("wCalendario","vacio","Marca al menos una acción en el simulador de plan."); return false; }
    $("calendario").innerHTML=["Días 1 a 30","Días 31 a 60","Días 61 a 90"].map((t,m)=>'<li><p class="cal-t">'+t+'</p><ul>'+elegidas.map(l=>"<li>"+HITOS_PLAN[l.clave].m[m]+"</li>").join("")+"</ul></li>").join("")+
      '<li class="cal-kpi"><p class="cal-t">Indicadores de seguimiento</p><ul>'+elegidas.map(l=>"<li><strong>"+l.titulo+":</strong> "+HITOS_PLAN[l.clave].kpi+"</li>").join("")+"</ul></li>";
  });
}
$("planOpciones").addEventListener("change",()=>{ planSel=[...$("planOpciones").querySelectorAll("input:checked")].map(i=>i.value); calcular(); });
