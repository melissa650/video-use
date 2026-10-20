import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './config';
import {Movilidad} from './Movilidad';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Movilidad"
    component={Movilidad}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
