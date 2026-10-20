import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame} from 'remotion';
import {enterExit} from './anim';
import {
  ACCENT,
  CREAM,
  CREAM_RGB,
  DARK,
  DARK_RGB,
  EXERCISES,
  Exercise,
  FPS,
  INTRO,
  INTRO_HOOK_RANGE,
  OUTRO,
  OUTRO_START,
  SAFE,
  SAND,
  SAND_RGB,
  TOTAL_FRAMES,
  USERNAME,
  WIDTH,
} from './config';
import {sansFamily, serifFamily} from './fonts';
import {BookmarkIcon} from './Icons';
import {LymphDiagram} from './LymphDiagram';

const CONTENT_LEFT = SAFE.left;
const CONTENT_RIGHT = WIDTH - SAFE.right; // 960
const CONTENT_W = CONTENT_RIGHT - CONTENT_LEFT;
const TOP = SAFE.top + 20; // 270
const CARD_BOTTOM = SAFE.bottom + 20; // 370 desde abajo

const shadow = `0 3px 22px rgba(${DARK_RGB},0.8)`;
const panel = `rgba(${DARK_RGB},0.74)`;

const eyebrow: React.CSSProperties = {
  fontFamily: sansFamily,
  fontWeight: 500,
  textTransform: 'uppercase',
  color: SAND,
  textShadow: shadow,
};

/** Tarjeta inferior (sobre el césped): diagrama linfático + texto. */
const BottomCard: React.FC<{
  opacity: number;
  translate: number;
  children: React.ReactNode;
  diagram?: React.ReactNode;
}> = ({opacity, translate, children, diagram}) => (
  <div
    style={{
      position: 'absolute',
      left: CONTENT_LEFT,
      width: CONTENT_W,
      bottom: CARD_BOTTOM,
      opacity,
      transform: `translateY(${translate}px)`,
      display: 'flex',
      alignItems: 'center',
      gap: 26,
      padding: '22px 30px',
      borderRadius: 30,
      backgroundColor: panel,
      border: `1px solid rgba(${SAND_RGB},0.3)`,
      boxSizing: 'border-box',
    }}
  >
    {diagram && <div style={{flex: '0 0 auto'}}>{diagram}</div>}
    <div
      style={{
        fontFamily: serifFamily,
        fontWeight: 500,
        fontSize: 38,
        lineHeight: 1.22,
        color: CREAM,
      }}
    >
      {children}
    </div>
  </div>
);

// ── Intro ───────────────────────────────────────────────────
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const title = enterExit(frame, 4, INTRO_HOOK_RANGE.from + INTRO_HOOK_RANGE.duration, {
    distance: 50,
  });
  const sub = enterExit(frame, 14, INTRO_HOOK_RANGE.from + INTRO_HOOK_RANGE.duration, {
    distance: 30,
  });
  const hook = enterExit(
    frame,
    INTRO_HOOK_RANGE.from,
    INTRO_HOOK_RANGE.from + INTRO_HOOK_RANGE.duration,
    {
      distance: 40,
    },
  );
  const line = spring({frame: frame - 12, fps: FPS, config: {damping: 200}});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: CONTENT_LEFT, top: TOP + 10, width: CONTENT_W}}>
        <div
          style={{
            opacity: title.opacity,
            transform: `translateY(${title.translate}px)`,
            fontFamily: serifFamily,
            fontWeight: 600,
            fontSize: 100,
            lineHeight: 1,
            letterSpacing: -1,
            color: CREAM,
            textShadow: shadow,
          }}
        >
          {INTRO.title.split(' ')[0]}{' '}
          <span style={{fontStyle: 'italic', fontWeight: 500, color: ACCENT}}>
            {INTRO.title.split(' ').slice(1).join(' ')}
          </span>
        </div>
        <div
          style={{
            marginTop: 26,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            opacity: sub.opacity,
            transform: `translateY(${sub.translate}px)`,
          }}
        >
          <div style={{width: 64 * line, height: 2, backgroundColor: ACCENT}} />
          <div style={{...eyebrow, fontSize: 34, letterSpacing: 5}}>{INTRO.subtitle}</div>
        </div>
      </div>
      {frame >= INTRO_HOOK_RANGE.from && (
        <BottomCard
          opacity={hook.opacity}
          translate={hook.translate}
          diagram={<LymphDiagram focus="whole" height={220} />}
        >
          {INTRO.hook}
        </BottomCard>
      )}
    </AbsoluteFill>
  );
};

