import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { BookOpen, CheckCircle2, Lock, Clock, Award, FileText, Layers, Pin, TrendingUp, AlertTriangle } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import BadgeIcon from "../../components/training/BadgeIcon";
import { progressApiService } from "../../api/services/progress";
import type { EmployeeProgress, ExtraAssignment } from "../../api/services/progress";

/**
 * MyProgress — Página del empleado para ver su progreso de capacitación.
 *
 * Muestra: insignias (grid), nivel actual, cursos con checkbox, asignaciones extras.
 */

const MyProgress = observer(() => {
  const [progress, setProgress] = useState<EmployeeProgress | null>(null);
  const [assignments, setAssignments] = useState<ExtraAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingCourse, setCompletingCourse] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prog, assigns] = await Promise.all([
        progressApiService.getMyProgress(),
        progressApiService.getMyAssignments(),
      ]);
      setProgress(prog);
      setAssignments(assigns);
    } catch { /* may not have progress yet */ }
    finally { setIsLoading(false); }
  };

  const handleCompleteCourse = async (courseId: string) => {
    setCompletingCourse(courseId);
    try {
      const result = await progressApiService.completeCourse(courseId);
      setProgress(result.progress);
      if (result.examUnlocked) {
        alert('¡Todos los cursos completados! El examen del nivel está disponible.');
      } else if (result.levelCompleted) {
        alert('¡Nivel completado! Avanzaste al siguiente.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al completar curso');
    } finally { setCompletingCourse(null); }
  };

  const handleCompleteAssignment = async (assignmentId: string) => {
    try {
      await progressApiService.completeAssignment(assignmentId);
      setAssignments(prev => prev.filter(a => a._id !== assignmentId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  if (isLoading) {
    return (
      <>
        <PageBreadcrumb pageTitle="Mi Progreso" />
        <div className="flex items-center justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
        </div>
      </>
    );
  }

  if (!progress) {
    return (
      <>
        <PageBreadcrumb pageTitle="Mi Progreso" />
        <div className="rounded-xl bg-white p-12 text-center shadow-1 dark:bg-gray-dark">
          <p className="text-gray-400">Tu progreso de capacitación aún no ha sido inicializado.</p>
        </div>
      </>
    );
  }

  const currentLevelName = typeof progress.currentLevel === 'object' ? progress.currentLevel.name : '';

  return (
    <>
      <PageBreadcrumb pageTitle="Mi Progreso" />
      <div className="space-y-6" data-test-context="my-progress-page">

        {/* Asignaciones Extraordinarias (arriba, D4) */}
        {assignments.length > 0 && (
          <div className="rounded-xl bg-orange-50 p-4 shadow-1 dark:bg-orange-500/5 dark:shadow-card" data-test-context="assignments-section">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-orange-800 dark:text-orange-300">
              <Pin size={16} /> Asignaciones Pendientes ({assignments.length})
            </h3>
            <div className="space-y-2">
              {assignments.map(a => (
                <div key={a._id} className="flex items-center justify-between rounded-lg bg-white p-3 dark:bg-gray-800" data-test-key={`assignment-${a._id}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      {a.priority === 'urgent' && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">URGENTE</span>}
                      {a.priority === 'high' && <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">ALTA</span>}
                      <span className="text-sm font-medium text-gray-800 dark:text-white">{a.title}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{a.reason}</p>
                  </div>
                  <button
                    onClick={() => handleCompleteAssignment(a._id)}
                    className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600"
                    data-test-key="complete-btn"
                  >
                    Completar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insignias */}
        <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card" data-test-context="badges-section">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
            <Award size={18} className="text-yellow-500" /> Insignias
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {progress.badges.map(bp => {
              const badge = typeof bp.badge === 'object' ? bp.badge : null;
              if (!badge) return null;
              return (
                <div key={badge._id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 dark:border-gray-700" data-test-key={`badge-${badge._id}`}>
                  <BadgeIcon
                    shape={badge.shape}
                    icon={badge.icon}
                    color={badge.color}
                    earned={bp.status === 'completed'}
                    progress={bp.percentage}
                    size={56}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{badge.name}</p>
                    <p className="text-xs text-gray-400">
                      {bp.status === 'completed' ? 'Obtenida' : bp.status === 'in_progress' ? `${bp.percentage}% completado` : 'Bloqueada'}
                    </p>
                    {bp.earnedAt && <p className="text-[10px] text-gray-400">Obtenida: {new Date(bp.earnedAt).toLocaleDateString('es-ES')}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nivel Actual + Cursos */}
        <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card" data-test-context="current-level-section">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
              <Layers size={18} className="text-brand-500" /> Nivel Actual: {currentLevelName || 'Sin nivel asignado'}
            </h3>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              {progress.totalStudyHours}h totales
            </span>
          </div>

          {/* Lista de cursos del nivel actual */}
          <div className="space-y-2" data-test-context="courses-checklist">
            {progress.courses
              .filter(cp => {
                // Solo mostrar cursos del nivel actual
                const course = typeof cp.course === 'object' ? cp.course : null;
                if (!course || !progress.currentLevel) return false;
                const currentLevelId = typeof progress.currentLevel === 'object' ? progress.currentLevel._id : progress.currentLevel;
                return (course as any).level?.toString() === currentLevelId?.toString() 
                  || (course as any).level === currentLevelId;
              })
              .map(cp => {
              const course = typeof cp.course === 'object' ? cp.course : null;
              const courseId = typeof cp.course === 'string' ? cp.course : cp.course?._id;
              return (
                <div
                  key={courseId}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    cp.status === 'completed'
                      ? 'border-green-200 bg-green-50/50 dark:border-green-500/20 dark:bg-green-500/5'
                      : 'border-gray-100 dark:border-gray-700'
                  }`}
                  data-test-key={`course-${courseId}`}
                >
                  <div className="flex items-center gap-3">
                    {cp.status === 'completed' ? (
                      <CheckCircle2 size={20} className="text-green-500" />
                    ) : (
                      <BookOpen size={20} className="text-gray-400" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${cp.status === 'completed' ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-800 dark:text-white'}`}>
                        {course?.name || courseId}
                      </p>
                      {cp.completedAt && (
                        <p className="text-[10px] text-gray-400">Completado: {new Date(cp.completedAt).toLocaleDateString('es-ES')}</p>
                      )}
                    </div>
                  </div>
                  {cp.status !== 'completed' && (
                    <button
                      onClick={() => handleCompleteCourse(courseId!)}
                      disabled={completingCourse === courseId}
                      className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                      data-test-key="mark-complete-btn"
                    >
                      {completingCourse === courseId ? '...' : 'Marcar Completado'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Niveles Timeline */}
        <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card" data-test-context="levels-timeline">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
            <TrendingUp size={18} className="text-brand-500" /> Todos los Niveles
          </h3>
          <div className="space-y-3">
            {progress.levels.map(lp => {
              const level = typeof lp.level === 'object' ? lp.level : null;
              const statusConfig: Record<string, { icon: React.FC<any>; color: string; label: string }> = {
                locked: { icon: Lock, color: 'text-gray-300', label: 'Bloqueado' },
                in_progress: { icon: Clock, color: 'text-blue-500', label: 'En progreso' },
                exam_pending: { icon: FileText, color: 'text-orange-500', label: 'Examen pendiente' },
                exam_failed: { icon: FileText, color: 'text-red-500', label: 'Examen reprobado' },
                completed: { icon: CheckCircle2, color: 'text-green-500', label: 'Completado' },
              };
              const config = statusConfig[lp.status] || statusConfig.locked;
              const Icon = config.icon;
              return (
                <div key={level?._id || lp.level?.toString()} className="flex items-center gap-3" data-test-key={`level-${level?._id}`}>
                  <Icon size={20} className={config.color} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{level?.name || 'Nivel'}</p>
                    <p className={`text-xs ${config.color}`}>{config.label}</p>
                  </div>
                  {lp.status === 'exam_pending' && (
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      ¡Examen disponible!
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
});

export default MyProgress;
