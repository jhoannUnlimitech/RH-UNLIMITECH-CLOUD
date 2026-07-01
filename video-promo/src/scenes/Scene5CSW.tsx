import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate, Easing, staticFile } from "remotion";

export const Scene5CSW: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOpacity = interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const imgOpacity = interpolate(frame, [0.8 * fps, 1.6 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const imgY = interpolate(frame, [0.8 * fps, 1.6 * fps], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const zoomScale = interpolate(frame, [2 * fps, 28 * fps], [1, 1.04], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const fadeOut = interpolate(frame, [28 * fps, 30 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "60px 100px", opacity: fadeOut }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%" }}>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 3, color: "#465FFF", opacity: labelOpacity, fontFamily: "Inter, sans-serif" }}>
          CSW — SOLICITUDES INTELIGENTES
        </div>
        <Img src={staticFile("screenshots/08-csw-mis-solicitudes.png")} style={{ width: "85%", borderRadius: 16, boxShadow: "0 25px 50px rgba(0,0,0,0.5)", opacity: imgOpacity, translate: `0px ${imgY}px`, scale: String(zoomScale) }} />
      </div>
    </AbsoluteFill>
  );
};
