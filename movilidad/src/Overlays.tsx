import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame} from 'remotion';
import {enterExit} from './anim';
import {
  ACCENT,
  BLACK,
  EXERCISES,
  Exercise,
  FPS,
  INTRO,
  INTRO_RANGE,
  OUTRO,
  OUTRO_START,
  SAFE,
  SIDE_LABELS,
  TOTAL_FRAMES,
  USERNAME,
  WHITE,
  WHY,
  WHY_RANGE,
  WIDTH,
} from './config';
import {fontFamily} from './fonts';
import {BookmarkIcon, LooseIcon, RangeIcon, ReadyIcon} from './Icons';
import {Silhouette} from './Silhouette';

const CONTENT_LEFT = SAFE.left;
const CONTENT_RIGHT = WIDTH - SAFE.right; // 960
const TOP = SAFE.top + 30; // 280
const TIP_BOTTOM = SAFE.bottom + 20; // 370 desde abajo

const shadow = '0 4px 24px rgba(0,0,0,0.55)';

// ── 1 · Intro ───────────────────────────────────────────────
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const end = INTRO_RANGE.from + INTRO_RANGE.duration;
  const title = enterExit(frame, INTRO_RANGE.from + 4, end, {distance: 60});
  const sub = enterExit(frame, INTRO_RANGE.from + 14, end, {distance: 40});
  const bar = spring({frame: frame - 10, fps: FPS, config: {damping: 200}});
  return (
    <div style={{position: 'absolute', left: CONTENT_LEFT, top: TOP + 10, width: 880}}>
      <div
        style={{
          opacity: title.opacity,
          transform: `translateY(${title.translate}px)`,
          fontFamily,
          fontWeight: 900,
          fontSize: 92,
          lineHeight: 1.02,
          letterSpacing: -2,
          color: WHITE,
          textShadow: shadow,
        }}
      >
        {INTRO.title.split('+').map((part, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{color: ACCENT}}>+</span>}
            {part}
          </React.Fragment>
        ))}
      </div>
      <div
        style={{
          marginTop: 26,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          opacity: sub.opacity,
          transform: `translateY(${sub.translate}px)`,
        }}
      >
        <div style={{width: 70 * bar, height: 8, borderRadius: 4, backgroundColor: ACCENT}} />
        <div
          style={{
            fontFamily,
            fontWeight: 700,
            fontSize: 46,
            color: WHITE,
            textShadow: shadow,
          }}
        >
          {INTRO.subtitle}
        </div>
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
        gap: 26,
      }}
    >
      {WHY.map((item, i) => {
        const a = enterExit(frame, WHY_RANGE.from + i * 20, end, {distance: 70});
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
                width: 76,
                height: 76,
                borderRadius: 38,
                backgroundColor: ACCENT,
                color: WHITE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: shadow,
              }}
            >
              <Icon size={44} />
            </div>
            <div
              style={{
                fontFamily,
                fontWeight: 800,
                fontSize: 48,
                lineHeight: 1.1,
                color: WHITE,
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
    padding: '8px 18px',
    borderRadius: 30,
    fontFamily,
    fontWeight: 700,
    fontSize: 30,
    color: active ? WHITE : 'rgba(255,255,255,0.55)',
    backgroundColor: active ? ACCENT : 'rgba(0,0,0,0.45)',
    border: active ? 'none' : '2px solid rgba(255,255,255,0.25)',
    transform: `scale(${scale})`,
  });
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 18}}>
      <div style={pill(!switched, 1)}>{SIDE_LABELS.left}</div>
      <svg
        width={34}
        height={34}
        viewBox="0 0 40 40"
        fill="none"
        stroke={switched ? ACCENT : 'rgba(255,255,255,0.6)'}
        strokeWidth={4.5}
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
  return (
    <AbsoluteFill>
      {/* Etiqueta: número y nombre */}
      <div
        style={{
          position: 'absolute',
          left: CONTENT_LEFT,
          top: TOP + 34,
          width: 640,
          opacity: label.opacity,
          transform: `translateX(${-label.translate}px)`,
        }}
      >
        <div
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 34,
            color: ACCENT,
            letterSpacing: 2,
            textShadow: shadow,
          }}
        >
          {index + 1}/{EXERCISES.length}
        </div>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 68,
            lineHeight: 1.04,
            letterSpacing: -1.5,
            color: WHITE,
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
          backgroundColor: 'rgba(0,0,0,0.35)',
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
            gap: 16,
            padding: '18px 30px',
            borderRadius: 44,
            backgroundColor: 'rgba(10,10,10,0.72)',
            border: `2px solid rgba(255,255,255,0.12)`,
          }}
        >
          <div style={{width: 16, height: 16, borderRadius: 8, backgroundColor: ACCENT}} />
          <div style={{fontFamily, fontWeight: 700, fontSize: 42, color: WHITE}}>{ex.tip}</div>
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
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.25)',
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
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: ACCENT,
          color: WHITE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: icon.opacity,
          transform: `translateY(${icon.translate}px) scale(${0.8 + 0.2 * icon.progress})`,
        }}
      >
        <BookmarkIcon size={64} />
      </div>
      <div
        style={{
          marginTop: 40,
          textAlign: 'center',
          fontFamily,
          fontWeight: 900,
          fontSize: 84,
          lineHeight: 1.05,
          letterSpacing: -1.5,
          color: WHITE,
          textShadow: shadow,
          opacity: cta.opacity,
          transform: `translateY(${cta.translate}px)`,
        }}
      >
        {OUTRO.cta}
      </div>
      <div
        style={{
          marginTop: 44,
          padding: '14px 34px',
          borderRadius: 40,
          backgroundColor: WHITE,
          color: BLACK,
          fontFamily,
          fontWeight: 800,
          fontSize: 44,
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
