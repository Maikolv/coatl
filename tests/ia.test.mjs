// Reglas de seguridad del intermediario de IA (servicios/ia/api/coatl.js), con Gemini simulado.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../servicios/ia/api/coatl.js';

const respuesta = () => { const r = { status: 0, cuerpo: null, cab: {} };
  r.setHeader = (k, v) => { r.cab[k] = v; }; r.status = (s) => { r.codigo = s; return r; };
  r.json = (j) => { r.cuerpo = j; return r; }; r.end = () => r; return r; };
const pedir = async (o) => { const res = respuesta(); await handler({ method: 'POST', headers: { origin: 'https://maikolv.github.io', 'x-forwarded-for': o.ip || '1.1.1.1' }, ...o }, res); return res; };

test('rechaza orígenes ajenos, peticiones inválidas y falta de clave', async () => {
  delete process.env.GEMINI_API_KEY;
  assert.equal((await pedir({ headers: { origin: 'https://otro.com' }, body: { modo: 'asistente', texto: 'hola' } })).codigo, 403);
  assert.equal((await pedir({ body: { modo: 'asistente', texto: 'hola' } })).codigo, 503);
  process.env.GEMINI_API_KEY = 'prueba';
  assert.equal((await pedir({ body: { modo: 'libre', texto: 'hola' } })).codigo, 400);
  assert.equal((await pedir({ body: { modo: 'asistente', texto: 'x'.repeat(1501) } })).codigo, 413);
});

test('fija instrucciones, store:false y tope de tokens; devuelve solo el texto', async () => {
  process.env.GEMINI_API_KEY = 'prueba';
  let enviado = null;
  globalThis.fetch = async (_u, o) => { enviado = JSON.parse(o.body); assert.equal(o.headers['x-goog-api-key'], 'prueba');
    return { ok: true, status: 200, json: async () => ({ steps: [{ type: 'model_output', content: [{ type: 'text', text: 'Hola.' }] }] }) }; };
  const r = await pedir({ ip: '2.2.2.2', body: { modo: 'asistente', texto: '¿Cómo voy?', contexto: { giro: 'Cafetería' } } });
  assert.equal(r.codigo, 200); assert.deepEqual(r.cuerpo, { texto: 'Hola.' });
  assert.equal(enviado.store, false); assert.equal(enviado.generation_config.max_output_tokens, 700);
  assert.match(enviado.system_instruction, /asistente de COATL/); assert.match(enviado.system_instruction, /Cafetería/);
  assert.equal(r.cab['Access-Control-Allow-Origin'], 'https://maikolv.github.io');
});

test('limita las peticiones por IP', async () => {
  process.env.GEMINI_API_KEY = 'prueba';
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ steps: [] }) });
  let ultimo; for (let i = 0; i < 31; i++) ultimo = await pedir({ ip: '3.3.3.3', body: { modo: 'asistente', texto: 'hola' } });
  assert.equal(ultimo.codigo, 429);
});
