import BadgeIcon, { BadgeShape } from "./BadgeIcon";

/**
 * BadgeShapePicker — Selector visual de forma para insignias.
 *
 * Grid compacto de formas (mismo estilo que el IconPicker).
 * La seleccionada se resalta con fondo brand.
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
      <div className="grid grid-cols-9 gap-2">
        {SHAPES.map(({ value: shape, label }) => {
          const isSelected = value === shape;
          return (
            <button
              key={shape}
              type="button"
              onClick={() => onChange(shape)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                isSelected
                  ? "bg-brand-500/10 ring-2 ring-brand-500 dark:ring-brand-400"
                  : "bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
              }`}
              data-test-key={`shape-${shape}`}
              title={label}
            >
              <BadgeIcon
                shape={shape}
                icon="star"
                color={isSelected ? color : "#9CA3AF"}
                earned={isSelected}
                size={28}
              />
            </button>
          );
        })}
      </div>

      {/* Selected display */}
      {value && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Forma:</span>
          <BadgeIcon shape={value} icon="star" color={color} earned={true} size={20} />
          <span className="font-mono text-gray-700 dark:text-gray-200">
            {SHAPES.find(s => s.value === value)?.label}
          </span>
        </div>
      )}
    </div>
  );
};

export default BadgeShapePicker;
