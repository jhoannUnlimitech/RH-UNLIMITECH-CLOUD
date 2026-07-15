import { useMemo } from "react";

/**
 * BadgeIcon — Renderiza una insignia con forma SVG + ícono Lucide + color.
 *
 * Props:
 * - shape: forma del contorno SVG (9 opciones)
 * - icon: nombre del ícono Lucide (se renderiza como texto por ahora, lucide-react se instala desde WSL)
 * - color: hex del color cuando está obtenida
 * - earned: true = color, false = gris
 * - progress: 0-100 (barra circular si está en progreso)
 * - size: sm | md | lg | xl
 */

export type BadgeShape =
  | "circle" | "shield" | "hexagon" | "star" | "diamond"
  | "pentagon" | "octagon" | "badge" | "medal";

interface BadgeIconProps {
  shape: BadgeShape;
  icon: string;
  color: string;
  earned?: boolean;
  progress?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  "data-test-key"?: string;
}

const SIZES = {
  sm: { container: 32, icon: 14, stroke: 2 },
  md: { container: 48, icon: 20, stroke: 2.5 },
  lg: { container: 64, icon: 28, stroke: 3 },
  xl: { container: 96, icon: 40, stroke: 3.5 },
};

/**
 * SVG path definitions for each badge shape.
 * All paths are normalized to a 100x100 viewBox.
 */
const SHAPE_PATHS: Record<BadgeShape, string> = {
  circle: "M50,5 A45,45 0 1,1 49.99,5 Z",
  shield: "M50,5 L90,25 L90,55 Q90,80 50,95 Q10,80 10,55 L10,25 Z",
  hexagon: "M50,3 L93,28 L93,72 L50,97 L7,72 L7,28 Z",
  star: "M50,5 L61,38 L97,38 L68,60 L79,93 L50,73 L21,93 L32,60 L3,38 L39,38 Z",
  diamond: "M50,5 L95,50 L50,95 L5,50 Z",
  pentagon: "M50,5 L95,38 L80,90 L20,90 L5,38 Z",
  octagon: "M33,5 L67,5 L95,33 L95,67 L67,95 L33,95 L5,67 L5,33 Z",
  badge: "M50,3 L60,15 L80,10 L78,32 L95,45 L82,60 L88,82 L68,82 L55,97 L45,97 L32,82 L12,82 L18,60 L5,45 L22,32 L20,10 L40,15 Z",
  medal: "M35,5 L25,30 L50,30 L50,30 L75,30 L65,5 L85,5 L85,30 Q85,35 80,38 L80,38 A40,40 0 1,1 20,38 L20,38 Q15,35 15,30 L15,5 Z",
};

const BadgeIcon: React.FC<BadgeIconProps> = ({
  shape,
  icon,
  color,
  earned = false,
  progress = 0,
  size = "md",
  className = "",
  ...props
}) => {
  const dims = SIZES[size];
  const fillColor = earned ? color : "#9CA3AF";
  const opacity = earned ? 1 : 0.4;
  const bgOpacity = earned ? 0.15 : 0.08;

  // Progress ring (circular) for in-progress state
  const showProgress = !earned && progress > 0 && progress < 100;
  const circumference = 2 * Math.PI * 42; // radius 42
  const strokeDashoffset = useMemo(
    () => circumference - (progress / 100) * circumference,
    [progress, circumference]
  );

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: dims.container, height: dims.container }}
      data-test-key={props["data-test-key"] || "badge-icon"}
    >
      {/* Shape SVG */}
      <svg
        viewBox="0 0 100 100"
        width={dims.container}
        height={dims.container}
        className="absolute inset-0"
      >
        {/* Background fill */}
        <path
          d={SHAPE_PATHS[shape]}
          fill={fillColor}
          fillOpacity={bgOpacity}
          stroke={fillColor}
          strokeWidth={dims.stroke}
          opacity={opacity}
        />
      </svg>

      {/* Progress ring (if in progress) */}
      {showProgress && (
        <svg
          viewBox="0 0 100 100"
          width={dims.container}
          height={dims.container}
          className="absolute inset-0 -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="3"
          />
          {/* Progress arc */}
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
      )}

      {/* Icon placeholder (text-based until lucide-react is installed via WSL) */}
      <span
        className="relative z-10 font-medium select-none"
        style={{
          fontSize: dims.icon * 0.6,
          color: earned ? color : "#6B7280",
          opacity: earned ? 1 : 0.6,
        }}
        title={icon}
      >
        {getIconEmoji(icon)}
      </span>

      {/* Progress text */}
      {showProgress && (
        <span
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white px-1 text-[8px] font-bold dark:bg-gray-900"
          style={{ color }}
        >
          {progress}%
        </span>
      )}
    </div>
  );
};

/**
 * Mapea nombres de íconos Lucide a emojis como fallback.
 * Cuando lucide-react esté instalado, reemplazar con el componente real.
 */
function getIconEmoji(iconName: string): string {
  const map: Record<string, string> = {
    award: "🏅",
    trophy: "🏆",
    star: "⭐",
    crown: "👑",
    flame: "🔥",
    rocket: "🚀",
    shield: "🛡️",
    "shield-check": "✅",
    zap: "⚡",
    heart: "❤️",
    target: "🎯",
    gem: "💎",
    medal: "🎖️",
    sprout: "🌱",
    book: "📚",
    graduation: "🎓",
    "graduation-cap": "🎓",
    lightbulb: "💡",
    brain: "🧠",
    puzzle: "🧩",
  };
  return map[iconName] || "🏅";
}

export default BadgeIcon;
