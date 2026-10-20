import React from 'react';

const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 3.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Flechas hacia fuera: más rango. */
export const RangeIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" {...common}>
    <path d="M6 20h28M6 20l6-6M6 20l6 6M34 20l-6-6M34 20l-6 6" />
  </svg>
);

/** Onda suelta: menos rigidez. */
export const LooseIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" {...common}>
    <path d="M5 15c5-6 10 6 15 0s10 6 15 0M5 26c5-6 10 6 15 0s10 6 15 0" />
  </svg>
);

/** Check: listos para entrenar. */
export const ReadyIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" {...common}>
    <path d="M9 21l7 7 15-16" />
  </svg>
);

/** Marcador: guardar. */
export const BookmarkIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" {...common}>
    <path d="M11 6h18v28l-9-7-9 7z" />
  </svg>
);
