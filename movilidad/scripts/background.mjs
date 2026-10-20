// Genera out/work/bg.mp4: la imagen del reel sin gráficos, directamente desde el original.
// Un solo paso de ffmpeg por fotograma: HDR (HLG) → SDR BT.709 con mapeo de tonos, reencuadre
// con un único reescalado lanczos y enfoque suave. Los encuadres salen de src/config.ts.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {
  FPS,
  FREEZE_SOURCE_FRAME,
  HEIGHT,
  SEGMENTS,
  TOTAL_FRAMES,
  WIDTH,
} from '../src/config.ts';

const SOURCE = 'public/movilidad_comprimido.mp4';
const OUT = 'out/work/bg.mp4';
/** Altura en pantalla del centro de la persona (igual que OUT_CY en src/Footage.tsx). */
const OUT_CY = 1040;

const TONEMAP =
  'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,' +
  'tonemap=mobius:param=0.3:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p';

// Interpolación suave (seno) entre el encuadre inicial y el final del tramo, en función de t
const ease = (a, b, dur) =>
  `(${a}+(${b}-${a})*(1-cos(PI*min(t/${dur},1)))/2)`;

const chains = SEGMENTS.map((s, i) => {
  const dur = (s.duration / FPS).toFixed(4);
  const z = ease(s.from.z, s.to.z, dur);
  const cx = ease(s.from.cx, s.to.cx, dur);
  const cy = ease(s.from.cy, s.to.cy, dur);
  const take =
    s.id === 'outro'
      ? `trim=start_frame=${FREEZE_SOURCE_FRAME}:end_frame=${FREEZE_SOURCE_FRAME + 1},setpts=PTS-STARTPTS`
      : `trim=start_frame=${s.trimBefore}:end_frame=${s.trimBefore + Math.ceil(s.duration * s.playbackRate) + 1},` +
        `setpts=(PTS-STARTPTS)/${s.playbackRate},fps=${FPS}`;
  return (
    `[s${i}]${take},tpad=stop_mode=clone:stop=${s.duration},trim=end_frame=${s.duration},setpts=PTS-STARTPTS,` +
    `scale=w='2*trunc(${WIDTH}*${z}/2)':h='2*trunc(${HEIGHT}*${z}/2)':eval=frame:flags=lanczos+accurate_rnd+full_chroma_int,` +
    `crop=${WIDTH}:${HEIGHT}:x='clip(${cx}*in_w/${WIDTH}-${WIDTH / 2},0,in_w-${WIDTH})':y='clip(${cy}*in_h/${HEIGHT}-${OUT_CY},0,in_h-${HEIGHT})',` +
    `setsar=1[v${i}]`
  );
});

const n = SEGMENTS.length;
const graph = [
  `[0:v]${TONEMAP},split=${n}${SEGMENTS.map((_, i) => `[s${i}]`).join('')}`,
  ...chains,
  `${SEGMENTS.map((_, i) => `[v${i}]`).join('')}concat=n=${n}:v=1:a=0,unsharp=5:5:0.55:3:3:0[out]`,
].join(';\n');

fs.mkdirSync('out/work', {recursive: true});
fs.writeFileSync('out/work/bg_filter.txt', graph);
const args = [
  '-v', 'error', '-y', '-i', SOURCE,
  '-filter_complex_script', 'out/work/bg_filter.txt', '-map', '[out]',
  '-c:v', 'libx264', '-crf', '8', '-preset', 'medium', '-pix_fmt', 'yuv420p',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
  '-frames:v', String(TOTAL_FRAMES), '-an', OUT,
];
const r = spawnSync('ffmpeg', args, {stdio: 'inherit'});
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`ok ${OUT}`);
