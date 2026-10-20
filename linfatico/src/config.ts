// ─────────────────────────────────────────────────────────────
//  Ajustes rápidos: textos, dosis, color, usuario y tiempos del montaje
// ─────────────────────────────────────────────────────────────

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Paleta amarillo pastel: acento mantequilla + marfil sobre fondos oscuros neutros. */
export const ACCENT = '#F5DF8E'; // amarillo pastel (linfa, progreso, detalles)
export const CREAM = '#FFFBEE'; // texto principal (marfil)
export const CREAM_RGB = '255,251,238';
export const SAND = '#F3E7BC'; // texto secundario
export const SAND_RGB = '243,231,188';
export const DARK = '#1D1B16'; // fondos de etiquetas
export const DARK_RGB = '29,27,22';

/** Usuario o marca que aparece en el cierre. */
export const USERNAME = '@glowithme.l';

/** Zonas seguras de Reels/TikTok/Shorts (px). */
export const SAFE = {top: 250, bottom: 350, right: 120, left: 60};

export const INTRO = {
  title: 'Activación linfática',
  subtitle: 'Mi rutina de mañana',
  hook: 'Tu sistema linfático no tiene bomba propia: se mueve cuando te mueves tú',
};

export const OUTRO = {
  cta: 'Guárdalo y pruébalo mañana',
};

// ── Material de origen ──────────────────────────────────────
// Clips del iPhone en public/clips (HEVC 10 bits, HDR HLG, ~60 fps variables, rotados a vertical).
export const CLIPS = {
  rebotes: 'public/clips/IMG_9378.mov',
  sentadilla: 'public/clips/IMG_9382.mov',
  balanceo: 'public/clips/IMG_9383.mov',
  saltitos: 'public/clips/IMG_9384.mov',
  respiracion: 'public/clips/IMG_9385.mov',
} as const;
export type ClipId = keyof typeof CLIPS;

/** Mapeo HDR → SDR. 203 nits = blanco de referencia HLG: natural en exteriores con sol. */
export const TONEMAP_NPL = 203;

export type Framing = {
  /** Centro del encuadre en coordenadas del clip vertical 1080×1920 (px). */
  cx: number;
  cy: number;
  /** Zoom. */
  z: number;
};

export type Segment = {
  id: string;
  clip: ClipId;
  /** Inicio en el clip (s). */
  start: number;
  /** Duración usada del clip (s). Con freeze=true, se congela el fotograma `start`. */
  length: number;
  playbackRate: number;
  /** Duración en el montaje (fotogramas). */
  duration: number;
  freeze?: boolean;
  from: Framing;
  to: Framing;
};

const seg = (
  id: string,
  clip: ClipId,
  start: number,
  length: number,
  playbackRate: number,
  from: Framing,
  to: Framing,
  freezeFrames?: number,
): Segment => ({
  id,
  clip,
  start,
  length,
  playbackRate,
  duration: freezeFrames ?? Math.round((length * FPS) / playbackRate),
  freeze: freezeFrames !== undefined,
  from,
  to,
});

