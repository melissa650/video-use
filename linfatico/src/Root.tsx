import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './config';
import {Linfatico} from './Linfatico';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Linfatico"
    component={Linfatico}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{withFootage: true}}
  />
);
