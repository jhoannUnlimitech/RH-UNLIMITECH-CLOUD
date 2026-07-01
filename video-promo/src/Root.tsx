import { Composition } from "remotion";
import { VideoPromo } from "./VideoPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RHUnlimitechCloud"
      component={VideoPromo}
      durationInFrames={60 * 162} // 2:42 a 60fps
      fps={60}
      width={1920}
      height={1080}
    />
  );
};
