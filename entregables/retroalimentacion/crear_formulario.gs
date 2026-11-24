/**
 * COATL · Retroalimentación (Feria Profesiográfica 2026) — GENERADO por scripts/retroalimentacion.mjs (no editar a mano).
 * Crea el formulario de Google y una hoja de cálculo para las respuestas, en la cuenta de quien lo ejecuta.
 * Cómo usarlo:
 *   1. script.google.com → Proyecto nuevo → pega este archivo → Ejecutar «crearFormulario» → autoriza.
 *   2. Abre el enlace de edición que aparece en el registro → Personalizar tema → Encabezado → sube encabezado.png
 *      (en el mismo tema: color #C8102E, fondo #FBF6F3, fuente «Basic»).
 *   3. Comparte el enlace para responder solo en persona (QR impreso en el stand), nunca en el repositorio.
 */
function crearFormulario() {
  var f = FormApp.create('COATL · ¿Qué te pareció?');
  f.setDescription("Gracias por visitar COATL (Cálculo de Oportunidad y Análisis Territorial Local) en la Feria Profesiográfica 2026. COATL estima la probabilidad de que un negocio siga abierto a 3 años en Coacalco de Berriozábal y cuánto podría ganar, con datos del INEGI y modelos de Probabilidad y Estadística.\nResponder toma 2 minutos. Tu opinión nos ayuda a mejorar el proyecto.\nAutores: Miguel Antonio Cruz García, Bruno Alejandro López Bautista y Alonso Arroyo Cortés. Contacto: A660136406@my.uvm.edu.mx.\nCOATL nunca te pedirá contraseñas, datos bancarios ni pagos. Si alguien lo hace en nombre del proyecto, no respondas.");
  f.setProgressBar(false);
  f.setCollectEmail(false);
  f.setAllowResponseEdits(false);
  f.setShowLinkToRespondAgain(true);
  f.setConfirmationMessage("¡Gracias por tu opinión! El equipo de COATL la leerá para mejorar el proyecto. Si quieres decirnos algo más, escribe a A660136406@my.uvm.edu.mx.");

  f.addSectionHeaderItem().setTitle('Privacidad').setHelpText("No pedimos datos personales: tu nombre es opcional. Las respuestas solo se usan para mejorar COATL y se reportan en conjunto (conteos y promedios), nunca de forma individual. No se publican, no se suben al repositorio del proyecto ni se envían a servicios de inteligencia artificial. Para pedir que borremos tu respuesta, escribe a A660136406@my.uvm.edu.mx.");
  f.addScaleItem().setTitle("¿Qué tan útil te pareció COATL?").setRequired(true).setBounds(1, 5).setLabels("Nada útil", "Muy útil");
  f.addScaleItem().setTitle("¿Qué tan fácil fue usarlo?").setRequired(true).setBounds(1, 5).setLabels("Muy difícil", "Muy fácil");
  f.addScaleItem().setTitle("¿Qué tan claro te quedó cómo se calcula la probabilidad?").setRequired(true).setBounds(1, 5).setLabels("Nada claro", "Muy claro");
  f.addScaleItem().setTitle("¿Qué tan atractivo te pareció el diseño?").setBounds(1, 5).setLabels("Nada atractivo", "Muy atractivo");
  f.addCheckboxItem().setTitle("¿Qué apartados te gustaron más?").setHelpText("Marca todos los que apliquen.").setChoiceValues(["Inicio y mapa de Coacalco","Territorio","DENUE nacional","Simulador","Para empresas","Estrategia","Metodología","Video","Asistente"]);
  f.addParagraphTextItem().setTitle("¿Qué fue lo que más te gustó?");
  f.addParagraphTextItem().setTitle("¿Qué mejorarías o qué le agregarías?");
  f.addMultipleChoiceItem().setTitle("¿Recomendarías COATL a alguien que quiere abrir un negocio?").setRequired(true).setChoiceValues(["Sí","Tal vez","No"]);
  f.addMultipleChoiceItem().setTitle("Tú eres…").setChoiceValues(["Estudiante de preparatoria","Estudiante universitario","Docente","Madre, padre o familiar","Emprendedor o dueño de negocio"]).showOtherOption(true);
  f.addTextItem().setTitle("¿Qué carrera estudias o te interesa?").setHelpText("Opcional.");
  f.addTextItem().setTitle("Tu nombre").setHelpText("Opcional.");

  var hoja = SpreadsheetApp.create('COATL · Respuestas de retroalimentación');
  f.setDestination(FormApp.DestinationType.SPREADSHEET, hoja.getId());
  Logger.log('Para responder: ' + f.getPublishedUrl());
  Logger.log('Para editar:    ' + f.getEditUrl());
  Logger.log('Respuestas:     ' + hoja.getUrl());
}
