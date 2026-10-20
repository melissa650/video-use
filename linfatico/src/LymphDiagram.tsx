import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ACCENT, CREAM, DARK, LymphFocus} from './config';

// Silueta frontal minimalista (lienzo 200×400) con un esquema simplificado del sistema linfático:
// vasos de piernas y brazos, cisterna del quilo, conducto torácico hasta la base del cuello y
// ganglios en rodillas, ingles, axilas y cuello. La linfa (trazos) fluye siempre hacia el cuello.

type Limb = [number, number, number, number, number]; // x1 y1 x2 y2 grosor

const LIMBS: Limb[] = [
  [60, 80, 50, 140, 15],
  [50, 140, 46, 196, 13],
  [140, 80, 150, 140, 15],
  [150, 140, 154, 196, 13],
  [85, 210, 81, 300, 27],
  [115, 210, 119, 300, 27],
  [81, 300, 81, 378, 19],
  [119, 300, 119, 378, 19],
  [81, 386, 74, 390, 12],
  [119, 386, 126, 390, 12],
];
const TORSO = 'M64 70 Q100 62 136 70 L131 140 Q128 178 134 214 L66 214 Q72 178 69 140 Z';

const Body: React.FC<{outline?: boolean; chest?: number}> = ({outline, chest = 1}) => {
  const grow = outline ? 4 : 0;
  const color = outline ? CREAM : DARK;
  return (
    <g>
      <circle cx={100} cy={34} r={20 + grow / 2} fill={color} />
      <rect x={92 - grow / 2} y={50} width={16 + grow} height={16} rx={5} fill={color} />
      {/* El tórax se expande un poco al respirar (foco «breath») */}
      <g transform={`translate(100 120) scale(${chest} 1) translate(-100 -120)`}>
        <path d={TORSO} fill={color} stroke={color} strokeWidth={grow} strokeLinejoin="round" />
      </g>
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

// Vasos (dibujados en el sentido del flujo: de la periferia al cuello)
const VESSELS = {
  legL: 'M81 382 L81 300 L84 214 L94 196 L100 170',
  legR: 'M119 382 L119 300 L116 214 L106 196 L100 170',
  duct: 'M100 170 L100 104 Q100 82 112 74',
  armR: 'M47 194 L50 140 L60 90 L74 84 L88 74',
  armL: 'M153 194 L150 140 L140 90 L126 84 L112 74',
} as const;
type VesselId = keyof typeof VESSELS;

const NODES = {
  knees: [
    [81, 300],
    [119, 300],
  ],
  groin: [
    [86, 212],
    [114, 212],
  ],
  armpits: [
    [64, 94],
    [136, 94],
  ],
  neck: [
    [88, 70],
    [112, 70],
  ],
  cisterna: [[100, 170]],
} as const;
type NodeGroup = keyof typeof NODES;

const FOCUS: Record<LymphFocus, {vessels: VesselId[]; nodes: NodeGroup[]}> = {
  calves: {vessels: ['legL', 'legR'], nodes: ['knees']},
  nodes: {vessels: [], nodes: ['groin', 'armpits']},
  arms: {vessels: ['armR', 'armL'], nodes: ['armpits']},
  whole: {vessels: ['legL', 'legR', 'duct', 'armR', 'armL'], nodes: ['neck']},
  breath: {vessels: ['duct'], nodes: ['neck', 'cisterna']},
};

export const LymphDiagram: React.FC<{focus: LymphFocus; height?: number}> = ({
  focus,
  height = 240,
}) => {
  const frame = useCurrentFrame();
  const pulse = 0.5 + 0.5 * Math.sin((frame / 30) * Math.PI * 2);
  const breath = 0.5 + 0.5 * Math.sin((frame / 75) * Math.PI * 2); // ~2,5 s por ciclo
  const active = FOCUS[focus];
  const flowOffset = -frame * 1.6;

  return (
    <svg width={height / 2} height={height} viewBox="0 0 200 400" style={{overflow: 'visible'}}>
      <Body outline chest={focus === 'breath' ? 1 + 0.06 * breath : 1} />
      <Body chest={focus === 'breath' ? 1 + 0.06 * breath : 1} />

      {/* Red completa, tenue */}
      <g stroke={ACCENT} strokeOpacity={0.28} strokeWidth={2.2} fill="none" strokeLinecap="round">
        {Object.values(VESSELS).map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* Pantorrillas que «bombean» */}
      {focus === 'calves' && (
        <g fill={ACCENT} opacity={0.35 + 0.45 * pulse}>
          <ellipse cx={81} cy={335} rx={10 + 2 * pulse} ry={24} />
          <ellipse cx={119} cy={335} rx={10 + 2 * pulse} ry={24} />
        </g>
      )}

      {/* Diafragma que sube y baja al respirar */}
      {focus === 'breath' && (
        <path
          d={`M70 ${158 + 8 * breath} Q100 ${138 + 14 * breath} 130 ${158 + 8 * breath}`}
          stroke={ACCENT}
          strokeOpacity={0.7}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Linfa fluyendo en los vasos del foco */}
      <g
        stroke={ACCENT}
        strokeWidth={4.5}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="3 13"
        strokeDashoffset={flowOffset}
        style={{filter: `drop-shadow(0 0 4px ${ACCENT})`}}
      >
        {active.vessels.map((v) => (
          <path key={v} d={VESSELS[v]} />
        ))}
      </g>

      {/* Ganglios: todos tenues; los del foco laten */}
      {(Object.keys(NODES) as NodeGroup[]).map((g) =>
        NODES[g].map(([x, y]) => {
          const on = active.nodes.includes(g);
          return (
            <circle
              key={`${g}-${x}-${y}`}
              cx={x}
              cy={y}
              r={on ? 7.5 + 3 * pulse : 4}
              fill={ACCENT}
              opacity={on ? 0.7 + 0.3 * pulse : 0.35}
              style={on ? {filter: `drop-shadow(0 0 ${5 + 6 * pulse}px ${ACCENT})`} : undefined}
            />
          );
        }),
      )}
    </svg>
  );
};
