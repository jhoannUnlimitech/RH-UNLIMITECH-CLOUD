import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { Plus, Edit2, Trash2, Eye, EyeOff, Search } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Pagination from "../../components/ui/pagination/Pagination";
import TableSkeleton from "../../components/ui/skeleton/TableSkeleton";
import DeleteConfirmModal from "../../components/employees/DeleteConfirmModal";
import HardDeleteModal from "../../components/ui/modal/HardDeleteModal";
import LucideIconByName from "../../components/training/LucideIcon";
import LibraryCategoryFormModal from "../../components/training/LibraryCategoryFormModal";
import { libraryStore } from "../../stores/views/LibraryStore";
import type { LibraryCategory } from "../../api/services/library";

/**
 * LibraryCategories — Vista de gestión de categorías de la Biblioteca.
 *
 * Tabla con todas las categorías: nombre, ícono, docs count, estado, acciones.
 * Permite crear, editar, desactivar y eliminar categorías.
 */

const LibraryCategories = observer(() => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LibraryCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<LibraryCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hardDeleteModalOpen, setHardDeleteModalOpen] = useState(false);
  const [hardDeletingCategory, setHardDeletingCategory] = useState<LibraryCategory | null>(null);
  const [isHardDeleting, setIsHardDeleting] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [restoringCategory, setRestoringCategory] = useState<LibraryCategory | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    // Fetch with includeDeleted when "deleted" filter is active
    libraryStore.fetchCategories(undefined, statusFilter === 'deleted');
  }, [statusFilter]);

  const handleEdit = (cat: LibraryCategory) => {
    setEditingCategory(cat);
    setModalOpen(true);
  };

  const handleDelete = async (cat: LibraryCategory) => {
    if (cat.isSystem) return;
    setDeletingCategory(cat);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      await libraryStore.deleteCategory(deletingCategory._id);
      setDeleteModalOpen(false);
      setDeletingCategory(null);
    } catch (err: any) {
      if (err.conflictData) {
        // Tiene sub-categorías y/o documentos — mostrar detalle y pedir force
        const { subcategories, documents } = err.conflictData;
        let msg = `Esta categoría tiene dependencias:\n\n`;
        if (subcategories?.length > 0) {
          msg += `📁 Sub-categorías (${subcategories.length}):\n`;
          msg += subcategories.map((c: any) => `  • ${c.name}`).join('\n');
          msg += '\n\n';
        }
        if (documents?.length > 0) {
          msg += `📄 Documentos (${documents.length}):\n`;
          msg += documents.map((d: any) => `  • ${d.title}`).join('\n');
          msg += '\n\n';
        }
        msg += `¿Desea eliminar de todas formas?\nLas sub-categorías serán eliminadas y los documentos serán despublicados.`;

        const forceConfirm = confirm(msg);
        if (forceConfirm) {
          try {
            await libraryStore.deleteCategory(deletingCategory._id, true);
            setDeleteModalOpen(false);
            setDeletingCategory(null);
          } catch {
            // Error shown via toast
          }
        }
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (cat: LibraryCategory) => {
    await libraryStore.updateCategory(cat._id, { active: !cat.active } as any);
    libraryStore.fetchCategories(undefined, statusFilter === 'deleted');
  };

  const handleRestore = async (cat: LibraryCategory) => {
    setRestoringCategory(cat);
    setRestoreModalOpen(true);
  };

  const confirmRestore = async () => {
    if (!restoringCategory) return;
    setIsRestoring(true);
    try {
      await libraryStore.restoreCategory(restoringCategory._id);
      libraryStore.fetchCategories(undefined, true);
      setRestoreModalOpen(false);
      setRestoringCategory(null);
    } catch { /* toast */ }
    finally { setIsRestoring(false); }
  };

  const handleHardDelete = async (cat: LibraryCategory) => {
    setHardDeletingCategory(cat);
    setHardDeleteModalOpen(true);
  };

  const confirmHardDelete = async () => {
    if (!hardDeletingCategory) return;
    setIsHardDeleting(true);
    try {
      await libraryStore.hardDeleteCategory(hardDeletingCategory._id);
      setHardDeleteModalOpen(false);
      setHardDeletingCategory(null);
    } catch { /* toast */ }
    finally { setIsHardDeleting(false); }
  };

  const handleSuccess = () => {
    libraryStore.fetchCategories(undefined, statusFilter === 'deleted');
    setModalOpen(false);
    setEditingCategory(null);
  };

  // Agrupar: raíces con sus hijos, aplicar filtros
  const allCats = libraryStore.categories;

  // Filtrar por búsqueda y estado
  const filtered = allCats.filter(c => {
    const matchesSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = c.active && !c.deleted;
    else if (statusFilter === 'inactive') matchesStatus = !c.active && !c.deleted;
    else if (statusFilter === 'deleted') matchesStatus = !!c.deleted;
    else matchesStatus = !c.deleted; // 'all' = no deleted
    return matchesSearch && matchesStatus;
  });

  // Paginar
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedCats = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getChildren = (parentId: string) =>
    allCats.filter(c => {
      const pId = typeof c.parent === 'string' ? c.parent : c.parent?._id;
      return pId === parentId;
    }).sort((a, b) => a.order - b.order);

  return (
    <>
      <PageBreadcrumb pageTitle="Gestión de Categorías" />
      <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card" data-test-context="library-categories-page">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Categorías de la Biblioteca</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Administra las categorías y sub-categorías de la biblioteca documental</p>
          </div>
          <Button onClick={() => { setEditingCategory(null); setModalOpen(true); }} data-test-key="create-category-btn">
            <Plus size={16} className="mr-1" /> Nueva Categoría
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between" data-test-context="categories-filters">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Mostrar</span>
            <div className="relative z-20 bg-transparent">
              <select
                className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none h-9 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                data-test-key="items-per-page"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar categoría..."
                className="w-full py-2 pl-10 pr-4 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg h-9 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                data-test-key="search-input"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none h-9 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              data-test-key="status-filter"
            >
              <option value="all">Todos</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
              <option value="deleted">Eliminadas</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm" data-test-context="categories-table">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Categoría</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Documentos</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Tipo</th>
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">Acciones</th>
              </tr>
            </thead>
            {libraryStore.isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={5}>
                    <TableSkeleton rows={itemsPerPage} columns={5} />
                  </td>
                </tr>
              </tbody>
            ) : (
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedCats.map((cat) => (
                <CategoryRow
                  key={cat._id}
                  category={cat}
                  depth={cat.depth || 0}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  onRestore={handleRestore}
                  onHardDelete={handleHardDelete}
                  isDeletedView={statusFilter === 'deleted'}
                />
              ))}
              {paginatedCats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    {searchQuery ? 'No se encontraron resultados' : 'No hay categorías creadas'}
                  </td>
                </tr>
              )}
            </tbody>
            )}
          </table>
        </div>

        {/* Pagination + Show items — same as Employees */}
        <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 dark:border-gray-800 sm:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} entradas
          </p>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {/* Modal crear/editar */}
      <LibraryCategoryFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCategory(null); }}
        onSuccess={handleSuccess}
        category={editingCategory}
      />

      {/* Modal confirmar eliminación */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingCategory(null); }}
        onConfirm={confirmDelete}
        itemName={deletingCategory?.name || ''}
        itemType="categoría"
        isLoading={isDeleting}
      />

      {/* Modal eliminación permanente */}
      <HardDeleteModal
        isOpen={hardDeleteModalOpen}
        onClose={() => { setHardDeleteModalOpen(false); setHardDeletingCategory(null); }}
        onConfirm={confirmHardDelete}
        itemName={hardDeletingCategory?.name || ''}
        itemType="categoría"
        isLoading={isHardDeleting}
      />

      {/* Modal confirmar restauración */}
      <Modal
        isOpen={restoreModalOpen}
        onClose={() => { setRestoreModalOpen(false); setRestoringCategory(null); }}
        className="relative w-full max-w-[500px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-10 dark:bg-gray-900"
      >
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <svg className="h-7 w-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5" />
            </svg>
          </div>
          <h4 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
            ¿Restaurar esta categoría?
          </h4>
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            La categoría volverá a estar activa y visible:
          </p>
          <p className="mb-6 text-base font-semibold text-gray-900 dark:text-white">
            "{restoringCategory?.name}"
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="outline" onClick={() => { setRestoreModalOpen(false); setRestoringCategory(null); }} disabled={isRestoring}>
              Cancelar
            </Button>
            <button
              onClick={confirmRestore}
              disabled={isRestoring}
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isRestoring ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span> Restaurando...</>
              ) : (
                'Restaurar'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
});

