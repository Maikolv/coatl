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
