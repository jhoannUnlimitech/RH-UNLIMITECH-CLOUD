import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Users, Clock, TrendingUp, AlertTriangle, CheckCircle2, XCircle, BookOpen,
  Award, BarChart3, PieChart, Bell,
} from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import apiClient from "../../api/client";
import { notify } from "../../utils/toast";

/**
 * TrainingDashboard — Dashboard del encargado de Training.
 *
 * Muestra: KPIs, distribución por nivel, horas semanales, alertas accionables.
 */

interface Overview {
  totalEmployeesInTraining: number;
  totalStudyHoursThisQuarter: number;
  averageStudyHoursPerEmployee: number;
  examPassRate: number;
  employeesWithoutReportThisWeek: number;
  pendingEvaluations: number;
  pendingBonuses: number;
  completedLevelsThisMonth: number;
}

interface LevelDist {
  levelName: string;
  count: number;
  percentage: number;
}

interface WeekHours {
  week: string;
  totalHours: number;
  reportCount: number;
}

interface Alert {
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  count: number;
  data?: any[];
}

const TrainingDashboard = observer(() => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [levels, setLevels] = useState<LevelDist[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<WeekHours[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [ov, lv, wh, al] = await Promise.all([
        apiClient.get<{ success: boolean; data: Overview }>('/training/dashboard/overview'),
        apiClient.get<{ success: boolean; data: LevelDist[] }>('/training/dashboard/by-level'),
        apiClient.get<{ success: boolean; data: WeekHours[] }>('/training/dashboard/study-hours'),
        apiClient.get<{ success: boolean; data: Alert[] }>('/training/dashboard/alerts'),
      ]);
      setOverview(ov.data.data);
      setLevels(lv.data.data);
      setWeeklyHours(wh.data.data);
      setAlerts(al.data.data);
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al cargar dashboard');
    } finally { setLoading(false); }
  };

  if (loading) {
    return (
      <>
        <PageBreadcrumb pageTitle="Dashboard Training" />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Dashboard Training" />
      <div className="space-y-6" data-test-context="training-dashboard">

        {/* KPI Cards */}
        {overview && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-test-context="kpi-cards">
            <KpiCard icon={Users} label="Empleados en Training" value={overview.totalEmployeesInTraining} color="brand" />
            <KpiCard icon={Clock} label="Horas este trimestre" value={`${overview.totalStudyHoursThisQuarter}h`} color="green" />
            <KpiCard icon={TrendingUp} label="Tasa aprobación" value={`${overview.examPassRate}%`} color="blue" />
            <KpiCard icon={AlertTriangle} label="Sin reporte esta semana" value={overview.employeesWithoutReportThisWeek} color="orange" />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Distribución por nivel */}
          <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark" data-test-context="level-distribution">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
              <PieChart size={18} className="text-brand-500" /> Distribución por Nivel
            </h3>
            {levels.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {levels.map(l => (
                  <div key={l.levelName} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 dark:text-gray-200">{l.levelName}</span>
                        <span className="text-xs text-gray-500">{l.count} ({l.percentage}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                        <div className="h-2 rounded-full bg-brand-500" style={{ width: `${l.percentage}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Horas por semana */}
          <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark" data-test-context="weekly-hours">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
              <BarChart3 size={18} className="text-green-500" /> Horas de Estudio por Semana
            </h3>
            {weeklyHours.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">Sin datos de las últimas 8 semanas</p>
            ) : (
              <div className="space-y-2">
                {weeklyHours.map(w => {
                  const maxHours = Math.max(...weeklyHours.map(x => x.totalHours), 1);
                  return (
                    <div key={w.week} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-gray-500 font-mono">{w.week}</span>
                      <div className="flex-1 h-5 rounded bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                        <div className="h-full rounded bg-green-400 dark:bg-green-500" style={{ width: `${(w.totalHours / maxHours) * 100}%` }} />
                        <span className="absolute inset-0 flex items-center pl-2 text-[10px] font-medium text-gray-700">{w.totalHours}h</span>
                      </div>
                      <span className="w-12 text-xs text-gray-400 text-right">{w.reportCount}r</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Alertas */}
        <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark" data-test-context="alerts-section">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
            <Bell size={18} className="text-orange-500" /> Alertas ({alerts.length})
          </h3>
          {alerts.length === 0 ? (
            <div className="flex items-center gap-3 py-6 text-sm text-gray-400">
              <CheckCircle2 size={20} className="text-green-400" /> Sin alertas — todo en orden
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div key={i} className={`flex items-start gap-3 rounded-lg p-3 ${
                  alert.severity === 'high' ? 'bg-red-50 dark:bg-red-500/5' :
                  alert.severity === 'medium' ? 'bg-orange-50 dark:bg-orange-500/5' :
                  'bg-gray-50 dark:bg-gray-800'
                }`} data-test-key={`alert-${alert.type}`}>
                  <div className={`mt-0.5 ${
                    alert.severity === 'high' ? 'text-red-500' :
                    alert.severity === 'medium' ? 'text-orange-500' : 'text-gray-400'
                  }`}>
                    {alert.severity === 'high' ? <XCircle size={18} /> : <AlertTriangle size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{alert.message}</p>
                    {alert.data && alert.data.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {alert.data.slice(0, 5).map((d, j) => (
                          <span key={j} className="rounded bg-white px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            {d.name || d.employeeName || d.examTitle || '...'}
                          </span>
                        ))}
                        {alert.data.length > 5 && <span className="text-[10px] text-gray-400">+{alert.data.length - 5} más</span>}
                      </div>
                    )}
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-200">{alert.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional KPIs row */}
        {overview && (
          <div className="grid gap-4 sm:grid-cols-3" data-test-context="secondary-kpis">
            <KpiCard icon={BookOpen} label="Evaluaciones pendientes" value={overview.pendingEvaluations} color="purple" />
            <KpiCard icon={Award} label="Niveles completados (mes)" value={overview.completedLevelsThisMonth} color="green" />
            <KpiCard icon={Clock} label="Promedio h/empleado" value={`${overview.averageStudyHoursPerEmployee}h`} color="blue" />
          </div>
        )}
      </div>
    </>
  );
});

// ─── KPI Card Component ─────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-1 dark:bg-gray-dark">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default TrainingDashboard;
