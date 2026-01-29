import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { cswStore, cswCategoryStore, authStore } from "../../stores/views";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert";

const CSWForm = observer(() => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    category: "",
    situation: "",
    information: "",
    solution: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    cswCategoryStore.fetchCategories();
    
    if (isEditing && id) {
      cswStore.fetchCSWById(id);
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (isEditing && cswStore.selectedCSW) {
      const csw = cswStore.selectedCSW;
      setFormData({
        category: csw.category._id,
        situation: csw.situation,
        information: csw.information,
        solution: csw.solution,
      });
    }
  }, [isEditing, cswStore.selectedCSW]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = "La categoría es requerida";
    }
    if (!formData.situation.trim()) {
      newErrors.situation = "La situación es requerida";
    }
    if (!formData.information.trim()) {
      newErrors.information = "La información es requerida";
    }
    if (!formData.solution.trim()) {
      newErrors.solution = "La solución es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        situation: formData.situation,
        information: formData.information,
        solution: formData.solution,
        category: formData.category,
      };

      if (isEditing && id) {
        await cswStore.updateCSW(id, submitData);
      } else {
        await cswStore.createCSW(submitData);
      }

      navigate("/csw/my-requests");
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const categories = cswCategoryStore.categories
    .slice()
    .sort((a, b) => a.order - b.order);

  // Obtener fecha actual e info del usuario
  const today = new Date();
  const formattedDate = today.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const user = authStore.user;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle={isEditing ? "Editar Solicitud CSW" : "Nueva Solicitud CSW"} />

      {/* Error Display */}
      {cswStore.error && (
        <Alert
          variant="error"
          title="Error"
          message={cswStore.error}
          onClose={() => cswStore.clearError()}
        />
      )}

      {/* Form Container */}
      <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Form Header con información del usuario */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-dark dark:text-white">
                  {isEditing ? "Editar Solicitud CSW" : "Nueva Solicitud CSW"}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {isEditing
                    ? "Actualiza la información de la solicitud"
                    : "Completa el formulario para crear una nueva solicitud"}
                </p>
              </div>
              {user && (
                <div className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">
                      {formattedDate}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {user.role?.name || "Sin rol"} • {user.division?.name || "Sin división"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
              Categoría <span className="text-red">*</span>
            </label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full rounded-[7px] border-[1.5px] bg-transparent px-5.5 py-3 pr-10 text-dark outline-none transition appearance-none focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary ${
                  errors.category ? "border-red" : "border-stroke"
                }`}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <span className="absolute text-gray-500 -translate-y-1/2 right-4 top-1/2 dark:text-gray-400 pointer-events-none">
                <svg className="stroke-current" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red">{errors.category}</p>
            )}
          </div>

          {/* Situación */}
          <div>
            <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
              Situación <span className="text-red">*</span>
            </label>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Proporciona la información rápidamente por la cuál envías este CSW
            </p>
            <textarea
              name="situation"
              value={formData.situation}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe la situación actual que requiere atención..."
              className={`w-full rounded-[7px] border-[1.5px] bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary ${
                errors.situation ? "border-red" : "border-stroke"
              }`}
            />
            {errors.situation && (
              <p className="mt-1 text-sm text-red">{errors.situation}</p>
            )}
          </div>

          {/* Información */}
          <div>
            <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
              Información <span className="text-red">*</span>
            </label>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Proporciona la información completa sobre este CSW, incluye la razón, cantidades, fechas, estadísticas etc. según aplique. Aquí queremos datos
            </p>
            <textarea
              name="information"
              value={formData.information}
              onChange={handleInputChange}
              rows={4}
              placeholder="Proporciona información detallada: razón, cantidades, fechas, estadísticas..."
              className={`w-full rounded-[7px] border-[1.5px] bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary ${
                errors.information ? "border-red" : "border-stroke"
              }`}
            />
            {errors.information && (
              <p className="mt-1 text-sm text-red">{errors.information}</p>
            )}
          </div>

          {/* Solución */}
          <div>
            <label className="mb-2.5 block text-sm font-medium text-dark dark:text-white">
              Solución <span className="text-red">*</span>
            </label>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Proporciona la información completa de cómo se maneja la situación mencionada previamente, si es un permiso de ausencia, asegúrate de poner todos los datos sobre cómo quedará cubierta tu producción, o cualquier otra cosa que se deba dejar bajo control en tu ausencia o quién se hará cargo de tu puesto
            </p>
            <textarea
              name="solution"
              value={formData.solution}
              onChange={handleInputChange}
              rows={5}
              placeholder="Describe cómo se resolverá o manejará la situación, quién se hará cargo, cómo quedará cubierta la producción..."
              className={`w-full rounded-[7px] border-[1.5px] bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary ${
                errors.solution ? "border-red" : "border-stroke"
              }`}
            />
            {errors.solution && (
              <p className="mt-1 text-sm text-red">{errors.solution}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 border-t border-stroke pt-6 dark:border-dark-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={cswStore.isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={cswStore.isLoading}
            >
              {cswStore.isLoading
                ? isEditing
                  ? "Actualizando..."
                  : "Creando..."
                : isEditing
                ? "Actualizar Solicitud"
                : "Crear Solicitud"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default CSWForm;
