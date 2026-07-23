import { useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Plus, Trash2, Clock, CheckCircle2, BookOpen, Search } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import apiClient from "../../api/client";
import { trainingService } from "../../api/services/training";
import type { Course } from "../../api/services/training";
import { notify } from "../../utils/toast";

/**
 * StudyReport — Página para que el empleado reporte sus horas de estudio diarias.
 *
 * Formulario: fecha, cursos estudiados, horas por curso, ¿terminó?, observaciones.
 * Mínimo 3h/semana en L/M/V.
 * Solo muestra cursos del nivel actual del empleado con dropdown searchable.
 */

interface ReportEntry {
  course: string;
  hoursSpent: number;
  completed: boolean;
  progress: string;
}

const StudyReport = observer(() => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [weekReports, setWeekReports] = useState<any[]>([]);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<ReportEntry[]>([{ course: '', hoursSpent: 1, completed: false, progress: '' }]);
  const [observations, setObservations] = useState('');

  useEffect(() => {
    loadMyCourses();
    loadWeekReports();
  }, []);

  const loadMyCourses = async () => {
    try {
      const res = await apiClient.get<{ success: boolean; data: any }>('/training/progress/me');
      const progress = res.data.data;
      if (progress && progress.courses) {
        // Obtener el level actual del empleado
        const currentLevelId = typeof progress.currentLevel === 'object'
          ? progress.currentLevel?._id
          : progress.currentLevel;

        // Filtrar cursos que pertenecen al nivel actual
        const myCourses = progress.courses
          .map((cp: any) => cp.course)
          .filter((c: any) => c && typeof c === 'object')
          .filter((c: any) => {
            if (!currentLevelId) return true;
            const courseLevelId = typeof c.level === 'object' ? c.level?._id : c.level;
            return courseLevelId === currentLevelId;
          });
        setCourses(myCourses);
      }
    } catch {
      // Fallback: cargar todos los cursos activos
      trainingService.getCourses({ active: 'true' }).then(setCourses);
    }
  };

  const loadWeekReports = async () => {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[]; weeklyTotal: number }>('/training/study-reports/me');
      setWeekReports(res.data.data);
      setWeeklyTotal(res.data.weeklyTotal);
    } catch { /* ignore */ }
  };

  const addEntry = () => {
    setEntries(prev => [...prev, { course: '', hoursSpent: 1, completed: false, progress: '' }]);
  };

  const removeEntry = (idx: number) => {
    if (entries.length <= 1) return;
    setEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const updateEntry = (idx: number, field: string, value: any) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const handleSubmit = async () => {
    // Validar
    for (const entry of entries) {
      if (!entry.course) { notify.error('Selecciona un curso para cada entrada'); return; }
      if (entry.hoursSpent < 0.25) { notify.error('Mínimo 0.25h por entrada'); return; }
      if (!entry.completed && !entry.progress.trim()) { notify.error('Si no terminaste el curso, indica en qué parte quedaste'); return; }
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/training/study-reports', {
        date: reportDate,
        entries: entries.map(e => ({
          course: e.course,
          hoursSpent: e.hoursSpent,
          completed: e.completed,
          progress: e.completed ? undefined : e.progress,
        })),
        observations: observations || undefined,
      });
      notify.success('Reporte guardado exitosamente');
      loadWeekReports();
      // Reset form
      setEntries([{ course: '', hoursSpent: 1, completed: false, progress: '' }]);
      setObservations('');
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al guardar reporte');
    } finally { setIsSubmitting(false); }
  };

  const todayTotal = entries.reduce((sum, e) => sum + e.hoursSpent, 0);
  const dayName = new Date(reportDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <PageBreadcrumb pageTitle="Reportar Estudio" />
      <div className="grid gap-6 lg:grid-cols-3" data-test-context="study-report-page">

        {/* Formulario (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
              <BookOpen size={18} className="text-brand-500" /> Reportar Estudio — {dayName}
            </h3>

            {/* Fecha */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full max-w-xs rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                data-test-key="report-date"
              />
            </div>

            {/* Entradas de cursos */}
            <div className="space-y-4">
              {entries.map((entry, idx) => (
                <div key={idx} className="rounded-lg border border-gray-100 p-4 dark:border-gray-700" data-test-key={`entry-${idx}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      {/* Curso (Searchable Dropdown) */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Curso *</label>
                        <SearchableCourseSelect
                          courses={courses}
                          value={entry.course}
                          onChange={(courseId) => updateEntry(idx, 'course', courseId)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Horas */}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-500">Horas dedicadas *</label>
                          <input
                            type="number"
                            value={entry.hoursSpent}
                            onChange={(e) => updateEntry(idx, 'hoursSpent', parseFloat(e.target.value) || 0)}
                            min="0.25" step="0.25" max="12"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            data-test-key="hours-input"
                          />
                        </div>

                        {/* ¿Terminaste? */}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-500">¿Terminaste el curso?</label>
                          <div className="flex items-center gap-4 pt-1">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="radio" name={`completed-${idx}`} checked={entry.completed} onChange={() => updateEntry(idx, 'completed', true)} className="accent-green-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-200">Sí</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="radio" name={`completed-${idx}`} checked={!entry.completed} onChange={() => updateEntry(idx, 'completed', false)} className="accent-gray-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-200">No</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* ¿En qué parte quedaste? (solo si no terminó) */}
                      {!entry.completed && (
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-500">¿En qué parte quedaste? *</label>
                          <input
                            type="text"
                            value={entry.progress}
                            onChange={(e) => updateEntry(idx, 'progress', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="Ej: Capítulo 3, video 2 de 5"
                            data-test-key="progress-input"
                          />
                        </div>
                      )}
                    </div>

                    {/* Botón eliminar entrada */}
                    {entries.length > 1 && (
                      <button onClick={() => removeEntry(idx)} className="mt-6 rounded p-1.5 text-gray-300 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Agregar otro curso */}
            <button onClick={addEntry} className="mt-3 flex items-center gap-1 text-sm text-brand-500 hover:text-brand-600">
              <Plus size={14} /> Agregar otro curso
            </button>

            {/* Observaciones */}
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones (opcional)</label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                rows={2}
                placeholder="Notas, dudas, dificultades..."
                data-test-key="observations-input"
              />
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
              <p className="text-sm text-gray-500">Total del día: <span className="font-semibold text-gray-800 dark:text-white">{todayTotal}h</span></p>
              <Button onClick={handleSubmit} disabled={isSubmitting} data-test-key="save-report-btn">
                {isSubmitting ? 'Guardando...' : 'Guardar Reporte'}
              </Button>
            </div>
          </div>
        </div>

        {/* Resumen semanal (1/3) */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-4 shadow-1 dark:bg-gray-dark">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white">
              <Clock size={16} className="text-brand-500" /> Resumen Semanal
            </h4>
            <div className="mb-3 text-center">
              <p className="text-3xl font-bold text-brand-600">{weeklyTotal}h</p>
              <p className="text-xs text-gray-400">de 3h mínimo</p>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className={`h-2 rounded-full transition-all ${weeklyTotal >= 3 ? 'bg-green-500' : 'bg-orange-400'}`}
                  style={{ width: `${Math.min((weeklyTotal / 3) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Reportes de la semana */}
            <div className="space-y-2">
              {weekReports.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-4">Sin reportes esta semana</p>
              ) : (
                weekReports.map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {new Date(r.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                      <CheckCircle2 size={12} /> {r.totalHours}h
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default StudyReport;


// ─── Componente: Dropdown con búsqueda para cursos ──────────────────────────

function SearchableCourseSelect({ courses, value, onChange }: {
  courses: Course[];
  value: string;
  onChange: (courseId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = courses.filter(course =>
    !search || course.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCourse = courses.find(c => c._id === value);

  return (
    <div className="relative" ref={containerRef} data-test-key="course-select">
      {/* Input que muestra el seleccionado y permite buscar */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={isOpen ? search : (selectedCourse?.name || '')}
          onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar curso..."
          className="w-full rounded-lg border border-gray-200 pl-8 pr-8 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          data-test-key="course-search-input"
        />

        {/* Botón limpiar */}
        {value && !isOpen && (
          <button
            type="button"
            onClick={() => { onChange(''); setSearch(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {filtered.map(course => (
            <button
              key={course._id}
              type="button"
              onClick={() => { onChange(course._id); setIsOpen(false); setSearch(''); }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                value === course._id ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10' : 'text-gray-700 dark:text-gray-200'
              }`}
              data-test-key={`course-option-${course._id}`}
            >
              <span className="font-medium">{course.name}</span>
              {course.estimatedHours && (
                <span className="ml-2 text-xs text-gray-400">({course.estimatedHours}h estimadas)</span>
              )}
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="px-4 py-3 text-center text-sm text-gray-400">
              {courses.length === 0 ? 'No tienes cursos asignados en tu nivel actual' : 'No se encontraron cursos'}
            </p>
          )}
        </div>
      )}

      {/* Overlay para cerrar */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => { setIsOpen(false); setSearch(''); }} />
      )}
    </div>
  );
}
