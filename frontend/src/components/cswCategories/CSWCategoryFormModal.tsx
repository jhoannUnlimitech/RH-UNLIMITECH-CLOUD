import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert";
import { cswCategoryStore } from "../../stores/views";
import type { ICSWCategoryStore } from "../../stores/views/CSWCategoryStore.contract";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryId?: string | null;
}

const CSWCategoryFormModal = observer(({ isOpen, onClose, onSuccess, categoryId }: Props) => {
  const [formData, setFormData] = useState<ICSWCategoryStore.CategoryInput>({
    name: "",
    description: "",
    active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isEditMode = !!categoryId;

  // Load category data if editing
  useEffect(() => {
    if (isOpen && categoryId) {
      cswCategoryStore.fetchCategoryById(categoryId);
    }
  }, [isOpen, categoryId]);

  // Populate form when selectedCategory changes
  useEffect(() => {
    if (isEditMode && cswCategoryStore.selectedCategory) {
      const category = cswCategoryStore.selectedCategory;
      setFormData({
        name: category.name,
        description: category.description || "",
        active: category.active,
      });
    }
  }, [cswCategoryStore.selectedCategory, isEditMode]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        description: "",
        active: true,
      });
      setErrors({});
      setSubmitError("");
      cswCategoryStore.setSelectedCategory(null);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked 
        : type === "number" ? Number(value) 
        : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "El nombre no puede exceder 100 caracteres";
    }

    if (formData.description && formData.description.length > 250) {
      newErrors.description = "La descripción no puede exceder 250 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (isEditMode && categoryId) {
        await cswCategoryStore.updateCategory(categoryId, formData);
      } else {
        await cswCategoryStore.createCategory(formData);
      }
      onSuccess();
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || "Error al guardar la categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl p-6 sm:p-8"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? "Editar Categoría" : "Crear Categoría"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {submitError && (
          <Alert 
            variant="error" 
            title="Error" 
            message={submitError} 
            onClose={() => setSubmitError("")} 
          />
        )}

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 dark:border-gray-700 focus:ring-brand-500"
            } bg-white dark:bg-dark-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
            placeholder="Ej: Permiso, Vacaciones, Aumento"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.description
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 dark:border-gray-700 focus:ring-brand-500"
            } bg-white dark:bg-dark-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 resize-none`}
            placeholder="Descripción de la categoría"
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>

        {/* Active */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Categoría activa
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isEditMode ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

export default CSWCategoryFormModal;
