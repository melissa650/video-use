import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export type OverlayProps = {text: string; accent: string; background: string};

// Placeholder card used by setup.sh's smoke render. Replace per slot.
export const Overlay: React.FC<OverlayProps> = ({text, accent, background}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = interpolate(frame, [0, fps * 0.8], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: background, justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          color: accent,
          fontFamily: 'monospace',
          fontWeight: 700,
          fontSize: 120,
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 40}px)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
