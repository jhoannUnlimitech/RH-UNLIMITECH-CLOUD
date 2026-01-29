import { observer } from "mobx-react-lite";
import { useEffect, useState, useMemo } from "react";
import { cswCategoryStore } from "../../stores/views";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import CSWCategoryFormModal from "../../components/cswCategories/CSWCategoryFormModal";
import DeleteConfirmModal from "../../components/cswCategories/DeleteConfirmModal";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import TableSkeleton from "../../components/ui/skeleton/TableSkeleton";
import Alert from "../../components/ui/alert/Alert";
import Pagination from "../../components/ui/pagination/Pagination";
import { useModal } from "../../hooks/useModal";
import { PencilIcon, TrashBinIcon } from "../../icons";

const CSWCategoriesList = observer(() => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [deletingCategoryName, setDeletingCategoryName] = useState("");

  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // Debounce search term (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch categories on mount
  useEffect(() => {
    cswCategoryStore.fetchCategories();
  }, []);

  // Filtered data
  const filteredCategories = useMemo(() => {
    const categories = Array.isArray(cswCategoryStore.categories) ? cswCategoryStore.categories : [];
    let filtered = categories;

    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(searchLower) ||
          (category.description && category.description.toLowerCase().includes(searchLower))
      );
    }

    return [...filtered].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }, [cswCategoryStore.categories, debouncedSearchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCategories.length);
  const currentData = filteredCategories.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (id: string) => {
    setEditingCategoryId(id);
    editModal.openModal();
  };

  const handleDelete = (id: string, name: string) => {
    setDeletingCategoryId(id);
    setDeletingCategoryName(name);
    deleteModal.openModal();
  };

  const handleCloseEditModal = () => {
    editModal.closeModal();
    setEditingCategoryId(null);
  };

  const confirmDelete = async () => {
    if (!deletingCategoryId) return;

    try {
      await cswCategoryStore.deleteCategory(deletingCategoryId);
      deleteModal.closeModal();
      setDeletingCategoryId(null);
      setDeletingCategoryName("");
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Categorías CSW" />

      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Categorías CSW
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona las categorías para las solicitudes de cambio
          </p>
        </div>
        <Button onClick={createModal.openModal} className="w-full sm:w-auto">
          Crear Categoría
        </Button>
      </div>

      {/* Error Alert */}
      {cswCategoryStore.error && (
        <div className="mb-4">
          <Alert
            variant="error"
            title="Error"
            message={cswCategoryStore.error}
            onClose={cswCategoryStore.clearError}
          />
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white dark:bg-dark-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Search and filters */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {cswCategoryStore.isLoading && <TableSkeleton rows={5} columns={5} />}

        {/* Empty State */}
        {!cswCategoryStore.isLoading && (!cswCategoryStore.categories || cswCategoryStore.categories.length === 0) && (
          <div className="text-center py-12 px-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <h3 className="mt-2 text-theme-sm font-medium text-gray-900 dark:text-white">
              No hay categorías
            </h3>
            <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
              Comienza creando una nueva categoría.
            </p>
          </div>
        )}

        {/* Table */}
        {!cswCategoryStore.isLoading && currentData.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell
                      isHeader
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Orden
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Nombre
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Descripción
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Estado
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {currentData.map((category) => (
                    <TableRow
                      key={category._id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      <TableCell className="py-3.5 px-4 sm:px-6">
                        <span className="font-mono text-theme-sm text-gray-700 dark:text-gray-300">
                          {category.order}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 sm:px-6">
                        <span className="font-medium text-theme-sm text-gray-900 dark:text-white">
                          {category.name}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 sm:px-6">
                        <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                          {category.description || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 sm:px-6">
                        <Badge color={category.active ? "success" : "light"}>
                          {category.active ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEdit(category._id)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-white/[0.05]"
                            title="Editar"
                          >
                            <PencilIcon className="h-[18px] w-[18px]" />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id, category.name)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-white/[0.05]"
                            title="Eliminar"
                          >
                            <TrashBinIcon className="h-[18px] w-[18px]" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-100 dark:border-gray-800">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                startIndex={startIndex + 1}
                endIndex={endIndex}
                totalItems={filteredCategories.length}
              />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <CSWCategoryFormModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        onSuccess={() => {
          createModal.closeModal();
          cswCategoryStore.fetchCategories();
        }}
      />

      {editingCategoryId && (
        <CSWCategoryFormModal
          isOpen={editModal.isOpen}
          onClose={handleCloseEditModal}
          categoryId={editingCategoryId}
          onSuccess={() => {
            handleCloseEditModal();
            cswCategoryStore.fetchCategories();
          }}
        />
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
        categoryName={deletingCategoryName}
        isDeleting={cswCategoryStore.isDeleting}
      />
    </div>
  );
});

export default CSWCategoriesList;
