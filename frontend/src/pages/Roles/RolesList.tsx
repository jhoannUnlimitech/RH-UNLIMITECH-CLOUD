import { observer } from "mobx-react-lite";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { rolesStore } from "../../stores/views";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import TableSkeleton from "../../components/ui/skeleton/TableSkeleton";
import Alert from "../../components/ui/alert/Alert";
import Pagination from "../../components/ui/pagination/Pagination";
import { useModal } from "../../hooks/useModal";
import DeleteConfirmModal from "../../components/roles/DeleteConfirmModal";
import { PencilIcon, TrashBinIcon } from "../../icons";

const RolesList = observer(() => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingRoleName, setDeletingRoleName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const deleteModal = useModal();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    rolesStore.fetchRoles();
  }, []);

  // Debounce para el buscador (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filtrado y ordenamiento
  const filteredRoles = useMemo(() => {
    const roles = Array.isArray(rolesStore.roles) ? rolesStore.roles : [];
    let filtered = roles;
    
    // Aplicar filtro de búsqueda con debounce
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(role =>
        role.name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Ordenar por nombre
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [rolesStore.roles, debouncedSearchTerm]);

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRoles.length);
  const currentData = filteredRoles.slice(startIndex, endIndex);

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
    setDeletingRoleName(name);
    deleteModal.openModal();
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    
    try {
      await rolesStore.deleteRole(deletingId);
      await rolesStore.fetchRoles();
    } catch (error) {
      // El error ya se maneja en el store
    } finally {
      deleteModal.closeModal();
      setDeletingId(null);
      setDeletingRoleName("");
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/roles/edit/${id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Lista de Roles" />
      
      {/* Error Display */}
      {rolesStore.error && (
        <Alert
          variant="error"
          title="Error"
          message={rolesStore.error}
          onClose={() => rolesStore.clearError()}
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
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.2929 5.79289C4.68342 5.40237 5.31659 5.40237 5.70711 5.79289L8.00001 8.08579L10.2929 5.79289C10.6834 5.40237 11.3166 5.40237 11.7071 5.79289C12.0976 6.18342 12.0976 6.81658 11.7071 7.20711L8.7071 10.2071C8.31658 10.5976 7.68342 10.5976 7.29289 10.2071L4.29289 7.20711C3.90237 6.81658 3.90237 6.18342 4.29289 5.79289Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">entries</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar roles..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full sm:w-64 h-9 rounded-lg border border-gray-300 appearance-none px-4 py-2 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
              />
              <span className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 14L11.1 11.1M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>

            {/* New Role Button */}
            <Button onClick={() => navigate('/roles/new')}>
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
              Nuevo Rol
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {rolesStore.isLoading && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            <TableSkeleton rows={itemsPerPage} columns={4} />
          </div>
        )}

        {/* Empty State */}
        {!rolesStore.isLoading && filteredRoles.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center border-t border-gray-100 dark:border-gray-800">
            <svg
              className="w-12 h-12 mb-4 text-gray-400 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <p className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              No hay roles
            </p>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? "No se encontraron resultados para tu búsqueda" : "Comienza creando tu primer rol"}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/roles/new')}>
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
                Nuevo Rol
              </Button>
            )}
          </div>
        )}

        {/* Table */}
        {!rolesStore.isLoading && filteredRoles.length > 0 && (
          <>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Nombre del Rol
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Permisos
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Empleados
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
                  {currentData.map((role) => (
                  <TableRow
                    key={role._id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-gradient-to-br from-brand-500 to-brand-600">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-theme-sm text-gray-900 dark:text-white">
                            {role.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <Badge color="info">
                        {role.permissions?.length || 0} permisos
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <span className="text-theme-sm text-gray-700 dark:text-gray-300">
                        {role.employeesCount || 0} empleados
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(role._id)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-white/[0.05]"
                          title="Editar"
                        >
                          <PencilIcon className="h-[18px] w-[18px]" />
                        </button>
                        <button
                          onClick={() => handleDelete(role._id, role.name)}
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
                totalItems={filteredRoles.length}
              />
            </div>
          </>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
        itemName={deletingRoleName}
        warningMessage="Si hay empleados asignados a este rol, no se podrá eliminar."
      />
    </div>
  );
});

export default RolesList;
