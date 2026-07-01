import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate, Easing, staticFile } from "remotion";

const STEPS = [
  { label: "Líder Técnico / Jefe Inmediato", bg: "#065F46", color: "#10B981", border: "#10B981" },
  { label: "Encargado de División", bg: "#065F46", color: "#10B981", border: "#10B981" },
  { label: "Founder / CEO", bg: "#78350F", color: "#F59E0B", border: "#F59E0B" },
  { label: "Recursos Humanos", bg: "#1E293B", color: "#94A3B8", border: "#334155" },
];

export const Scene6Flujo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOpacity = interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const imgOpacity = interpolate(frame, [0.8 * fps, 1.5 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const imgY = interpolate(frame, [0.8 * fps, 1.5 * fps], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

  const fadeOut = interpolate(frame, [26 * fps, 28 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "50px 100px", opacity: fadeOut }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: "100%" }}>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 3, color: "#465FFF", opacity: labelOpacity, fontFamily: "Inter, sans-serif" }}>
          FLUJO DE APROBACIÓN MULTINIVEL
        </div>
        <Img src={staticFile("screenshots/16-csw-detalle.png")} style={{ width: "75%", borderRadius: 16, boxShadow: "0 25px 50px rgba(0,0,0,0.5)", opacity: imgOpacity, translate: `0px ${imgY}px`, maxHeight: 550 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
          {STEPS.map((step, i) => {
            const stepOpacity = interpolate(frame, [(8 + i * 0.5) * fps, (8.8 + i * 0.5) * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const stepY = interpolate(frame, [(8 + i * 0.5) * fps, (8.8 + i * 0.5) * fps], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ padding: "12px 20px", borderRadius: 12, fontSize: 17, fontWeight: 600, background: step.bg, color: step.color, border: `1px solid ${step.border}`, opacity: stepOpacity, translate: `0px ${stepY}px`, fontFamily: "Inter, sans-serif" }}>
                  {step.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span style={{ fontSize: 28, color: "#475569", opacity: stepOpacity }}>→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
