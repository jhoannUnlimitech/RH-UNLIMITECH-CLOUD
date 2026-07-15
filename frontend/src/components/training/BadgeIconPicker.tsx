import { useState, useMemo } from "react";

/**
 * BadgeIconPicker — Selector de ícono Lucide para insignias.
 *
 * Muestra un grid de íconos Lucide con barra de búsqueda.
 * El usuario busca y selecciona el ícono deseado.
 * Usa emojis como fallback visual (hasta que lucide-react esté instalado).
 */

interface BadgeIconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  "data-test-context"?: string;
}

/** Íconos disponibles para insignias (subset curado de Lucide) */
const AVAILABLE_ICONS: { name: string; emoji: string; tags: string[] }[] = [
  // Logros y premios
  { name: "award", emoji: "🏅", tags: ["premio", "logro", "medal"] },
  { name: "trophy", emoji: "🏆", tags: ["trofeo", "ganador", "campeón"] },
  { name: "medal", emoji: "🎖️", tags: ["medalla", "honor"] },
  { name: "crown", emoji: "👑", tags: ["corona", "rey", "líder"] },
  { name: "star", emoji: "⭐", tags: ["estrella", "favorito", "destacado"] },
  { name: "gem", emoji: "💎", tags: ["gema", "diamante", "valioso"] },
  { name: "target", emoji: "🎯", tags: ["objetivo", "meta", "precisión"] },

  // Progreso y energía
  { name: "flame", emoji: "🔥", tags: ["fuego", "energía", "racha"] },
  { name: "rocket", emoji: "🚀", tags: ["cohete", "lanzamiento", "velocidad"] },
  { name: "zap", emoji: "⚡", tags: ["rayo", "energía", "rápido"] },
  { name: "trending-up", emoji: "📈", tags: ["crecimiento", "progreso", "subir"] },
  { name: "timer", emoji: "⏱️", tags: ["tiempo", "velocidad", "rápido"] },

  // Conocimiento y educación
  { name: "book-open", emoji: "📖", tags: ["libro", "lectura", "estudio"] },
  { name: "graduation-cap", emoji: "🎓", tags: ["graduación", "educación", "título"] },
  { name: "brain", emoji: "🧠", tags: ["cerebro", "inteligencia", "conocimiento"] },
  { name: "lightbulb", emoji: "💡", tags: ["idea", "innovación", "creatividad"] },
  { name: "puzzle", emoji: "🧩", tags: ["puzzle", "solución", "lógica"] },
  { name: "code", emoji: "💻", tags: ["código", "programación", "desarrollo"] },
  { name: "file-text", emoji: "📄", tags: ["documento", "texto", "archivo"] },

  // Seguridad y protección
  { name: "shield", emoji: "🛡️", tags: ["escudo", "protección", "seguridad"] },
  { name: "shield-check", emoji: "✅", tags: ["verificado", "seguro", "aprobado"] },
  { name: "lock", emoji: "🔒", tags: ["candado", "seguridad", "privado"] },
  { name: "key", emoji: "🔑", tags: ["llave", "acceso", "autorización"] },

  // Naturaleza y crecimiento
  { name: "sprout", emoji: "🌱", tags: ["brote", "inicio", "crecimiento"] },
  { name: "tree", emoji: "🌳", tags: ["árbol", "naturaleza", "estabilidad"] },
  { name: "sun", emoji: "☀️", tags: ["sol", "brillo", "energía"] },
  { name: "mountain", emoji: "⛰️", tags: ["montaña", "cima", "reto"] },

  // Comunicación y equipo
  { name: "users", emoji: "👥", tags: ["equipo", "personas", "grupo"] },
  { name: "heart", emoji: "❤️", tags: ["corazón", "amor", "pasión"] },
  { name: "thumbs-up", emoji: "👍", tags: ["aprobado", "bien", "ok"] },
  { name: "message-circle", emoji: "💬", tags: ["mensaje", "comunicación", "chat"] },

  // Herramientas
  { name: "wrench", emoji: "🔧", tags: ["herramienta", "configuración", "reparar"] },
  { name: "settings", emoji: "⚙️", tags: ["configuración", "ajustes", "engranaje"] },
  { name: "compass", emoji: "🧭", tags: ["brújula", "dirección", "navegación"] },
  { name: "flag", emoji: "🚩", tags: ["bandera", "meta", "hito"] },
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
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Ícono de la insignia
      </label>

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
        className="grid max-h-48 grid-cols-6 gap-2 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-8 md:grid-cols-10"
        data-test-key="icon-grid"
      >
        {filteredIcons.map((icon) => (
          <button
            key={icon.name}
            type="button"
            onClick={() => onChange(icon.name)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${
              value === icon.name
                ? "bg-brand-500 text-white ring-2 ring-brand-300"
                : "bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
            title={icon.name}
            data-test-key={`icon-${icon.name}`}
          >
            {icon.emoji}
          </button>
        ))}

        {filteredIcons.length === 0 && (
          <p className="col-span-full py-4 text-center text-sm text-gray-400">
            No se encontraron íconos
          </p>
        )}
      </div>

      {/* Selected icon display */}
      {value && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Seleccionado:</span>
          <span className="font-mono text-gray-700 dark:text-gray-200">{value}</span>
          <span>{AVAILABLE_ICONS.find((i) => i.name === value)?.emoji || "🏅"}</span>
        </div>
      )}
    </div>
  );
};

export default BadgeIconPicker;
