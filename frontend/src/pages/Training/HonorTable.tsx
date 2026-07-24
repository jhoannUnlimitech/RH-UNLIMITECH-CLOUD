import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Trophy, Medal, Clock, TrendingUp, ChevronLeft, ChevronRight, Users } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import apiClient from "../../api/client";
import { notify } from "../../utils/toast";

/**
 * HonorTable — Tabla de Honor trimestral.
 *
 * Muestra el ranking de empleados por horas de estudio en el trimestre.
 * Top 3 destacados con medallas. Todos pueden ver la tabla.
 */

interface HonorEntry {
  position: number;
  employee: { _id: string; name: string; email: string; photo?: string };
  totalHours: number;
  totalReports: number;
  averagePerWeek: number;
  aboveMinimum: number;
}

interface HonorTableData {
  quarter: number;
  year: number;
  minWeeklyHours: number;
  minQuarterlyHours: number;
  weeksInQuarter: number;
  entries: HonorEntry[];
  totalParticipants: number;
}

const QUARTER_NAMES = ['', 'Ene — Mar', 'Abr — Jun', 'Jul — Sep', 'Oct — Dic'];

const HonorTable = observer(() => {
  const [data, setData] = useState<HonorTableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuarter, setCurrentQuarter] = useState(() => Math.ceil((new Date().getMonth() + 1) / 3));
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    loadHonorTable();
  }, [currentQuarter, currentYear]);

  const loadHonorTable = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ success: boolean; data: HonorTableData }>(
        `/training/honor-table/${currentYear}/${currentQuarter}`
      );
      setData(res.data.data);
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al cargar tabla de honor');
    } finally { setLoading(false); }
  };

  const navigateQuarter = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentQuarter === 1) { setCurrentQuarter(4); setCurrentYear(y => y - 1); }
      else setCurrentQuarter(q => q - 1);
    } else {
      if (currentQuarter === 4) { setCurrentQuarter(1); setCurrentYear(y => y + 1); }
      else setCurrentQuarter(q => q + 1);
    }
  };

  const getMedalColor = (position: number) => {
    if (position === 1) return 'text-yellow-500';
    if (position === 2) return 'text-gray-400';
    if (position === 3) return 'text-amber-600';
    return 'text-gray-300';
  };

  const getRowBg = (position: number) => {
    if (position === 1) return 'bg-yellow-50/50 dark:bg-yellow-500/5';
    if (position === 2) return 'bg-gray-50/50 dark:bg-gray-500/5';
    if (position === 3) return 'bg-amber-50/50 dark:bg-amber-500/5';
    return '';
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Tabla de Honor" />
      <div data-test-context="honor-table-page">

        {/* Header con navegación de trimestre */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
            <Trophy size={22} className="text-yellow-500" />
            Tabla de Honor — Estudio
          </h3>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateQuarter('prev')}
              className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[180px] text-center text-sm font-medium text-gray-700 dark:text-gray-200">
              Q{currentQuarter} {currentYear} — {QUARTER_NAMES[currentQuarter]}
            </span>
            <button
              onClick={() => navigateQuarter('next')}
              className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Stats cards */}
        {data && !loading && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-white p-4 shadow-1 dark:bg-gray-dark">
              <p className="text-xs text-gray-400">Participantes</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{data.totalParticipants}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-1 dark:bg-gray-dark">
              <p className="text-xs text-gray-400">Mínimo semanal</p>
              <p className="text-2xl font-bold text-brand-600">{data.minWeeklyHours}h</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-1 dark:bg-gray-dark">
              <p className="text-xs text-gray-400">Mínimo trimestral</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{data.minQuarterlyHours}h</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-1 dark:bg-gray-dark">
              <p className="text-xs text-gray-400">Semanas</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{data.weeksInQuarter}</p>
            </div>
          </div>
        )}

        {/* Tabla */}
        <div className="rounded-xl bg-white shadow-1 dark:bg-gray-dark">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : !data || data.entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Users size={48} className="mb-3" />
              <p className="text-sm">No hay datos de estudio para este trimestre.</p>
              <p className="text-xs mt-1">Los empleados deben reportar estudio para aparecer aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-test-key="honor-table">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="px-4 py-3 text-center font-medium text-gray-500 w-16">#</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Empleado</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">
                      <span className="flex items-center justify-center gap-1"><Clock size={12} /> Horas Total</span>
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">Promedio/Sem</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">Reportes</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">
                      <span className="flex items-center justify-center gap-1"><TrendingUp size={12} /> Sobre mínimo</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((entry) => (
                    <tr
                      key={entry.employee._id}
                      className={`border-b border-gray-50 dark:border-gray-800 ${getRowBg(entry.position)}`}
                      data-test-key={`honor-row-${entry.position}`}
                    >
                      {/* Posición */}
                      <td className="px-4 py-3 text-center">
                        {entry.position <= 3 ? (
                          <Medal size={22} className={`mx-auto ${getMedalColor(entry.position)}`} />
                        ) : (
                          <span className="text-sm font-medium text-gray-400">{entry.position}</span>
                        )}
                      </td>

                      {/* Empleado */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-xs font-semibold dark:bg-brand-500/10">
                            {entry.employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{entry.employee.name}</p>
                            <p className="text-xs text-gray-400">{entry.employee.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Horas total */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-base font-bold text-gray-800 dark:text-white">{entry.totalHours}h</span>
                      </td>

                      {/* Promedio por semana */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{entry.averagePerWeek}h</span>
                      </td>

                      {/* Total reportes */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-500">{entry.totalReports}</span>
                      </td>

                      {/* Sobre mínimo */}
                      <td className="px-4 py-3 text-center">
                        {entry.aboveMinimum > 0 ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                            +{entry.aboveMinimum}h
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                            {entry.aboveMinimum}h
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default HonorTable;
