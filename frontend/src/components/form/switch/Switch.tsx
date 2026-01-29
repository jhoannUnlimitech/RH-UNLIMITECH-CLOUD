import { useEffect, useState } from "react";

interface SwitchProps {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  color?: "blue" | "gray";
}

const Switch: React.FC<SwitchProps> = ({
  label,
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  color = "blue",
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  // Sincronizar con el prop checked cuando cambia (componente controlado)
  useEffect(() => {
    if (checked !== undefined) {
      setInternalChecked(checked);
    }
  }, [checked]);

  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (disabled) return;
    
    const newCheckedState = e.target.checked;
    
    // Solo actualiza el estado interno si no es controlado
    if (checked === undefined) {
      setInternalChecked(newCheckedState);
    }
    
    if (onChange) {
      onChange(newCheckedState);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const switchColors =
    color === "blue"
      ? {
          background: isChecked
            ? "bg-brand-500"
            : "bg-gray-200 dark:bg-white/10",
          knob: isChecked
            ? "translate-x-full bg-white"
            : "translate-x-0 bg-white",
        }
      : {
          background: isChecked
            ? "bg-gray-800 dark:bg-white/10"
            : "bg-gray-200 dark:bg-white/10",
          knob: isChecked
            ? "translate-x-full bg-white"
            : "translate-x-0 bg-white",
        };

  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-2 text-xs font-medium ${
        disabled ? "text-gray-400 cursor-not-allowed" : "text-gray-700 dark:text-gray-400"
      }`}
      onClick={handleClick}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={`block transition duration-150 ease-linear h-5 w-9 rounded-full ${
            disabled
              ? "bg-gray-100 pointer-events-none dark:bg-gray-800"
              : switchColors.background
          }`}
        ></div>
        <div
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full shadow-theme-sm duration-150 ease-linear transform ${switchColors.knob}`}
        ></div>
      </div>
      {label}
    </label>
  );
};

export default Switch;
