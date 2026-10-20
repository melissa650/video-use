import React from 'react';
import {AbsoluteFill, Audio, getStaticFiles, interpolate, staticFile} from 'remotion';
import {FPS, MUSIC_FILE, MUSIC_VOLUME, TOTAL_FRAMES} from './config';
// import {MUSIC_DUCKED_VOLUME, VOICE_FILE} from './config';
import {Footage} from './Footage';
import {Overlays} from './Overlays';

const hasStatic = (name: string) => getStaticFiles().some((f) => f.name === name);

// ── Locución opcional ───────────────────────────────────────
// Para usar public/voz.mp3: descomenta VOICE_START/VOICE_END, el import de arriba,
// el bloque <Audio src={staticFile(VOICE_FILE)} .../> y la línea `duck` de musicVolume.
// const VOICE_START = 15; // fotograma en el que empieza la voz
// const VOICE_END = TOTAL_FRAMES - 10; // fotograma aproximado en el que termina

const musicVolume = (f: number) => {
  const fade = interpolate(
    f,
    [0, FPS * 1, TOTAL_FRAMES - FPS * 2, TOTAL_FRAMES],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const level = MUSIC_VOLUME;
  // Con voz: la música baja al 25 % mientras suena la locución.
  // const level = f >= VOICE_START - 10 && f <= VOICE_END + 10 ? MUSIC_DUCKED_VOLUME : MUSIC_VOLUME;
  return fade * level;
};

export const Movilidad: React.FC = () => {
  const music = hasStatic(MUSIC_FILE);
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <Footage />
      <Overlays />
      {music && <Audio src={staticFile(MUSIC_FILE)} volume={musicVolume} />}
      {/* <Sequence from={VOICE_START}><Audio src={staticFile(VOICE_FILE)} volume={1} /></Sequence> */}
    </AbsoluteFill>
  );
};
