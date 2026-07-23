import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Settings, Globe, Clock, GraduationCap, Bell, Save,
} from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import apiClient from "../../api/client";
import { notify } from "../../utils/toast";

/**
 * SystemSettings — Configuración general del sistema.
 *
 * Tabs: General | Horario | Training | Festivos | Notificaciones
 */

interface SystemConfig {
  general: {
    companyName: string;
    timezone: string;
    locale: string;
    dateFormat: string;
  };
  schedule: {
    workDays: number[];
    workHoursStart: string;
    workHoursEnd: string;
    studyDays: number[];
  };
  training: {
    minWeeklyHours: number;
    examPassingScore: number;
    maxExamAttempts: number;
    studyReportMaxHoursPerDay: number;
  };
  notifications: {
    retentionDays: number;
    emailEnabled: boolean;
    summaryFrequency: 'daily' | 'weekly' | 'none';
  };
}

const TABS = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'schedule', label: 'Horario', icon: Clock },
  { id: 'training', label: 'Training', icon: GraduationCap },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
] as const;

type TabId = typeof TABS[number]['id'];

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const TIMEZONES = [
  'America/Bogota',
  'America/Mexico_City',
  'America/Lima',
  'America/Santiago',
  'America/Buenos_Aires',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/Madrid',
  'Europe/London',
  'UTC',
];

