import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Presentacion } from "./scenes/Scene2Presentacion";
import { Scene3Dashboard } from "./scenes/Scene3Dashboard";
import { Scene4Empleados } from "./scenes/Scene4Empleados";
import { Scene5CSW } from "./scenes/Scene5CSW";
import { Scene6Flujo } from "./scenes/Scene6Flujo";
import { Scene7Extras } from "./scenes/Scene7Extras";
import { Scene8Cierre } from "./scenes/Scene8Cierre";

// Duración en frames (60fps) - sin silencios, escenas encadenadas
const FPS = 60;
const SCENES = {
  hook: { start: 0, duration: 15 * FPS },               // 0-15s
  presentacion: { start: 15 * FPS, duration: 22 * FPS }, // 15-37s
  dashboard: { start: 37 * FPS, duration: 21 * FPS },    // 37-58s
  empleados: { start: 58 * FPS, duration: 24 * FPS },    // 58-82s
  csw: { start: 82 * FPS, duration: 27 * FPS },          // 82-109s
  flujo: { start: 109 * FPS, duration: 26 * FPS },       // 109-135s
  extras: { start: 135 * FPS, duration: 17 * FPS },      // 135-152s
  cierre: { start: 152 * FPS, duration: 10 * FPS },      // 152-162s
};

export const VideoPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0F172A" }}>
      {/* Audio tracks - sin gaps */}
      <Sequence from={Math.round(0.3 * FPS)} durationInFrames={Math.round(13.4 * FPS)}>
        <Audio src={staticFile("audio/v-01-hook.wav")} />
      </Sequence>
      <Sequence from={Math.round(15.3 * FPS)} durationInFrames={Math.round(20.6 * FPS)}>
        <Audio src={staticFile("audio/v-02-presentacion.wav")} />
      </Sequence>
      <Sequence from={Math.round(37.5 * FPS)} durationInFrames={Math.round(19.6 * FPS)}>
        <Audio src={staticFile("audio/v-03-dashboard.wav")} />
      </Sequence>
      <Sequence from={Math.round(58.5 * FPS)} durationInFrames={Math.round(22 * FPS)}>
        <Audio src={staticFile("audio/v-04-empleados.wav")} />
      </Sequence>
      <Sequence from={Math.round(82.5 * FPS)} durationInFrames={Math.round(25.8 * FPS)}>
        <Audio src={staticFile("audio/v-05-csw.wav")} />
      </Sequence>
      <Sequence from={Math.round(109.5 * FPS)} durationInFrames={Math.round(24 * FPS)}>
        <Audio src={staticFile("audio/v-06-flujo.wav")} />
      </Sequence>
      <Sequence from={Math.round(135.5 * FPS)} durationInFrames={Math.round(15.5 * FPS)}>
        <Audio src={staticFile("audio/v-07-extras.wav")} />
      </Sequence>
      <Sequence from={Math.round(152.5 * FPS)} durationInFrames={Math.round(7 * FPS)}>
        <Audio src={staticFile("audio/v-08-cierre.wav")} />
      </Sequence>

      {/* Visual scenes */}
      <Sequence from={SCENES.hook.start} durationInFrames={SCENES.hook.duration}>
        <Scene1Hook />
      </Sequence>
      <Sequence from={SCENES.presentacion.start} durationInFrames={SCENES.presentacion.duration}>
        <Scene2Presentacion />
      </Sequence>
      <Sequence from={SCENES.dashboard.start} durationInFrames={SCENES.dashboard.duration}>
        <Scene3Dashboard />
      </Sequence>
      <Sequence from={SCENES.empleados.start} durationInFrames={SCENES.empleados.duration}>
        <Scene4Empleados />
      </Sequence>
      <Sequence from={SCENES.csw.start} durationInFrames={SCENES.csw.duration}>
        <Scene5CSW />
      </Sequence>
      <Sequence from={SCENES.flujo.start} durationInFrames={SCENES.flujo.duration}>
        <Scene6Flujo />
      </Sequence>
      <Sequence from={SCENES.extras.start} durationInFrames={SCENES.extras.duration}>
        <Scene7Extras />
      </Sequence>
      <Sequence from={SCENES.cierre.start} durationInFrames={SCENES.cierre.duration}>
        <Scene8Cierre />
      </Sequence>
    </AbsoluteFill>
  );
};
