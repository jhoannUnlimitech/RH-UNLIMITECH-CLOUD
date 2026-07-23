import { useState, useMemo } from "react";
import {
  Award, Trophy, Medal, Crown, Star, Gem, Target,
  Flame, Rocket, Zap, TrendingUp, Timer,
  BookOpen, GraduationCap, Brain, Lightbulb, Puzzle, Code, FileText,
  Shield, ShieldCheck, Lock, Key,
  Sprout, TreePine, Sun, Mountain,
  Users, Heart, ThumbsUp, MessageCircle,
  Wrench, Settings, Compass, Flag,
  type LucideIcon,
} from "lucide-react";

/**
 * BadgeIconPicker — Selector de ícono Lucide para insignias.
 *
 * Muestra un grid de íconos Lucide reales con barra de búsqueda.
 */

interface BadgeIconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  "data-test-context"?: string;
}

/** Mapa de nombre → componente Lucide */
const ICON_MAP: Record<string, LucideIcon> = {
  award: Award, trophy: Trophy, medal: Medal, crown: Crown,
  star: Star, gem: Gem, target: Target,
  flame: Flame, rocket: Rocket, zap: Zap,
  "trending-up": TrendingUp, timer: Timer,
  "book-open": BookOpen, "graduation-cap": GraduationCap,
  brain: Brain, lightbulb: Lightbulb, puzzle: Puzzle, code: Code,
  "file-text": FileText,
  shield: Shield, "shield-check": ShieldCheck, lock: Lock, key: Key,
  sprout: Sprout, "tree-pine": TreePine, sun: Sun, mountain: Mountain,
  users: Users, heart: Heart, "thumbs-up": ThumbsUp,
  "message-circle": MessageCircle,
  wrench: Wrench, settings: Settings, compass: Compass, flag: Flag,
};

const AVAILABLE_ICONS: { name: string; tags: string[] }[] = [
  { name: "award", tags: ["premio", "logro", "medal"] },
  { name: "trophy", tags: ["trofeo", "ganador", "campeón"] },
  { name: "medal", tags: ["medalla", "honor"] },
  { name: "crown", tags: ["corona", "rey", "líder"] },
  { name: "star", tags: ["estrella", "favorito", "destacado"] },
  { name: "gem", tags: ["gema", "diamante", "valioso"] },
  { name: "target", tags: ["objetivo", "meta", "precisión"] },
  { name: "flame", tags: ["fuego", "energía", "racha"] },
  { name: "rocket", tags: ["cohete", "lanzamiento", "velocidad"] },
  { name: "zap", tags: ["rayo", "energía", "rápido"] },
  { name: "trending-up", tags: ["crecimiento", "progreso", "subir"] },
  { name: "timer", tags: ["tiempo", "velocidad", "rápido"] },
  { name: "book-open", tags: ["libro", "lectura", "estudio"] },
  { name: "graduation-cap", tags: ["graduación", "educación", "título"] },
  { name: "brain", tags: ["cerebro", "inteligencia", "conocimiento"] },
  { name: "lightbulb", tags: ["idea", "innovación", "creatividad"] },
  { name: "puzzle", tags: ["puzzle", "solución", "lógica"] },
  { name: "code", tags: ["código", "programación", "desarrollo"] },
  { name: "file-text", tags: ["documento", "texto", "archivo"] },
  { name: "shield", tags: ["escudo", "protección", "seguridad"] },
  { name: "shield-check", tags: ["verificado", "seguro", "aprobado"] },
  { name: "lock", tags: ["candado", "seguridad", "privado"] },
  { name: "key", tags: ["llave", "acceso", "autorización"] },
  { name: "sprout", tags: ["brote", "inicio", "crecimiento"] },
  { name: "tree-pine", tags: ["árbol", "naturaleza", "estabilidad"] },
  { name: "sun", tags: ["sol", "brillo", "energía"] },
  { name: "mountain", tags: ["montaña", "cima", "reto"] },
  { name: "users", tags: ["equipo", "personas", "grupo"] },
  { name: "heart", tags: ["corazón", "amor", "pasión"] },
  { name: "thumbs-up", tags: ["aprobado", "bien", "ok"] },
  { name: "message-circle", tags: ["mensaje", "comunicación", "chat"] },
  { name: "wrench", tags: ["herramienta", "configuración", "reparar"] },
  { name: "settings", tags: ["configuración", "ajustes", "engranaje"] },
  { name: "compass", tags: ["brújula", "dirección", "navegación"] },
  { name: "flag", tags: ["bandera", "meta", "hito"] },
];

const BadgeIconPicker: React.FC<BadgeIconPickerProps> = ({
  value,
  onChange,
  ...props
}) => {
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return AVAILABLE_ICONS;
    const term = search.toLowerCase();
    return AVAILABLE_ICONS.filter(
      (icon) =>
        icon.name.includes(term) ||
        icon.tags.some((tag) => tag.includes(term))
    );
  }, [search]);

  return (
    <div data-test-context={props["data-test-context"] || "badge-icon-picker"}>
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar ícono..."
        className="mb-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        data-test-key="icon-search"
      />

      {/* Grid de íconos */}
      <div
        className="grid max-h-48 grid-cols-6 gap-2 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-8"
        data-test-key="icon-grid"
      >
        {filteredIcons.map((icon) => {
          const IconComponent = ICON_MAP[icon.name];
          const isSelected = value === icon.name;
          return (
            <button
              key={icon.name}
              type="button"
              onClick={() => onChange(icon.name)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                isSelected
                  ? "bg-brand-500 text-white ring-2 ring-brand-300 dark:ring-brand-700"
                  : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              }`}
              title={icon.name}
              data-test-key={`icon-${icon.name}`}
            >
              {IconComponent ? <IconComponent size={20} /> : <span className="text-xs">{icon.name}</span>}
            </button>
          );
        })}

        {filteredIcons.length === 0 && (
          <p className="col-span-full py-4 text-center text-sm text-gray-400">
            No se encontraron íconos
          </p>
        )}
      </div>

      {/* Selected display */}
      {value && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Seleccionado:</span>
          {ICON_MAP[value] && (() => { const I = ICON_MAP[value]; return <I size={16} className="text-brand-500" />; })()}
          <span className="font-mono text-gray-700 dark:text-gray-200">{value}</span>
        </div>
      )}
    </div>
  );
};

export default BadgeIconPicker;
