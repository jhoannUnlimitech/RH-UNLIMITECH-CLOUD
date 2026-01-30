import { observer } from "mobx-react-lite";
import { useEffect, useState, useMemo } from "react";
import { divisionsStore } from "../../stores/views";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import DivisionFormModal from "../../components/divisions/DivisionFormModal";
import DivisionViewModal from "../../components/divisions/DivisionViewModal";
import DeleteConfirmModal from "../../components/divisions/DeleteConfirmModal";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import TableSkeleton from "../../components/ui/skeleton/TableSkeleton";
import Alert from "../../components/ui/alert/Alert";
import Pagination from "../../components/ui/pagination/Pagination";
import { useModal } from "../../hooks/useModal";
import { PencilIcon, TrashBinIcon } from "../../icons";

const DivisionsList = observer(() => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingDivisionName, setDeletingDivisionName] = useState<string>("");
  const [editingDivisionId, setEditingDivisionId] = useState<string | undefined>(undefined);
  const [viewingDivisionId, setViewingDivisionId] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const createModal = useModal();
  const editModal = useModal();
  const viewModal = useModal();
  const deleteModal = useModal();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    divisionsStore.fetchDivisions();
  }, []);

  // Debounce para el buscador (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filtrado y ordenamiento
  const filteredDivisions = useMemo(() => {
    const divisions = Array.isArray(divisionsStore.divisions) ? divisionsStore.divisions : [];
    let filtered = divisions;
    
    // Aplicar filtro de búsqueda con debounce
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(division =>
        division.name?.toLowerCase().includes(searchLower) ||
        division.code?.toLowerCase().includes(searchLower) ||
        (division.manager?.name && division.manager.name.toLowerCase().includes(searchLower)) ||
        (division.description && division.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Ordenar por nombre
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [divisionsStore.divisions, debouncedSearchTerm]);

  const totalPages = Math.ceil(filteredDivisions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredDivisions.length);
  const currentData = filteredDivisions.slice(startIndex, endIndex);

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

  const handleDelete = async (id: string, name: string) => {
    setDeletingId(id);
    setDeletingDivisionName(name);
    deleteModal.openModal();
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    
    try {
      await divisionsStore.deleteDivision(deletingId);
      await divisionsStore.fetchDivisions();
    } catch (error) {
      // El error ya se maneja en el store
    } finally {
      deleteModal.closeModal();
      setDeletingId(null);
      setDeletingDivisionName("");
    }
  };

  const handleEdit = (id: string) => {
    setEditingDivisionId(id);
    editModal.openModal();
  };

  const handleView = (id: string) => {
    setViewingDivisionId(id);
    viewModal.openModal();
  };

  const handleCloseEditModal = () => {
    editModal.closeModal();
    setEditingDivisionId(undefined);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Divisiones" />
      
      {/* Error Display */}
      {divisionsStore.error && (
        <Alert
          variant="error"
          title="Error"
          message={divisionsStore.error}
          onClose={() => divisionsStore.clearError()}
        />
      )}

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03]">
        {/* Table Header with Controls */}
        <div className="flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
            <span className="text-gray-500 dark:text-gray-400">Show</span>
            <div className="relative z-20 bg-transparent">
              <select
                className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none h-9 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value="5" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">5</option>
                <option value="10" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">10</option>
                <option value="25" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">25</option>
                <option value="50" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">50</option>
              </select>
              <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
                <svg
                  className="stroke-current"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                    stroke=""
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">entries</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <button className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400">
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                    fill=""
                  />
                </svg>
              </button>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar divisiones..."
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
              />
            </div>
            <Button onClick={createModal.openModal}>
              <svg
                className="mr-2"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 5V15M5 10H15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Nueva División
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {divisionsStore.isLoading && (
          <TableSkeleton rows={5} columns={6} />
        )}

        {/* Empty State */}
        {!divisionsStore.isLoading && divisionsStore.divisions.length === 0 && (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-theme-sm font-medium text-gray-900 dark:text-white">
              No hay divisiones
            </h3>
            <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
              Comienza creando una nueva división.
            </p>
            <div className="mt-6">
              <Button onClick={createModal.openModal}>
                <svg
                  className="mr-2"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 5V15M5 10H15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Nueva División
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        {!divisionsStore.isLoading && filteredDivisions.length > 0 && (
          <>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Código
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
                      Representante
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
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 text-center"
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {currentData.map((division) => (
                  <TableRow
                    key={division._id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <span className="font-mono font-medium text-theme-sm text-gray-900 dark:text-white">
                        {division.code}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <span className="font-medium text-theme-sm text-gray-900 dark:text-white">
                        {division.name}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      {division.manager ? (
                        <div className="flex items-center gap-2">
                          {division.manager.photo ? (
                            <img
                              src={division.manager.photo}
                              alt={division.manager.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                {division.manager.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-theme-sm text-gray-900 dark:text-white">
                              {division.manager.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {division.manager.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                          Sin asignar
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                        {division.description || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <Badge
                        color={division.status === "active" ? "success" : "light"}
                      >
                        {division.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleView(division._id)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.05] transition"
                          title="Ver detalles"
                        >
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z" fill="currentColor"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(division._id)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-white/[0.05]"
                          title="Editar"
                        >
                          <PencilIcon className="h-[18px] w-[18px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(division._id, division.name)}
                          disabled={deletingId === division._id}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar"
                        >
                          {deletingId === division._id ? (
                            <div className="animate-spin rounded-full h-[18px] w-[18px] border-b-2 border-red-600"></div>
                          ) : (
                            <TrashBinIcon className="h-[18px] w-[18px]" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col gap-3 px-4 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredDivisions.length)} de {filteredDivisions.length} entradas
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
        )}
      </div>

      {/* Modals */}
      <DivisionFormModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
      />
      <DivisionFormModal
        isOpen={editModal.isOpen}
        onClose={handleCloseEditModal}
        divisionId={editingDivisionId}
      />
      <DivisionViewModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
        divisionId={viewingDivisionId}
      />
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.closeModal();
          setDeletingId(null);
          setDeletingDivisionName("");
        }}
        onConfirm={confirmDelete}
        divisionName={deletingDivisionName}
        isDeleting={!!deletingId && divisionsStore.isLoading}
      />
    </div>
  );
});

export default DivisionsList;
