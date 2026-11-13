#!/usr/bin/env node
// Asistente de IA de COATL (Claude) para usar dentro del repositorio o de una copia descargada.
// Responde preguntas sobre el modelo, simula escenarios con el MISMO motor del sitio y consulta
// los datos del DENUE y la documentación del proyecto.
//
// Uso:
//   npm run asistente                          (conversación interactiva)
//   npm run asistente -- "¿Qué P tiene una farmacia en el Centro con 90 clientes al día?"
// Credenciales: ANTHROPIC_API_KEY, o un perfil de `ant auth login`. Sin credenciales, se avisa y termina.
import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { cargarModelo, escenarioReferencia } from "../tests/cargar.mjs";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(raiz);
const M = cargarModelo();
const DOCS = ["README.md", "CLAUDE.md", "docs/METODOLOGIA.md", "docs/VERIFICACION_DATOS.md", "docs/DENUE.md", "docs/WIDGETS.md", "docs/SEGURIDAD.md"];

const herramientas = [
  {
    name: "simular_escenario",
    description: "Ejecuta el modelo estadístico de COATL (logístico + Cox + Monte Carlo + finanzas) partiendo del escenario de referencia (Cafetería · Los Héroes) y aplicando solo los cambios indicados. Devuelve P a 3 años, rango plausible, utilidad mensual, percentiles del Monte Carlo, ROI, payback y VPN.",
    strict: true,
    input_schema: {
      type: "object", additionalProperties: false,
      properties: {
        giro: { type: ["string", "null"], enum: [...Object.keys(M.GIROS), null], description: "Clave del giro" },
        zona: { type: ["string", "null"], enum: [...Object.keys(M.ZONAS), null] },
        clientes_dia: { type: ["number", "null"] }, ticket: { type: ["number", "null"] },
        costo_variable_pct: { type: ["number", "null"] }, renta: { type: ["number", "null"] },
        empleados: { type: ["number", "null"] }, inversion: { type: ["number", "null"] },
        credito_pct: { type: ["number", "null"] },
      },
      required: ["giro", "zona", "clientes_dia", "ticket", "costo_variable_pct", "renta", "empleados", "inversion", "credito_pct"],
    },
  },
  {
    name: "leer_documento",
    description: "Lee un documento del proyecto para citar metodología, supuestos o fuentes.",
    strict: true,
    input_schema: { type: "object", additionalProperties: false, properties: { nombre: { type: "string", enum: DOCS } }, required: ["nombre"] },
  },
  {
    name: "consultar_denue",
    description: "Conteo de establecimientos del DENUE (INEGI) en un municipio: total y principales clases SCIAN. Claves INEGI: entidad de 2 dígitos y municipio de 3 (Coacalco = 15 / 020).",
    strict: true,
    input_schema: { type: "object", additionalProperties: false, properties: { entidad: { type: "string" }, municipio: { type: "string" }, buscar: { type: ["string", "null"] } }, required: ["entidad", "municipio", "buscar"] },
  },
];

