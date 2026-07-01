import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate, Easing, staticFile } from "remotion";

export const Scene3Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOpacity = interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelX = interpolate(frame, [0.3 * fps, 0.8 * fps], [-30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const imgOpacity = interpolate(frame, [0.8 * fps, 1.6 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const imgY = interpolate(frame, [0.8 * fps, 1.6 * fps], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

  // Slow zoom
  const zoomScale = interpolate(frame, [2 * fps, 19 * fps], [1, 1.04], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const fadeOut = interpolate(frame, [19 * fps, 21 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: fadeOut, display: "flex", flexDirection: "column", padding: "40px 100px", gap: 20 }}>
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 3, color: "#465FFF", textTransform: "uppercase" as const, opacity: labelOpacity, translate: `${labelX}px 0px`, fontFamily: "Inter, sans-serif" }}>
        DASHBOARD EN TIEMPO REAL
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Img
          src={staticFile("screenshots/01-dashboard.png")}
          style={{ width: "100%", maxHeight: 900, objectFit: "contain" as const, borderRadius: 16, boxShadow: "0 25px 50px rgba(0,0,0,0.5)", opacity: imgOpacity, translate: `0px ${imgY}px`, scale: String(zoomScale) }}
        />
      </div>
    </AbsoluteFill>
  );
};
