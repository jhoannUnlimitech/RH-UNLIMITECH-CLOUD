import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert";
import { cswStore, cswCategoryStore } from "../../stores/views";
import type { ICSWStore } from "../../stores/views/CSWStore.contract";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  cswId?: string | null;
}

const CSWFormModal = observer(({ isOpen, onClose, mode, cswId }: Props) => {
  const [formData, setFormData] = useState<ICSWStore.CSWInput>({
    category: "",
    situation: "",
    information: "",
    solution: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isEditMode = mode === "edit";

  // Load CSW data if editing
  useEffect(() => {
    if (isOpen && isEditMode && cswId) {
      cswStore.fetchCSWById(cswId);
    }
  }, [isOpen, isEditMode, cswId]);

  // Load categories
  useEffect(() => {
    if (isOpen) {
      cswCategoryStore.fetchCategories();
    }
  }, [isOpen]);

  // Populate form when selectedCSW changes
  useEffect(() => {
    if (isEditMode && cswStore.selectedCSW) {
      const csw = cswStore.selectedCSW;
      const categoryId = typeof csw.category === 'string' ? csw.category : csw.category._id;
      setFormData({
        category: categoryId,
        situation: csw.situation,
        information: csw.information,
        solution: csw.solution,
      });
    }
  }, [cswStore.selectedCSW, isEditMode]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        category: "",
        situation: "",
        information: "",
        solution: "",
      });
      setErrors({});
      setSubmitError("");
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  // Count words in text
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = "La categoría es requerida";
    }

    if (!formData.situation.trim()) {
      newErrors.situation = "La situación es requerida";
    } else if (countWords(formData.situation) > 200) {
      newErrors.situation = "La situación no puede exceder 200 palabras";
    }

    if (!formData.information.trim()) {
      newErrors.information = "La información es requerida";
    } else if (countWords(formData.information) > 200) {
      newErrors.information = "La información no puede exceder 200 palabras";
    }

    if (!formData.solution.trim()) {
      newErrors.solution = "La solución es requerida";
    } else if (countWords(formData.solution) > 200) {
      newErrors.solution = "La solución no puede exceder 200 palabras";
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
      if (isEditMode && cswId) {
        await cswStore.updateCSW(cswId, formData);
      } else {
        await cswStore.createCSW(formData);
      }
      onClose();
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || "Error al guardar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = Array.isArray(cswCategoryStore.categories)
    ? cswCategoryStore.categories.filter((c) => c.active)
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? "Editar Solicitud CSW" : "Crear Solicitud CSW"}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Complete el formulario con los detalles de su solicitud. Máximo 200 palabras por campo.
        </p>
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

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-dark dark:text-white"
          >
            Categoría <span className="text-red">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full rounded-[7px] border-[1.5px] ${
              errors.category ? "border-red" : "border-stroke dark:border-dark-3"
            } bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:bg-dark-2 dark:text-white`}
            disabled={isSubmitting}
          >
            <option value="">Seleccione una categoría</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red">{errors.category}</p>
          )}
        </div>

        {/* Situation */}
        <div>
          <label
            htmlFor="situation"
            className="mb-2 block text-sm font-medium text-dark dark:text-white"
          >
            Situación <span className="text-red">*</span>
            <span className="ml-2 text-xs font-normal text-gray-500">
              {countWords(formData.situation)}/200 palabras
            </span>
          </label>
          <textarea
            id="situation"
            name="situation"
            value={formData.situation}
            onChange={handleChange}
            rows={4}
            placeholder="Describa la situación actual que motiva su solicitud..."
            className={`w-full rounded-[7px] border-[1.5px] ${
              errors.situation ? "border-red" : "border-stroke dark:border-dark-3"
            } bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:bg-dark-2 dark:text-white`}
            disabled={isSubmitting}
          />
          {errors.situation && (
            <p className="mt-1 text-sm text-red">{errors.situation}</p>
          )}
        </div>

        {/* Information */}
        <div>
          <label
            htmlFor="information"
            className="mb-2 block text-sm font-medium text-dark dark:text-white"
          >
            Información <span className="text-red">*</span>
            <span className="ml-2 text-xs font-normal text-gray-500">
              {countWords(formData.information)}/200 palabras
            </span>
          </label>
          <textarea
            id="information"
            name="information"
            value={formData.information}
            onChange={handleChange}
            rows={4}
            placeholder="Proporcione información adicional relevante para su solicitud..."
            className={`w-full rounded-[7px] border-[1.5px] ${
              errors.information ? "border-red" : "border-stroke dark:border-dark-3"
            } bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:bg-dark-2 dark:text-white`}
            disabled={isSubmitting}
          />
          {errors.information && (
            <p className="mt-1 text-sm text-red">{errors.information}</p>
          )}
        </div>

        {/* Solution */}
        <div>
          <label
            htmlFor="solution"
            className="mb-2 block text-sm font-medium text-dark dark:text-white"
          >
            Solución Propuesta <span className="text-red">*</span>
            <span className="ml-2 text-xs font-normal text-gray-500">
              {countWords(formData.solution)}/200 palabras
            </span>
          </label>
          <textarea
            id="solution"
            name="solution"
            value={formData.solution}
            onChange={handleChange}
            rows={4}
            placeholder="Describa la solución que propone para su solicitud..."
            className={`w-full rounded-[7px] border-[1.5px] ${
              errors.solution ? "border-red" : "border-stroke dark:border-dark-3"
            } bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:bg-dark-2 dark:text-white`}
            disabled={isSubmitting}
          />
          {errors.solution && (
            <p className="mt-1 text-sm text-red">{errors.solution}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-stroke pt-6 dark:border-dark-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando..."
              : isEditMode
              ? "Actualizar Solicitud"
              : "Crear Solicitud"}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

export default CSWFormModal;
