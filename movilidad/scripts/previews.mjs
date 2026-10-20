// Renderiza un fotograma de muestra por bloque en out/previews/
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const FRAMES = {
  '01_intro': 60,
  '02_por_que': 180,
  '03_ej1_cadera_lateral': 245,
  '04_ej2_flexores_lado_izq': 335,
  '05_ej2_flexores_lado_dcho': 440,
  '06_ej3_isquios_lado_izq': 570,
  '07_ej3_isquios_lado_dcho': 690,
  '08_ej4_cuadriceps': 840,
  '09_ej5_aductores': 1020,
  '10_cierre': 1180,
};
const only = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER ?? null;

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Movilidad', browserExecutable});
fs.mkdirSync('out/previews', {recursive: true});
for (const [name, frame] of Object.entries(FRAMES)) {
  if (only.length && !only.some((o) => name.includes(o))) continue;
  await renderStill({
    serveUrl,
    composition,
    frame,
    output: `out/previews/${name}.jpg`,
    imageFormat: 'jpeg',
    jpegQuality: 90,
    browserExecutable,
  });
  console.log('ok', name, frame);
}
