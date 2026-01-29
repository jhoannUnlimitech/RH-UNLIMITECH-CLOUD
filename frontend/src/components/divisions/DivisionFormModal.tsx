import { observer } from "mobx-react-lite";
import { useEffect, useState, useMemo } from "react";
import { divisionsStore } from "../../stores/views";
import InputField from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal";
import { IDivisionsStore } from "../../stores/views/DivisionsStore.contract";
import { employeesService, Employee } from "../../api/services/employees";
import ApprovalFlowManager, {
  ApprovalLevel,
} from "./ApprovalFlowManager";

interface DivisionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  divisionId?: string;
}

const DivisionFormModal = observer(
  ({ isOpen, onClose, divisionId }: DivisionFormModalProps) => {
    const isEdit = Boolean(divisionId);

    const [formData, setFormData] = useState<IDivisionsStore.DivisionInput>({
      name: "",
      code: "",
      description: "",
      managerId: "",
      status: "active",
      approvalFlow: [],
    });

    const [errors, setErrors] = useState<{
      name?: string;
      code?: string;
      managerId?: string;
    }>({});

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
      if (!isOpen) {
        setFormData({
          name: "",
          code: "",
          description: "",
          managerId: "",
          status: "active",
          approvalFlow: [],
        });
        setErrors({});
        divisionsStore.setSelectedDivision(null);
      }
    }, [isOpen]);

    // Load employees for selector
    useEffect(() => {
      if (isOpen) {
        loadEmployees();
      }
    }, [isOpen]);

    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const data = await employeesService.getAll();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar empleados:", error);
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };

    // Memoizar las opciones del select para evitar re-cálculos
    const employeeOptions = useMemo(() => {
      if (!Array.isArray(employees) || employees.length === 0) return [];
      
      const idField = employees[0]._id ? '_id' : (employees[0].id ? 'id' : null);
      
      if (!idField) {
        return [];
      }
      
      return employees.map((emp: any) => ({
        value: emp[idField]?.toString() || emp[idField],
        label: `${emp.name}${emp.role ? ` (${emp.role.name})` : ""}`,
      }));
    }, [employees]);

    // Load division data for edit mode
    useEffect(() => {
      if (isOpen && isEdit && divisionId) {
        divisionsStore.fetchDivisionById(divisionId);
      }
    }, [isOpen, isEdit, divisionId]);

    // Populate form with selected division data
    useEffect(() => {
      if (isEdit && divisionsStore.selectedDivision && employees.length > 0) {
        const division = divisionsStore.selectedDivision;
        
        // Extraer managerId - priorizar el ID del campo manager si existe
        let managerIdValue = '';
        
        // 1. Si hay manager poblado, usar su _id
        if (division.manager?._id) {
          managerIdValue = division.manager._id.toString();
        } 
        // 2. Si managerId es string válido
        else if (typeof division.managerId === 'string' && division.managerId.length === 24) {
          managerIdValue = division.managerId;
        }
        // 3. Si managerId es objeto con _id
        else if (typeof division.managerId === 'object' && (division.managerId as any)?._id) {
          managerIdValue = (division.managerId as any)._id.toString();
        }
        
        // Convertir approvalFlow asegurando que employeeIds sean strings
        const approvalFlowConverted = (division.approvalFlow || []).map(level => ({
          ...level,
          employeeId: typeof level.employeeId === 'string' 
            ? level.employeeId 
            : (level.employeeId as any)?._id?.toString() || (level.employeeId as any)?.toString() || level.employeeId
        }));
        
        setFormData({
          name: division.name || "",
          code: division.code || "",
          description: division.description || "",
          managerId: managerIdValue,
          status: division.status || "active",
          approvalFlow: approvalFlowConverted,
        });
      }
    }, [isEdit, divisionsStore.selectedDivision, employees, employeeOptions]);

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name as keyof typeof errors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    };

    const handleSelectChange = (name: string, value: string) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name as keyof typeof errors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    };

    const validate = (): boolean => {
      const newErrors: typeof errors = {};

      if (!formData.name.trim()) {
        newErrors.name = "El nombre es requerido";
      }

      if (!formData.code.trim()) {
        newErrors.code = "El código es requerido";
      } else if (formData.code.length < 1) {
        newErrors.code = "El código debe tener al menos 1 caracter";
      }

      if (!formData.managerId || !formData.managerId.trim()) {
        newErrors.managerId = "Debe seleccionar un representante";
      } else if (formData.managerId.length !== 24) {
        // MongoDB ObjectId tiene 24 caracteres hexadecimales
        newErrors.managerId = "El ID del representante no es válido";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) {
        return;
      }

      setIsSubmitting(true);
      try {
        if (isEdit && divisionId) {
          await divisionsStore.updateDivision(divisionId, formData);
        } else {
          await divisionsStore.createDivision(formData);
        }
        onClose();
        await divisionsStore.fetchDivisions();
      } catch (error: any) {
        console.error("Error al guardar división:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="relative w-full max-w-[640px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-10 dark:bg-gray-900"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <h4 className="text-title-sm mb-1 font-semibold text-gray-800 dark:text-white/90">
            {isEdit ? "Editar División" : "Nueva División"}
          </h4>
          <p className="mb-6 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {isEdit
              ? "Actualiza la información de la división"
              : "Completa los datos para crear una nueva división"}
          </p>

          {/* Error Display */}
          {divisionsStore.error && (
            <div className="mb-6">
              <Alert
                variant="error"
                title="Error"
                message={divisionsStore.error}
                onClose={() => divisionsStore.clearError()}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <InputField
                id="name"
                name="name"
                type="text"
                placeholder="Ej: Tecnología"
                value={formData.name}
                onChange={handleChange}
                error={Boolean(errors.name)}
                hint={errors.name}
                disabled={isSubmitting}
              />
            </div>

            {/* Code Field */}
            <div>
              <Label htmlFor="code">
                Código <span className="text-red-500">*</span>
              </Label>
              <InputField
                id="code"
                name="code"
                type="text"
                placeholder="Ej: TEC"
                value={formData.code}
                onChange={handleChange}
                error={Boolean(errors.code)}
                hint={errors.code}
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Mínimo 1 caracter. Se convertirá a mayúsculas automáticamente.
              </p>
            </div>

            {/* Manager/Representative Field */}
            <div>
              <Label htmlFor="managerId">
                Representante <span className="text-red-500">*</span>
              </Label>
              {loadingEmployees ? (
                <div className="h-11 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              ) : (
                <Select
                  options={employeeOptions}
                  placeholder="Selecciona un representante"
                  value={formData.managerId}
                  onChange={(value) => handleSelectChange("managerId", value)}
                  error={Boolean(errors.managerId)}
                  disabled={isSubmitting}
                />
              )}
              {errors.managerId && (
                <p className="mt-1 text-xs text-red-500">{errors.managerId}</p>
              )}
            </div>

            {/* Status Field */}
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                options={[
                  { value: "active", label: "Activo" },
                  { value: "inactive", label: "Inactivo" },
                ]}
                placeholder="Selecciona el estado"
                value={formData.status}
                onChange={(value) => handleSelectChange("status", value as "active" | "inactive")}
                disabled={isSubmitting}
              />
            </div>

            {/* Description Field */}
            <div>
              <Label htmlFor="description">Descripción</Label>
              <TextArea
                id="description"
                name="description"
                placeholder="Descripción de la división (opcional)"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Approval Flow Manager */}
            <div>
              <ApprovalFlowManager
                levels={formData.approvalFlow || []}
                onChange={(levels) =>
                  setFormData((prev) => ({ ...prev, approvalFlow: levels }))
                }
                disabled={isSubmitting}
              />
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex flex-col sm:flex-row w-full items-center justify-between gap-3">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : isEdit ? (
                  "Actualizar"
                ) : (
                  "Crear División"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    );
  }
);

export default DivisionFormModal;
