import { observer } from "mobx-react-lite";
import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { cswStore, cswCategoryStore, authStore } from "../../stores/views";
import { ICSWStore } from "../../stores/views/CSWStore.contract";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
// import CSWViewModal from "../../components/csw/CSWViewModal";
// import DeleteConfirmModal from "../../components/csw/DeleteConfirmModal";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import TableSkeleton from "../../components/ui/skeleton/TableSkeleton";
import Alert from "../../components/ui/alert/Alert";
import Pagination from "../../components/ui/pagination/Pagination";
// import { useModal } from "../../hooks/useModal";
import { PencilIcon, TrashBinIcon, EyeIcon } from "../../icons";

const CSWList = observer(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  // const [viewingCSWId, setViewingCSWId] = useState<string | null>(null);
  // const [deletingCSWId, setDeletingCSWId] = useState<string | null>(null);
  // const [deletingCSWNumber, setDeletingCSWNumber] = useState("");

  // const viewModal = useModal();
  // const deleteModal = useModal();

  // Determinar configuración según la ruta
  const routeConfig = useMemo(() => {
    const path = location.pathname;
    if (path === "/csw/my-requests") {
      return {
        title: "Mis Solicitudes CSW",
        breadcrumb: "Mis Solicitudes",
        filterType: "my-requests" as const,
        showCreateButton: true,
      };
    } else if (path === "/csw/pending") {
      return {
        title: "Solicitudes Pendientes de Aprobación",
        breadcrumb: "Pendientes de Aprobación",
        filterType: "pending" as const,
        showCreateButton: false,
      };
    } else if (path === "/csw/all") {
      return {
        title: "Todas las Solicitudes CSW",
        breadcrumb: "Todas las Solicitudes",
        filterType: "all" as const,
        showCreateButton: false,
      };
    }
    return {
      title: "Solicitudes CSW",
      breadcrumb: "Solicitudes",
      filterType: "all" as const,
      showCreateButton: true,
    };
  }, [location.pathname]);

  // Debounce search term (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data on mount
  useEffect(() => {
    cswStore.fetchCSWs();
    cswCategoryStore.fetchCategories();
  }, []);

  // Status badge configuration
  const getStatusBadge = (status: ICSWStore.CSWStatus) => {
    const statusConfig = {
      [ICSWStore.CSWStatus.PENDING]: { text: "Pendiente", color: "warning" as const },
      [ICSWStore.CSWStatus.APPROVED]: { text: "Aprobada", color: "success" as const },
      [ICSWStore.CSWStatus.REJECTED]: { text: "Rechazada", color: "error" as const },
      [ICSWStore.CSWStatus.CANCELLED]: { text: "Cancelada", color: "light" as const },
    };
    return statusConfig[status] || { text: status, color: "light" as const };
  };

  // Filtered data
  const filteredCSWs = useMemo(() => {
    const csws = Array.isArray(cswStore.csws) ? cswStore.csws : [];
    const currentUserId = authStore.user?._id;
    // Crear una copia del array para evitar mutaciones en MobX
    let filtered = csws.slice();

    // Filtro automático por ruta
    if (routeConfig.filterType === "my-requests") {
      // Solo mis solicitudes
      filtered = filtered.filter((csw) => csw.requester === currentUserId);
    } else if (routeConfig.filterType === "pending") {
      // Solo solicitudes pendientes donde soy aprobador
      filtered = filtered.filter((csw) => {
        if (csw.status !== ICSWStore.CSWStatus.PENDING) return false;
        // Verificar si el usuario actual es aprobador en el nivel actual
        const currentLevelApproval = csw.approvalChain.find(
          (approval) => approval.level === csw.currentLevel
        );
        return currentLevelApproval?.approverId === currentUserId &&
               currentLevelApproval?.status === ICSWStore.ApprovalStatus.PENDING;
      });
    }
    // Si filterType === "all", no aplicar filtro automático

    // Filter by search term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (csw) =>
          csw.requesterName.toLowerCase().includes(searchLower) ||
          (typeof csw.category === 'object' && csw.category.name.toLowerCase().includes(searchLower)) ||
          csw.situation.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((csw) => csw.status === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((csw) => 
        typeof csw.category === 'string' ? csw.category === categoryFilter : csw.category._id === categoryFilter
      );
    }

    // Ordenar por fecha (más reciente primero)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [cswStore.csws, debouncedSearchTerm, statusFilter, categoryFilter, routeConfig.filterType, authStore.user]);

  // Pagination
  const totalPages = Math.ceil(filteredCSWs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCSWs.length);
  const currentData = filteredCSWs.slice(startIndex, endIndex);

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

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleView = (id: string) => {
    // Temporal: navegar a la página de edición como vista de solo lectura
    navigate(`/csw/edit/${id}`);
    // TODO: Implementar modal de vista cuando CSWViewModal esté creado
    // setViewingCSWId(id);
    // cswStore.fetchCSWById(id);
    // viewModal.openModal();
  };

  const handleEdit = (id: string) => {
    navigate(`/csw/edit/${id}`);
  };

  const handleDelete = (id: string, requestNumber: string) => {
    // TODO: Implementar modal de confirmación cuando DeleteConfirmModal esté creado
    if (window.confirm(`¿Estás seguro de eliminar la solicitud ${requestNumber}?`)) {
      cswStore.deleteCSW(id).then(() => {
        cswStore.fetchCSWs();
      });
    }
    // setDeletingCSWId(id);
    // setDeletingCSWNumber(requestNumber);
    // deleteModal.openModal();
  };

  // const handleCloseViewModal = () => {
  //   viewModal.closeModal();
  //   setViewingCSWId(null);
  // };

  // const handleCloseDeleteModal = () => {
  //   deleteModal.closeModal();
  //   setDeletingCSWId(null);
  //   setDeletingCSWNumber("");
  // };

  const categories = Array.isArray(cswCategoryStore.categories) ? cswCategoryStore.categories : [];

  return (
    <>
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle={routeConfig.breadcrumb} />

      <div className="flex flex-col gap-7.5">
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="flex flex-col gap-5.5 px-6.5 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-dark dark:text-white">
                  {routeConfig.title}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {routeConfig.filterType === "my-requests" 
                    ? "Gestiona tus solicitudes CSW y su estado de aprobación"
                    : routeConfig.filterType === "pending"
                    ? "Solicitudes que requieren tu aprobación"
                    : "Visualiza todas las solicitudes CSW del sistema"}
                </p>
              </div>
              {routeConfig.showCreateButton && (
                <Button onClick={() => navigate("/csw/new")}>
                  Crear Solicitud
                </Button>
              )}
            </div>

            {/* Indicador de Filtro Activo */}
            {routeConfig.filterType !== "all" && (
              <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-500/30 dark:bg-brand-500/10">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
                    {routeConfig.filterType === "my-requests" 
                      ? "Mostrando solo tus solicitudes" 
                      : "Mostrando solo solicitudes pendientes de tu aprobación"}
                  </p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Buscar
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Buscar por número, solicitante, categoría..."
                  className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Estado
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 pr-10 text-dark outline-none transition appearance-none focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  >
                    <option value="all">Todos los estados</option>
                    <option value={ICSWStore.CSWStatus.PENDING}>Pendiente</option>
                    <option value={ICSWStore.CSWStatus.APPROVED}>Aprobada</option>
                    <option value={ICSWStore.CSWStatus.REJECTED}>Rechazada</option>
                    <option value={ICSWStore.CSWStatus.CANCELLED}>Cancelada</option>
                  </select>
                  <span className="absolute text-gray-500 -translate-y-1/2 right-4 top-1/2 dark:text-gray-400 pointer-events-none">
                    <svg className="stroke-current" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Categoría
                </label>
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={handleCategoryFilterChange}
                    className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 pr-10 text-dark outline-none transition appearance-none focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  >
                    <option value="all">Todas las categorías</option>
                    {categories
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                  <span className="absolute text-gray-500 -translate-y-1/2 right-4 top-1/2 dark:text-gray-400 pointer-events-none">
                    <svg className="stroke-current" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {cswStore.error && (
              <Alert
                variant="error"
                title="Error"
                message={cswStore.error}
              />
            )}

            {/* Table or Loading */}
            {cswStore.isLoading ? (
              <TableSkeleton rows={itemsPerPage} columns={7} />
            ) : (
              <>
                {/* Table Header with Show selector */}
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
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableCell>Número</TableCell>
                        <TableCell>Solicitante</TableCell>
                        <TableCell>Categoría</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Progreso</TableCell>
                        <TableCell className="text-center">Acciones</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.length === 0 ? (
                        <TableRow>
                          <TableCell className="text-center py-12">
                            <div className="flex flex-col items-center justify-center gap-3 mx-auto max-w-md">
                              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                  {debouncedSearchTerm || statusFilter !== "all" || categoryFilter !== "all"
                                    ? "No se encontraron solicitudes"
                                    : "No hay solicitudes registradas"}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  {debouncedSearchTerm || statusFilter !== "all" || categoryFilter !== "all"
                                    ? "Intenta ajustar los filtros para ver más resultados"
                                    : "Crea tu primera solicitud para comenzar"}
                                </p>
                              </div>
                              {!debouncedSearchTerm && statusFilter === "all" && categoryFilter === "all" && routeConfig.showCreateButton && (
                                <Button onClick={() => navigate("/csw/new")} className="mt-2">
                                  Crear Primera Solicitud
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentData.map((csw) => {
                          const approved = csw.approvalChain.filter(
                            (a) => a.status === ICSWStore.ApprovalStatus.APPROVED
                          ).length;
                          const total = csw.approvalChain.length;
                          const statusBadge = getStatusBadge(csw.status);
                          const categoryName = typeof csw.category === 'object' ? csw.category.name : 'Sin categoría';

                          return (
                            <TableRow key={csw._id}>
                              <TableCell className="font-medium">CSW-{csw._id}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{csw.requesterName}</div>
                                  <div className="text-sm text-gray-500">{csw.requesterPosition}</div>
                                </div>
                              </TableCell>
                              <TableCell>{categoryName}</TableCell>
                              <TableCell>
                                <Badge color={statusBadge.color}>{statusBadge.text}</Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(csw.createdAt).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {approved}/{total}
                                  </div>
                                  <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div
                                      className="h-full bg-primary transition-all"
                                      style={{ width: `${(approved / total) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-3">
                                  <button
                                    onClick={() => handleView(csw._id)}
                                    className="text-primary hover:text-primary/80"
                                    title="Ver detalles"
                                  >
                                    <EyeIcon />
                                  </button>
                                  {routeConfig.filterType === "my-requests" && csw.status === ICSWStore.CSWStatus.PENDING && (
                                    <>
                                      <button
                                        onClick={() => handleEdit(csw._id)}
                                        className="text-dark hover:text-dark/80 dark:text-white dark:hover:text-white/80"
                                        title="Editar"
                                      >
                                        <PencilIcon />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(csw._id, csw.requesterName)}
                                        className="text-red hover:text-red/80"
                                        title="Eliminar"
                                      >
                                        <TrashBinIcon />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Footer */}
                <div className="flex flex-col gap-3 px-4 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredCSWs.length)} de {filteredCSWs.length} entradas
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
        </div>
      </div>

      {/* Modals - TODO: Implementar cuando los componentes estén creados */}
      {/* {viewingCSWId && (
        <CSWViewModal
          isOpen={viewModal.isOpen}
          onClose={handleCloseViewModal}
          cswId={viewingCSWId}
        />
      )}

      {deletingCSWId && (
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={handleCloseDeleteModal}
          cswId={deletingCSWId}
          cswNumber={deletingCSWNumber}
        />
      )} */}
    </>
  );
});

export default CSWList;
