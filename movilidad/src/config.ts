// ─────────────────────────────────────────────────────────────
//  Ajustes rápidos: color, usuario, textos y tiempos del montaje
// ─────────────────────────────────────────────────────────────

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Paleta amarillo pastel: acento mantequilla + marfil sobre fondos oscuros neutros. */
export const ACCENT = '#F5DF8E'; // amarillo pastel (zonas, progreso, detalles)
export const CREAM = '#FFFBEE'; // texto principal (marfil)
export const CREAM_RGB = '255,251,238';
export const SAND = '#F3E7BC'; // texto secundario (amarillo muy claro)
export const SAND_RGB = '243,231,188';
export const DARK = '#1D1B16'; // fondos de etiquetas
export const DARK_RGB = '29,27,22'; // DARK en rgb, para transparencias

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
// hq.mp4         = original HDR convertido a SDR (color original) y escalado ×1,5 (scripts/prepare.sh)
// last_frame.png = fotograma 1052 de hq.mp4 (último de aductores)

/** Fotograma del original que se congela en el cierre (último de aductores). */
export const FREEZE_SOURCE_FRAME = 1052;

/** Escala de hq.mp4 respecto al original 1080×1920. Los encuadres se dan en px del original. */
export const SOURCE_SCALE = 1.5;

export type Framing = {
  /** Centro del encuadre en coordenadas del vídeo de origen (px). */
  cx: number;
  cy: number;
  /** Zoom. */
  z: number;
};

export type Segment = {
  id: string;
  src: 'hq.mp4' | 'last_frame.png';
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
  // Intro (0:00–0:04,13 de origen, a 0,8×): titular + «por qué» encima, sin etiqueta de ejercicio
  seg('intro', 'hq.mp4', 0, 124, 0.8, {cx: 600, cy: 1080, z: 1.15}, {cx: 630, cy: 1090, z: 1.32}),
  // 1 · Media zancada, lado A (0:04,70–0:08,53) y lado B (0:09,20–0:12,93)
  seg('ex2a', 'hq.mp4', 141, 115, 1, {cx: 585, cy: 1000, z: 1.38}, {cx: 595, cy: 1010, z: 1.44}),
  seg('ex2b', 'hq.mp4', 276, 112, 1, {cx: 700, cy: 1010, z: 1.44}, {cx: 690, cy: 1000, z: 1.38}),
  // 2 · Isquiotibiales, pierna A (0:13,47–0:17,40) y pierna B (0:17,97–0:21,90)
  seg('ex3a', 'hq.mp4', 404, 118, 1, {cx: 660, cy: 1090, z: 1.28}, {cx: 660, cy: 1100, z: 1.33}),
  seg('ex3b', 'hq.mp4', 539, 118, 1, {cx: 385, cy: 1100, z: 1.33}, {cx: 385, cy: 1090, z: 1.28}),
  // 3 · Cuádriceps (0:22,47–0:30,60), velocidad real
  seg('ex4', 'hq.mp4', 674, 244, 1, {cx: 590, cy: 1140, z: 1.34}, {cx: 595, cy: 1150, z: 1.4}),
  // 4 · Aductores (0:31,00–0:35,10), ligeramente ralentizado 0,8×
  seg('ex5', 'hq.mp4', 930, 123, 0.8, {cx: 605, cy: 1150, z: 1.42}, {cx: 605, cy: 1150, z: 1.48}),
  // Cierre: congelado del último fotograma
  seg('outro', 'last_frame.png', 0, 120, 1, {cx: 605, cy: 1150, z: 1.48}, {cx: 605, cy: 1150, z: 1.5}),
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
export const INTRO_RANGE = {from: 0, duration: 72}; // 0–2,4 s
export const WHY_RANGE = {from: 72, duration: segEnd('intro') - 72}; // 2,4–5,2 s
/** Fotogramas entre la entrada de cada mensaje del «por qué». */
export const WHY_STAGGER = 12;
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
    tip: '30–60 s por zona',
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