// Row component
function CategoryRow({ category, depth, onEdit, onDelete, onToggleActive, onRestore, onHardDelete, isDeletedView }: {
  category: LibraryCategory;
  depth: number;
  onEdit: (c: LibraryCategory) => void;
  onDelete: (c: LibraryCategory) => void;
  onToggleActive: (c: LibraryCategory) => void;
  onRestore?: (c: LibraryCategory) => void;
  onHardDelete?: (c: LibraryCategory) => void;
  isDeletedView?: boolean;
}) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50" data-test-key={`category-row-${category.slug}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 24}px` }}>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${category.color || '#3B82F6'}20` }}
          >
            <LucideIconByName name={category.icon} size={16} color={category.color || '#3B82F6'} />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white line-clamp-2 break-words">{category.name}</p>
            {category.description && (
              <p className="text-xs text-gray-400 line-clamp-1">{category.description}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{category.documentsCount}</td>
      <td className="px-4 py-3">
        {category.isSystem ? (
          <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">Sistema</span>
        ) : (
          <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">Personalizada</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${category.active ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400'}`}>
          {category.active ? 'Activa' : 'Inactiva'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          {isDeletedView ? (
            <>
              {onRestore && (
                <button
                  onClick={() => onRestore(category)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-500/10"
                  title="Restaurar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                </button>
              )}
              {onHardDelete && !category.isSystem && (
                <button
                  onClick={() => onHardDelete(category)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                  title="Eliminar permanentemente"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => onToggleActive(category)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                title={category.active ? "Desactivar" : "Activar"}
              >
                {category.active ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={() => onEdit(category)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-700"
                title="Editar"
              >
                <Edit2 size={16} />
              </button>
              {!category.isSystem && (
                <button
                  onClick={() => onDelete(category)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default LibraryCategories;
