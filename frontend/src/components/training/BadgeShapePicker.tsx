import BadgeIcon, { BadgeShape } from "./BadgeIcon";

/**
 * BadgeShapePicker — Selector visual de forma para insignias.
 *
 * Muestra las 9 formas disponibles en un grid. El usuario hace click
 * en la forma deseada. La seleccionada se resalta con borde.
 */

interface BadgeShapePickerProps {
  value: BadgeShape;
  onChange: (shape: BadgeShape) => void;
  color?: string;
  "data-test-context"?: string;
}

const SHAPES: { value: BadgeShape; label: string }[] = [
  { value: "circle", label: "Círculo" },
  { value: "shield", label: "Escudo" },
  { value: "hexagon", label: "Hexágono" },
  { value: "star", label: "Estrella" },
  { value: "diamond", label: "Diamante" },
  { value: "pentagon", label: "Pentágono" },
  { value: "octagon", label: "Octágono" },
  { value: "badge", label: "Badge" },
  { value: "medal", label: "Medalla" },
];

const BadgeShapePicker: React.FC<BadgeShapePickerProps> = ({
  value,
  onChange,
  color = "#3B82F6",
  ...props
}) => {
  return (
    <div data-test-context={props["data-test-context"] || "badge-shape-picker"}>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Forma de la insignia
      </label>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-9">
        {SHAPES.map(({ value: shape, label }) => (
          <button
            key={shape}
            type="button"
            onClick={() => onChange(shape)}
            className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all ${
              value === shape
                ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/10"
                : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
            }`}
            data-test-key={`shape-${shape}`}
            title={label}
          >
            <BadgeIcon
              shape={shape}
              icon="star"
              color={value === shape ? color : "#9CA3AF"}
              earned={value === shape}
              size="sm"
            />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BadgeShapePicker;