// ── Ejercicio ───────────────────────────────────────────────
const DoseIcon: React.FC<{size: number}> = ({size}) => (
  // Cronómetro / repeticiones
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    stroke="currentColor"
    strokeWidth={3.2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx={20} cy={23} r={13} />
    <path d="M20 23V15M16 4h8M31 10l2.5-2.5" />
  </svg>
);

/** Ancho reservado a la derecha para el diagrama animado. */
const DIAGRAM_BOX_W = 210;

const ExerciseBlock: React.FC<{ex: Exercise; index: number}> = ({ex, index}) => {
  const frame = useCurrentFrame();
  if (frame < ex.from || frame >= ex.to) return null;
  const label = enterExit(frame, ex.from, ex.to, {distance: 50});
  const dose = enterExit(frame, ex.from, ex.to, {distance: 30, delay: 6});
  const fig = enterExit(frame, ex.from, ex.to, {distance: 30, delay: 4});
  const card = enterExit(frame, ex.from, ex.to, {distance: 40, delay: 12});
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <AbsoluteFill>
      {/* Número, nombre y dosis */}
      <div
        style={{
          position: 'absolute',
          left: CONTENT_LEFT,
          top: TOP + 26,
          width: CONTENT_W - DIAGRAM_BOX_W - 30,
        }}
      >
        <div style={{opacity: label.opacity, transform: `translateX(${-label.translate}px)`}}>
          <div style={{...eyebrow, fontSize: 28, letterSpacing: 6}}>
            <span style={{color: ACCENT}}>{pad(index + 1)}</span> / {pad(EXERCISES.length)}
          </div>
          <div
            style={{
              marginTop: 4,
              fontFamily: serifFamily,
              fontWeight: 600,
              fontSize: 56,
              lineHeight: 1.05,
              color: CREAM,
              textShadow: shadow,
            }}
          >
            {ex.name}
          </div>
        </div>
        <div
          style={{
            marginTop: 16,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '9px 22px 9px 16px',
            borderRadius: 30,
            backgroundColor: ACCENT,
            color: DARK,
            opacity: dose.opacity,
            transform: `translateY(${dose.translate}px)`,
          }}
        >
          <DoseIcon size={30} />
          <div style={{fontFamily: sansFamily, fontWeight: 600, fontSize: 30, letterSpacing: 1}}>
            {ex.dose}
          </div>
        </div>
      </div>

      {/* Diagrama animado del sistema linfático */}
      <div
        style={{
          position: 'absolute',
          right: SAFE.right + 6,
          top: TOP + 26,
          width: DIAGRAM_BOX_W,
          boxSizing: 'border-box',
          padding: '18px 0 14px',
          borderRadius: 28,
          backgroundColor: `rgba(${DARK_RGB},0.55)`,
          border: `1px solid rgba(${SAND_RGB},0.25)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: fig.opacity,
          transform: `translateY(${fig.translate}px)`,
        }}
      >
        <LymphDiagram focus={ex.focus} height={330} />
        <div
          style={{
            ...eyebrow,
            fontSize: 17,
            letterSpacing: 2.5,
            lineHeight: 1.25,
            textAlign: 'center',
            textShadow: 'none',
          }}
        >
          Sistema
          <br />
          linfático
        </div>
      </div>

      {/* Explicación */}
      <BottomCard opacity={card.opacity} translate={card.translate}>
        {ex.fact}
      </BottomCard>
    </AbsoluteFill>
  );
};

// ── Progreso ────────────────────────────────────────────────
const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const start = EXERCISES[0].from;
  const a = enterExit(frame, start, OUTRO_START, {distance: 20});
  if (frame < start || frame >= OUTRO_START) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: CONTENT_LEFT,
        top: TOP,
        width: CONTENT_W,
        display: 'flex',
        gap: 10,
        opacity: a.opacity,
      }}
    >
      {EXERCISES.map((ex, i) => {
        const fill = interpolate(frame, [ex.from, ex.to], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              backgroundColor: `rgba(${CREAM_RGB},0.25)`,
              overflow: 'hidden',
            }}
          >
            <div style={{width: `${fill * 100}%`, height: '100%', backgroundColor: ACCENT}} />
          </div>
        );
      })}
    </div>
  );
};

// ── Cierre ──────────────────────────────────────────────────
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < OUTRO_START) return null;
  const icon = enterExit(frame, OUTRO_START + 4, TOTAL_FRAMES + 30, {distance: 40});
  const cta = enterExit(frame, OUTRO_START + 8, TOTAL_FRAMES + 30, {distance: 50});
  const user = enterExit(frame, OUTRO_START + 18, TOTAL_FRAMES + 30, {distance: 30});
  const line = spring({frame: frame - OUTRO_START - 14, fps: FPS, config: {damping: 200}});
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: CONTENT_LEFT,
        paddingRight: SAFE.right,
        paddingBottom: 120,
      }}
    >
      <div
        style={{
          width: 116,
          height: 116,
          borderRadius: 58,
          border: `2px solid ${ACCENT}`,
          color: ACCENT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: icon.opacity,
          transform: `translateY(${icon.translate}px) scale(${0.8 + 0.2 * icon.progress})`,
        }}
      >
        <BookmarkIcon size={56} />
      </div>
      <div
        style={{
          marginTop: 40,
          textAlign: 'center',
          fontFamily: serifFamily,
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 86,
          lineHeight: 1.08,
          color: CREAM,
          textShadow: shadow,
          opacity: cta.opacity,
          transform: `translateY(${cta.translate}px)`,
        }}
      >
        {OUTRO.cta}
      </div>
      <div style={{marginTop: 40, width: 120 * line, height: 2, backgroundColor: ACCENT}} />
      <div
        style={{
          ...eyebrow,
          marginTop: 36,
          fontSize: 48,
          letterSpacing: 3,
          textTransform: 'none',
          color: CREAM,
          opacity: user.opacity,
          transform: `translateY(${user.translate}px)`,
        }}
      >
        {USERNAME}
      </div>
    </AbsoluteFill>
  );
};

export const Overlays: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {frame < INTRO_HOOK_RANGE.from + INTRO_HOOK_RANGE.duration && <Intro />}
      <Progress />
      {EXERCISES.map((ex, i) => (
        <ExerciseBlock key={ex.name} ex={ex} index={i} />
      ))}
      <Outro />
    </AbsoluteFill>
  );
};
