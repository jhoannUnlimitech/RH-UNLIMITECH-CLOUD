import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { Folder, Plus, Search, Star } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Pagination from "../../components/ui/pagination/Pagination";
import CategoryTree from "../../components/training/CategoryTree";
import DocumentCard from "../../components/training/DocumentCard";
import LibraryCategoryFormModal from "../../components/training/LibraryCategoryFormModal";
import { libraryStore } from "../../stores/views/LibraryStore";
import type { LibraryCategory, LibraryDocument } from "../../api/services/library";

/**
 * LibraryManage — Vista admin de la Biblioteca.
 *
 * Layout 2 columnas: sidebar con árbol de categorías (CRUD),
 * panel derecho con documentos filtrados + buscador + paginación.
 */

const LibraryManage = observer(() => {
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modal de categoría
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LibraryCategory | null>(null);

  useEffect(() => {
    libraryStore.fetchCategories();
  }, []);

  useEffect(() => {
    const filters: Record<string, string> = { page: String(currentPage), limit: "12" };
    if (selectedCategoryId) filters.category = selectedCategoryId;
    if (typeFilter) filters.type = typeFilter;
    libraryStore.fetchDocuments(filters);
  }, [selectedCategoryId, typeFilter, currentPage]);

  // Búsqueda con debounce
  useEffect(() => {
    if (searchQuery.trim()) {
      const timeout = setTimeout(() => {
        libraryStore.search(searchQuery, { category: selectedCategoryId, type: typeFilter || undefined });
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [searchQuery, selectedCategoryId, typeFilter]);

  const handleSelectCategory = (cat: LibraryCategory) => {
    setSelectedCategoryId(cat._id === selectedCategoryId ? undefined : cat._id);
    setCurrentPage(1);
  };

  const handleDocumentClick = (doc: LibraryDocument) => {
    navigate(`/library/documents/edit/${doc.slug}`);
  };

  const handlePublish = (doc: LibraryDocument) => {
    libraryStore.publishDocument(doc._id, !doc.published);
  };

  const handleDeleteDoc = (doc: LibraryDocument) => {
    if (confirm(`¿Eliminar "${doc.title}"?`)) {
      libraryStore.deleteDocument(doc._id);
    }
  };

  const handleEditCategory = (cat: LibraryCategory) => {
    setEditingCategory(cat);
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = (cat: LibraryCategory) => {
    // Verificar si tiene sub-categorías
    const children = libraryStore.categories.filter(c => {
      const pId = typeof c.parent === 'string' ? c.parent : c.parent?._id;
      return pId === cat._id;
    });

    if (children.length > 0) {
      const childNames = children.map(c => `  • ${c.name}`).join('\n');
      alert(
        `No se puede eliminar "${cat.name}" porque tiene ${children.length} sub-categoría(s):\n\n${childNames}\n\nElimina o reubica las sub-categorías primero.`
      );
      return;
    }

    if (cat.documentsCount > 0) {
      alert(`No se puede eliminar "${cat.name}" porque tiene ${cat.documentsCount} documento(s). Mueve los documentos primero.`);
      return;
    }

    if (confirm(`¿Eliminar categoría "${cat.name}"? Esta acción no se puede deshacer.`)) {
      libraryStore.deleteCategory(cat._id);
    }
  };

  const handleCategorySuccess = () => {
    libraryStore.fetchCategories();
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const displayedDocs = searchQuery.trim() ? libraryStore.searchResults : libraryStore.documents;

  return (
    <>
      <PageBreadcrumb pageTitle="Gestión Biblioteca" />
      <div className="flex gap-6" data-test-context="library-manage-page">
        {/* Sidebar: Categorías */}
        <div className="w-80 shrink-0 rounded-xl bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card" data-test-context="categories-sidebar">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Categorías</h3>
            <button
              onClick={() => navigate('/library/categories')}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-700"
              title="Gestión de categorías"
              data-test-key="manage-categories-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>

          {/* Botón "Todas" */}
          <button
            onClick={() => { setSelectedCategoryId(undefined); setCurrentPage(1); }}
            className={`mb-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${!selectedCategoryId ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
            data-test-key="all-categories-btn"
          >
            <Folder size={16} /> Todas las categorías
          </button>

          <CategoryTree
            categories={libraryStore.categories}
            selectedId={selectedCategoryId}
            onSelect={handleSelectCategory}
            adminMode={true}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
          />
        </div>

        {/* Panel derecho: Documentos */}
        <div className="flex-1 rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card" data-test-context="documents-panel">
          {/* Header con título y botón crear */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white" data-test-key="panel-title">
              Documentos {libraryStore.pagination.total > 0 && `(${libraryStore.pagination.total})`}
            </h2>
            <Button onClick={() => navigate('/library/documents/new')} data-test-key="create-document-btn">
              <Plus size={16} className="mr-1" /> Nuevo Documento
            </Button>
          </div>

          {/* Buscador y filtros */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center" data-test-context="documents-filters">
            {/* Buscador */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título o tags..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                data-test-key="search-input"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Filtro por tipo */}
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              data-test-key="type-filter"
            >
              <option value="">Todos los tipos</option>
              <option value="article">Artículos</option>
              <option value="link">Links</option>
              <option value="file">Archivos</option>
              <option value="mixed">Mixtos</option>
            </select>

            {/* Toggle vista grid/list */}
            <div className="flex rounded-xl border border-gray-200 dark:border-gray-700" data-test-key="view-toggle">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-l-xl px-3 py-2.5 ${viewMode === 'grid' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title="Vista grid"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-r-xl px-3 py-2.5 ${viewMode === 'list' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title="Vista lista"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* Grid de documentos */}
          {libraryStore.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-2 flex justify-between">
                    <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="mb-2 h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="mb-2 h-3 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex gap-2">
                    <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedDocs.length === 0 ? (
            <div className="py-12 text-center text-gray-400" data-test-key="empty-state">
              <p className="mt-2">{searchQuery ? "No se encontraron resultados" : "No hay documentos en esta categoría"}</p>
              {!searchQuery && (
                <Button className="mt-4" onClick={() => navigate('/library/documents/new')}>
                  Crear primer documento
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-3 sm:grid-cols-2" data-test-context="documents-grid">
              {displayedDocs.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  document={doc}
                  onClick={handleDocumentClick}
                  onPublish={handlePublish}
                  onDelete={handleDeleteDoc}
                  adminMode={true}
                />
              ))}
            </div>
          ) : (
            /* Vista lista — tabla clickeable */
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700" data-test-context="documents-table">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Título</th>
                    <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Tipo</th>
                    <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Categoría</th>
                    <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Estado</th>
                    <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Vistas</th>
                    <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {displayedDocs.map((doc) => {
                    const catName = typeof doc.category === 'object' ? doc.category.name : '';
                    return (
                      <tr
                        key={doc._id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        onClick={() => handleDocumentClick(doc)}
                        data-test-key={`doc-row-${doc.slug}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {doc.featured && <Star size={14} className="fill-yellow-400 text-yellow-400 shrink-0" />}
                            <span className="font-medium text-gray-800 dark:text-white">{doc.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize text-gray-600 dark:text-gray-300">{doc.type === 'article' ? 'Artículo' : doc.type === 'link' ? 'Link' : doc.type === 'file' ? 'Archivo' : 'Mixto'}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{catName}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${doc.published ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                            {doc.published ? 'Publicado' : 'Borrador'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{doc.viewCount}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(doc.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación + Show items — consistente con Employees */}
          {!searchQuery && (
            <div className="flex flex-col items-center justify-between gap-4 mt-4 sm:flex-row">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando {libraryStore.pagination.total > 0 ? (currentPage - 1) * 12 + 1 : 0} a {Math.min(currentPage * 12, libraryStore.pagination.total)} de {libraryStore.pagination.total} entradas
              </p>
              {libraryStore.pagination.pages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={libraryStore.pagination.pages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal crear/editar categoría */}
      <LibraryCategoryFormModal
        isOpen={categoryModalOpen}
        onClose={() => { setCategoryModalOpen(false); setEditingCategory(null); }}
        onSuccess={handleCategorySuccess}
        category={editingCategory}
        parentId={selectedCategoryId}
      />
    </>
  );
});

export default LibraryManage;
