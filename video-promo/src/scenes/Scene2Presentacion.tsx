import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate, Easing, staticFile } from "remotion";

const PILLS = ["Empleados", "Divisiones", "Solicitudes", "Aprobaciones", "Calendario", "Productividad"];

export const Scene2Presentacion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = interpolate(frame, [0.3 * fps, 1 * fps], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
  const logoOpacity = interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const titleOpacity = interpolate(frame, [1 * fps, 1.7 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [1 * fps, 1.7 * fps], [50, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

  const subOpacity = interpolate(frame, [1.6 * fps, 2.3 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Fade out
  const fadeOut = interpolate(frame, [22 * fps, 24 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Img src={staticFile("logo.webp")} style={{ height: 80, scale: String(logoScale), opacity: logoOpacity }} />
        <div style={{ fontSize: 72, fontWeight: 800, color: "#F8FAFC", letterSpacing: -1, opacity: titleOpacity, translate: `0px ${titleY}px`, fontFamily: "Inter, sans-serif" }}>
          RH Unlimitech Cloud
        </div>
        <div style={{ fontSize: 32, color: "#94A3B8", fontWeight: 400, opacity: subOpacity, fontFamily: "Inter, sans-serif" }}>
          Sistema de Gestión de Recursos Humanos
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 16 }}>
          {PILLS.map((pill, i) => {
            const pillOpacity = interpolate(frame, [(2.2 + i * 0.15) * fps, (2.6 + i * 0.15) * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const pillY = interpolate(frame, [(2.2 + i * 0.15) * fps, (2.6 + i * 0.15) * fps], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            // Each pill lights up as the narration mentions it (staggered ~3s apart starting at ~5s)
            const activateAt = (5 + i * 2) * fps;
            const isActive = frame >= activateAt;
            const pillBg = isActive ? "#465FFF" : "#1E293B";
            const pillColor = isActive ? "#FFFFFF" : "#94A3B8";
            const pillBorder = isActive ? "#6366F1" : "#334155";
            const pillScale = interpolate(frame, [activateAt, activateAt + 0.3 * fps], [1, 1.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const pillScaleBack = interpolate(frame, [activateAt + 0.3 * fps, activateAt + 0.6 * fps], [1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const finalScale = frame < activateAt ? 1 : frame < activateAt + 0.3 * fps ? pillScale : pillScaleBack;

            return (
              <span key={pill} style={{ padding: "10px 24px", background: pillBg, border: `1px solid ${pillBorder}`, borderRadius: 999, fontSize: 20, fontWeight: 500, color: pillColor, opacity: pillOpacity, translate: `0px ${pillY}px`, scale: String(finalScale), transition: "background 0.3s", fontFamily: "Inter, sans-serif" }}>
                {pill}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
