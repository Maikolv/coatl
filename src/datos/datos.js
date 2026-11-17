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
