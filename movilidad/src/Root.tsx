import React from 'react';
import {Composition, Still} from 'remotion';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './config';
import {Cover} from './Cover';
import {Movilidad} from './Movilidad';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Movilidad"
      component={Movilidad}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    <Still id="Portada" component={Cover} width={WIDTH} height={HEIGHT} defaultProps={{withText: true}} />
  </>
);
