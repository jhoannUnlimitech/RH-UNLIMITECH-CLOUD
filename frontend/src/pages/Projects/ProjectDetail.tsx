import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import apiClient from "../../api/client";

interface ProjectDetail {
  _id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  divisionId?: { _id: string; name: string; code: string };
  members?: { _id: string; name: string; email: string; photo?: string; role?: any; division?: any }[];
  leadId?: { _id: string; name: string; email: string; photo?: string };
  repositories?: { name: string; url: string; type: string }[];
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

const statusLabels: Record<string, string> = { active: "Activo", on_hold: "En Pausa", completed: "Completado", cancelled: "Cancelado" };
const statusColors: Record<string, "success" | "warning" | "info" | "error"> = { active: "success", on_hold: "warning", completed: "info", cancelled: "error" };

const ProjectDetailPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/projects/${id}`);
      setProject(res.data?.data || null);
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageBreadcrumb pageTitle="Detalle del Proyecto" />
        <div className="p-12 text-center">
          <div className="w-10 h-10 border-4 border-gray-300 rounded-full border-t-brand-600 animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col gap-6">
        <PageBreadcrumb pageTitle="Proyecto no encontrado" />
        <div className="p-12 text-center">
          <p className="text-gray-500">El proyecto no existe o no tienes acceso.</p>
          <Button onClick={() => navigate("/projects")} className="mt-4">Volver a Proyectos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb pageTitle={project.name} />

      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h2>
              <Badge color={statusColors[project.status] || "info"}>{statusLabels[project.status] || project.status}</Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{project.code}</p>
            {project.description && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{project.description}</p>}
          </div>
          <Button variant="outline" onClick={() => navigate("/projects")}>← Volver</Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1">División</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">{project.divisionId?.name || "—"}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1">Líder</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">{project.leadId?.name || "Sin asignar"}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1">Miembros</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">{project.members?.length || 0} personas</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1">Inicio</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            {project.startDate ? new Date(project.startDate).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" }) : "—"}
          </p>
        </div>
      </div>

      {/* Links asociados */}
      {project.repositories && project.repositories.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Links asociados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.repositories.map((repo: any, idx: number) => (
              <a
                key={idx}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-brand-300 hover:bg-brand-50/50 dark:hover:border-brand-800 dark:hover:bg-brand-900/10 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{repo.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{repo.url}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de miembros */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Equipo del Proyecto</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Personas asignadas a este proyecto</p>
        </div>

        {(project.members?.length || 0) > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nombre</TableCell>
                <TableCell isHeader className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                <TableCell isHeader className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Hat</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.members!.map((member) => (
                <TableRow key={member._id} className="border-b border-gray-100 dark:border-gray-800">
                  <TableCell className="py-3 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-sm font-medium text-brand-700 dark:text-brand-300">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{member.name}</span>
                      {project.leadId?._id === member._id && (
                        <Badge color="warning">Líder</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 sm:px-6">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{member.email}</span>
                  </TableCell>
                  <TableCell className="py-3 px-4 sm:px-6">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{member.role?.name || "—"}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-gray-500">No hay miembros asignados</div>
        )}
      </div>
    </div>
  );
});

export default ProjectDetailPage;
