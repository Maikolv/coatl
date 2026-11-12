// Carga los módulos puros (sin DOM) en un contexto aislado, tal como el navegador los concatena.
import fs from 'node:fs';
import vm from 'node:vm';
const ARCHIVOS = ['src/datos/datos.js', 'src/modelo/modelo.js', 'src/modelo/finanzas.js'];
export function cargarModelo() {
  const codigo = ARCHIVOS.map((f) => fs.readFileSync(f, 'utf8')).join('\n') +
    '\n;({GIROS,ZONAS,S0,BETA0,ESTACION,N_SIM,SEMILLA,INCERTIDUMBRE,mulberry32,gaussiana,acota,sigmoide,derivar,modeloLogistico,curvaSupervivencia,monteCarlo,rangoP,cuantil,finanzas})';
  return vm.runInNewContext(codigo, { Math, Object, Array, Infinity, isFinite });
}
// Escenario por defecto del formulario (src/index.html): Cafetería · Los Héroes.
export function escenarioReferencia(M, cambios = {}) {
  const g = M.GIROS.cafeteria;
  return M.derivar({
    zonaKey: 'heroes', giro: g, zona: M.ZONAS.heroes,
    expZ: 0, formZ: 0.10, mktZ: 0.05, compZ: 0, resZ: 0,
    empleados: 1, costoEmpleado: 11000, propio: false, superficie: 50,
    inversion: 250000, credPct: 0.20, tasa: 0.24, renta: 7500,
    ticket: g.ticket, cv: g.cv / 100, otrosFijos: 6000, mu: 60, diasSem: 6,
    estacion: M.ESTACION.estable, r: 0.12, merma: 0.03, mktGasto: 1500,
    crec: 0.08, inf: 0.045, ...cambios,
  });
}
