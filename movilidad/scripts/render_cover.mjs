// Portadas de máxima calidad: fondo con ffmpeg desde el original (HDR→SDR, un único reescalado
// lanczos) + titular de Remotion sobre transparente. Salida: out/portada.png y out/portada_sin_texto.png
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {FPS, HEIGHT, SOURCE_FILE, WIDTH} from '../src/config.ts';

const COVER_SOURCE_FRAME = 372; // a 30 fps = 0:12,40, media zancada erguida
const {cx, cy, z} = {cx: 718, cy: 985, z: 1.75}; // = COVER_FRAMING en src/Cover.tsx
const OUT_CY = 1170; // = COVER_OUT_CY en src/Cover.tsx

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, {stdio: 'inherit'});
  if (r.status !== 0) process.exit(r.status ?? 1);
};

const w = 2 * Math.round((WIDTH * z) / 2);
const h = 2 * Math.round((HEIGHT * z) / 2);
const x = Math.round(Math.min(Math.max(cx * z - WIDTH / 2, 0), w - WIDTH));
const y = Math.round(Math.min(Math.max(cy * z - OUT_CY, 0), h - HEIGHT));
fs.mkdirSync('out/work', {recursive: true});
run('ffmpeg', [
  '-v', 'error', '-y', '-i', SOURCE_FILE,
  '-vf',
  `trim=start=${(COVER_SOURCE_FRAME / FPS).toFixed(4)},setpts=PTS-STARTPTS,` +
    'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=mobius:param=0.3:desat=0,' +
    `zscale=t=bt709:m=bt709:r=tv:d=error_diffusion,format=yuv444p,scale=${w}:${h}:flags=lanczos+accurate_rnd+full_chroma_int,` +
    `crop=${WIDTH}:${HEIGHT}:${x}:${y},unsharp=5:5:0.55:3:3:0,scale=in_color_matrix=bt709,format=rgb24`,
  '-frames:v', '1', 'out/portada_sin_texto.png',
]);
run('npx', ['remotion', 'still', 'Portada', 'out/work/portada_texto.png', '--props={"withText":true,"showImage":false}', '--log=error']);
run('ffmpeg', [
  '-v', 'error', '-y', '-i', 'out/portada_sin_texto.png', '-i', 'out/work/portada_texto.png',
  '-filter_complex', '[0:v]format=gbrp[b];[1:v]format=gbrap[o];[b][o]overlay=format=gbrp,format=rgb24',
  '-frames:v', '1', 'out/portada.png',
]);
console.log('ok out/portada.png, out/portada_sin_texto.png');
