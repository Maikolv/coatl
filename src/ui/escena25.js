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
