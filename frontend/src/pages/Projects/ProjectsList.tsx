import { observer } from "mobx-react-lite";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
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
import Pagination from "../../components/ui/pagination/Pagination";
import SearchableSelect from "../../components/form/SearchableSelect";
import apiClient from "../../api/client";
import { usePermissions } from "../../hooks/usePermissions";
import { useModal } from "../../hooks/useModal";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { notify } from "../../utils/toast";
import ProjectFormModal from "../../components/projects/ProjectFormModal";
import DeleteConfirmModal from "../../components/hats/DeleteConfirmModal";

interface Project {
  _id: string;
  name: string;
  code: string;
  description?: string;
  status: "active" | "on_hold" | "completed" | "cancelled";
  divisionId?: { _id: string; name: string; code: string };
  members?: { _id: string; name: string; email: string; photo?: string }[];
  leadId?: { _id: string; name: string; email: string };
  startDate?: string;
  endDate?: string;
}

const statusColors: Record<string, "success" | "warning" | "info" | "error"> = {
  active: "success",
  on_hold: "warning",
  completed: "info",
  cancelled: "error",
};

const statusLabels: Record<string, string> = {
  active: "Activo",
  on_hold: "En Pausa",
  completed: "Completado",
  cancelled: "Cancelado",
};

const statusOptions = [
  { value: "", label: "Todos los estados" },
  { value: "active", label: "Activo" },
  { value: "on_hold", label: "En Pausa" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];

const ProjectsList = observer(() => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canCreate = can("projects", "create");
  const canUpdate = can("projects", "update");
  const canDelete = can("projects", "delete");

  const createModal = useModal();
  const deleteModal = useModal();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState("");

  useEffect(() => { loadProjects(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const endpoint = canUpdate ? "/projects" : "/projects/my-projects";
      const response = await apiClient.get(endpoint);
      setProjects(response.data?.data || []);
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    let filtered = projects;
    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s)
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    return filtered;
  }, [projects, debouncedSearch, statusFilter]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProjects.length);
  const currentData = filteredProjects.slice(startIndex, endIndex);

  const handleView = (id: string) => navigate(`/projects/${id}`);
  const handleEdit = (id: string) => { setEditingProjectId(id); createModal.openModal(); };
  const handleDelete = (id: string, name: string) => { setDeletingId(id); setDeletingName(name); deleteModal.openModal(); };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await apiClient.delete(`/projects/${deletingId}`);
      notify.success("Proyecto eliminado exitosamente");
      loadProjects();
    } catch (err: any) {
      notify.error(err.response?.data?.message || "Error al eliminar proyecto");
    } finally {
      deleteModal.closeModal();
      setDeletingId(null);
      setDeletingName("");
    }
  };

  const handleCreateSuccess = () => {
    createModal.closeModal();
    setEditingProjectId(null);
    loadProjects();
  };

  return (
    <div className="flex flex-col gap-6" data-test-context="projects-list">
      <PageBreadcrumb pageTitle="Proyectos" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Proyectos
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona los proyectos activos y sus equipos
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => { setEditingProjectId(null); createModal.openModal(); }} className="flex items-center gap-2" data-test-key="create-project-button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Nuevo Proyecto
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03]">
        {/* Header */}
        <div className="flex flex-col gap-3 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Mostrar</span>
            <select
              className="py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none h-9 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
            </select>
            <span className="text-gray-500 dark:text-gray-400 text-sm">registros</span>

            {/* Filtro de estado */}
            <div className="w-[180px]">
              <SearchableSelect
                id="status-filter"
                options={statusOptions}
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
                placeholder="Estado..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar proyectos..."
                data-test-key="search-input"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 xl:w-[250px]"
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-8 text-center border border-gray-100 dark:border-white/[0.05]">
            <div className="w-8 h-8 border-4 border-gray-300 rounded-full border-t-brand-600 animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Cargando proyectos...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center border border-gray-100 dark:border-white/[0.05]">
            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No hay proyectos</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter ? "No se encontraron resultados con esos filtros" : "No tienes proyectos asignados"}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && filteredProjects.length > 0 && (
          <>
            <div className="max-w-full overflow-x-auto border border-gray-100 dark:border-white/[0.05]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Código</TableCell>
                    <TableCell isHeader className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Proyecto</TableCell>
                    <TableCell isHeader className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">División</TableCell>
                    <TableCell isHeader className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Equipo</TableCell>
                    <TableCell isHeader className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Estado</TableCell>
                    <TableCell isHeader className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Acciones</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((project) => (
                    <TableRow key={project._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <TableCell className="py-3.5 px-4 sm:px-6">
                        <span className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">{project.code}</span>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 sm:px-6">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{project.name}</p>
                        {project.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[250px]">{project.description}</p>}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 sm:px-6">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{project.divisionId?.name || "—"}</span>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 sm:px-6">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center -space-x-2">
                            {(project.members || []).slice(0, 5).map((m) => (
                              <div key={m._id} className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-xs font-medium text-brand-700 dark:text-brand-300 border-2 border-white dark:border-gray-900" title={m.name}>
                                {m.name.charAt(0)}
                              </div>
                            ))}
                            {(project.members?.length || 0) > 5 && (
                              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white dark:border-gray-900">+{(project.members?.length || 0) - 5}</div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{project.members?.length || 0}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 sm:px-6 text-center">
                        <Badge color={statusColors[project.status] || "info"}>{statusLabels[project.status] || project.status}</Badge>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleView(project._id)} className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]" title="Ver detalle" data-test-key="view-button">
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" clipRule="evenodd" d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z" fill="currentColor"/>
                            </svg>
                          </button>
                          {canUpdate && (
                            <button onClick={() => handleEdit(project._id)} className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-white/[0.05]" title="Editar" data-test-key="edit-button">
                              <PencilIcon className="h-[18px] w-[18px]" />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDelete(project._id, project.name)} className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-white/[0.05]" title="Eliminar" data-test-key="delete-button">
                              <TrashBinIcon className="h-[18px] w-[18px]" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="border border-t-0 border-gray-100 dark:border-white/[0.05] rounded-b-xl">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => { if (p >= 1 && p <= totalPages) setCurrentPage(p); }} startIndex={startIndex + 1} endIndex={endIndex} totalItems={filteredProjects.length} />
            </div>
          </>
        )}
      </div>

      {/* Modal Crear/Editar */}
      <ProjectFormModal
        isOpen={createModal.isOpen}
        onClose={() => { createModal.closeModal(); setEditingProjectId(null); }}
        onSuccess={handleCreateSuccess}
        projectId={editingProjectId}
      />

      {/* Modal Eliminar */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
        itemName={deletingName}
        warningMessage="El proyecto será eliminado permanentemente."
      />
    </div>
  );
});

export default ProjectsList;
