import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  ClipboardList, ChevronLeft, ChevronRight, Check, X, Minus, Save, Users, ShieldOff,
} from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import apiClient from "../../api/client";
import { notify } from "../../utils/toast";

/**
 * Attendance — Pase de lista manual de estudio (vista admin).
 *
 * El encargado de Training pasa lista L/M/V marcando ✅/❌ por cada empleado.
 * Puede marcar individual (click) o guardar todo el día en bulk.
 */

interface EmployeeDay {
  present: boolean;
  exempt?: boolean;
  exemptReason?: string;
  notes?: string;
}

interface EmployeeAttendance {
  employee: { _id: string; name: string; email: string };
  days: Record<string, EmployeeDay | null>; // dateStr → state o null (no marcado)
  totalPresent: number;
  totalAbsent: number;
}

interface AttendanceResponse {
  weekStart: string;
  weekEnd: string;
  obligatoryDays: string[];
  employees: EmployeeAttendance[];
}

const DAYS_ES: Record<number, string> = { 1: 'Lun', 3: 'Mié', 5: 'Vie' };

const Attendance = observer(() => {
  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // dateStr que se está guardando
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date());

  // Estado local editable: { empId_dateStr → 'present' | 'absent' | 'exempt' | undefined }
  const [localState, setLocalState] = useState<Record<string, 'present' | 'absent' | 'exempt'>>({});

  useEffect(() => {
    loadAttendance();
  }, [currentWeekDate]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const weekParam = currentWeekDate.toISOString().split('T')[0];
      const res = await apiClient.get<{ success: boolean; data: AttendanceResponse }>(
        `/training/attendance?week=${weekParam}`
      );
      setData(res.data.data);

      // Inicializar estado local con los datos existentes
      const state: Record<string, 'present' | 'absent' | 'exempt'> = {};
      for (const emp of res.data.data.employees) {
        for (const [dateStr, dayData] of Object.entries(emp.days)) {
          const key = `${emp.employee._id}_${dateStr}`;
          if (dayData !== null) {
            if (dayData.exempt) state[key] = 'exempt';
            else if (dayData.present) state[key] = 'present';
            else state[key] = 'absent';
          }
        }
      }
      setLocalState(state);
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al cargar asistencia');
    } finally { setLoading(false); }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekDate(newDate);
  };

  // Toggle individual: cicla ✅ → ❌ → ⬜(exento) → sin marcar → ✅ ...
  const toggleEmployee = async (empId: string, dateStr: string) => {
    const key = `${empId}_${dateStr}`;
    const current = localState[key];

    // Ciclo: undefined → present → absent → exempt → present → ...
    let newValue: 'present' | 'absent' | 'exempt';
    if (current === undefined) newValue = 'present';
    else if (current === 'present') newValue = 'absent';
    else if (current === 'absent') newValue = 'exempt';
    else newValue = 'present'; // exempt → present

    setLocalState(prev => ({ ...prev, [key]: newValue }));

    // Guardar al servidor
    try {
      if (newValue === 'exempt') {
        await apiClient.post('/training/attendance/exempt', {
          employee: empId, date: dateStr, reason: 'Exento',
        });
      } else {
        await apiClient.post('/training/attendance/mark', {
          employee: empId, date: dateStr, present: newValue === 'present',
        });
      }
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al marcar asistencia');
      // Revertir
      setLocalState(prev => {
        const copy = { ...prev };
        if (current === undefined) delete copy[key];
        else copy[key] = current;
        return copy;
      });
    }
  };

  // Guardar día completo en bulk (marca como ausentes los no marcados)
  const saveDay = async (dateStr: string) => {
    if (!data) return;

    setSaving(dateStr);
    try {
      const records = data.employees.map(emp => {
        const key = `${emp.employee._id}_${dateStr}`;
        const state = localState[key];
        return {
          employee: emp.employee._id,
          present: state === 'present', // Si no marcó o exempt, ausente por defecto
        };
      });

      await apiClient.post('/training/attendance/bulk', { date: dateStr, records });
      notify.success('Asistencia guardada');

      // Actualizar estado local: todos los no marcados ahora son absent
      const newState = { ...localState };
      for (const emp of data.employees) {
        const key = `${emp.employee._id}_${dateStr}`;
        if (newState[key] === undefined) newState[key] = 'absent';
      }
      setLocalState(newState);
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al guardar');
    } finally { setSaving(null); }
  };

  const formatWeekRange = () => {
    if (!data) return '';
    const start = new Date(data.weekStart + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const end = new Date(data.weekEnd + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${start} — ${end}`;
  };

  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().split('T')[0];
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Pase de Lista — Estudio" />
      <div data-test-context="attendance-page">
        <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-gray-dark">
          {/* Header con navegación de semana */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
              <ClipboardList size={18} className="text-brand-500" />
              Pase de Lista Semanal
            </h3>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateWeek('prev')}
                className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                data-test-key="prev-week-btn"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-[200px] text-center text-sm font-medium text-gray-700 dark:text-gray-200" data-test-key="week-range">
                {formatWeekRange()}
              </span>
              <button
                onClick={() => navigateWeek('next')}
                className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                data-test-key="next-week-btn"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="mb-4 rounded-lg bg-blue-50 px-4 py-2.5 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <strong>Instrucciones:</strong> Haz click en cada celda para marcar asistencia (✅ presente / ❌ ausente).
            También puedes guardar un día completo con el botón <Save size={12} className="inline" />.
          </div>

          {/* Leyenda */}
          <div className="mb-4 flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-green-100 text-green-600"><Check size={12} /></span> Presente
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-red-100 text-red-500"><X size={12} /></span> Ausente
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-blue-500"><ShieldOff size={12} /></span> Exento (vacaciones/permiso)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-gray-400"><Minus size={12} /></span> Sin marcar
            </span>
          </div>

          {/* Tabla */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : !data || data.employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Users size={40} className="mb-2" />
              <p className="text-sm">No hay empleados activos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm" data-test-key="attendance-table">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="px-3 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                      Empleado
                    </th>
                    {data.obligatoryDays.map((dateStr) => {
                      const day = new Date(dateStr + 'T12:00:00');
                      const dayOfWeek = day.getDay();
                      const today = isToday(dateStr);
                      return (
                        <th key={dateStr} className={`px-2 py-3 text-center ${today ? 'bg-brand-50 dark:bg-brand-500/5' : ''}`}>
                          <div className="text-xs font-medium text-gray-700 dark:text-gray-200">
                            {DAYS_ES[dayOfWeek]}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {day.getDate()}/{day.getMonth() + 1}
                          </div>
                          {/* Botón guardar día */}
                          <button
                            onClick={() => saveDay(dateStr)}
                            disabled={saving === dateStr}
                            className="mt-1 inline-flex items-center gap-0.5 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-600 hover:bg-brand-100 disabled:opacity-50 dark:bg-brand-500/10 dark:text-brand-400"
                            title="Guardar día completo"
                          >
                            <Save size={10} /> {saving === dateStr ? '...' : 'Guardar'}
                          </button>
                        </th>
                      );
                    })}
                    <th className="px-3 py-3 text-center font-medium text-gray-600 dark:text-gray-300">
                      Asistencia
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.employees.map((emp) => {
                    // Contar presentes/ausentes del estado local
                    let presents = 0;
                    let absents = 0;
                    let exempts = 0;
                    for (const dateStr of data.obligatoryDays) {
                      const key = `${emp.employee._id}_${dateStr}`;
                      if (localState[key] === 'present') presents++;
                      else if (localState[key] === 'absent') absents++;
                      else if (localState[key] === 'exempt') exempts++;
                    }

                    return (
                      <tr
                        key={emp.employee._id}
                        className="border-b border-gray-50 hover:bg-gray-25 dark:border-gray-800 dark:hover:bg-gray-800/50"
                        data-test-key={`employee-row-${emp.employee._id}`}
                      >
                        <td className="px-3 py-3">
                          <div className="font-medium text-gray-800 dark:text-white text-xs">{emp.employee.name}</div>
                          <div className="text-[10px] text-gray-400">{emp.employee.email}</div>
                        </td>
                        {data.obligatoryDays.map((dateStr) => {
                          const key = `${emp.employee._id}_${dateStr}`;
                          const state = localState[key]; // 'present' | 'absent' | 'exempt' | undefined
                          const today = isToday(dateStr);

                          return (
                            <td key={dateStr} className={`px-2 py-3 text-center ${today ? 'bg-brand-50/50 dark:bg-brand-500/5' : ''}`}>
                              <button
                                onClick={() => toggleEmployee(emp.employee._id, dateStr)}
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                                  state === 'present'
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400'
                                    : state === 'absent'
                                    ? 'bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400'
                                    : state === 'exempt'
                                    ? 'bg-blue-100 text-blue-500 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-500'
                                }`}
                                title={state === 'present' ? 'Presente → click: ausente' : state === 'absent' ? 'Ausente → click: exento' : state === 'exempt' ? 'Exento → click: presente' : 'Sin marcar → click: presente'}
                              >
                                {state === 'present' ? <Check size={14} /> : state === 'absent' ? <X size={14} /> : state === 'exempt' ? <ShieldOff size={14} /> : <Minus size={14} />}
                              </button>
                            </td>
                          );
                        })}
                        <td className="px-3 py-3 text-center">
                          <span className="text-xs">
                            <span className="font-medium text-green-600">{presents}</span>
                            <span className="text-gray-300 mx-1">/</span>
                            <span className="font-medium text-red-500">{absents}</span>
                            <span className="text-gray-300 mx-1">/</span>
                            <span className="text-gray-400">{data.obligatoryDays.length}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary footer */}
          {!loading && data && data.employees.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-gray-100 pt-4 dark:border-gray-700">
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Users size={14} /> Total empleados: <span className="font-medium text-gray-700 dark:text-gray-200">{data.employees.length}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default Attendance;