function simular(p) {
  const g = p.giro ? M.GIROS[p.giro] : M.GIROS.cafeteria;
  const c = {};
  if (p.giro) { c.giro = g; c.ticket = g.ticket; c.cv = g.cv / 100; }
  if (p.zona) { c.zona = M.ZONAS[p.zona]; c.zonaKey = p.zona; }
  if (p.clientes_dia != null) c.mu = p.clientes_dia;
  if (p.ticket != null) c.ticket = p.ticket;
  if (p.costo_variable_pct != null) c.cv = p.costo_variable_pct / 100;
  if (p.renta != null) c.renta = p.renta;
  if (p.empleados != null) c.empleados = p.empleados;
  if (p.inversion != null) c.inversion = p.inversion;
  if (p.credito_pct != null) c.credPct = p.credito_pct / 100;
  const e = escenarioReferencia(M, c), m = M.modeloLogistico(e), S = M.curvaSupervivencia(m.P), mc = M.monteCarlo(e), f = M.finanzas(e, mc, S), r = M.rangoP(m);
  const red = (x) => Math.round(x);
  return JSON.stringify({ giro: e.giro.n, zona: e.zona.n, P_3_anios: +(m.P * 100).toFixed(1), rango_P5_P95: [+(r.p05 * 100).toFixed(1), +(r.p95 * 100).toFixed(1)],
    utilidad_mensual: red(e.utilMes), punto_equilibrio_clientes_dia: Number.isFinite(e.peDia) ? Math.ceil(e.peDia) : null,
    utilidad_anual_P5_P50_P95: [red(mc.p05), red(mc.p50), red(mc.p95)], ROI_pct: +(f.roi * 100).toFixed(1), payback_meses: f.payback ? +f.payback.toFixed(1) : null, VPN_3_anios: red(f.vpn),
    nota: "Cifras antes de impuestos; β, ticket, costo variable y afluencia son estimaciones del equipo." });
}
function consultarDenue({ entidad, municipio, buscar }) {
  const ruta = path.join("data", "denue", "ent", entidad.padStart(2, "0") + ".json");
  if (!fs.existsSync(ruta)) return "No hay datos para esa entidad. Ejecuta scripts/denue_sync.py.";
  const mun = JSON.parse(fs.readFileSync(ruta, "utf8"))[municipio.padStart(3, "0")];
  if (!mun) return "Municipio no encontrado.";
  const cat = JSON.parse(fs.readFileSync(path.join("data", "denue", "clases.json"), "utf8"));
  let cl = Object.entries(mun.clases).map(([c, n]) => ({ clase: c, nombre: cat[c], n }));
  if (buscar) cl = cl.filter((x) => (x.clase + " " + x.nombre).toLowerCase().includes(buscar.toLowerCase()));
  return JSON.stringify({ municipio: mun.nombre, total: mun.total, clases: cl.sort((a, b) => b.n - a.n).slice(0, 25), fuente: "INEGI, DENUE (descarga masiva), ver data/denue/meta.json" });
}
function ejecutar(nombre, entrada) {
  if (nombre === "simular_escenario") return simular(entrada);
  if (nombre === "leer_documento") return DOCS.includes(entrada.nombre) ? fs.readFileSync(entrada.nombre, "utf8").slice(0, 60000) : "Documento no permitido.";
  if (nombre === "consultar_denue") return consultarDenue(entrada);
  throw new Error("Herramienta desconocida: " + nombre);
}

const SISTEMA = `Eres el asistente de COATL, un simulador académico de probabilidad de supervivencia a 3 años y rentabilidad de negocios en Coacalco de Berriozábal (México). Respondes en español de México, claro y breve.
Usa las herramientas para cualquier cifra: nunca inventes números. Distingue siempre dato oficial (INEGI, CONEVAL, DENUE), supuesto del equipo y resultado del modelo. Recuerda que las cifras son antes de impuestos y que el rango de P es sensibilidad, no un intervalo de confianza. No das asesoría financiera.
Autores: Miguel Antonio Cruz García, Bruno Alejandro López Bautista y Alonso Arroyo Cortés.`;

const client = new Anthropic();
const mensajes = [];
async function turno(pregunta) {
  mensajes.push({ role: "user", content: pregunta });
  for (let i = 0; i < 12; i++) {
    const r = await client.beta.messages.create({
      model: "claude-opus-5-5", max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"], fallbacks: "default",
      output_config: { effort: "medium" },
      system: SISTEMA, tools: herramientas, messages: mensajes,
    });
    mensajes.push({ role: "assistant", content: r.content });
    if (r.stop_reason === "refusal") { console.log("\n[El modelo no puede responder esta solicitud.]"); return; }
    if (r.stop_reason === "pause_turn") continue;
    const usos = r.content.filter((b) => b.type === "tool_use");
    for (const b of r.content) if (b.type === "text" && b.text.trim()) console.log("\n" + b.text);
    if (r.stop_reason !== "tool_use" || !usos.length) return;
    const resultados = usos.map((u) => {
      try { process.stderr.write(`  · ${u.name}\n`); return { type: "tool_result", tool_use_id: u.id, content: ejecutar(u.name, u.input) }; }
      catch (err) { return { type: "tool_result", tool_use_id: u.id, content: String(err.message), is_error: true }; }
    });
    mensajes.push({ role: "user", content: resultados });
  }
}

try {
  const pregunta = process.argv.slice(2).join(" ").trim();
  if (pregunta) await turno(pregunta);
  else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log("Asistente COATL · escribe tu pregunta (vacío para salir)");
    for (;;) { const q = (await rl.question("\n› ")).trim(); if (!q) break; await turno(q); }
    rl.close();
  }
} catch (err) {
  if (err instanceof Anthropic.AuthenticationError || /credential|api key|apiKey/i.test(String(err.message))) {
    console.error("Falta la credencial de Anthropic. Define ANTHROPIC_API_KEY o ejecuta `ant auth login`.");
  } else if (err instanceof Anthropic.RateLimitError) console.error("Límite de uso alcanzado; intenta en unos minutos.");
  else if (err instanceof Anthropic.APIError) console.error(`Error de la API (${err.status}): ${err.message}`);
  else console.error(err.message);
  process.exitCode = 1;
}
