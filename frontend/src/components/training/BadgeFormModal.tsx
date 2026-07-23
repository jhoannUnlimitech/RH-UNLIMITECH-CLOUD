import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import BadgeIconPicker from "./BadgeIconPicker";
import BadgeShapePicker from "./BadgeShapePicker";
import { trainingService } from "../../api/services/training";
import type { Badge } from "../../api/services/training";
import { notify } from "../../utils/toast";

/**
 * BadgeFormModal — Modal para crear/editar insignias.
 */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (badge: Badge) => void;
  badge?: Badge | null;
}

const BadgeFormModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, badge }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "award",
    shape: "hexagon",
    color: "#3B82F6",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && badge) {
      setFormData({
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        shape: badge.shape,
        color: badge.color,
      });
    } else if (isOpen) {
      setFormData({ name: "", description: "", icon: "award", shape: "hexagon", color: "#3B82F6" });
    }
  }, [isOpen, badge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { notify.error("El nombre es requerido"); return; }
    if (!formData.description.trim()) { notify.error("La descripción es requerida"); return; }

    setIsSubmitting(true);
    try {
      let result: Badge;
      if (badge) {
        result = await trainingService.updateBadge(badge._id, formData);
        notify.success("Insignia actualizada");
      } else {
        result = await trainingService.createBadge(formData);
        notify.success("Insignia creada");
      }
      onSuccess(result);
      onClose();
    } catch (err: any) {
      notify.error(err.response?.data?.message || "Error al guardar insignia");
    } finally { setIsSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 lg:p-8">
      <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
        {badge ? "Editar Insignia" : "Nueva Insignia"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Nombre de la insignia"
            data-test-key="badge-name-input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            rows={2}
            placeholder="Descripción de la insignia"
            data-test-key="badge-description-input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Ícono</label>
          <BadgeIconPicker value={formData.icon} onChange={(icon) => setFormData(prev => ({ ...prev, icon }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Forma</label>
          <BadgeShapePicker selected={formData.shape} onChange={(shape) => setFormData(prev => ({ ...prev, shape }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="h-10 w-14 cursor-pointer rounded-lg border border-gray-200 p-1 dark:border-gray-700"
              data-test-key="badge-color-input"
            />
            <span className="text-xs text-gray-400">{formData.color}</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : badge ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BadgeFormModal;
