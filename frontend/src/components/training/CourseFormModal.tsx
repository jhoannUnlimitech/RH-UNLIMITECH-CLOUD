import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { trainingService } from "../../api/services/training";
import { libraryService } from "../../api/services/library";
import type { Level, Course } from "../../api/services/training";
import type { LibraryDocument } from "../../api/services/library";
import { notify } from "../../utils/toast";

/**
 * CourseFormModal — Modal para crear/editar cursos de capacitación.
 *
 * Un curso se asocia a un documento de la Biblioteca (material de estudio)
 * y pertenece a un Nivel dentro de una Insignia.
 */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (course: Course) => void;
  course?: Course | null;
  levels: Level[];
}

const CourseFormModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, course, levels }) => {
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: "",
    libraryDocument: "",
    link: "",
    estimatedHours: 1,
    order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar documentos publicados de la biblioteca
  useEffect(() => {
    if (isOpen) {
      libraryService.getDocuments({ published: 'true', limit: '100' })
        .then(result => setDocuments(result.documents));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && course) {
      setFormData({
        name: course.name,
        description: course.description,
        level: typeof course.level === 'object' ? course.level._id : course.level,
        libraryDocument: typeof course.libraryDocument === 'object' ? course.libraryDocument._id : (course.libraryDocument || ""),
        link: course.link || "",
        estimatedHours: course.estimatedHours || 1,
        order: course.order,
      });
    } else if (isOpen) {
      setFormData({ name: "", description: "", level: "", libraryDocument: "", link: "", estimatedHours: 1, order: 0 });
    }
  }, [isOpen, course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { notify.error("El nombre es requerido"); return; }
    if (!formData.description.trim()) { notify.error("La descripción es requerida"); return; }
    if (!formData.level) { notify.error("Seleccione un nivel"); return; }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        level: formData.level,
        order: formData.order,
        estimatedHours: formData.estimatedHours,
      };
      if (formData.libraryDocument) payload.libraryDocument = formData.libraryDocument;
      if (formData.link) payload.link = formData.link;

      let result: Course;
      if (course) {
        result = await trainingService.updateCourse(course._id, payload);
        notify.success("Curso actualizado");
      } else {
        result = await trainingService.createCourse(payload);
        notify.success("Curso creado");
      }
      onSuccess(result);
      onClose();
    } catch (err: any) {
      notify.error(err.response?.data?.message || "Error al guardar curso");
    } finally { setIsSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 lg:p-8">
      <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
        {course ? "Editar Curso" : "Nuevo Curso"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Nombre del curso"
            data-test-key="course-name-input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            rows={2}
            placeholder="Descripción del curso"
            data-test-key="course-description-input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nivel *</label>
          <select
            value={formData.level}
            onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            data-test-key="course-level-select"
          >
            <option value="">Seleccionar nivel</option>
            {levels.map(l => (
              <option key={l._id} value={l._id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Documento asociado (Biblioteca)</label>
          <select
            value={formData.libraryDocument}
            onChange={(e) => setFormData(prev => ({ ...prev, libraryDocument: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            data-test-key="course-document-select"
          >
            <option value="">— Sin documento asociado —</option>
            {documents.map(doc => (
              <option key={doc._id} value={doc._id}>{doc.title}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">El documento de la Biblioteca que el empleado debe leer para este curso.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Link externo (opcional)</label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="https://..."
            data-test-key="course-link-input"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Horas estimadas</label>
            <input
              type="number"
              value={formData.estimatedHours}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: Number(e.target.value) }))}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              min={0.25}
              step={0.25}
              data-test-key="course-hours-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Orden</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              min={0}
              data-test-key="course-order-input"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : course ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CourseFormModal;
