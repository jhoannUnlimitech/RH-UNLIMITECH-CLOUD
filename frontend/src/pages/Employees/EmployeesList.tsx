import { observer } from "mobx-react-lite";
import { useEffect, useState, useMemo } from "react";
import { employeesStore } from "../../stores/views";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import EmployeeFormModal from "../../components/employees/EmployeeFormModal";
import DeleteConfirmModal from "../../components/employees/DeleteConfirmModal";
import ViewEmployeeModal from "../../components/employees/ViewEmployeeModal";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import TableSkeleton from "../../components/ui/skeleton/TableSkeleton";
import Alert from "../../components/ui/alert/Alert";
import Pagination from "../../components/ui/pagination/Pagination";
import { useModal } from "../../hooks/useModal";
import { PencilIcon, TrashBinIcon, EyeIcon } from "../../icons";
import { getCountryName } from "../../utils/countries";
import { IEmployee } from "../../api/services/employees";

const EmployeesList = observer(() => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingEmployeeName, setDeletingEmployeeName] = useState<string>("");
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | undefined>(undefined);
  const [viewingEmployee, setViewingEmployee] = useState<IEmployee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();
  const viewModal = useModal();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    employeesStore.fetchEmployees();
  }, []);

  // Debounce para el buscador (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filtrado y ordenamiento
  const filteredEmployees = useMemo(() => {
    const employees = Array.isArray(employeesStore.employees) ? employeesStore.employees : [];
    let filtered = employees;
    
    // Aplicar filtro de búsqueda con debounce
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(employee =>
        employee.name?.toLowerCase().includes(searchLower) ||
        employee.email?.toLowerCase().includes(searchLower) ||
        employee.nationalId?.toLowerCase().includes(searchLower) ||
        (employee.role?.name && employee.role.name.toLowerCase().includes(searchLower)) ||
        (employee.division?.name && employee.division.name.toLowerCase().includes(searchLower))
      );
    }
    
    // Ordenar por nombre
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [employeesStore.employees, debouncedSearchTerm]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredEmployees.length);
  const currentData = filteredEmployees.slice(startIndex, endIndex);

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
    setDeletingEmployeeName(name);
    deleteModal.openModal();
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    
    try {
      await employeesStore.deleteEmployee(deletingId);
      await employeesStore.fetchEmployees();
    } catch (error) {
      // El error ya se maneja en el store
    } finally {
      deleteModal.closeModal();
      setDeletingId(null);
      setDeletingEmployeeName("");
    }
  };

  const handleEdit = (id: string) => {
    setEditingEmployeeId(id);
    editModal.openModal();
  };

  const handleCloseEditModal = () => {
    editModal.closeModal();
    setEditingEmployeeId(undefined);
  };

  const handleView = (employee: IEmployee) => {
    setViewingEmployee(employee);
    viewModal.openModal();
  };

  const handleCloseViewModal = () => {
    viewModal.closeModal();
    setViewingEmployee(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Lista de Empleados" />
      
      {/* Error Display */}
      {employeesStore.error && (
        <Alert
          variant="error"
          title="Error"
          message={employeesStore.error}
          onClose={() => employeesStore.clearError()}
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
                placeholder="Buscar empleados..."
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
              Nuevo Empleado
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {employeesStore.isLoading && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            <TableSkeleton rows={itemsPerPage} columns={8} />
          </div>
        )}

        {/* Empty State */}
        {!employeesStore.isLoading && filteredEmployees.length === 0 && (
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <p className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              No hay empleados
            </p>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? "No se encontraron resultados para tu búsqueda" : "Comienza creando tu primer empleado"}
            </p>
            {!searchTerm && (
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
                Nuevo Empleado
              </Button>
            )}
          </div>
        )}

        {/* Table */}
        {!employeesStore.isLoading && filteredEmployees.length > 0 && (
          <>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Empleado
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Contacto
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Rol & División
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Identificación
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Nacionalidad
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
                  {currentData.map((employee) => (
                  <TableRow
                    key={employee._id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        {employee.photo ? (
                          <img
                            src={employee.photo}
                            alt={employee.name}
                            className="object-cover w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
                            <span className="text-sm font-semibold">
                              {employee.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-theme-sm text-gray-900 dark:text-white truncate">
                            {employee.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-theme-sm text-gray-700 dark:text-gray-300">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs truncate">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-theme-sm text-gray-700 dark:text-gray-300">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-xs">{employee.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <div className="space-y-1.5">
                        <Badge color="info" className="inline-block">
                          {employee.role?.name || 'Sin rol'}
                        </Badge>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {employee.division?.name || 'Sin división'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                          <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                            {employee.nationalId}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <span className="text-theme-sm text-gray-700 dark:text-gray-300">
                        {getCountryName(employee.nationality)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleView(employee)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.05] transition"
                          title="Ver detalles"
                        >
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z" fill="currentColor"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(employee._id)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-white/[0.05]"
                          title="Editar"
                        >
                          <PencilIcon className="h-[18px] w-[18px]" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee._id, employee.name)}
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
                totalItems={filteredEmployees.length}
              />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <EmployeeFormModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        onSuccess={() => {
          createModal.closeModal();
          employeesStore.fetchEmployees();
        }}
      />

      {editingEmployeeId && (
        <EmployeeFormModal
          isOpen={editModal.isOpen}
          onClose={handleCloseEditModal}
          onSuccess={() => {
            handleCloseEditModal();
            employeesStore.fetchEmployees();
          }}
          employeeId={editingEmployeeId}
        />
      )}

      <ViewEmployeeModal
        isOpen={viewModal.isOpen}
        onClose={handleCloseViewModal}
        employee={viewingEmployee}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
        itemName={deletingEmployeeName}
        itemType="empleado"
        isLoading={employeesStore.isLoading}
      />
    </div>
  );
});

export default EmployeesList;
