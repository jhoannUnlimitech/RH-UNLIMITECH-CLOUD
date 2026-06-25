import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import apiClient from "../../api/client";
import { authStore } from "../../stores/views";

interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  type: 'qa' | 'developer';
  qa_metrics?: {
    commits_qa: number;
    acs_validated: number;
    acs_automated: number;
    acs_pending: number;
    automation_rate: number;
  };
  dev_metrics?: {
    gross_insertions: number;
    deletions: number;
    self_churn: number;
    net_insertions: number;
    uip_per_day: number;
    commits: number;
    working_days: number;
  };
}

const WeeklyProductivityChart = observer(() => {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const hatName = authStore.user?.role?.name || '';
  const isQA = hatName.includes('QA');
  const isDev = !isQA; // Default to dev view if not QA

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await apiClient.get('/reports/weekly/me');
      const data = (res.data?.data || []).sort(
        (a: WeeklyReport, b: WeeklyReport) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
      );
      setReports(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-[250px] bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (reports.length === 0) return null;

  const formatWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString('es', { month: 'short' })}`;
  };

  const categories = reports.map(r => formatWeek(r.weekStart));
  const currentReport = reports[reports.length - 1];

  // QA Chart
  if (isQA && reports[0]?.qa_metrics) {
    const series = [
      { name: "ACs Validados", data: reports.map(r => r.qa_metrics?.acs_validated || 0) },
      { name: "ACs Automatizados", data: reports.map(r => r.qa_metrics?.acs_automated || 0) },
    ];

    const options: ApexOptions = {
      colors: ["#465FFF", "#9CB9FF"],
      chart: { fontFamily: "Outfit, sans-serif", height: 250, type: "area", toolbar: { show: false } },
      fill: { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
      stroke: { curve: "smooth", width: [2, 2] },
      markers: { size: 4 },
      grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
      dataLabels: { enabled: false },
      legend: { show: true, position: "top" },
      xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { title: { text: "" } },
      tooltip: { y: { formatter: (val: number) => `${val}` } },
    };

    const curr = currentReport?.qa_metrics;

    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h4 className="text-base font-semibold text-gray-800 dark:text-white">Reporte QA Semanal</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Últimas 8 semanas — ACs validados vs automatizados</p>
          </div>
          {curr && (
            <div className="flex gap-4 mt-2 sm:mt-0">
              <div className="text-center">
                <p className="text-lg font-bold text-brand-600">{curr.acs_validated}</p>
                <p className="text-xs text-gray-500">Validados</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-brand-400">{curr.acs_automated}</p>
                <p className="text-xs text-gray-500">Automatizados</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-warning-600">{curr.acs_pending}</p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
            </div>
          )}
        </div>
        <Chart options={options} series={series} type="area" height={250} />
        {curr && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
              <p className="text-xs text-gray-500">Commits qa()</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{curr.commits_qa}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
              <p className="text-xs text-gray-500">Tasa automatización</p>
              <p className="text-lg font-bold text-success-600">{curr.automation_rate}%</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
              <p className="text-xs text-gray-500">ACs validados</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{curr.acs_validated}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
              <p className="text-xs text-gray-500">Pendientes</p>
              <p className="text-lg font-bold text-warning-600">{curr.acs_pending}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Developer Chart
  if (isDev && reports[0]?.dev_metrics) {
    const series = [
      { name: "Inserciones Netas", data: reports.map(r => r.dev_metrics?.net_insertions || 0) },
      { name: "Eliminaciones", data: reports.map(r => r.dev_metrics?.deletions || 0) },
    ];

    const options: ApexOptions = {
      colors: ["#465FFF", "#F87171"],
      chart: { fontFamily: "Outfit, sans-serif", height: 250, type: "area", toolbar: { show: false } },
      fill: { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
      stroke: { curve: "smooth", width: [2, 2] },
      markers: { size: 4 },
      grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
      dataLabels: { enabled: false },
      legend: { show: true, position: "top" },
      xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { title: { text: "" } },
      tooltip: { y: { formatter: (val: number) => `${val} líneas` } },
    };

    const curr = currentReport?.dev_metrics;

    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h4 className="text-base font-semibold text-gray-800 dark:text-white">Productividad Semanal</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Últimas 8 semanas — Inserciones netas vs eliminaciones</p>
          </div>
          {curr && (
            <div className="flex gap-4 mt-2 sm:mt-0">
              <div className="text-center">
                <p className="text-lg font-bold text-brand-600">{curr.uip_per_day}</p>
                <p className="text-xs text-gray-500">UIP/d</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{curr.commits}</p>
                <p className="text-xs text-gray-500">Commits</p>
              </div>
            </div>
          )}
        </div>
        <Chart options={options} series={series} type="area" height={250} />
        {curr && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
              <p className="text-xs text-gray-500">Inserciones brutas</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{curr.gross_insertions.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
              <p className="text-xs text-gray-500">Self-churn</p>
              <p className="text-lg font-bold text-warning-600">{curr.self_churn}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
              <p className="text-xs text-gray-500">Neto</p>
              <p className="text-lg font-bold text-success-600">{curr.net_insertions.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
              <p className="text-xs text-gray-500">Días trabajados</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{curr.working_days}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
});

export default WeeklyProductivityChart;