const SystemSettings = observer(() => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('general');

  // Formularios locales por tab
  const [general, setGeneral] = useState<SystemConfig['general']>({ companyName: '', timezone: '', locale: '', dateFormat: '' });
  const [schedule, setSchedule] = useState<SystemConfig['schedule']>({ workDays: [], workHoursStart: '', workHoursEnd: '', studyDays: [] });
  const [training, setTraining] = useState<SystemConfig['training']>({ minWeeklyHours: 3, examPassingScore: 80, maxExamAttempts: 3, studyReportMaxHoursPerDay: 12 });
  const [notifications, setNotifications] = useState<SystemConfig['notifications']>({ retentionDays: 90, emailEnabled: false, summaryFrequency: 'none' });

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ success: boolean; data: SystemConfig }>('/config');
      const data = res.data.data;
      setConfig(data);
      setGeneral(data.general);
      setSchedule(data.schedule);
      setTraining(data.training);
      setNotifications(data.notifications);
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al cargar configuración');
    } finally { setLoading(false); }
  };

  const saveSection = async (section: string, data: any) => {
    setSaving(true);
    try {
      await apiClient.put(`/config/${section}`, data);
      notify.success('Configuración guardada');
      loadConfig();
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const toggleDay = (days: number[], day: number, setter: (d: number[]) => void) => {
    if (days.includes(day)) {
      setter(days.filter(d => d !== day));
    } else {
      setter([...days, day].sort());
    }
  };

  if (loading) {
    return (
      <>
        <PageBreadcrumb pageTitle="Configuración del Sistema" />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Configuración del Sistema" />
      <div data-test-context="system-settings-page">
        <div className="rounded-xl bg-white shadow-1 dark:bg-gray-dark">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap px-5 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-brand-500 text-brand-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                  data-test-key={`tab-${tab.id}`}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* Tab: General */}
            {activeTab === 'general' && (
              <div className="max-w-xl space-y-5" data-test-context="settings-general">
                <h4 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
                  <Globe size={18} className="text-brand-500" /> Configuración General
                </h4>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Empresa</label>
                  <input
                    type="text" value={general.companyName}
                    onChange={(e) => setGeneral(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    data-test-key="company-name-input"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Zona Horaria</label>
                  <select
                    value={general.timezone}
                    onChange={(e) => setGeneral(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    data-test-key="timezone-select"
                  >
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Locale</label>
                    <select
                      value={general.locale}
                      onChange={(e) => setGeneral(prev => ({ ...prev, locale: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="es-CO">Español (Colombia)</option>
                      <option value="es-MX">Español (México)</option>
                      <option value="es-ES">Español (España)</option>
                      <option value="en-US">English (US)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Formato de Fecha</label>
                    <select
                      value={general.dateFormat}
                      onChange={(e) => setGeneral(prev => ({ ...prev, dateFormat: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={() => saveSection('general', general)} disabled={saving}>
                    <Save size={14} className="mr-1.5" /> {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            )}

            {/* Tab: Horario */}
            {activeTab === 'schedule' && (
              <div className="max-w-xl space-y-5" data-test-context="settings-schedule">
                <h4 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
                  <Clock size={18} className="text-brand-500" /> Horario y Jornada
                </h4>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Días Laborales</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_ES.map((name, idx) => (
                      <button
                        key={idx} type="button"
                        onClick={() => toggleDay(schedule.workDays, idx, (d) => setSchedule(prev => ({ ...prev, workDays: d })))}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          schedule.workDays.includes(idx)
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Hora Inicio</label>
                    <input type="time" value={schedule.workHoursStart}
                      onChange={(e) => setSchedule(prev => ({ ...prev, workHoursStart: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Hora Fin</label>
                    <input type="time" value={schedule.workHoursEnd}
                      onChange={(e) => setSchedule(prev => ({ ...prev, workHoursEnd: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Días Obligatorios de Estudio (Pase de Lista)</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_ES.map((name, idx) => (
                      <button
                        key={idx} type="button"
                        onClick={() => toggleDay(schedule.studyDays, idx, (d) => setSchedule(prev => ({ ...prev, studyDays: d })))}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          schedule.studyDays.includes(idx)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={() => saveSection('schedule', schedule)} disabled={saving}>
                    <Save size={14} className="mr-1.5" /> {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            )}

            {/* Tab: Training */}
            {activeTab === 'training' && (
              <div className="max-w-xl space-y-5" data-test-context="settings-training">
                <h4 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
                  <GraduationCap size={18} className="text-brand-500" /> Configuración de Training
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Mínimo horas/semana</label>
                    <input type="number" value={training.minWeeklyHours} min={0} max={40} step={0.5}
                      onChange={(e) => setTraining(prev => ({ ...prev, minWeeklyHours: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-400">Horas mínimas que un empleado debe estudiar por semana</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">% Aprobación Examen</label>
                    <input type="number" value={training.examPassingScore} min={1} max={100}
                      onChange={(e) => setTraining(prev => ({ ...prev, examPassingScore: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-400">Puntaje mínimo para aprobar un examen</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Máx. intentos/examen</label>
                    <input type="number" value={training.maxExamAttempts} min={1} max={10}
                      onChange={(e) => setTraining(prev => ({ ...prev, maxExamAttempts: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Máx. horas/día reporte</label>
                    <input type="number" value={training.studyReportMaxHoursPerDay} min={1} max={24}
                      onChange={(e) => setTraining(prev => ({ ...prev, studyReportMaxHoursPerDay: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={() => saveSection('training', training)} disabled={saving}>
                    <Save size={14} className="mr-1.5" /> {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            )}

            {/* Tab: Notificaciones */}
            {activeTab === 'notifications' && (
              <div className="max-w-xl space-y-5" data-test-context="settings-notifications">
                <h4 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
                  <Bell size={18} className="text-brand-500" /> Notificaciones
                </h4>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Retención (días)</label>
                  <input type="number" value={notifications.retentionDays} min={7} max={365}
                    onChange={(e) => setNotifications(prev => ({ ...prev, retentionDays: Number(e.target.value) }))}
                    className="w-full max-w-xs rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-400">Días que las notificaciones se conservan antes de eliminarse</p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={notifications.emailEnabled}
                      onChange={(e) => setNotifications(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                      className="h-4 w-4 accent-brand-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Enviar notificaciones por email</span>
                  </label>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Frecuencia de resumen</label>
                  <select value={notifications.summaryFrequency}
                    onChange={(e) => setNotifications(prev => ({ ...prev, summaryFrequency: e.target.value as any }))}
                    className="w-full max-w-xs rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="none">Ninguno</option>
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                  </select>
                </div>

                <div className="pt-2">
                  <Button onClick={() => saveSection('notifications', notifications)} disabled={saving}>
                    <Save size={14} className="mr-1.5" /> {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

export default SystemSettings;
