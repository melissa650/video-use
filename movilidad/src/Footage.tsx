import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {BROWN_RGB, Framing, HEIGHT, OUTRO_START, Segment, SEGMENTS, WIDTH} from './config';

/** Punto de la pantalla donde se coloca el centro de la persona. */
const OUT_CX = WIDTH / 2;
const OUT_CY = 1040;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Reencuadre: zoom alrededor de la persona sin dejar bordes vacíos. */
const transformFor = ({cx, cy, z}: Framing) => {
  const tx = clamp(OUT_CX - cx * z, WIDTH - WIDTH * z, 0);
  const ty = clamp(OUT_CY - cy * z, HEIGHT - HEIGHT * z, 0);
  return `translate(${tx}px, ${ty}px) scale(${z})`;
};

const FramedSegment: React.FC<{segment: Segment}> = ({segment}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, segment.duration], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const mix = (k: keyof Framing) =>
    segment.from[k] + (segment.to[k] - segment.from[k]) * t;
  const framing = {cx: mix('cx'), cy: mix('cy'), z: mix('z')};

  const style: React.CSSProperties = {
    position: 'absolute',
    width: WIDTH,
    height: HEIGHT,
    transformOrigin: '0 0',
    transform: transformFor(framing),
  };

  if (segment.src.endsWith('.png')) {
    return <Img src={staticFile(segment.src)} style={style} />;
  }
  return (
    <OffthreadVideo
      src={staticFile(segment.src)}
      trimBefore={segment.trimBefore}
      playbackRate={segment.playbackRate}
      muted
      style={style}
    />
  );
};

export const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  let start = 0;
  // Oscurecido suave del cierre
  const outroDim = interpolate(frame, [OUTRO_START, OUTRO_START + 18], [0, 0.7], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{backgroundColor: 'black', overflow: 'hidden'}}>
      {/* Tono cálido suave para casar con la paleta tierra */}
      <AbsoluteFill style={{filter: 'sepia(0.14) saturate(0.95)'}}>
        {SEGMENTS.map((s) => {
          const from = start;
          start += s.duration;
          return (
            <Sequence key={s.id} from={from} durationInFrames={s.duration} name={s.id}>
              <FramedSegment segment={s} />
            </Sequence>
          );
        })}
      </AbsoluteFill>
      {/* Viñetas suaves arriba y abajo para que los textos se lean sin tapar a la persona */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(${BROWN_RGB},0.82) 0%, rgba(${BROWN_RGB},0.7) 20%, rgba(${BROWN_RGB},0) 38%, rgba(${BROWN_RGB},0) 70%, rgba(${BROWN_RGB},0.65) 100%)`,
        }}
      />
      <AbsoluteFill style={{backgroundColor: `rgba(${BROWN_RGB},${outroDim})`}} />
    </AbsoluteFill>
  );
};
