import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame} from 'remotion';
import {enterExit} from './anim';
import {
  ACCENT,
  BROWN,
  BROWN_RGB,
  CREAM,
  EXERCISES,
  Exercise,
  FPS,
  INTRO,
  INTRO_RANGE,
  OUTRO,
  OUTRO_START,
  SAFE,
  SAND,
  SIDE_LABELS,
  TOTAL_FRAMES,
  USERNAME,
  WHY,
  WHY_RANGE,
  WHY_STAGGER,
  WIDTH,
} from './config';
import {sansFamily, serifFamily} from './fonts';
import {BookmarkIcon, LooseIcon, RangeIcon, ReadyIcon} from './Icons';
import {Silhouette} from './Silhouette';

const CONTENT_LEFT = SAFE.left;
const CONTENT_RIGHT = WIDTH - SAFE.right; // 960
const TOP = SAFE.top + 30; // 280
const TIP_BOTTOM = SAFE.bottom + 20; // 370 desde abajo

const shadow = `0 3px 22px rgba(${BROWN_RGB},0.75)`;
const panel = `rgba(${BROWN_RGB},0.72)`;

/** Texto pequeño en mayúsculas espaciadas (sans). */
const eyebrow: React.CSSProperties = {
  fontFamily: sansFamily,
  fontWeight: 500,
  textTransform: 'uppercase',
  color: SAND,
  textShadow: shadow,
};

