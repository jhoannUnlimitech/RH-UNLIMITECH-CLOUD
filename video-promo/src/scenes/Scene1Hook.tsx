import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pregunta aparece primero (0-6s)
  const questionOpacity = interpolate(frame, [0.3 * fps, 1.2 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const questionY = interpolate(frame, [0.3 * fps, 1.2 * fps], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  // Pregunta se desvanece para dar paso a la respuesta
  const questionFade = interpolate(frame, [5.5 * fps, 6.5 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Stat aparece después (6.5s)
  const statOpacity = interpolate(frame, [6.5 * fps, 7.5 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const statY = interpolate(frame, [6.5 * fps, 7.5 * fps], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

  const subOpacity = interpolate(frame, [7.5 * fps, 8.5 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(frame, [7.5 * fps, 8.5 * fps], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const ctaOpacity = interpolate(frame, [10.5 * fps, 11.5 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaScale = interpolate(frame, [10.5 * fps, 11.2 * fps], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.34, 1.56, 0.64, 1) });

  // Fade out at end
  const fadeOut = interpolate(frame, [13.5 * fps, 15 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
      {/* Pregunta inicial */}
      <div style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", opacity: questionOpacity * questionFade, translate: `0px ${questionY}px` }}>
        <div style={{ fontSize: 52, fontWeight: 600, color: "#F8FAFC", textAlign: "center" as const, maxWidth: 1100, lineHeight: 1.3, fontFamily: "Inter, sans-serif" }}>
          ¿Cuántas horas pierde tu equipo de recursos humanos procesando solicitudes en papel, correos y hojas de cálculo?
        </div>
      </div>

      {/* Respuesta con stat */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, opacity: statOpacity }}>
        <div style={{ fontSize: 130, fontWeight: 800, color: "#465FFF", letterSpacing: -3, translate: `0px ${statY}px`, fontFamily: "Inter, sans-serif" }}>
          20+ horas/mes
        </div>
        <div style={{ fontSize: 38, fontWeight: 400, color: "#94A3B8", textAlign: "center" as const, maxWidth: 800, opacity: subOpacity, translate: `0px ${subY}px`, fontFamily: "Inter, sans-serif" }}>
          perdidas en trámites manuales de RRHH
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: "#F8FAFC", marginTop: 20, opacity: ctaOpacity, scale: String(ctaScale), fontFamily: "Inter, sans-serif" }}>
          Hay una mejor forma.
        </div>
      </div>
    </AbsoluteFill>
  );
};
