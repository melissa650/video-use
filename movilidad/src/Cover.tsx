import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ACCENT, CREAM, DARK_RGB, Framing, HEIGHT, INTRO, SAND, SOURCE_SCALE, WIDTH} from './config';
import {transformFor} from './Footage';
import {sansFamily, serifFamily} from './fonts';

/** Portada del reel: fotograma 0:12,40 (cover_frame.png), con o sin titular. */
export const COVER_FRAMING: Framing = {cx: 718, cy: 985, z: 1.75};
/** Altura en pantalla del centro de la persona (más abajo que en el vídeo para dejar sitio al titular). */
export const COVER_OUT_CY = 1170;

const shadow = `0 3px 22px rgba(${DARK_RGB},0.75)`;

/** showImage=false: solo el texto sobre transparente (scripts/render_cover.sh lo compone sobre el fondo de ffmpeg). */
export const Cover: React.FC<{withText: boolean; showImage?: boolean}> = ({
  withText,
  showImage = true,
}) => {
  const [first, ...rest] = INTRO.title.split('+');
  return (
    <AbsoluteFill style={{backgroundColor: showImage ? 'black' : undefined, overflow: 'hidden'}}>
      {showImage && (
        <Img
          src={staticFile('cover_frame.png')}
          style={{
            position: 'absolute',
            width: WIDTH * SOURCE_SCALE,
            height: HEIGHT * SOURCE_SCALE,
            transformOrigin: '0 0',
            transform: transformFor(COVER_FRAMING, COVER_OUT_CY),
          }}
        />
      )}
      {withText && (
        <>
          <AbsoluteFill
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.65) 22%, rgba(0,0,0,0) 38%)',
            }}
          />
          {/* Dentro del recorte 3:4 de la cuadrícula del perfil (y 240–1680) */}
          <div
            style={{
              position: 'absolute',
              top: 300,
              left: 0,
              width: WIDTH,
              textAlign: 'center',
              fontFamily: serifFamily,
              color: CREAM,
              textShadow: shadow,
            }}
          >
            <div style={{fontWeight: 600, fontSize: 120, lineHeight: 1, letterSpacing: -1}}>
              {first.trim()}
            </div>
            {rest.length > 0 && (
              <div
                style={{
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: 84,
                  lineHeight: 1.1,
                  marginTop: 10,
                }}
              >
                <span style={{color: ACCENT}}>+ </span>
                {rest.join('+').trim()}
              </div>
            )}
            <div
              style={{
                marginTop: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
              }}
            >
              <div style={{width: 56, height: 2, backgroundColor: ACCENT}} />
              <div
                style={{
                  fontFamily: sansFamily,
                  fontWeight: 500,
                  fontSize: 34,
                  letterSpacing: 5,
                  textTransform: 'uppercase',
                  color: SAND,
                }}
              >
                {INTRO.subtitle}
              </div>
              <div style={{width: 56, height: 2, backgroundColor: ACCENT}} />
            </div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