// ── 1 · Intro ───────────────────────────────────────────────
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const end = INTRO_RANGE.from + INTRO_RANGE.duration;
  const title = enterExit(frame, INTRO_RANGE.from + 4, end, {distance: 50});
  const sub = enterExit(frame, INTRO_RANGE.from + 16, end, {distance: 30});
  const line = spring({frame: frame - 12, fps: FPS, config: {damping: 200}});
  const [first, ...rest] = INTRO.title.split('+');
  return (
    <div style={{position: 'absolute', left: CONTENT_LEFT, top: TOP + 10, width: 880}}>
      <div
        style={{
          opacity: title.opacity,
          transform: `translateY(${title.translate}px)`,
          fontFamily: serifFamily,
          color: CREAM,
          textShadow: shadow,
        }}
      >
        <div style={{fontWeight: 600, fontSize: 104, lineHeight: 1, letterSpacing: -1}}>
          {first.trim()}
        </div>
        {rest.length > 0 && (
          <div style={{fontStyle: 'italic', fontWeight: 500, fontSize: 80, lineHeight: 1.05, marginTop: 8}}>
            <span style={{color: ACCENT}}>+ </span>
            {rest.join('+').trim()}
          </div>
        )}
      </div>
      <div
        style={{
          marginTop: 30,
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
  );
};

// ── 2 · Por qué importa ─────────────────────────────────────
const ICONS = {range: RangeIcon, loose: LooseIcon, ready: ReadyIcon};

const Why: React.FC = () => {
  const frame = useCurrentFrame();
  const end = WHY_RANGE.from + WHY_RANGE.duration;
  return (
    <div
      style={{
        position: 'absolute',
        left: CONTENT_LEFT,
        top: TOP + 10,
        width: CONTENT_RIGHT - CONTENT_LEFT,
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      {WHY.map((item, i) => {
        const a = enterExit(frame, WHY_RANGE.from + i * WHY_STAGGER, end, {distance: 60});
        const Icon = ICONS[item.icon];
        return (
          <div
            key={item.text}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              opacity: a.opacity,
              transform: `translateX(${-a.translate}px)`,
            }}
          >
            <div
              style={{
                flex: '0 0 auto',
                width: 74,
                height: 74,
                borderRadius: 37,
                border: `2px solid ${ACCENT}`,
                backgroundColor: panel,
                color: ACCENT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={40} />
            </div>
            <div
              style={{
                fontFamily: serifFamily,
                fontWeight: 600,
                fontSize: 50,
                lineHeight: 1.12,
                color: CREAM,
                textShadow: shadow,
                maxWidth: 780,
              }}
            >
              {item.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── 3 · Bloque de ejercicio ─────────────────────────────────
const SideIndicator: React.FC<{ex: Exercise}> = ({ex}) => {
  const frame = useCurrentFrame();
  if (!ex.sideSwitch) return null;
  const switched = frame >= ex.sideSwitch;
  const pop = spring({frame: frame - ex.sideSwitch, fps: FPS, config: {damping: 12, mass: 0.6}});
  const arrow = interpolate(frame, [ex.sideSwitch - 6, ex.sideSwitch + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pill = (active: boolean, scale: number): React.CSSProperties => ({
    padding: '8px 20px',
    borderRadius: 30,
    fontFamily: sansFamily,
    fontWeight: 500,
    fontSize: 27,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: active ? BROWN : 'rgba(245,237,227,0.6)',
    backgroundColor: active ? ACCENT : panel,
    border: active ? `1.5px solid ${ACCENT}` : '1.5px solid rgba(217,196,168,0.35)',
    transform: `scale(${scale})`,
  });
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 20}}>
      <div style={pill(!switched, 1)}>{SIDE_LABELS.left}</div>
      <svg
        width={32}
        height={32}
        viewBox="0 0 40 40"
        fill="none"
        stroke={switched ? ACCENT : SAND}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{transform: `translateX(${arrow * 6}px)`}}
      >
        <path d="M6 20h26M22 10l10 10-10 10" />
      </svg>
      <div style={pill(switched, switched ? 0.9 + 0.1 * pop : 1)}>{SIDE_LABELS.right}</div>
    </div>
  );
};

const ExerciseBlock: React.FC<{ex: Exercise; index: number}> = ({ex, index}) => {
  const frame = useCurrentFrame();
  if (frame < ex.from || frame >= ex.to) return null;
  const label = enterExit(frame, ex.from, ex.to, {distance: 50});
  const fig = enterExit(frame, ex.from, ex.to, {distance: 30, delay: 5});
  const tip = enterExit(frame, ex.from, ex.to, {distance: 40, delay: 9});
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <AbsoluteFill>
      {/* Etiqueta: número y nombre */}
      <div
        style={{
          position: 'absolute',
          left: CONTENT_LEFT,
          top: TOP + 36,
          width: 640,
          opacity: label.opacity,
          transform: `translateX(${-label.translate}px)`,
        }}
      >
        <div style={{...eyebrow, fontSize: 30, letterSpacing: 6}}>
          <span style={{color: ACCENT}}>{pad(index + 1)}</span> / {pad(EXERCISES.length)}
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: serifFamily,
            fontWeight: 600,
            fontSize: 72,
            lineHeight: 1.04,
            color: CREAM,
            textShadow: shadow,
          }}
        >
          {ex.name}
        </div>
        <SideIndicator ex={ex} />
      </div>

      {/* Silueta con la zona trabajada */}
      <div
        style={{
          position: 'absolute',
          right: SAFE.right + 6,
          top: TOP + 34,
          opacity: fig.opacity,
          transform: `translateY(${fig.translate}px)`,
          padding: '18px 22px 14px',
          borderRadius: 28,
          backgroundColor: `rgba(${BROWN_RGB},0.45)`,
          border: '1px solid rgba(217,196,168,0.2)',
        }}
      >
        <Silhouette zone={ex.zone} view={ex.view} size={300} />
      </div>

      {/* Pauta */}
      <div
        style={{
          position: 'absolute',
          left: CONTENT_LEFT,
          width: CONTENT_RIGHT - CONTENT_LEFT,
          bottom: TIP_BOTTOM,
          display: 'flex',
          justifyContent: 'center',
          opacity: tip.opacity,
          transform: `translateY(${tip.translate}px)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '18px 34px',
            borderRadius: 44,
            backgroundColor: panel,
            border: '1px solid rgba(217,196,168,0.35)',
          }}
        >
          <div style={{width: 12, height: 12, backgroundColor: ACCENT, transform: 'rotate(45deg)'}} />
          <div style={{fontFamily: sansFamily, fontWeight: 500, fontSize: 40, letterSpacing: 0.5, color: CREAM}}>
            {ex.tip}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Barra de progreso (5 segmentos) ─────────────────────────
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
        width: CONTENT_RIGHT - CONTENT_LEFT,
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
              backgroundColor: 'rgba(245,237,227,0.22)',
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

// ── 4 · Cierre ──────────────────────────────────────────────
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
      {frame < INTRO_RANGE.from + INTRO_RANGE.duration && <Intro />}
      {frame >= WHY_RANGE.from && frame < WHY_RANGE.from + WHY_RANGE.duration && <Why />}
      <Progress />
      {EXERCISES.map((ex, i) => (
        <ExerciseBlock key={ex.name} ex={ex} index={i} />
      ))}
      <Outro />
    </AbsoluteFill>
  );
};
