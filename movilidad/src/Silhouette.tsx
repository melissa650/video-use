import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ACCENT, BROWN, CREAM, SAND, Zone} from './config';
import {sansFamily} from './fonts';

type Limb = [number, number, number, number, number]; // x1 y1 x2 y2 grosor

// Figura frontal/posterior minimalista en un lienzo de 200×400
const LIMBS: Limb[] = [
  [60, 80, 50, 140, 15], // brazo izq.
  [50, 140, 46, 196, 13],
  [140, 80, 150, 140, 15], // brazo dcho.
  [150, 140, 154, 196, 13],
  [85, 210, 81, 300, 27], // muslo izq.
  [115, 210, 119, 300, 27], // muslo dcho.
  [81, 300, 81, 378, 19], // pierna izq.
  [119, 300, 119, 378, 19], // pierna dcho.
  [81, 386, 74, 390, 12], // pies
  [119, 386, 126, 390, 12],
];
const TORSO = 'M64 70 Q100 62 136 70 L131 140 Q128 178 134 214 L66 214 Q72 178 69 140 Z';

const Body: React.FC<{outline?: boolean}> = ({outline}) => {
  const grow = outline ? 4 : 0;
  const color = outline ? CREAM : BROWN;
  return (
    <g>
      <circle cx={100} cy={34} r={20 + grow / 2} fill={color} />
      <rect x={92 - grow / 2} y={50} width={16 + grow} height={16} rx={5} fill={color} />
      <path d={TORSO} fill={color} stroke={color} strokeWidth={grow} strokeLinejoin="round" />
      {LIMBS.map(([x1, y1, x2, y2, w], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={w + grow}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
};

const Mirror: React.FC<{children: React.ReactNode}> = ({children}) => (
  <>
    {children}
    <g transform="translate(200 0) scale(-1 1)">{children}</g>
  </>
);

const ZoneShape: React.FC<{zone: Zone}> = ({zone}) => {
  const s = {stroke: ACCENT, strokeLinecap: 'round' as const, fill: 'none'};
  switch (zone) {
    case 'hipLateral':
      return (
        <Mirror>
          <ellipse cx={70} cy={204} rx={7} ry={13} fill={ACCENT} />
          <line x1={74} y1={212} x2={70} y2={294} strokeWidth={8} {...s} />
        </Mirror>
      );
    case 'hipFlexorsAnkle':
      return (
        <Mirror>
          <line x1={77} y1={207} x2={95} y2={219} strokeWidth={10} {...s} />
          <line x1={81} y1={366} x2={81} y2={382} strokeWidth={12} {...s} />
        </Mirror>
      );
    case 'hamstrings':
    case 'quads':
      return (
        <Mirror>
          <line x1={85} y1={218} x2={81.6} y2={290} strokeWidth={19} {...s} />
        </Mirror>
      );
    case 'adductors':
      return (
        <Mirror>
          <line x1={95} y1={214} x2={90} y2={286} strokeWidth={8} {...s} />
        </Mirror>
      );
  }
};

export const Silhouette: React.FC<{zone: Zone; view: 'front' | 'back'; size?: number}> = ({
  zone,
  view,
  size = 300,
}) => {
  const frame = useCurrentFrame();
  const pulse = 0.5 + 0.5 * Math.sin((frame / 36) * Math.PI * 2);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
      <svg width={size / 2} height={size} viewBox="0 0 200 400" style={{overflow: 'visible'}}>
        <Body outline />
        <Body />
        {view === 'back' && (
          <g stroke={SAND} strokeOpacity={0.45} strokeWidth={2.5} fill="none" strokeLinecap="round">
            <line x1={100} y1={76} x2={100} y2={190} />
            <path d="M74 206 Q87 216 100 206 Q113 216 126 206" />
          </g>
        )}
        <g
          opacity={0.55 + 0.45 * pulse}
          style={{filter: `drop-shadow(0 0 ${6 + 8 * pulse}px ${ACCENT})`}}
        >
          <ZoneShape zone={zone} />
        </g>
      </svg>
      <div
        style={{
          fontFamily: sansFamily,
          fontWeight: 500,
          fontSize: 21,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: SAND,
        }}
      >
        {view === 'front' ? 'Vista frontal' : 'Vista posterior'}
      </div>
    </div>
  );
};
