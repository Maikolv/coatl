/**
 * COATL · Encuesta a negocios de Coacalco — GENERADO por scripts/encuesta.mjs (no editar a mano).
 * Crea el formulario de Google y una hoja de cálculo para las respuestas, en la cuenta de quien lo ejecuta.
 * Cómo usarlo: script.google.com → Proyecto nuevo → pega este archivo → Ejecutar «crearFormulario» → autoriza.
 * Al terminar, el registro de ejecución muestra el enlace para responder y el de edición.
 */
function crearFormulario() {
  var f = FormApp.create('COATL · Encuesta a negocios de Coacalco');
  f.setDescription("Esta encuesta, de unos 5 minutos, ayuda a medir con datos reales qué hace que un negocio de Coacalco siga abierto. Es parte de COATL (Cálculo de Oportunidad y Análisis Territorial Local), un proyecto académico de la materia de Probabilidad y Estadística. COATL nunca te pedirá contraseñas, datos bancarios ni pagos. Si alguien lo hace en nombre del proyecto, no respondas.");
  f.setProgressBar(true);
  f.setCollectEmail(false);
  f.setAllowResponseEdits(false);
  f.setShowLinkToRespondAgain(false);
  f.setConfirmationMessage("¡Gracias! Tu respuesta ayuda a que COATL mida con datos lo que hoy son supuestos. Si quieres ver cómo funciona el simulador, pide una demostración al equipo de COATL.");

  // Aviso de privacidad y consentimiento: si no acepta, el formulario termina aquí.
  f.addSectionHeaderItem().setTitle('Aviso de privacidad').setHelpText("AVISO DE PRIVACIDAD SIMPLIFICADO (Ley Federal de Protección de Datos Personales en Posesión de los Particulares).\nResponsables: Miguel Antonio Cruz García, Bruno Alejandro López Bautista y Alonso Arroyo Cortés, autores del proyecto académico COATL (materia de Probabilidad y Estadística).\nFinalidad única: estimar con datos reales cómo se relacionan la experiencia, la reserva de efectivo, el marketing y la deuda con la supervivencia de los negocios de Coacalco. No hay fines comerciales ni de cobranza.\nQué datos: características de tu negocio. El nombre comercial, la calle y el contacto son OPCIONALES y solo sirven para buscar el negocio en el DENUE del INEGI dentro de un año; no se publican.\nQué se publica: solo resultados agregados (conteos, porcentajes y coeficientes), nunca respuestas individuales. Las respuestas no se suben al repositorio del proyecto ni se envían a servicios de inteligencia artificial.\nTus derechos: puedes pedir el acceso, la corrección o la eliminación de tus respuestas en persona al equipo que te invitó a responder. COATL nunca te pedirá contraseñas, datos bancarios ni pagos. Si alguien lo hace en nombre del proyecto, no respondas.\nParticipar es voluntario y puedes dejar preguntas sin contestar salvo las marcadas como obligatorias.");
  var consentimiento = f.addMultipleChoiceItem().setTitle('¿Aceptas participar con base en este aviso?').setRequired(true);
  consentimiento.setChoices([
    consentimiento.createChoice('Sí, acepto', FormApp.PageNavigationType.CONTINUE),
    consentimiento.createChoice('No acepto', FormApp.PageNavigationType.SUBMIT)
  ]);

  f.addPageBreakItem().setTitle("Tu negocio").setHelpText("Datos generales. Con ellos ubicamos tu negocio en el giro y la zona que usa COATL.");
  f.addListItem().setTitle("¿A qué se dedica tu negocio?").setHelpText("Elige el giro más parecido. Si no aparece, elige «Otro».").setRequired(true).setChoiceValues(["Abarrotes / minisúper","Autolavado","Cafetería","Carnicería / pollería","Celulares y accesorios","Ciber / impresiones","Consultorio / despacho profesional","Consultorio dental","Educación (regularización / idiomas)","Estética / barbería","Farmacia","Ferretería / tlapalería","Florería","Fonda / cocina económica","Frutería y verdulería","Gimnasio (mensualidades)","Joyería y bisutería","Juguería / licuados","Lavandería","Óptica","Panadería","Papelería","Pastelería / repostería","Pizzería","Refaccionaria automotriz","Restaurante","Ropa y calzado","Spa / salón de uñas","Taller mecánico","Taquería / antojitos","Tecnología (venta y reparación)","Tienda naturista / suplementos","Tortillería","Veterinaria / estética canina","Vinatería / licorería","Otro"]);
  f.addListItem().setTitle("¿En qué zona de Coacalco está?").setHelpText("Las mismas seis zonas del mapa de COATL.").setRequired(true).setChoiceValues(["Corredor Vía López Portillo","San Francisco Coacalco (Centro)","Villa de las Flores · Parque Res. · Bosques","Los Héroes · Loma Bonita · V. de las Manzanas","El Potrero · San Rafael · El Olivo","Zonas habitacionales periféricas","No sé"]);
  f.addTextItem().setTitle("¿En qué año abrió el negocio?").setHelpText("Año de cuatro cifras, por ejemplo 2021.").setRequired(true).setValidation(FormApp.createTextValidation().setHelpText('Escribe un año entre 1950 y 2026.').requireNumberBetween(1950, 2026).build());
  f.addMultipleChoiceItem().setTitle("¿Cuántas personas trabajan, contándote a ti?").setRequired(true).setChoiceValues(["0 a 5","6 a 10","11 a 30","31 o más"]);
  f.addMultipleChoiceItem().setTitle("El local es…").setRequired(true).setChoiceValues(["Propio","Rentado","Sin local fijo (puesto, a domicilio o en línea)"]);

  f.addPageBreakItem().setTitle("Cuando abriste").setHelpText("Piensa en el momento de la apertura, no en hoy. Estas son las variables que COATL todavía no puede medir.");
  f.addMultipleChoiceItem().setTitle("Antes de abrir, ¿cuánta experiencia tenías en este mismo giro?").setHelpText("Como dueño, empleado o familiar que ayudaba.").setRequired(true).setChoiceValues(["Ninguna","Menos de 1 año","1 a 3 años","3 a 5 años","Más de 5 años"]);
  f.addMultipleChoiceItem().setTitle("¿Tomaste capacitación formal sobre el giro o sobre administrar un negocio?").setRequired(true).setChoiceValues(["Sí","No"]);
  f.addMultipleChoiceItem().setTitle("Al abrir, ¿cuántos meses de gastos fijos podías pagar sin vender nada?").setHelpText("Renta, sueldos, servicios y deudas, con tus ahorros o tu reserva.").setRequired(true).setChoiceValues(["Menos de 3 meses","3 a 6 meses","6 a 12 meses","Más de 12 meses","No sé"]);
  f.addMultipleChoiceItem().setTitle("¿Qué parte de la inversión inicial fue con crédito o préstamo?").setRequired(true).setChoiceValues(["Nada (0 %)","Menos de la tercera parte (1 % a 29 %)","Entre la tercera parte y la mitad (30 % a 59 %)","La mayor parte (60 % o más)"]);
  f.addCheckboxItem().setTitle("¿De dónde vino ese crédito?").setHelpText("Marca todas las que apliquen.").setChoiceValues(["Banco","Caja popular o cooperativa","Programa de gobierno","Familiares o amigos","Proveedor","Prestamista informal","No usé crédito"]);
  f.addMultipleChoiceItem().setTitle("En el primer año, ¿cómo promocionaste el negocio?").setRequired(true).setChoiceValues(["No lo promocioné","Básico: redes sociales sin pagar","Activo: redes, publicidad pagada y WhatsApp Business"]);
  f.addMultipleChoiceItem().setTitle("En el primer año, ¿cuánto gastabas al mes en publicidad?").setChoiceValues(["Nada","Menos de $500","$500 a $2,000","$2,000 a $5,000","Más de $5,000"]);
  f.addMultipleChoiceItem().setTitle("Ante el SAT y el IMSS, el negocio…").setRequired(true).setChoiceValues(["Fue formal desde el inicio","Se formalizó poco a poco","No está registrado"]);

  f.addPageBreakItem().setTitle("Hoy").setHelpText("La situación actual. Si el negocio ya cerró, tus respuestas valen lo mismo: sin los negocios que cerraron, la estimación saldría sesgada.");
  f.addMultipleChoiceItem().setTitle("¿El negocio sigue abierto?").setRequired(true).setChoiceValues(["Sí, sigue abierto","Cerró"]);
  f.addTextItem().setTitle("Si cerró, ¿en qué año?").setHelpText("Déjalo en blanco si sigue abierto.").setValidation(FormApp.createTextValidation().setHelpText('Escribe un año entre 1950 y 2026.').requireNumberBetween(1950, 2026).build());
  f.addMultipleChoiceItem().setTitle("Ventas de un mes normal (aproximadas)").setChoiceValues(["Menos de $25,000","$25,000 a $50,000","$50,000 a $100,000","$100,000 a $300,000","Más de $300,000","Prefiero no responder"]);
  f.addMultipleChoiceItem().setTitle("¿Has recibido amenazas o cobro de piso?").setHelpText("Pregunta opcional. Solo se usa en conteos agregados.").setChoiceValues(["Nunca","Alguna vez","Con frecuencia","Prefiero no responder"]);

  f.addPageBreakItem().setTitle("Seguimiento (opcional)").setHelpText("Dentro de un año buscaremos el negocio en el DENUE del INEGI para saber si sigue operando. Estos datos son opcionales y no se publican.");
  f.addTextItem().setTitle("Nombre comercial del negocio");
  f.addTextItem().setTitle("Calle y número (o la referencia más cercana)");
  f.addMultipleChoiceItem().setTitle("¿Aceptas que te contactemos dentro de 12 meses para una pregunta breve?").setChoiceValues(["Sí","No"]);
  f.addTextItem().setTitle("Correo electrónico o teléfono para ese contacto").setHelpText("Solo si respondiste «Sí» arriba.");

  var hoja = SpreadsheetApp.create('COATL · Respuestas de la encuesta');
  f.setDestination(FormApp.DestinationType.SPREADSHEET, hoja.getId());
  Logger.log('Para responder: ' + f.getPublishedUrl());
  Logger.log('Para editar:    ' + f.getEditUrl());
  Logger.log('Respuestas:     ' + hoja.getUrl());
}
