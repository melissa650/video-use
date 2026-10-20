import {interpolate, spring} from 'remotion';
import {FPS} from './config';

/**
 * Entrada con muelle (deslizamiento + fundido) y salida rápida.
 * Devuelve opacidad y desplazamiento en px para un elemento visible
 * entre `from` y `to` (fotogramas absolutos).
 */
export const enterExit = (
  frame: number,
  from: number,
  to: number,
  {distance = 40, exitFrames = 7, delay = 0} = {},
) => {
  const enter = spring({
    frame: frame - from - delay,
    fps: FPS,
    config: {damping: 200, stiffness: 160, mass: 0.8},
  });
  const exit = interpolate(frame, [to - exitFrames, to], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitShift = interpolate(frame, [to - exitFrames, to], [0, -distance * 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {
    opacity: Math.min(enter, exit),
    translate: (1 - enter) * distance + exitShift,
    progress: enter,
  };
};
