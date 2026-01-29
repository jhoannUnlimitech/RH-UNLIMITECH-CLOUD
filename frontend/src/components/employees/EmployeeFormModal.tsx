import { observer } from "mobx-react-lite";
import { useEffect, useState, useMemo } from "react";
import { employeesStore } from "../../stores/views";
import InputField from "../form/input/InputField";
import SearchableSelect from "../form/SearchableSelect";
import DatePicker from "../form/date-picker";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert";
import { Modal } from "../ui/modal";
import { IEmployeesStore } from "../../stores/views/EmployeesStore.contract";
import { divisionsService } from "../../api/services/divisions";
import { rolesService, Role } from "../../api/services/roles";
import { employeesService, Employee } from "../../api/services/employees";
import { IDivisionsStore } from "../../stores/views/DivisionsStore.contract";
import { countries } from "../../utils/countries";
import { isValidEmail, generatePassword, getPasswordStrength } from "../../utils/validation";

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string;
  onSuccess?: () => void;
}

const EmployeeFormModal = observer(
  ({ isOpen, onClose, employeeId, onSuccess }: EmployeeFormModalProps) => {
    const isEdit = Boolean(employeeId);

    const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
      phone: "",
      photo: "",
      role: "",
      division: "",
      birthDate: "",
      nationalId: "",
      nationality: "",
      managerId: "",
      techLeadId: "",
      forcePasswordChange: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [divisions, setDivisions] = useState<IDivisionsStore.Division[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong">("weak");
    const [showPassword, setShowPassword] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
      if (!isOpen) {
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          photo: "",
          role: "",
          division: "",
          birthDate: "",
          nationalId: "",
          nationality: "",
          managerId: "",
          techLeadId: "",
          forcePasswordChange: true,
        });
        setErrors({});
        setPasswordStrength("weak");
        setShowPassword(false);
        employeesStore.setSelectedEmployee(null);
      }
    }, [isOpen]);

    // Load divisions, roles and employees for selectors
    useEffect(() => {
      if (isOpen) {
        loadData();
      }
    }, [isOpen]);

    const loadData = async () => {
      setLoadingData(true);
      try {
        const [divisionsData, rolesData, employeesData] = await Promise.all([
          divisionsService.getAll(),
          rolesService.getAll(),
          employeesService.getAll({ limit: 1000 }),
        ]);
        
        setDivisions(Array.isArray(divisionsData) ? divisionsData : []);
        setRoles(Array.isArray(rolesData) ? rolesData : []);
        
        const employeesList = employeesData.data || employeesData;
        setEmployees(Array.isArray(employeesList) ? employeesList : []);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoadingData(false);
      }
    };

    // Generate select options
    const divisionOptions = useMemo(() => {
      return divisions.map((div) => ({
        value: div._id,
        label: `${div.name} (${div.code})`,
      }));
    }, [divisions]);

    const roleOptions = useMemo(() => {
      return roles.map((role) => ({
        value: role._id,
        label: role.name,
      }));
    }, [roles]);

    const employeeOptions = useMemo(() => {
      const filteredEmployees = isEdit && employeeId
        ? employees.filter((emp) => emp._id !== employeeId)
        : employees;
      
      return filteredEmployees.map((emp) => ({
        value: emp._id,
        label: `${emp.name}${emp.role?.name ? ` (${emp.role.name})` : ""}`,
      }));
    }, [employees, isEdit, employeeId]);

    // Load employee data for edit mode
    useEffect(() => {
      if (isOpen && isEdit && employeeId) {
        employeesStore.fetchEmployeeById(employeeId);
      }
    }, [isOpen, isEdit, employeeId]);

    // Populate form with selected employee data
    useEffect(() => {
      if (isEdit && employeesStore.selectedEmployee) {
        const employee = employeesStore.selectedEmployee;
        
        let birthDateFormatted = "";
        if (employee.birthDate) {
          const date = new Date(employee.birthDate);
          birthDateFormatted = date.toISOString().split('T')[0];
        }

        setFormData({
          name: employee.name || "",
          email: employee.email || "",
          password: "",
          phone: employee.phone || "",
          photo: employee.photo || "",
          role: employee.role?._id || "",
          division: employee.division?._id || "",
          birthDate: birthDateFormatted,
          nationalId: employee.nationalId || "",
          nationality: employee.nationality || "",
          managerId: employee.managerId || employee.manager?._id || "",
          techLeadId: employee.techLeadId || employee.techLead?._id || "",
          forcePasswordChange: employee.forcePasswordChange || false,
        });
      }
    }, [isEdit, employeesStore.selectedEmployee]);

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Validación en tiempo real de email
      if (name === "email") {
        if (value && !isValidEmail(value)) {
          setErrors((prev) => ({ ...prev, email: "El email no es válido" }));
        } else {
          setErrors((prev) => ({ ...prev, email: undefined }));
        }
      } else if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }

      // Evaluación de fortaleza de contraseña
      if (name === "password") {
        setPasswordStrength(getPasswordStrength(value));
      }
    };

    const handleSelectChange = (name: string, value: string) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: "La foto no debe superar 2MB" }));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, photo: "Debe seleccionar una imagen" }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData((prev) => ({ ...prev, photo: base64 }));
        setErrors((prev) => ({ ...prev, photo: undefined }));
      };
      reader.readAsDataURL(file);
    };

    const handleGeneratePassword = () => {
      const newPassword = generatePassword(12);
      setFormData((prev) => ({ ...prev, password: newPassword }));
      setPasswordStrength(getPasswordStrength(newPassword));
      setErrors((prev) => ({ ...prev, password: undefined }));
    };

    const handleDateChange = (selectedDates: Date[]) => {
      if (selectedDates.length > 0) {
        const date = selectedDates[0];
        const formattedDate = date.toISOString().split('T')[0];
        setFormData((prev) => ({ ...prev, birthDate: formattedDate }));
        setErrors((prev) => ({ ...prev, birthDate: undefined }));
      }
    };

    const validate = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!formData.name.trim()) {
        newErrors.name = "El nombre es requerido";
      } else if (formData.name.length < 3) {
        newErrors.name = "El nombre debe tener al menos 3 caracteres";
      }

      if (!formData.email.trim()) {
        newErrors.email = "El email es requerido";
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = "El email no es válido";
      }

      if (!isEdit && !formData.password.trim()) {
        newErrors.password = "La contraseña es requerida";
      } else if (!isEdit && formData.password.length < 6) {
        newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "El teléfono es requerido";
      }

      if (!formData.role) {
        newErrors.role = "Debe seleccionar un rol";
      }

      if (!formData.division) {
        newErrors.division = "Debe seleccionar una división";
      }

      if (!formData.birthDate) {
        newErrors.birthDate = "La fecha de nacimiento es requerida";
      } else {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          newErrors.birthDate = "El empleado debe ser mayor de 18 años";
        }
      }

      if (!formData.nationalId.trim()) {
        newErrors.nationalId = "La cédula es requerida";
      }

      if (!formData.nationality.trim()) {
        newErrors.nationality = "La nacionalidad es requerida";
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
        if (isEdit && employeeId) {
          const updateData: IEmployeesStore.EmployeeUpdateInput = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            photo: formData.photo || undefined,
            role: formData.role,
            division: formData.division,
            birthDate: formData.birthDate,
            nationalId: formData.nationalId,
            nationality: formData.nationality,
            managerId: formData.managerId || undefined,
            techLeadId: formData.techLeadId || undefined,
            forcePasswordChange: formData.forcePasswordChange,
          };

          if (formData.password) {
            updateData.password = formData.password;
          }

          await employeesStore.updateEmployee(employeeId, updateData);
        } else {
          const createData: IEmployeesStore.EmployeeInput = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            photo: formData.photo || undefined,
            role: formData.role,
            division: formData.division,
            birthDate: formData.birthDate,
            nationalId: formData.nationalId,
            nationality: formData.nationality,
            managerId: formData.managerId || undefined,
            techLeadId: formData.techLeadId || undefined,
            forcePasswordChange: formData.forcePasswordChange,
          };
          await employeesStore.createEmployee(createData);
        }
        
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } catch (error: any) {
        console.error("Error al guardar empleado:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const getPasswordStrengthColor = () => {
      switch (passwordStrength) {
        case "weak":
          return "bg-red-500";
        case "medium":
          return "bg-yellow-500";
        case "strong":
          return "bg-green-500";
      }
    };

    const getPasswordStrengthText = () => {
      switch (passwordStrength) {
        case "weak":
          return "Débil";
        case "medium":
          return "Media";
        case "strong":
          return "Fuerte";
      }
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="relative w-full max-w-[900px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-10 dark:bg-gray-900"
      >
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {isEdit ? "Editar Empleado" : "Nuevo Empleado"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isEdit
              ? "Actualiza la información del empleado"
              : "Completa los datos del nuevo empleado"}
          </p>
        </div>

        {employeesStore.error && (
          <Alert
            variant="error"
            title="Error"
            message={employeesStore.error}
            onClose={() => employeesStore.clearError()}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
            {/* Foto con preview circular */}
            <div>
              <Label htmlFor="photo">
                Foto de perfil
                <span className="ml-1 text-xs text-gray-500">(opcional, máx 2MB)</span>
              </Label>
              <div className="flex items-center gap-4 mt-2">
                {formData.photo ? (
                  <div className="relative w-20 h-20">
                    <img
                      src={formData.photo}
                      alt="Preview"
                      className="object-cover w-full h-full rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, photo: "" }))}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-20 h-20 text-gray-400 bg-gray-100 rounded-full dark:bg-gray-800 ring-2 ring-gray-200 dark:ring-gray-700">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="photo"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/20 dark:file:text-brand-400"
                  />
                  {errors.photo && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.photo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Nombre */}
              <div>
                <Label htmlFor="name">
                  Nombre completo <span className="text-red-500">*</span>
                </Label>
                <InputField
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  error={errors.name}
                  className="mt-2"
                />
              </div>

              {/* Email con validación en tiempo real */}
              <div>
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <InputField
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="juan.perez@example.com"
                  error={errors.email}
                  className="mt-2"
                />
              </div>

              {/* Password con generador y medidor de fortaleza */}
              {!isEdit && (
                <div className="md:col-span-2">
                  <Label htmlFor="password">
                    Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 relative">
                      <InputField
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        error={errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGeneratePassword}
                      className="shrink-0"
                    >
                      Generar
                    </Button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                          <div
                            className={`h-full rounded-full transition-all ${getPasswordStrengthColor()}`}
                            style={{
                              width:
                                passwordStrength === "weak"
                                  ? "33%"
                                  : passwordStrength === "medium"
                                  ? "66%"
                                  : "100%",
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Forzar cambio de contraseña */}
              {!isEdit && (
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.forcePasswordChange}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          forcePasswordChange: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Forzar cambio de contraseña en el primer login
                    </span>
                  </label>
                </div>
              )}

              {/* Teléfono */}
              <div>
                <Label htmlFor="phone">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <InputField
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+58 412-1234567"
                  error={errors.phone}
                  className="mt-2"
                />
              </div>

              {/* Cédula */}
              <div>
                <Label htmlFor="nationalId">
                  Cédula <span className="text-red-500">*</span>
                </Label>
                <InputField
                  id="nationalId"
                  name="nationalId"
                  type="text"
                  value={formData.nationalId}
                  onChange={handleChange}
                  placeholder="V-12345678"
                  error={errors.nationalId}
                  className="mt-2"
                />
              </div>

              {/* Fecha de nacimiento con DatePicker */}
              <div>
                <DatePicker
                  id="birthDate"
                  label="Fecha de nacimiento"
                  defaultDate={formData.birthDate || undefined}
                  onChange={handleDateChange}
                  placeholder="Seleccionar fecha"
                  error={errors.birthDate}
                />
              </div>

              {/* Nacionalidad con select buscable */}
              <div>
                <SearchableSelect
                  id="nationality"
                  label="Nacionalidad"
                  options={countries}
                  value={formData.nationality}
                  onChange={(value) => handleSelectChange("nationality", value)}
                  placeholder="Buscar país..."
                  error={errors.nationality}
                  required
                  debounceMs={300}
                />
              </div>

              {/* Rol */}
              <div>
                <SearchableSelect
                  id="role"
                  label="Rol"
                  options={[
                    { value: "", label: "Seleccionar rol" },
                    ...roleOptions,
                  ]}
                  value={formData.role}
                  onChange={(value) => handleSelectChange("role", value)}
                  placeholder="Buscar rol..."
                  error={errors.role}
                  disabled={loadingData}
                  required
                  debounceMs={300}
                />
              </div>

              {/* División */}
              <div>
                <SearchableSelect
                  id="division"
                  label="División"
                  options={[
                    { value: "", label: "Seleccionar división" },
                    ...divisionOptions,
                  ]}
                  value={formData.division}
                  onChange={(value) => handleSelectChange("division", value)}
                  placeholder="Buscar división..."
                  error={errors.division}
                  disabled={loadingData}
                  required
                  debounceMs={300}
                />
              </div>

              {/* Manager (opcional) */}
              <div>
                <SearchableSelect
                  id="managerId"
                  label="Jefe de División (opcional)"
                  options={[
                    { value: "", label: "Sin jefe asignado" },
                    ...employeeOptions,
                  ]}
                  value={formData.managerId}
                  onChange={(value) => handleSelectChange("managerId", value)}
                  placeholder="Buscar empleado..."
                  disabled={loadingData}
                  debounceMs={500}
                />
              </div>

              {/* Tech Lead con búsqueda y debounce de 500ms */}
              <div>
                <SearchableSelect
                  id="techLeadId"
                  label="Jefe Inmediato / Tech Lead (opcional)"
                  options={[
                    { value: "", label: "Sin jefe inmediato" },
                    ...employeeOptions,
                  ]}
                  value={formData.techLeadId}
                  onChange={(value) => handleSelectChange("techLeadId", value)}
                  placeholder="Buscar empleado..."
                  disabled={loadingData}
                  debounceMs={500}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loadingData}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>{isEdit ? "Actualizando..." : "Creando..."}</span>
                </div>
              ) : (
                <span>{isEdit ? "Actualizar" : "Crear"} Empleado</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }
);

export default EmployeeFormModal;
