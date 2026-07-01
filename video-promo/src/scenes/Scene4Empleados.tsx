import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate, Easing, staticFile } from "remotion";

export const Scene4Empleados: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOpacity = interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelX = interpolate(frame, [0.3 * fps, 0.8 * fps], [-30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const img1Opacity = interpolate(frame, [0.8 * fps, 1.5 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const img1Y = interpolate(frame, [0.8 * fps, 1.5 * fps], [50, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const img2Opacity = interpolate(frame, [1.2 * fps, 1.9 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const img2Y = interpolate(frame, [1.2 * fps, 1.9 * fps], [50, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

  const fadeOut = interpolate(frame, [22 * fps, 24 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: fadeOut, display: "flex", flexDirection: "column", padding: "40px 80px", gap: 20 }}>
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 3, color: "#465FFF", opacity: labelOpacity, translate: `${labelX}px 0px`, fontFamily: "Inter, sans-serif" }}>
        DIRECTORIO Y ESTRUCTURA
      </div>
      <div style={{ flex: 1, display: "flex", gap: 20, alignItems: "center" }}>
        <Img src={staticFile("screenshots/02-empleados-lista.png")} style={{ width: "50%", borderRadius: 12, boxShadow: "0 20px 40px rgba(0,0,0,0.4)", opacity: img1Opacity, translate: `0px ${img1Y}px`, objectFit: "contain" as const, maxHeight: 850 }} />
        <Img src={staticFile("screenshots/03-divisiones.png")} style={{ width: "50%", borderRadius: 12, boxShadow: "0 20px 40px rgba(0,0,0,0.4)", opacity: img2Opacity, translate: `0px ${img2Y}px`, objectFit: "contain" as const, maxHeight: 850 }} />
      </div>
    </AbsoluteFill>
  );
};
