// Renderiza un fotograma de muestra por bloque en out/previews/
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const FRAMES = {
  '01_intro': 50,
  '02_por_que': 140,
  '03_ej1_flexores_lado_izq': 200,
  '04_ej1_flexores_lado_dcho': 320,
  '05_ej2_isquios_lado_izq': 450,
  '06_ej2_isquios_lado_dcho': 560,
  '07_ej3_cuadriceps': 740,
  '08_ej4_abductores': 950,
  '09_cierre': 1100,
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
