import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import apiClient from "../../api/client";
import { authStore } from "../../stores/views";

const CurrentWeekSummary = observer(() => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const hatName = authStore.user?.role?.name || '';
  const isQA = hatName.includes('QA');

  useEffect(() => {
    loadCurrentWeek();
  }, []);

  const loadCurrentWeek = async () => {
    try {
      const res = await apiClient.get('/reports/weekly/me');
      const data = res.data?.data || [];
      if (data.length > 0) {
        // El más reciente
        const sorted = data.sort((a: any, b: any) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
        setReport(sorted[0]);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
    );
  }

  if (!report) return null;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short' });

  if (isQA && report.qa_metrics) {
    const m = report.qa_metrics;
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Esta Semana</h4>
          <span className="text-xs text-gray-500">{formatDate(report.weekStart)} — {formatDate(report.weekEnd)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-bold text-brand-600">{m.acs_validated}</p>
            <p className="text-xs text-gray-500">ACs validados</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-400">{m.acs_automated}</p>
            <p className="text-xs text-gray-500">Automatizados</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{m.commits_qa}</p>
            <p className="text-xs text-gray-500">Commits qa()</p>
          </div>
          <div>
            <p className="text-lg font-bold text-success-600">{m.automation_rate}%</p>
            <p className="text-xs text-gray-500">Tasa auto.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isQA && report.dev_metrics) {
    const m = report.dev_metrics;
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Esta Semana</h4>
          <span className="text-xs text-gray-500">{formatDate(report.weekStart)} — {formatDate(report.weekEnd)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-bold text-brand-600">{m.uip_per_day}</p>
            <p className="text-xs text-gray-500">UIP/d</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{m.commits}</p>
            <p className="text-xs text-gray-500">Commits</p>
          </div>
          <div>
            <p className="text-lg font-bold text-success-600">{m.net_insertions.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Neto</p>
          </div>
          <div>
            <p className="text-lg font-bold text-warning-600">{m.self_churn}</p>
            <p className="text-xs text-gray-500">Self-churn</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
});

export default CurrentWeekSummary;
