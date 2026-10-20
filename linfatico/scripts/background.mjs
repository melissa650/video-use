// Genera out/work/bg.mp4: la imagen del reel sin gráficos, directamente desde los clips originales.
// Por fotograma: HDR (HLG, 10 bits) → SDR BT.709 con mapeo de tonos, reencuadre con un único
// reescalado lanczos y enfoque suave. Tramos y encuadres salen de src/config.ts.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {CLIPS, FPS, HEIGHT, SEGMENTS, TONEMAP_NPL, TOTAL_FRAMES, WIDTH} from '../src/config.ts';

const OUT = 'out/work/bg.mp4';
const OUT_CX = WIDTH / 2; // = OUT_CX en src/Footage.tsx
const OUT_CY = 880; // = OUT_CY en src/Footage.tsx

const TONEMAP =
  `zscale=t=linear:npl=${TONEMAP_NPL},format=gbrpf32le,zscale=p=bt709,` +
  'tonemap=mobius:param=0.3:desat=0,zscale=t=bt709:m=bt709:r=tv:d=error_diffusion,format=yuv420p';

const ease = (a, b, dur) => `(${a}+(${b}-${a})*(1-cos(PI*min(t/${dur},1)))/2)`;

// Una entrada por clip; cada entrada se reparte entre los tramos que la usan
const clipIds = [...new Set(SEGMENTS.map((s) => s.clip))];
const uses = Object.fromEntries(clipIds.map((c) => [c, SEGMENTS.filter((s) => s.clip === c).length]));
const taken = Object.fromEntries(clipIds.map((c) => [c, 0]));

const heads = clipIds.map(
  (c, i) => `[${i}:v]${TONEMAP},split=${uses[c]}${Array.from({length: uses[c]}, (_, k) => `[${c}${k}]`).join('')}`,
);

const chains = SEGMENTS.map((s, i) => {
  const label = `${s.clip}${taken[s.clip]++}`;
  const dur = (s.duration / FPS).toFixed(4);
  const z = ease(s.from.z, s.to.z, dur);
  const cx = ease(s.from.cx, s.to.cx, dur);
  const cy = ease(s.from.cy, s.to.cy, dur);
  // Fotograma variable (~60 fps): se recorta por tiempo y se pasa a 30 fps (cámara lenta con fotogramas reales)
  const take = s.freeze
    ? `trim=start=${s.start}:end=${s.start + 0.1},setpts=PTS-STARTPTS,fps=${FPS},trim=end_frame=1`
    : `trim=start=${s.start}:end=${(s.start + s.length + 0.1).toFixed(3)},setpts=(PTS-STARTPTS)/${s.playbackRate},fps=${FPS}`;
  return (
    `[${label}]${take},tpad=stop_mode=clone:stop=${s.duration},trim=end_frame=${s.duration},setpts=PTS-STARTPTS,` +
    `scale=w='2*trunc(${WIDTH}*${z}/2)':h='2*trunc(${HEIGHT}*${z}/2)':eval=frame:flags=lanczos+accurate_rnd+full_chroma_int,` +
    `crop=${WIDTH}:${HEIGHT}:x='clip(${cx}*in_w/${WIDTH}-${OUT_CX},0,in_w-${WIDTH})':y='clip(${cy}*in_h/${HEIGHT}-${OUT_CY},0,in_h-${HEIGHT})',` +
    `setsar=1[v${i}]`
  );
});

const graph = [
  ...heads,
  ...chains,
  `${SEGMENTS.map((_, i) => `[v${i}]`).join('')}concat=n=${SEGMENTS.length}:v=1:a=0,unsharp=5:5:0.5:3:3:0[out]`,
].join(';\n');

fs.mkdirSync('out/work', {recursive: true});
fs.writeFileSync('out/work/bg_filter.txt', graph);
const args = [
  '-v', 'error', '-y',
  ...clipIds.flatMap((c) => ['-i', CLIPS[c]]),
  '-filter_complex_script', 'out/work/bg_filter.txt', '-map', '[out]',
  '-c:v', 'libx264', '-crf', '8', '-preset', 'medium', '-pix_fmt', 'yuv420p',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
  '-frames:v', String(TOTAL_FRAMES), '-an', OUT,
];
const r = spawnSync('ffmpeg', args, {stdio: 'inherit'});
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`ok ${OUT}`);
