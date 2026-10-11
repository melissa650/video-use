import {Composition} from 'remotion';
import {Overlay, OverlayProps} from './Overlay';

// Override per slot: --props='{"text":"..."}', or edit width/height/fps/duration
// to match the timeline (fps must equal the edit's output fps).
export const RemotionRoot: React.FC = () => (
  <Composition
    id="Overlay"
    component={Overlay}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{text: 'video-use', accent: '#FF5A00', background: '#0A0A0A'} satisfies OverlayProps}
  />
);
