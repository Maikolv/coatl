"""Música de fondo ORIGINAL para el video de COATL: se sintetiza aquí, nota por nota, así que no hay derechos de terceros.

Guitarra punteada (Karplus-Strong) en arpegios, colchón suave de acordes y bajo, en La menor a 84 pulsos por minuto.
Progresión de 8 compases: Am · F · C · G · Am · F · G · E. Intro de 4 compases solo con colchón.
Uso: uv run --no-project --with numpy python -I scripts/musica_fondo.py <segundos> <salida.wav>
"""
import sys, wave
import numpy as np

SR = 48000
BPM = 84
PULSO = 60 / BPM
COMPAS = 4 * PULSO
rng = np.random.default_rng(1519)  # semilla fija: la misma pista en cada render

def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)

# acordes en MIDI: (bajo, notas del arpegio)
ACORDES = [
    (45, [57, 60, 64, 69]),  # Am
    (41, [53, 57, 60, 65]),  # F
    (48, [55, 60, 64, 67]),  # C
    (43, [55, 59, 62, 67]),  # G
    (45, [57, 60, 64, 69]),  # Am
    (41, [53, 57, 60, 65]),  # F
    (43, [55, 59, 62, 67]),  # G
    (40, [56, 59, 64, 68]),  # E (con sol sostenido: cadencia andaluza/mexicana)
]
PATRON = [0, 1, 2, 3, 2, 1, 2, 3]  # índices del arpegio en corcheas

_cache = {}
def cuerda(midi, dur=2.2):
    """Nota de guitarra por Karplus-Strong; se calcula una vez por altura y se reutiliza."""
    if midi in _cache:
        return _cache[midi]
    n = int(SR * dur)
    periodo = int(round(SR / hz(midi)))
    buf = rng.uniform(-1, 1, periodo).astype(np.float64)
    buf = np.convolve(buf, np.ones(4) / 4, mode='same')  # ataque menos brillante
    out = np.empty(n)
    # recurrencia por bloques de un periodo: y[k] = 0.996 * (y[k-p] + y[k-p+1]) / 2
    out[:periodo] = buf
    for ini in range(periodo, n, periodo):
        fin = min(ini + periodo, n)
        prev = out[ini - periodo:fin - periodo + 1]
        if len(prev) < fin - ini + 1:
            prev = np.append(prev, prev[-1])
        out[ini:fin] = 0.996 * 0.5 * (prev[:fin - ini] + prev[1:fin - ini + 1])
    out *= np.exp(-np.arange(n) / (SR * 0.9))
    out /= np.max(np.abs(out)) + 1e-9
    _cache[midi] = out
    return out

def colchon(notas, dur):
    n = int(SR * dur)
    t = np.arange(n) / SR
    env = np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 0.8).clip(0)
    s = np.zeros(n)
    for m in notas:
        f = hz(m - 12)
        for det in (-0.12, 0.12):  # dos voces apenas desafinadas: coro suave
            s += np.sin(2 * np.pi * f * (1 + det / 100) * t) + 0.25 * np.sin(4 * np.pi * f * t)
    return s * env / (len(notas) * 2)

def bajo(midi, dur):
    n = int(SR * dur)
    t = np.arange(n) / SR
    f = hz(midi - 12 if midi > 43 else midi)
    env = np.exp(-t / 0.9) * np.minimum(1, t / 0.01)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * env

def poner(pista, señal, t, gan, pan=0.0):
    i = int(t * SR)
    if i >= pista.shape[1]:
        return
    j = min(pista.shape[1], i + len(señal))
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    pista[0, i:j] += señal[:j - i] * gan * l
    pista[1, i:j] += señal[:j - i] * gan * r

def reverb(x, segundos=2.0, mezcla=0.22):
    """Convolución por bloques con una respuesta de ruido que decae: sala cálida sin dependencias extra."""
    n = int(SR * segundos)
    ir = rng.normal(0, 1, n) * np.exp(-np.arange(n) / (SR * segundos / 6))
    ir = np.convolve(ir, np.ones(8) / 8, mode='same')  # menos agudos en la cola
    ir /= np.sqrt(np.sum(ir ** 2))
    bloque = 1 << 16
    tam = 1 << int(np.ceil(np.log2(bloque + n)))
    IR = np.fft.rfft(ir, tam)
    y = np.zeros(len(x) + n)
    for a in range(0, len(x), bloque):
        seg = x[a:a + bloque]
        y[a:a + tam] += np.fft.irfft(np.fft.rfft(seg, tam) * IR, tam)[:len(y) - a]
    return (1 - mezcla) * x + mezcla * y[:len(x)]

def componer(dur):
    pista = np.zeros((2, int(SR * (dur + 3))))
    total_compases = int(np.ceil(dur / COMPAS))
    for c in range(total_compases):
        t0 = c * COMPAS
        b, notas = ACORDES[c % len(ACORDES)]
        poner(pista, colchon(notas, COMPAS + 0.6), t0, 0.14)
        if c >= 4:  # tras la intro entran guitarra y bajo
            for k, idx in enumerate(PATRON):
                humano = rng.normal(0, 0.008)  # pequeñas variaciones de tiempo y fuerza, como un músico
                poner(pista, cuerda(notas[idx]), t0 + k * PULSO / 2 + humano, 0.42 * rng.uniform(0.8, 1.0), pan=0.25 if k % 2 else -0.25)
            poner(pista, bajo(b, PULSO * 2), t0, 0.13)
            poner(pista, bajo(b, PULSO * 2), t0 + 2 * PULSO, 0.10)
    pista = pista[:, :int(SR * dur)]
    pista = np.vstack([reverb(pista[0]), reverb(pista[1])])
    # entrada de 3 s y salida de 5 s
    n = pista.shape[1]
    env = np.ones(n)
    a, z = int(3 * SR), int(5 * SR)
    env[:a] = np.linspace(0, 1, a)
    env[-z:] = np.linspace(1, 0, z)
    pista *= env
    return pista / (np.max(np.abs(pista)) + 1e-9) * 0.89

def guardar(pista, ruta):
    datos = (np.clip(pista.T, -1, 1) * 32767).astype('<i2')
    with wave.open(ruta, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(datos.tobytes())

if __name__ == '__main__':
    dur = float(sys.argv[1]); salida = sys.argv[2]
    p = componer(dur)
    assert p.shape == (2, int(SR * dur)) and np.max(np.abs(p)) <= 0.9, 'pista fuera de rango'
    guardar(p, salida)
    print(f'{salida}: {dur:.1f} s, original (sin derechos de terceros)')
