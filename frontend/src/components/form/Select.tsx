import { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  error?: boolean;
  loading?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
  disabled = false,
  error = false,
  loading = false,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const currentValue = value !== undefined ? value : selectedValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setSelectedValue(newValue);
    }
    onChange(newValue);
  };

  return (
    <div className="relative">
      <select
        className={`h-11 w-full appearance-none rounded-lg border ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
            : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
        } bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
          currentValue
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-400"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled || loading}
      >
        <option
          value=""
          disabled
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {loading ? "Cargando..." : placeholder}
        </option>
        {options.map((option, index) => (
          <option
            key={`${option.value}-${index}`}
            value={option.value}
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {option.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute text-gray-700 dark:text-gray-400 right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.79175 8.02075L10.0001 13.2291L15.2084 8.02075"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default Select;
