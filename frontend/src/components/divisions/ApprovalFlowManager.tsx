import { useState, useEffect } from "react";
import { Employee, employeesService } from "../../api/services/employees";
import InputField from "../form/input/InputField";

export interface ApprovalLevel {
  order: number;
  employeeId: string;
  employeeName: string;
  employeePosition?: string;
}

interface ApprovalFlowManagerProps {
  levels: ApprovalLevel[];
  onChange: (levels: ApprovalLevel[]) => void;
  disabled?: boolean;
}

const ApprovalFlowManager: React.FC<ApprovalFlowManagerProps> = ({
  levels,
  onChange,
  disabled = false,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar empleados
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const result = await employeesService.getAll();
      setEmployees(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar empleados por búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !levels.some((level) => level.employeeId === getEmployeeId(emp))
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees([]);
    }
  }, [searchTerm, employees, levels]);

  const getEmployeeId = (emp: any): string => {
    return emp._id || emp.id || "";
  };

  // Añadir empleado al flujo
  const addEmployee = (employee: Employee) => {
    const employeeId = getEmployeeId(employee);
    if (!employeeId) return;

    const newLevel: ApprovalLevel = {
      order: levels.length + 1,
      employeeId,
      employeeName: employee.name,
      employeePosition: employee.role?.name || "",
    };

    onChange([...levels, newLevel]);
    setSearchTerm("");
    setShowDropdown(false);
  };

  // Remover empleado del flujo
  const removeEmployee = (index: number) => {
    const newLevels = levels.filter((_, i) => i !== index);
    // Reordenar
    const reordered = newLevels.map((level, i) => ({
      ...level,
      order: i + 1,
    }));
    onChange(reordered);
  };

  // Mover arriba
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newLevels = [...levels];
    [newLevels[index - 1], newLevels[index]] = [
      newLevels[index],
      newLevels[index - 1],
    ];
    // Reordenar
    const reordered = newLevels.map((level, i) => ({
      ...level,
      order: i + 1,
    }));
    onChange(reordered);
  };

  // Mover abajo
  const moveDown = (index: number) => {
    if (index === levels.length - 1) return;
    const newLevels = [...levels];
    [newLevels[index], newLevels[index + 1]] = [
      newLevels[index + 1],
      newLevels[index],
    ];
    // Reordenar
    const reordered = newLevels.map((level, i) => ({
      ...level,
      order: i + 1,
    }));
    onChange(reordered);
  };

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        Flujo de Aprobación (Orden de Aprobación)
      </label>

      {/* Buscador de empleados */}
      <div className="relative mb-4">
        <InputField
          name="searchEmployee"
          type="text"
          placeholder="Buscar empleado por nombre..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          disabled={disabled || loading}
        />

        {/* Dropdown de resultados */}
        {showDropdown && filteredEmployees.length > 0 && (
          <div className="absolute left-0 right-0 z-50 mt-1 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 dark:bg-gray-900 dark:border-gray-700">
            {filteredEmployees.map((employee) => (
              <button
                key={getEmployeeId(employee)}
                type="button"
                onClick={() => addEmployee(employee)}
                className="flex items-center w-full px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {employee.name}
                  </div>
                  {employee.role && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {employee.role.name}
                    </div>
                  )}
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista de empleados en el flujo */}
      {levels.length === 0 ? (
        <div className="p-6 text-center text-gray-500 border border-gray-200 border-dashed rounded-lg dark:border-gray-700 dark:text-gray-400">
          No hay aprobadores configurados. Busca y añade empleados al flujo.
        </div>
      ) : (
        <div className="space-y-2">
          {levels.map((level, index) => (
            <div
              key={`${level.employeeId}-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg dark:bg-white/5 dark:border-gray-700"
            >
              {/* Orden */}
              <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white rounded-full bg-brand-600">
                {level.order}
              </div>

              {/* Info del empleado */}
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {level.employeeName}
                </div>
                {level.employeePosition && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {level.employeePosition}
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              {!disabled && (
                <div className="flex items-center gap-1">
                  {/* Mover arriba */}
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-white/10"
                    title="Mover arriba"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>

                  {/* Mover abajo */}
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === levels.length - 1}
                    className="p-1.5 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-white/10"
                    title="Mover abajo"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={() => removeEmployee(index)}
                    className="p-1.5 text-red-600 rounded hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    title="Eliminar"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Define el orden de aprobación para las solicitudes CSW de esta división.
        Cada nivel debe aprobar antes de pasar al siguiente.
      </p>
    </div>
  );
};

export default ApprovalFlowManager;
