import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { divisionsStore } from "../../stores/views";
import InputField from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Checkbox from "../../components/form/input/Checkbox";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { IDivisionsStore } from "../../stores/views/DivisionsStore.contract";

const DivisionForm = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<IDivisionsStore.DivisionInput>({
    name: "",
    code: "",
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    code?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      divisionsStore.fetchDivisionById(id);
    }
  }, [isEdit, id]);

  useEffect(() => {
    if (isEdit && divisionsStore.selectedDivision) {
      setFormData({
        name: divisionsStore.selectedDivision.name,
        code: divisionsStore.selectedDivision.code,
        description: divisionsStore.selectedDivision.description || "",
        isActive: divisionsStore.selectedDivision.isActive,
      });
    }
  }, [isEdit, divisionsStore.selectedDivision]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isActive: e.target.checked }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.code.trim()) {
      newErrors.code = "El código es requerido";
    } else if (formData.code.length < 2) {
      newErrors.code = "El código debe tener al menos 2 caracteres";
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
      if (isEdit && id) {
        await divisionsStore.updateDivision(id, formData);
      } else {
        await divisionsStore.createDivision(formData);
      }
      navigate("/divisions");
    } catch (error) {
      console.error("Error al guardar división:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && divisionsStore.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {isEdit ? "Editar División" : "Nueva División"}
          </h2>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            {isEdit
              ? "Actualiza la información de la división"
              : "Completa los datos para crear una nueva división"}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {divisionsStore.error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-theme-sm font-medium text-red-800 dark:text-red-400">
                {divisionsStore.error}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                onClick={() => divisionsStore.clearError()}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Is Active Checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <Checkbox
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                disabled={isSubmitting}
              />
            </div>
            <div className="ml-3">
              <Label htmlFor="isActive" className="font-medium">
                Activo
              </Label>
              <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                Si está marcado, la división estará disponible en el sistema
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Link to="/divisions">
              <Button variant="outline" type="button" disabled={isSubmitting}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : isEdit ? (
                "Actualizar División"
              ) : (
                "Crear División"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default DivisionForm;
