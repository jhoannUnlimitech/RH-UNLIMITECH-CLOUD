import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { trainingService } from "../../api/services/training";
import type { Badge, Level } from "../../api/services/training";
import { notify } from "../../utils/toast";

/**
 * LevelFormModal — Modal para crear/editar niveles de capacitación.
 */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (level: Level) => void;
  level?: Level | null;
  badges: Badge[];
}

const LevelFormModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, level, badges }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    badge: "",
    order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && level) {
      setFormData({
        name: level.name,
        description: level.description || "",
        badge: typeof level.badge === 'object' ? level.badge._id : level.badge,
        order: level.order,
      });
    } else if (isOpen) {
      setFormData({ name: "", description: "", badge: "", order: 0 });
    }
  }, [isOpen, level]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { notify.error("El nombre es requerido"); return; }
    if (!formData.badge) { notify.error("Seleccione una insignia"); return; }

    setIsSubmitting(true);
    try {
      let result: Level;
      if (level) {
        result = await trainingService.updateLevel(level._id, formData);
        notify.success("Nivel actualizado");
      } else {
        result = await trainingService.createLevel(formData as any);
        notify.success("Nivel creado");
      }
      onSuccess(result);
      onClose();
    } catch (err: any) {
      notify.error(err.response?.data?.message || "Error al guardar nivel");
    } finally { setIsSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 lg:p-8">
      <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
        {level ? "Editar Nivel" : "Nuevo Nivel"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Nombre del nivel"
            data-test-key="level-name-input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            rows={2}
            placeholder="Descripción del nivel"
            data-test-key="level-description-input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Insignia *</label>
          <select
            value={formData.badge}
            onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            data-test-key="level-badge-select"
          >
            <option value="">Seleccionar insignia</option>
            {badges.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Orden</label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            min={0}
            data-test-key="level-order-input"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : level ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LevelFormModal;
