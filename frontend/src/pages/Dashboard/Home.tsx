import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router';
import PageMeta from '../../utils/PageMeta';
import RHMetrics from '../../components/dashboard/RHMetrics';
import TopDivisions from '../../components/dashboard/TopDivisions';
import RecentEmployees from '../../components/dashboard/RecentEmployees';
import EmployeesByStatus from '../../components/dashboard/EmployeesByStatus';
import WeeklyProductivityChart from '../../components/dashboard/WeeklyProductivityChart';
import CurrentWeekSummary from '../../components/dashboard/CurrentWeekSummary';
import { usePermissions } from '../../hooks/usePermissions';
import { authStore } from '../../stores/views';
import apiClient from '../../api/client';

interface CSWStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const Home = observer(() => {
  const { can, canAccessResource } = usePermissions();
  const [cswStats, setCswStats] = useState<CSWStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loadingCSW, setLoadingCSW] = useState(false);
  const [myProjects, setMyProjects] = useState<any[]>([]);

  const canSeeEmployees = canAccessResource('employees');
  const canSeeDivisions = canAccessResource('divisions');
  const canSeeCSW = canAccessResource('csw');
  const canApproveCSW = can('csw', 'approve');
  const canManageHats = canAccessResource('roles');
  const isApprover = authStore.user?.approve_csw === true;
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [loadingPendingApprovals, setLoadingPendingApprovals] = useState(false);

  // Cargar stats de CSW
  useEffect(() => {
    if (canSeeCSW) {
      loadCSWStats();
    }
  }, [canSeeCSW]);

  // Cargar solicitudes pendientes de mi aprobación
  useEffect(() => {
    if (isApprover) {
      loadPendingApprovals();
    }
  }, [isApprover]);

  // Cargar mis proyectos
  useEffect(() => {
    if (canAccessResource('projects')) {
      loadMyProjects();
    }
  }, []);

  const loadMyProjects = async () => {
    try {
      const response = await apiClient.get('/projects/my-projects');
      setMyProjects(response.data?.data || []);
    } catch {
      // silenciar
    }
  };

  const loadPendingApprovals = async () => {
    setLoadingPendingApprovals(true);
    try {
      const response = await apiClient.get('/csw/my-pending');
      const pending = response.data?.data || [];
      setPendingApprovals(pending.length);
    } catch {
      // silenciar
    } finally {
      setLoadingPendingApprovals(false);
    }
  };

  const loadCSWStats = async () => {
    setLoadingCSW(true);
    try {
      const response = await apiClient.get('/csw/my-requests');
      const csws = response.data?.data || [];
      setCswStats({
        total: csws.length,
        pending: csws.filter((c: any) => c.status === 'pending').length,
        approved: csws.filter((c: any) => c.status === 'approved').length,
        rejected: csws.filter((c: any) => c.status === 'rejected').length,
      });
    } catch {
      // Si falla, dejamos en 0
    } finally {
      setLoadingCSW(false);
    }
  };

  const userDivision = authStore.user?.division?.name || 'Sin división';
  const userHat = authStore.user?.role?.name || 'Sin hat';

  return (
    <>
      <PageMeta title="Dashboard - RH UNLIMITECH" description="Sistema de Gestión de Recursos Humanos" />
      
      <div className="space-y-6">
        {/* Header con saludo */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hola, {authStore.user?.name?.split(' ')[0] || 'Usuario'} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {userHat} • {userDivision}
          </p>
        </div>

        {/* Métricas principales (Admin/HR) */}
        {(canSeeEmployees || canSeeDivisions) && <RHMetrics />}

        {/* Cards de CSW — Visible para todos los que tienen acceso a CSW */}
        {canSeeCSW && (
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isApprover ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Solicitudes</p>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-2xl font-bold text-gray-800 dark:text-white">{loadingCSW ? '...' : cswStats.total}</h4>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">En Trámite</p>
                <div className="p-2 rounded-lg bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-2xl font-bold text-warning-600 dark:text-warning-400">{loadingCSW ? '...' : cswStats.pending}</h4>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Aprobadas</p>
                <div className="p-2 rounded-lg bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-2xl font-bold text-success-600 dark:text-success-400">{loadingCSW ? '...' : cswStats.approved}</h4>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Rechazadas</p>
                <div className="p-2 rounded-lg bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-2xl font-bold text-error-600 dark:text-error-400">{loadingCSW ? '...' : cswStats.rejected}</h4>
            </div>

            {/* Pendientes de mi firma — solo aprobadores */}
            {isApprover && (
              <Link to="/csw/pending" className={`rounded-2xl border p-5 transition-colors ${
                pendingApprovals > 0
                  ? 'border-orange-200 bg-orange-50 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-900/10 dark:hover:bg-orange-900/20'
                  : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Por Firmar</p>
                  <div className={`p-2 rounded-lg ${
                    pendingApprovals > 0
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400'
                      : 'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400'
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <h4 className={`text-2xl font-bold ${
                  pendingApprovals > 0
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>{loadingPendingApprovals ? '...' : pendingApprovals}</h4>
              </Link>
            )}
          </div>
        )}

        {/* Grid de contenido principal */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 items-start">
          {/* Columna Izquierda — 2/3 */}
          <div className="xl:col-span-2 space-y-6">
            {/* Gráfica de productividad semanal */}
            <WeeklyProductivityChart />
            
            {canSeeDivisions && <TopDivisions />}
            {canSeeEmployees && <RecentEmployees />}

            {/* Info de mi división — siempre visible */}
            {!canSeeDivisions && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-3">
                  Mi División
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/15">
                    <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{userDivision}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{userHat}</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Columna Derecha — 1/3 */}
          <div className="xl:col-span-1 space-y-6">
            {/* Rendimiento esta semana */}
            <CurrentWeekSummary />

            {/* Mis Proyectos */}
            {canAccessResource('projects') && myProjects.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Mis Proyectos</h4>
                  <Link to="/projects" className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400">Ver todos →</Link>
                </div>
                <div className="space-y-2">
                  {myProjects.slice(0, 3).map((project: any) => (
                    <div key={project._id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{project.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{project.code}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        project.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-600'
                      }`}>{project.status === 'active' ? 'Activo' : project.status === 'on_hold' ? 'Pausa' : project.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {canSeeEmployees && <EmployeesByStatus />}
            
            {/* Acciones rápidas */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
                Accesos Rápidos
              </h4>
              <div className="space-y-2">
                {canSeeCSW && (
                  <Link
                    to="/csw/my-requests"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mis Solicitudes</span>
                  </Link>
                )}
                {canApproveCSW && (
                  <Link
                    to="/csw/pending"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pendientes de Aprobación</span>
                  </Link>
                )}
                {canSeeEmployees && (
                  <Link
                    to="/employees"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Directorio de Empleados</span>
                  </Link>
                )}
                {canManageHats && (
                  <Link
                    to="/roles"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gestionar Hats</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje para usuarios sin permisos */}
        {!canSeeEmployees && !canSeeDivisions && !canSeeCSW && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sin módulos asignados</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Contacta a tu administrador para obtener acceso al sistema.
            </p>
          </div>
        )}
      </div>
    </>
  );
});

export default Home;
