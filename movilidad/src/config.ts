// ─────────────────────────────────────────────────────────────
//  Ajustes rápidos: color, usuario, textos y tiempos del montaje
// ─────────────────────────────────────────────────────────────

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Paleta tierra: acento caramelo + crema, arena y marrón. */
export const ACCENT = '#C99A6E'; // caramelo (zonas, progreso, detalles)
export const CREAM = '#F5EDE3'; // texto principal
export const SAND = '#D9C4A8'; // texto secundario
export const BROWN = '#2E2119'; // fondos de etiquetas
export const BROWN_RGB = '46,33,25'; // BROWN en rgb, para transparencias

/** Usuario o marca que aparece en el cierre. */
export const USERNAME = '@glowithme.l';

/** Zonas seguras de Reels/TikTok/Shorts (px). */
export const SAFE = {top: 250, bottom: 350, right: 120, left: 60};

export const INTRO = {
  title: 'Movilidad + liberación miofascial',
  subtitle: 'Mi rutina antes de entrenar',
};

export const WHY: {text: string; icon: 'range' | 'loose' | 'ready'}[] = [
  {text: 'Más rango de movimiento', icon: 'range'},
  {text: 'Menos sensación de rigidez', icon: 'loose'},
  {text: 'Músculos y articulaciones listos para entrenar', icon: 'ready'},
];

export const OUTRO = {
  cta: 'Guárdalo para tu próximo entreno',
};

// ── Material de origen ──────────────────────────────────────
// graded.mp4   = vídeo original con exposición/contraste corregidos (ffmpeg)
// ex1_slow.mp4 = 0:00–0:03,50 corregido y ralentizado a 0,4× con interpolación (258 fotogramas)
// last_frame.png = fotograma 1052 de graded.mp4 (último del ejercicio 5)

export type Framing = {
  /** Centro del encuadre en coordenadas del vídeo de origen (px). */
  cx: number;
  cy: number;
  /** Zoom. */
  z: number;
};

export type Segment = {
  id: string;
  src: 'graded.mp4' | 'ex1_slow.mp4' | 'last_frame.png';
  /** Primer fotograma usado del archivo de origen (a 30 fps). */
  trimBefore: number;
  /** Duración en el montaje final (fotogramas). */
  duration: number;
  playbackRate: number;
  from: Framing;
  to: Framing;
};

const seg = (
  id: string,
  src: Segment['src'],
  trimBefore: number,
  srcFrames: number,
  playbackRate: number,
  from: Framing,
  to: Framing,
): Segment => ({
  id,
  src,
  trimBefore,
  duration: Math.round(srcFrames / playbackRate),
  playbackRate,
  from,
  to,
});

export const SEGMENTS: Segment[] = [
  // 1 · Cadera lateral (0:00–0:03,50 de origen, a cámara lenta 0,4×). Intro + «por qué» van encima.
  seg('ex1', 'ex1_slow.mp4', 0, 258, 1, {cx: 600, cy: 1080, z: 1.2}, {cx: 640, cy: 1100, z: 1.34}),
  // 2 · Media zancada, lado A (0:04,70–0:08,53) y lado B (0:09,20–0:12,93)
  seg('ex2a', 'graded.mp4', 141, 115, 1, {cx: 585, cy: 1000, z: 1.38}, {cx: 595, cy: 1010, z: 1.44}),
  seg('ex2b', 'graded.mp4', 276, 112, 1, {cx: 700, cy: 1010, z: 1.44}, {cx: 690, cy: 1000, z: 1.38}),
  // 3 · Isquiotibiales, pierna A (0:13,47–0:17,40) y pierna B (0:17,97–0:21,90)
  seg('ex3a', 'graded.mp4', 404, 118, 1, {cx: 660, cy: 1090, z: 1.28}, {cx: 660, cy: 1100, z: 1.33}),
  seg('ex3b', 'graded.mp4', 539, 118, 1, {cx: 385, cy: 1100, z: 1.33}, {cx: 385, cy: 1090, z: 1.28}),
  // 4 · Cuádriceps (0:22,47–0:30,60), acelerado 1,15×
  seg('ex4', 'graded.mp4', 674, 244, 1.15, {cx: 590, cy: 1140, z: 1.34}, {cx: 595, cy: 1150, z: 1.4}),
  // 5 · Aductores (0:31,00–0:35,10), ligeramente ralentizado 0,8×
  seg('ex5', 'graded.mp4', 930, 123, 0.8, {cx: 605, cy: 1150, z: 1.45}, {cx: 605, cy: 1150, z: 1.52}),
  // Cierre: congelado del último fotograma
  seg('outro', 'last_frame.png', 0, 120, 1, {cx: 605, cy: 1150, z: 1.52}, {cx: 605, cy: 1150, z: 1.58}),
];

export const segStart = (id: string) => {
  let f = 0;
  for (const s of SEGMENTS) {
    if (s.id === id) return f;
    f += s.duration;
  }
  throw new Error(`Segmento desconocido: ${id}`);
};
const segEnd = (id: string) =>
  segStart(id) + SEGMENTS.find((s) => s.id === id)!.duration;

export const TOTAL_FRAMES = SEGMENTS.reduce((a, s) => a + s.duration, 0);

// ── Bloques de texto ────────────────────────────────────────
export const INTRO_RANGE = {from: 0, duration: 90}; // 0–3 s
export const WHY_RANGE = {from: 90, duration: 96}; // 3–6,2 s
export const OUTRO_START = segStart('outro');

export type Zone = 'hipLateral' | 'hipFlexorsAnkle' | 'hamstrings' | 'quads' | 'adductors';

export type Exercise = {
  name: string;
  zone: Zone;
  view: 'front' | 'back';
  tip: string;
  from: number;
  to: number;
  /** Fotograma (absoluto) en el que cambia de lado, si aplica. */
  sideSwitch?: number;
};

export const EXERCISES: Exercise[] = [
  {
    name: 'Cadera lateral',
    zone: 'hipLateral',
    view: 'front',
    tip: '30–60 s por zona',
    from: WHY_RANGE.from + WHY_RANGE.duration,
    to: segEnd('ex1'),
  },
  {
    name: 'Flexores de cadera y tobillo',
    zone: 'hipFlexorsAnkle',
    view: 'front',
    tip: 'Lento y respirando',
    from: segStart('ex2a'),
    to: segEnd('ex2b'),
    sideSwitch: segStart('ex2b'),
  },
  {
    name: 'Isquiotibiales',
    zone: 'hamstrings',
    view: 'back',
    tip: 'Ambos lados',
    from: segStart('ex3a'),
    to: segEnd('ex3b'),
    sideSwitch: segStart('ex3b'),
  },
  {
    name: 'Cuádriceps',
    zone: 'quads',
    view: 'front',
    tip: 'Presión tolerable, sin dolor agudo',
    from: segStart('ex4'),
    to: segEnd('ex4'),
  },
  {
    name: 'Aductores',
    zone: 'adductors',
    view: 'front',
    tip: 'Haz pausa donde notes más tensión',
    from: segStart('ex5'),
    to: segEnd('ex5'),
  },
];

export const SIDE_LABELS = {left: 'Lado izq.', right: 'Lado dcho.'};

// ── Audio ───────────────────────────────────────────────────
export const MUSIC_FILE = 'music.mp3';
export const MUSIC_VOLUME = 0.6;
export const MUSIC_DUCKED_VOLUME = 0.25;
export const VOICE_FILE = 'voz.mp3';
