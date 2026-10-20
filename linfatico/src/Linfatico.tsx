import React from 'react';
import {AbsoluteFill, Audio, getStaticFiles, interpolate, staticFile} from 'remotion';
import {FPS, MUSIC_FILE, MUSIC_VOLUME, TOTAL_FRAMES} from './config';
import {Footage} from './Footage';
import {Overlays} from './Overlays';

const hasStatic = (name: string) => getStaticFiles().some((f) => f.name === name);

const musicVolume = (f: number) =>
  interpolate(f, [0, FPS, TOTAL_FRAMES - FPS * 2, TOTAL_FRAMES], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }) * MUSIC_VOLUME;

export type LinfaticoProps = {
  /** false = solo gráficos sobre fondo transparente (los compone scripts/render_final.sh). */
  withFootage: boolean;
};

export const Linfatico: React.FC<LinfaticoProps> = ({withFootage}) => (
  <AbsoluteFill style={{backgroundColor: withFootage ? 'black' : undefined}}>
    <Footage showVideo={withFootage} />
    <Overlays />
    {withFootage && hasStatic(MUSIC_FILE) && (
      <Audio src={staticFile(MUSIC_FILE)} volume={musicVolume} />
    )}
  </AbsoluteFill>
);
