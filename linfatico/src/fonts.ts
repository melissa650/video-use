import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fuentes servidas desde public/fonts (subconjunto latino) para renderizar sin conexión.
/** Titulares: serif elegante, con cursiva para los acentos. */
export const serifFamily = 'Playfair Display';
/** Etiquetas y pautas: sans geométrica fina. */
export const sansFamily = 'Jost';

loadFont({
  family: serifFamily,
  url: staticFile('fonts/PlayfairDisplay-latin.woff2'),
  weight: '400 900',
  style: 'normal',
  format: 'woff2',
});
loadFont({
  family: serifFamily,
  url: staticFile('fonts/PlayfairDisplay-Italic-latin.woff2'),
  weight: '400 900',
  style: 'italic',
  format: 'woff2',
});
loadFont({
  family: sansFamily,
  url: staticFile('fonts/Jost-latin.woff2'),
  weight: '300 700',
  format: 'woff2',
});