export const SEGMENTS: Segment[] = [
  // Intro: saltitos de frente (0:00–0:04,8 de IMG_9384), con el titular y el gancho
  seg('intro', 'saltitos', 0, 4.8, 1, {cx: 420, cy: 900, z: 1.12}, {cx: 420, cy: 900, z: 1.25}),
  // 1 · Rebotes de talones (IMG_9378 completo, 0,8×)
  seg('ex1', 'rebotes', 0, 5.5, 0.8, {cx: 600, cy: 960, z: 1.18}, {cx: 600, cy: 960, z: 1.26}),
  // 2 · Sentadilla + brazos arriba (IMG_9382, 0:00–0:07,5)
  seg('ex2', 'sentadilla', 0, 7.5, 1, {cx: 640, cy: 940, z: 1.12}, {cx: 640, cy: 950, z: 1.18}),
  // 3 · Balanceo de brazos (IMG_9383, 0:00–0:07,5, de frente)
  seg('ex3', 'balanceo', 0, 7.5, 1, {cx: 545, cy: 990, z: 1.12}, {cx: 545, cy: 990, z: 1.2}),
  // 4 · Saltitos suaves (IMG_9384, 0:04,8–0:12,9, de perfil)
  seg('ex4', 'saltitos', 4.8, 8.1, 1, {cx: 560, cy: 900, z: 1.15}, {cx: 560, cy: 900, z: 1.22}),
  // 5 · Respiración y estiramiento (IMG_9385, 0:00–0:08,7)
  seg('ex5', 'respiracion', 0, 8.7, 1, {cx: 745, cy: 990, z: 1.45}, {cx: 745, cy: 975, z: 1.55}),
  // Cierre: congelado del estiramiento lateral (IMG_9385, 0:08,6), 3,5 s
  seg(
    'outro',
    'respiracion',
    8.6,
    0,
    1,
    {cx: 745, cy: 975, z: 1.55},
    {cx: 745, cy: 975, z: 1.6},
    105,
  ),
];

export const segStart = (id: string) => {
  let f = 0;
  for (const s of SEGMENTS) {
    if (s.id === id) return f;
    f += s.duration;
  }
  throw new Error(`Segmento desconocido: ${id}`);
};
export const segEnd = (id: string) => segStart(id) + SEGMENTS.find((s) => s.id === id)!.duration;

export const TOTAL_FRAMES = SEGMENTS.reduce((a, s) => a + s.duration, 0);

// ── Bloques de texto ────────────────────────────────────────
/** El titular está toda la intro; el gancho entra a los 2 s (0:02–0:04,8). */
export const INTRO_HOOK_RANGE = {from: 60, duration: segEnd('intro') - 60};
export const OUTRO_START = segStart('outro');

/** Qué enseña la animación del sistema linfático en cada ejercicio. */
export type LymphFocus = 'calves' | 'nodes' | 'arms' | 'whole' | 'breath';

export type Exercise = {
  name: string;
  /** Repeticiones o tiempo. */
  dose: string;
  /** Explicación del sistema linfático (corta, ≥ 1,2 s en pantalla). */
  fact: string;
  focus: LymphFocus;
  from: number;
  to: number;
};

export const EXERCISES: Exercise[] = [
  {
    name: 'Rebotes de talones',
    dose: '30–60 segundos',
    fact: 'No tiene corazón propio: la linfa sube gracias a tus músculos, como las pantorrillas',
    focus: 'calves',
    from: segStart('ex1'),
    to: segEnd('ex1'),
  },
  {
    name: 'Sentadilla + brazos arriba',
    dose: '10 repeticiones',
    fact: 'En ingles y axilas hay muchos ganglios: filtran la linfa y forman parte de tus defensas',
    focus: 'nodes',
    from: segStart('ex2'),
    to: segEnd('ex2'),
  },
  {
    name: 'Balanceo de brazos',
    dose: '30 segundos',
    fact: 'Sus vasos tienen válvulas: cada movimiento empuja la linfa en un solo sentido',
    focus: 'arms',
    from: segStart('ex3'),
    to: segEnd('ex3'),
  },
  {
    name: 'Saltitos suaves',
    dose: '30–60 segundos',
    fact: 'Cada día recoge unos 3 litros de líquido de tus tejidos y los devuelve a la sangre',
    focus: 'whole',
    from: segStart('ex4'),
    to: segEnd('ex4'),
  },
  {
    name: 'Respiración y estiramiento',
    dose: '5 respiraciones lentas',
    fact: 'Al inspirar hondo baja la presión en el pecho y la linfa sube hacia el cuello',
    focus: 'breath',
    from: segStart('ex5'),
    to: segEnd('ex5'),
  },
];

// ── Audio ───────────────────────────────────────────────────
export const MUSIC_FILE = 'music.mp3';
export const MUSIC_VOLUME = 0.6;
