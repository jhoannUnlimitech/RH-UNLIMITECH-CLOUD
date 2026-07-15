import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { libraryStore } from "../../stores/views/LibraryStore";
import type { LibraryCategory } from "../../api/services/library";
import {
  BookOpen, Clipboard, FileText, Bot, Book, GraduationCap,
  Shield, Lightbulb, Wrench, BarChart3, Building, Zap,
  type LucideIcon
} from "lucide-react";

/**
 * LibraryCategoryFormModal — Modal para crear/editar categorías de la Biblioteca.
 */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: LibraryCategory | null;
  parentId?: string;
}

const ICON_OPTIONS: { name: string; Icon: LucideIcon }[] = [
  { name: "book-open", Icon: BookOpen },
  { name: "clipboard", Icon: Clipboard },
  { name: "file-text", Icon: FileText },
  { name: "bot", Icon: Bot },
  { name: "book", Icon: Book },
  { name: "graduation-cap", Icon: GraduationCap },
  { name: "shield", Icon: Shield },
  { name: "lightbulb", Icon: Lightbulb },
  { name: "wrench", Icon: Wrench },
  { name: "bar-chart", Icon: BarChart3 },
  { name: "building", Icon: Building },
  { name: "zap", Icon: Zap },
];

const LibraryCategoryFormModal = observer(({ isOpen, onClose, onSuccess, category, parentId }: Props) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "book-open",
    color: "#3B82F6",
    parent: parentId || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!category;

  useEffect(() => {
    if (isOpen && category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        icon: category.icon || "book-open",
        color: category.color || "#3B82F6",
        parent: typeof category.parent === 'string' ? category.parent : category.parent?._id || "",
      });
    } else if (isOpen && !category) {
      setFormData({ name: "", description: "", icon: "book-open", color: "#3B82F6", parent: parentId || "" });
    }
    setErrors({});
  }, [isOpen, category, parentId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    else if (formData.name.length < 2) newErrors.name = "Mínimo 2 caracteres";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color,
      };
      if (formData.parent) data.parent = formData.parent;

      if (isEditMode && category) {
        await libraryStore.updateCategory(category._id, data);
      } else {
        await libraryStore.createCategory(data);
      }
      onSuccess();
      onClose();
    } catch {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 lg:p-8">
      <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
        {isEditMode ? "Editar Categoría" : "Nueva Categoría"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none dark:bg-gray-800 dark:text-white ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-500 dark:border-gray-700'}`}
            placeholder="Nombre de la categoría"
            data-test-key="name-input"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Descripción breve"
            rows={2}
            maxLength={250}
            data-test-key="description-input"
          />
        </div>

        {/* Ícono (Lucide icons grid) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Ícono</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map(({ name, Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, icon: name }))}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  formData.icon === name
                    ? 'bg-brand-50 ring-2 ring-brand-500 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
                title={name}
                data-test-key={`icon-${name}`}
              >
                <Icon size={20} />
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="h-10 w-14 cursor-pointer rounded-xl border border-gray-200 p-1 dark:border-gray-700"
              data-test-key="color-input"
            />
            <span className="text-xs text-gray-400">{formData.color}</span>
          </div>
        </div>

        {/* Categoría padre */}
        {!isEditMode && libraryStore.categories.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría padre (opcional)</label>
            <select
              value={formData.parent}
              onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              data-test-key="parent-select"
            >
              <option value="">— Raíz (sin padre) —</option>
              {libraryStore.categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {"  ".repeat(cat.depth)}{cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} data-test-key="cancel-btn">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} data-test-key="submit-btn">
            {isSubmitting ? "Guardando..." : isEditMode ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

export default LibraryCategoryFormModal;
