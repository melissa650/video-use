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
import {
  CLIPS,
  DARK_RGB,
  FPS,
  Framing,
  HEIGHT,
  OUTRO_START,
  Segment,
  SEGMENTS,
  WIDTH,
} from './config';

/** Punto de la pantalla donde se coloca el centro de la persona (deja sitio arriba y abajo). */
export const OUT_CX = WIDTH / 2;
export const OUT_CY = 880;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Desplazamiento del recorte (px de pantalla) para un encuadre: el mismo cálculo que background.mjs. */
export const offsetFor = ({cx, cy, z}: Framing) => ({
  x: clamp(cx * z - OUT_CX, 0, WIDTH * z - WIDTH),
  y: clamp(cy * z - OUT_CY, 0, HEIGHT * z - HEIGHT),
});

/** Archivo de vista previa (scripts/prepare.sh) de un clip. */
const previewOf = (s: Segment) =>
  s.freeze
    ? `preview/${s.id}.png`
    : `preview/${CLIPS[s.clip]
        .split('/')
        .pop()!
        .replace(/\.mov$/i, '.mp4')}`;

const FramedSegment: React.FC<{segment: Segment}> = ({segment}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, segment.duration], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const mix = (k: keyof Framing) => segment.from[k] + (segment.to[k] - segment.from[k]) * t;
  const framing = {cx: mix('cx'), cy: mix('cy'), z: mix('z')};
  const {x, y} = offsetFor(framing);
  const style: React.CSSProperties = {
    position: 'absolute',
    width: WIDTH,
    height: HEIGHT,
    transformOrigin: '0 0',
    transform: `translate(${-x}px, ${-y}px) scale(${framing.z})`,
  };
  if (segment.freeze) return <Img src={staticFile(previewOf(segment))} style={style} />;
  return (
    <OffthreadVideo
      src={staticFile(previewOf(segment))}
      trimBefore={Math.round(segment.start * FPS)}
      playbackRate={segment.playbackRate}
      muted
      style={style}
    />
  );
};

/**
 * Imagen + viñetas + oscurecido del cierre. Con showVideo=false solo dibuja las capas
 * semitransparentes (el render final compone los gráficos sobre el fondo de ffmpeg).
 */
export const Footage: React.FC<{showVideo?: boolean}> = ({showVideo = true}) => {
  const frame = useCurrentFrame();
  let start = 0;
  const outroDim = interpolate(frame, [OUTRO_START, OUTRO_START + 18], [0, 0.62], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{backgroundColor: showVideo ? 'black' : undefined, overflow: 'hidden'}}>
      <AbsoluteFill>
        {showVideo &&
          SEGMENTS.map((s) => {
            const from = start;
            start += s.duration;
            return (
              <Sequence key={s.id} from={from} durationInFrames={s.duration} name={s.id}>
                <FramedSegment segment={s} />
              </Sequence>
            );
          })}
      </AbsoluteFill>
      {/* Viñetas neutras arriba y abajo para leer los textos sobre cielo y césped */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.42) 20%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 64%, rgba(0,0,0,0.5) 100%)',
        }}
      />
      <AbsoluteFill style={{backgroundColor: `rgba(${DARK_RGB},${outroDim})`}} />
    </AbsoluteFill>
  );
};
