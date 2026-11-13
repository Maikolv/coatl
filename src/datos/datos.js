/* COATL · Datos de anclaje (giros, zonas, S0, estacionalidad). Sin DOM. */
/* ---------- 1. Parámetros y datos de anclaje ---------- */
const GIROS = {
  abarrotes:    {n:"Abarrotes / minisúper",                ticket:65,  cv:72, dem:120, z:-0.10},
  tortilleria:  {n:"Tortillería",                          ticket:22,  cv:55, dem:260, z:-0.02},
  carniceria:   {n:"Carnicería / pollería",                ticket:140, cv:68, dem:75,  z: 0.00},
  fruteria:     {n:"Frutería y verdulería",                ticket:70,  cv:62, dem:95,  z:-0.05},
  fonda:        {n:"Fonda / cocina económica",             ticket:85,  cv:45, dem:70,  z:-0.12},
  taqueria:     {n:"Taquería / antojitos",                 ticket:95,  cv:40, dem:90,  z:-0.10},
  restaurante:  {n:"Restaurante",                          ticket:180, cv:42, dem:55,  z:-0.15},
  pizzeria:     {n:"Pizzería",                             ticket:160, cv:38, dem:45,  z:-0.10},
  cafeteria:    {n:"Cafetería",                            ticket:95,  cv:38, dem:65,  z:-0.08},
  jugueria:     {n:"Juguería / licuados",                  ticket:55,  cv:35, dem:70,  z:-0.06},
  panaderia:    {n:"Panadería",                            ticket:40,  cv:45, dem:140, z:-0.02},
  pasteleria:   {n:"Pastelería / repostería",              ticket:210, cv:38, dem:30,  z: 0.00},
  papeleria:    {n:"Papelería",                            ticket:55,  cv:60, dem:80,  z:-0.10},
  ciber:        {n:"Ciber / impresiones",                  ticket:35,  cv:25, dem:60,  z:-0.05},
  farmacia:     {n:"Farmacia",                             ticket:160, cv:70, dem:90,  z: 0.05},
  naturista:    {n:"Tienda naturista / suplementos",       ticket:170, cv:52, dem:30,  z: 0.03},
  vinateria:    {n:"Vinatería / licorería",                ticket:180, cv:68, dem:55,  z: 0.02},
  ropa:         {n:"Ropa y calzado",                       ticket:320, cv:55, dem:25,  z:-0.18},
  joyeria:      {n:"Joyería y bisutería",                  ticket:350, cv:52, dem:10,  z:-0.08},
  celulares:    {n:"Celulares y accesorios",               ticket:280, cv:55, dem:28,  z:-0.02},
  tecnologia:   {n:"Tecnología (venta y reparación)",      ticket:380, cv:50, dem:18,  z: 0.10},
  ferreteria:   {n:"Ferretería / tlapalería",              ticket:190, cv:62, dem:40,  z: 0.06},
  refaccionaria:{n:"Refaccionaria automotriz",             ticket:260, cv:58, dem:22,  z: 0.08},
  taller:       {n:"Taller mecánico",                      ticket:850, cv:40, dem:8,   z: 0.12},
  autolavado:   {n:"Autolavado",                           ticket:120, cv:25, dem:28,  z: 0.04},
  estetica:     {n:"Estética / barbería",                  ticket:130, cv:18, dem:28,  z: 0.08},
  spa:          {n:"Spa / salón de uñas",                  ticket:260, cv:22, dem:18,  z: 0.06},
  lavanderia:   {n:"Lavandería",                           ticket:90,  cv:30, dem:45,  z: 0.02},
  gimnasio:     {n:"Gimnasio (mensualidades)",             ticket:480, cv:12, dem:12,  z: 0.05},
  veterinaria:  {n:"Veterinaria / estética canina",        ticket:320, cv:30, dem:16,  z: 0.12},
  dental:       {n:"Consultorio dental",                   ticket:750, cv:22, dem:7,   z: 0.22},
  optica:       {n:"Óptica",                               ticket:950, cv:45, dem:7,   z: 0.10},
  consultorio:  {n:"Consultorio / despacho profesional",   ticket:420, cv:15, dem:10,  z: 0.20},
  educacion:    {n:"Educación (regularización / idiomas)", ticket:350, cv:20, dem:15,  z: 0.15},
  floreria:     {n:"Florería",                             ticket:230, cv:45, dem:14,  z:-0.04}
};
const ZONAS = {
  corredor:  {n:"Corredor Vía López Portillo",                       afl:1.35, rm2:280, z: 0.30},
  centro:    {n:"San Francisco Coacalco (Centro)",                   afl:1.15, rm2:170, z: 0.12},
  flores:    {n:"Villa de las Flores · Parque Res. · Bosques",       afl:1.10, rm2:190, z: 0.15},
  heroes:    {n:"Los Héroes · Loma Bonita · V. de las Manzanas",     afl:1.00, rm2:150, z: 0.04},
  popular:   {n:"El Potrero · San Rafael · El Olivo",                afl:0.90, rm2:110, z:-0.10},
  periferia: {n:"Zonas habitacionales periféricas",                  afl:0.78, rm2:90,  z:-0.18}
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
