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
import SearchableSelect from "../../components/form/SearchableSelect";
// import DeleteConfirmModal from "../../components/csw/DeleteConfirmModal";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import TableSkeleton from "../../components/ui/skeleton/TableSkeleton";
import Alert from "../../components/ui/alert/Alert";
import Pagination from "../../components/ui/pagination/Pagination";
// import { useModal } from "../../hooks/useModal";
import { PencilIcon, TrashBinIcon } from "../../icons";

const CSWList = observer(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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
    const loadData = async () => {
      // Verificar autenticación primero y esperar
      await authStore.checkAuth();
      // Luego cargar los datos
      cswStore.fetchCSWs();
      cswCategoryStore.fetchCategories();
    };
    loadData();
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
    
    // Si authStore está cargando, retornar array vacío (se mostrará loading)
    if (authStore.isLoading) {
      return [];
    }
    
    // Si no hay usuario autenticado después de cargar, retornar array vacío
    if (!currentUserId && (routeConfig.filterType === "my-requests" || routeConfig.filterType === "pending")) {
      return [];
    }
    
    // Crear una copia del array para evitar mutaciones en MobX
    let filtered = csws.slice();

    // Filtro automático por ruta
    if (routeConfig.filterType === "my-requests") {
      // Solo mis solicitudes
      filtered = filtered.filter((csw) => {
        // Manejar requester como string (ID) u objeto con _id
        const requesterId = typeof csw.requester === 'string' ? csw.requester : csw.requester?._id;
        return requesterId === currentUserId;
      });
    } else if (routeConfig.filterType === "pending") {
      // Solo solicitudes pendientes donde soy aprobador
      filtered = filtered.filter((csw) => {
        if (csw.status !== ICSWStore.CSWStatus.PENDING) return false;
        // Verificar si el usuario actual es aprobador en el nivel actual
        const currentLevelApproval = csw.approvalChain.find(
          (approval) => approval.level === csw.currentLevel
        );
        // Manejar approverId como string u objeto
        const approverId = typeof currentLevelApproval?.approverId === 'string' 
          ? currentLevelApproval.approverId 
          : (currentLevelApproval?.approverId as any)?._id;
        return approverId === currentUserId &&
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

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleView = (id: string) => {
    // Navegar a la página de detalle para todas las rutas
    navigate(`/csw/view/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/csw/edit/${id}`);
  };

  const handleDelete = (id: string, requesterName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la solicitud de ${requesterName}?`)) {
      cswStore.deleteCSW(id).then(() => {
        cswStore.fetchCSWs();
      });
    }
  };

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

            {/* Error Alert */}
            {cswStore.error && (
              <Alert
                variant="error"
                title="Error"
                message={cswStore.error}
              />
            )}

            {/* Filters and Search Bar */}
            <div className="rounded-lg border border-gray-100 bg-white p-6 dark:border-white/[0.05] dark:bg-gray-dark">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Buscar por número, solicitante o descripción..."
                    className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-primary"
                  />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-end gap-3">
                  {/* Items per page */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mostrar
                    </label>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                    <span className="text-sm text-gray-500 dark:text-gray-400">entradas</span>
                  </div>

                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

                  {/* Status Filter */}
                  <div className="flex-1 min-w-[200px]">
                    <SearchableSelect
                      id="statusFilter"
                      label="Estado"
                      options={[
                        { value: "all", label: "Todos los estados" },
                        { value: ICSWStore.CSWStatus.PENDING, label: "Pendiente" },
                        { value: ICSWStore.CSWStatus.APPROVED, label: "Aprobada" },
                        { value: ICSWStore.CSWStatus.REJECTED, label: "Rechazada" },
                        { value: ICSWStore.CSWStatus.CANCELLED, label: "Cancelada" },
                      ]}
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      placeholder="Filtrar por estado..."
                      debounceMs={300}
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex-1 min-w-[200px]">
                    <SearchableSelect
                      id="categoryFilter"
                      label="Categoría"
                      options={[
                        { value: "all", label: "Todas las categorías" },
                        ...categories
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((category) => ({
                            value: category._id,
                            label: category.name,
                          })),
                      ]}
                      value={categoryFilter}
                      onChange={handleCategoryFilterChange}
                      placeholder="Filtrar por categoría..."
                      debounceMs={300}
                    />
                  </div>

                  {/* Clear Filters Button */}
                  {(searchTerm || statusFilter !== "all" || categoryFilter !== "all") && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setCategoryFilter("all");
                        setCurrentPage(1);
                      }}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Limpiar filtros
                    </button>
                  )}
                </div>

                {/* Active Filters Summary */}
                {(debouncedSearchTerm || statusFilter !== "all" || categoryFilter !== "all") && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Filtros activos:</span>
                    {debouncedSearchTerm && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Búsqueda: "{debouncedSearchTerm}"
                      </span>
                    )}
                    {statusFilter !== "all" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Estado: {statusFilter}
                      </span>
                    )}
                    {categoryFilter !== "all" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Categoría: {categories.find(c => c._id === categoryFilter)?.name || categoryFilter}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Table or Loading */}
            {(cswStore.isLoading || authStore.isLoading) ? (
              <TableSkeleton rows={itemsPerPage} columns={7} />
            ) : (
              <>

                <div className="overflow-x-auto border border-gray-100 dark:border-white/[0.05] rounded-b-xl">
                  <Table className="border-collapse">
                    <TableHeader>
                      <TableRow className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-gray-800/50">
                        <TableCell className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Número</TableCell>
                        <TableCell className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Solicitante</TableCell>
                        <TableCell className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Categoría</TableCell>
                        <TableCell className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Estado</TableCell>
                        <TableCell className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Fecha</TableCell>
                        <TableCell className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Progreso</TableCell>
                        <TableCell className="px-6 py-4 text-center align-middle text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400">Acciones</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
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
                          // Calcular progreso basado en la cadena de aprobación específica de este CSW
                          const approvalChain = csw.approvalChain || [];
                          const approved = approvalChain.filter(
                            (a) => a.status === ICSWStore.ApprovalStatus.APPROVED
                          ).length;
                          const total = approvalChain.length;
                          
                          // Calcular porcentaje de progreso
                          let progressPercent = 0;
                          if (total > 0) {
                            if (csw.status === ICSWStore.CSWStatus.APPROVED) {
                              progressPercent = 100; // Si está aprobado completamente
                            } else if (csw.status === ICSWStore.CSWStatus.REJECTED || csw.status === ICSWStore.CSWStatus.CANCELLED) {
                              progressPercent = (approved / total) * 100; // Mostrar hasta donde llegó
                            } else {
                              progressPercent = (approved / total) * 100; // Progreso actual
                            }
                          }
                          
                          const statusBadge = getStatusBadge(csw.status);
                          const categoryName = typeof csw.category === 'object' ? csw.category.name : 'Sin categoría';

                          return (
                            <TableRow key={csw._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors dark:border-white/[0.05] dark:hover:bg-gray-800/30">
                              <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-white">CSW-{csw._id}</TableCell>
                              <TableCell className="px-6 py-4">
                                <div className="space-y-1.5">
                                  <div className="font-medium text-gray-900 dark:text-white">{csw.requesterName}</div>
                                  <Badge color="info">
                                    <span className="inline-block text-xs">{csw.requesterPosition}</span>
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4 text-gray-700 dark:text-gray-300">{categoryName}</TableCell>
                              <TableCell className="px-6 py-4">
                                <Badge color={statusBadge.color}>{statusBadge.text}</Badge>
                              </TableCell>
                              <TableCell className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                {new Date(csw.createdAt).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </TableCell>
                              <TableCell className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {approved}/{total}
                                  </div>
                                  <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div
                                      className={`h-full transition-all ${
                                        csw.status === ICSWStore.CSWStatus.APPROVED 
                                          ? 'bg-green-500' 
                                          : csw.status === ICSWStore.CSWStatus.REJECTED 
                                          ? 'bg-red-500'
                                          : 'bg-primary'
                                      }`}
                                      style={{ width: `${progressPercent}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4">
                                <div className="flex items-center justify-center gap-3">
                                  <button
                                    onClick={() => handleView(csw._id)}
                                    className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.05] transition"
                                    title="Ver detalles"
                                  >
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" clipRule="evenodd" d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z" fill="currentColor"/>
                                    </svg>
                                  </button>
                                  
                                  {/* Botones de edición/eliminación para mis solicitudes (solo si NO está aprobada) */}
                                  {routeConfig.filterType === "my-requests" && csw.status !== ICSWStore.CSWStatus.APPROVED && (
                                    <>
                                      <button
                                        onClick={() => handleEdit(csw._id)}
                                        className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-white/[0.05]"
                                        title="Editar"
                                      >
                                        <PencilIcon className="h-[18px] w-[18px]" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(csw._id, csw.requesterName)}
                                        className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-white/[0.05]"
                                        title="Eliminar"
                                      >
                                        <TrashBinIcon className="h-[18px] w-[18px]" />
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
                <div className="flex flex-col gap-4 rounded-b-xl border border-t-0 border-gray-100 bg-gray-50 px-6 py-4 dark:border-white/[0.05] dark:bg-gray-800/50 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span> a <span className="font-medium text-gray-900 dark:text-white">{Math.min(endIndex, filteredCSWs.length)}</span> de <span className="font-medium text-gray-900 dark:text-white">{filteredCSWs.length}</span> resultados
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
    </>
  );
});

export default CSWList;
