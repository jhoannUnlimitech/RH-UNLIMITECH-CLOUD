import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DocumentEditor from "../../components/training/DocumentEditor";
import { libraryStore } from "../../stores/views/LibraryStore";

/**
 * DocumentForm — Crear/Editar documento de la Biblioteca.
 *
 * Campos: título, categoría, tipo, tags, visibilidad.
 * Editor dual (visual/markdown) para el contenido.
 * Link externo y upload de archivo opcionales.
 */

const DocumentForm = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    type: "article" as "article" | "link" | "file" | "mixed",
    content: "",
    externalLink: "",
    tags: [] as string[],
    visibility: "all" as "all" | "specific_roles" | "specific_divisions",
    published: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [changeNote, setChangeNote] = useState("");

  useEffect(() => {
    libraryStore.fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      // Cargar documento para edición
      libraryStore.fetchDocuments({ _id: id } as any);
    }
  }, [id, isEditing]);

  // Cargar datos del documento al editar
  useEffect(() => {
    const doc = libraryStore.selectedDocument;
    if (isEditing && doc) {
      setFormData({
        title: doc.title,
        description: doc.description || "",
        category: typeof doc.category === 'object' ? doc.category._id : doc.category,
        type: doc.type,
        content: doc.content || "",
        externalLink: doc.externalLink || "",
        tags: doc.tags || [],
        visibility: doc.visibility,
        published: doc.published,
      });
    }
  }, [libraryStore.selectedDocument, isEditing]);

  const handleSubmit = async (publish: boolean) => {
    try {
      const data = {
        ...formData,
        published: publish,
        ...(isEditing && changeNote ? { changeNote } : {}),
      };

      if (isEditing && id) {
        await libraryStore.updateDocument(id, data);
      } else {
        await libraryStore.createDocument(data);
      }
      navigate('/library/manage');
    } catch {
      // Error handled by store
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  return (
    <>
      <PageBreadcrumb pageTitle={isEditing ? "Editar Documento" : "Nuevo Documento"} />
      <div className="mx-auto max-w-4xl" data-test-context="document-form-page">
        <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="space-y-6">

            {/* Título */}
            <div data-test-context="title-field">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Título del documento"
                required
                data-test-key="title-input"
              />
            </div>

            {/* Descripción */}
            <div data-test-context="description-field">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Breve descripción del documento"
                rows={2}
                maxLength={500}
                data-test-key="description-input"
              />
            </div>

            {/* Categoría + Tipo (row) */}
            <div className="grid grid-cols-2 gap-4">
              <div data-test-context="category-field">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                  data-test-key="category-select"
                >
                  <option value="">Seleccionar categoría</option>
                  {libraryStore.categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div data-test-context="type-field">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  data-test-key="type-select"
                >
                  <option value="article">📝 Artículo</option>
                  <option value="link">🔗 Link externo</option>
                  <option value="file">📎 Archivo</option>
                  <option value="mixed">📦 Mixto</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div data-test-context="tags-field">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Agregar tag..."
                  data-test-key="tag-input"
                />
                <Button type="button" size="sm" onClick={addTag} data-test-key="add-tag-btn">+</Button>
              </div>
            </div>

            {/* Link externo (si tipo es link o mixed) */}
            {(formData.type === 'link' || formData.type === 'mixed') && (
              <div data-test-context="link-field">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Link externo</label>
                <input
                  type="url"
                  value={formData.externalLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, externalLink: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="https://..."
                  data-test-key="link-input"
                />
              </div>
            )}

            {/* Editor de contenido (si tipo es article o mixed) */}
            {(formData.type === 'article' || formData.type === 'mixed') && (
              <div data-test-context="content-field">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Contenido</label>
                <DocumentEditor
                  value={formData.content}
                  onChange={(md) => setFormData(prev => ({ ...prev, content: md }))}
                  placeholder="Escribe el contenido del documento..."
                  data-test-context="document-editor"
                />
              </div>
            )}

            {/* Change note (solo edición) */}
            {isEditing && (
              <div data-test-context="change-note-field">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nota del cambio</label>
                <input
                  type="text"
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Ej: Actualizado sección 3, corregido tabla de contenidos..."
                  maxLength={200}
                  data-test-key="change-note-input"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-700" data-test-context="form-actions">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} data-test-key="cancel-btn">
                Cancelar
              </Button>
              <Button type="submit" variant="outline" data-test-key="save-draft-btn">
                Guardar Borrador
              </Button>
              <Button type="button" onClick={() => handleSubmit(true)} data-test-key="publish-btn">
                {isEditing ? "Guardar y Publicar" : "Crear y Publicar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
});

export default DocumentForm;
