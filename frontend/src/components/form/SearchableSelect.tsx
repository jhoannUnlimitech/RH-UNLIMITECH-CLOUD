import { useState, useEffect, useRef } from "react";
import Label from "./Label";

interface SearchableSelectProps {
  id: string;
  label?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  debounceMs?: number;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = "Buscar...",
  error,
  disabled = false,
  required = false,
  debounceMs = 500,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar opciones basado en la búsqueda con debounce
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Obtener el label de la opción seleccionada
  const selectedLabel = options.find((opt) => opt.value === value)?.label || "";

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
      )}

      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs text-left focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-700"
              : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800" : "bg-transparent"}`}
        >
          <span className={selectedLabel ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}>
            {selectedLabel || placeholder}
          </span>
        </button>

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-700 max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              autoFocus
            />
          </div>

          {/* Options list */}
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    option.value === value
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default SearchableSelect;
