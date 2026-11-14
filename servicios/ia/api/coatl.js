// Intermediario de IA de COATL (Vercel, plan Hobby gratuito).
// La clave de Gemini vive SOLO en la variable de entorno GEMINI_API_KEY de este proyecto de Vercel:
// nunca llega al navegador ni al repositorio. El sitio llama aquí y esta función llama a Gemini.
//
// Defensas para que nadie use la clave como un chatbot gratuito:
//  - Solo responde a los orígenes de COATL (CORS) y solo en POST con JSON pequeño.
//  - Las instrucciones del sistema las fija el servidor (modo «asistente» o «interprete»).
//  - Modelo, store:false y tope de tokens fijados aquí; límite de peticiones por IP.
//  - Sin facturación: con el plan gratuito de Gemini, al agotar la cuota responde 429; nunca cobra.

const ORIGENES = new Set(['https://maikolv.github.io', 'http://127.0.0.1:8000', 'http://localhost:8000']);
const MODELOS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite'];
const LIMITE = { ventanaMs: 10 * 60 * 1000, max: 30 };   // 30 peticiones por IP cada 10 minutos (por instancia)
const visitas = new Map();

const INSTRUCCIONES = {
  asistente: (ctx) => 'Eres el asistente de COATL, simulador académico de supervivencia a 3 años y rentabilidad de negocios en ' +
    'Coacalco de Berriozábal, Estado de México. Responde en español de México, en 2 a 4 frases claras. No inventes cifras: ' +
    'usa solo las del escenario dado y di cuando algo no lo sabe el modelo. No das asesoría financiera ni legal. ' +
    'Si te preguntan algo ajeno a COATL, a negocios o a Coacalco, redirige con amabilidad. Escenario actual: ' + ctx,
  interprete: (ctx) => 'Convierte la descripción de un negocio en Coacalco de Berriozábal (México) en parámetros del simulador COATL. ' +
    'Usa solo lo que la persona dijo; deja en null lo que no mencione. Cantidades en pesos mexicanos; clientes por día; ' +
    'crédito en porcentaje de la inversión; tasa anual en porcentaje. En «resumen» explica en una frase qué entendiste. ' +
    'Responde únicamente con un objeto JSON (sin texto adicional). ' + ctx,
};
const TOPE = { asistente: 700, interprete: 1200 };

function limitar(ip) {
  const ahora = Date.now(), v = (visitas.get(ip) || []).filter((t) => ahora - t < LIMITE.ventanaMs);
  v.push(ahora); visitas.set(ip, v);
  if (visitas.size > 5000) visitas.clear();   // shortcut: memoria acotada por instancia; para un límite global usar Vercel KV
  return v.length > LIMITE.max;
}

async function gemini(modo, texto, contexto, i = 0) {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST', signal: AbortSignal.timeout(25000),
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({ model: MODELOS[i], input: texto, system_instruction: INSTRUCCIONES[modo](contexto), store: false,
      generation_config: { max_output_tokens: TOPE[modo] } }),
  });
  const j = await r.json().catch(() => ({}));
  if (r.status === 404 && i + 1 < MODELOS.length) return gemini(modo, texto, contexto, i + 1);
  if (!r.ok) { const e = new Error(j.error?.message || 'Gemini ' + r.status); e.status = r.status; throw e; }
  return (j.steps || []).filter((s) => s.type === 'model_output').flatMap((s) => s.content || [])
    .filter((c) => c.type === 'text').map((c) => c.text).join('');
}

export default async function handler(req, res) {
  const origen = req.headers.origin || '';
  if (ORIGENES.has(origen)) { res.setHeader('Access-Control-Allow-Origin', origen); res.setHeader('Vary', 'Origin'); }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') return res.status(200).json({ servicio: 'COATL IA', listo: Boolean(process.env.GEMINI_API_KEY) });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!ORIGENES.has(origen)) return res.status(403).json({ error: 'Origen no permitido' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'La IA de COATL aún no tiene clave configurada' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anon';
  if (limitar(ip)) return res.status(429).json({ error: 'Demasiadas preguntas seguidas; espera unos minutos' });

  const { modo, texto, contexto } = req.body || {};
  if (!INSTRUCCIONES[modo] || typeof texto !== 'string' || !texto.trim()) return res.status(400).json({ error: 'Petición inválida' });
  if (texto.length > 1500 || JSON.stringify(contexto ?? '').length > 8000) return res.status(413).json({ error: 'Texto demasiado largo' });

  try {
    const salida = await gemini(modo, texto.trim(), typeof contexto === 'string' ? contexto : JSON.stringify(contexto ?? {}));
    return res.status(200).json({ texto: salida });
  } catch (e) {
    const status = e.status === 429 ? 429 : e.name === 'TimeoutError' ? 504 : 502;
    return res.status(status).json({ error: status === 429 ? 'Se alcanzó el límite gratuito de Gemini; intenta en un minuto' : 'La IA no respondió' });
  }
}
