import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate, Easing, staticFile } from "remotion";

export const Scene8Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = interpolate(frame, [0.3 * fps, 0.9 * fps], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
  const logoOpacity = interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const titleOpacity = interpolate(frame, [1 * fps, 1.7 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [1 * fps, 1.7 * fps], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

  const subOpacity = interpolate(frame, [1.8 * fps, 2.5 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Final fade to black
  const fadeOut = interpolate(frame, [9.5 * fps, 12 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Img src={staticFile("logo.webp")} style={{ height: 64, scale: String(logoScale), opacity: logoOpacity }} />
        <div style={{ fontSize: 56, fontWeight: 700, color: "#F8FAFC", textAlign: "center" as const, maxWidth: 900, opacity: titleOpacity, translate: `0px ${titleY}px`, fontFamily: "Inter, sans-serif" }}>
          La gestión de tu equipo, simplificada.
        </div>
        <div style={{ fontSize: 28, color: "#94A3B8", opacity: subOpacity, fontFamily: "Inter, sans-serif" }}>
          Disponible ahora en la nube
        </div>
      </div>
    </AbsoluteFill>
  );
};
