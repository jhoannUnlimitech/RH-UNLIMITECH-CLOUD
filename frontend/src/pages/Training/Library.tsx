import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { Search, Star, Eye, FileText, ExternalLink, Paperclip, Package } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Pagination from "../../components/ui/pagination/Pagination";
import CategoryTree from "../../components/training/CategoryTree";
import { libraryStore } from "../../stores/views/LibraryStore";
import type { LibraryCategory, LibraryDocument } from "../../api/services/library";

/**
 * Library — Vista empleado de la Biblioteca documental.
 *
 * Muestra documentos publicados, categorías navegables, búsqueda por título/tags.
 * Sin acciones admin (no editar, no eliminar, no publicar).
 */

const TYPE_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  article: FileText,
  link: ExternalLink,
  file: Paperclip,
  mixed: Package,
};

const Library = observer(() => {
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredDocs, setFeaturedDocs] = useState<LibraryDocument[]>([]);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    libraryStore.fetchCategories();
    // Traer TODOS los destacados publicados (sin paginar)
    import("../../api/services/library").then(({ libraryService }) => {
      libraryService.getDocuments({ published: 'true', featured: 'true', limit: '100' })
        .then(result => setFeaturedDocs(result.documents));
    });
  }, []);

  useEffect(() => {
    const filters: Record<string, string> = { published: "true", page: String(currentPage), limit: String(ITEMS_PER_PAGE) };
    if (selectedCategoryId) filters.category = selectedCategoryId;
    if (typeFilter) filters.type = typeFilter;
    libraryStore.fetchDocuments(filters);
  }, [selectedCategoryId, typeFilter, currentPage]);

  // Búsqueda con debounce 400ms
  useEffect(() => {
    if (searchQuery.trim()) {
      const timeout = setTimeout(() => {
        libraryStore.search(searchQuery, { category: selectedCategoryId, type: typeFilter || undefined });
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [searchQuery, selectedCategoryId, typeFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, typeFilter, searchQuery]);

  const handleSelectCategory = (cat: LibraryCategory) => {
    setSelectedCategoryId(cat._id === selectedCategoryId ? undefined : cat._id);
  };

  const handleDocClick = (doc: LibraryDocument) => {
    navigate(`/library/documents/${doc.slug}`);
  };

  const displayedDocs = searchQuery.trim() ? libraryStore.searchResults : libraryStore.documents;

  return (
    <>
      <PageBreadcrumb pageTitle="Biblioteca" />
      <div className="flex gap-6" data-test-context="library-page">
        {/* Sidebar categorías */}
        <div className="w-72 shrink-0 rounded-xl bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white">Categorías</h3>
          <button
            onClick={() => setSelectedCategoryId(undefined)}
            className={`mb-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${!selectedCategoryId ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
          >
            Todas
          </button>
          <CategoryTree
            categories={libraryStore.categories}
            selectedId={selectedCategoryId}
            onSelect={handleSelectCategory}
          />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {/* Destacados — slider contenido con flechas de navegación */}
          {!searchQuery && featuredDocs.length > 0 && !selectedCategoryId && (
            <div className="mb-6 rounded-xl bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card" data-test-context="featured-section">
              <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Destacados</h3>
              <div className="relative">
                {/* Flecha izquierda */}
                <button
                  onClick={() => {
                    const el = document.getElementById('featured-slider');
                    if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  className="absolute -left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>

                {/* Slider */}
                <div
                  id="featured-slider"
                  className="flex gap-4 overflow-x-hidden px-6"
                >
                  {featuredDocs.map(doc => (
                    <div
                      key={doc._id}
                      onClick={() => handleDocClick(doc)}
                      className="min-w-[240px] max-w-[260px] shrink-0 cursor-pointer rounded-xl border border-brand-100 bg-brand-50/30 p-3 transition-all hover:shadow-md dark:border-brand-500/20 dark:bg-brand-500/5"
                      data-test-key={`featured-${doc.slug}`}
                    >
                      <div className="mb-1.5 flex items-center gap-2">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] text-brand-600 dark:text-brand-400">Destacado</span>
                      </div>
                      <h4 className="mb-1 text-xs font-semibold text-gray-800 dark:text-white line-clamp-1">{doc.title}</h4>
                      {doc.description && <p className="text-[10px] text-gray-500 line-clamp-2">{doc.description}</p>}
                    </div>
                  ))}
                </div>

                {/* Flecha derecha */}
                <button
                  onClick={() => {
                    const el = document.getElementById('featured-slider');
                    if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  className="absolute -right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* Buscador + filtro */}
          <div className="mb-4 rounded-xl bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar documentos por título o tags..."
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  data-test-key="search-input"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                data-test-key="type-filter"
              >
                <option value="">Todos los tipos</option>
                <option value="article">Artículos</option>
                <option value="link">Links</option>
                <option value="file">Archivos</option>
                <option value="mixed">Mixtos</option>
              </select>
            </div>
          </div>

          {/* Lista de documentos */}
          {libraryStore.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-white p-4 shadow-1 dark:bg-gray-dark">
                  <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700 mb-2"></div>
                  <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              ))}
            </div>
          ) : displayedDocs.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-1 dark:bg-gray-dark">
              <p className="text-gray-400">
                {searchQuery ? "No se encontraron documentos" : "No hay documentos publicados en esta categoría"}
              </p>
            </div>
          ) : (
            <div className="space-y-3" data-test-context="documents-list">
              {displayedDocs.map(doc => {
                const TypeIcon = TYPE_ICONS[doc.type] || FileText;
                const catName = typeof doc.category === 'object' ? doc.category.name : '';
                return (
                  <div
                    key={doc._id}
                    onClick={() => handleDocClick(doc)}
                    className="group cursor-pointer rounded-xl bg-white p-4 shadow-1 transition-all hover:shadow-md dark:bg-gray-dark dark:shadow-card dark:hover:shadow-lg"
                    data-test-key={`doc-${doc.slug}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <TypeIcon size={20} className="text-gray-500" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-800 group-hover:text-brand-500 dark:text-white dark:group-hover:text-brand-400 line-clamp-1">
                            {doc.title}
                          </h4>
                          {doc.featured && <Star size={12} className="fill-yellow-400 text-yellow-400 shrink-0" />}
                        </div>
                        {doc.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{doc.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500">
                          <span>{catName}</span>
                          <span className="flex items-center gap-1"><Eye size={10} /> {doc.viewCount}</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
                          {doc.tags.length > 0 && (
                            <div className="flex gap-1">
                              {doc.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] dark:bg-gray-700">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {!searchQuery && libraryStore.pagination.total > 0 && (
            <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, libraryStore.pagination.total)} de {libraryStore.pagination.total} documentos
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
    </>
  );
});

export default Library;
