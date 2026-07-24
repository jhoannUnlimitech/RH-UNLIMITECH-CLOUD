import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Gift, Plus, Edit3, Trash2, Calculator, CheckCircle2, Clock, DollarSign, Award,
} from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import apiClient from "../../api/client";
import { notify } from "../../utils/toast";

/**
 * BonusManagement — Administración de rangos de bonificación y bonos trimestrales.
 *
 * Dos secciones:
 * 1. Configuración de rangos (CRUD)
 * 2. Bonos generados (calcular, ver, marcar pagado)
 */

interface BonusRange {
  _id: string;
  name: string;
  minHours: number;
  maxHours: number | null;
  order: number;
  prizeType: string;
  prizeDescription: string;
  prizeAmount?: number;
  prizeCurrency?: string;
  color: string;
  active: boolean;
}

interface BonusRecord {
  _id: string;
  employee: { _id: string; name: string; email: string };
  quarter: number;
  year: number;
  totalHours: number;
  bonusRange: { name: string; prizeType: string; prizeDescription: string; prizeAmount?: number; color: string };
  status: 'pending' | 'paid' | 'acknowledged';
  paidAt?: string;
  paidBy?: { name: string };
}

const PRIZE_TYPES: Record<string, string> = {
  symbolic: 'Simbólico',
  monetary: 'Monetario',
  time_off: 'Tiempo libre',
  other: 'Otro',
};

const BonusManagement = observer(() => {
  const [activeTab, setActiveTab] = useState<'ranges' | 'bonuses'>('ranges');
  const [ranges, setRanges] = useState<BonusRange[]>([]);
  const [bonuses, setBonuses] = useState<BonusRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal para crear/editar rango
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [editingRange, setEditingRange] = useState<BonusRange | null>(null);
  const [rangeForm, setRangeForm] = useState({
    name: '', minHours: 0, maxHours: '' as string | number, prizeType: 'symbolic',
    prizeDescription: '', prizeAmount: '', prizeCurrency: 'COP', color: '#3b82f6',
  });

  // Calcular bonos
  const [calcQuarter, setCalcQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [calcYear, setCalcYear] = useState(new Date().getFullYear());
  const [calculating, setCalculating] = useState(false);

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'ranges') {
        const res = await apiClient.get<{ success: boolean; data: BonusRange[] }>('/training/bonuses/ranges');
        setRanges(res.data.data);
      } else {
        const res = await apiClient.get<{ success: boolean; data: BonusRecord[] }>('/training/bonuses/pending');
        setBonuses(res.data.data);
      }
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al cargar datos');
    } finally { setLoading(false); }
  };

  // ─── RANGES ───────────────────────────────────────────────────────────────────

  const openRangeModal = (range?: BonusRange) => {
    if (range) {
      setEditingRange(range);
      setRangeForm({
        name: range.name, minHours: range.minHours,
        maxHours: range.maxHours ?? '',
        prizeType: range.prizeType, prizeDescription: range.prizeDescription,
        prizeAmount: range.prizeAmount?.toString() || '', prizeCurrency: range.prizeCurrency || 'COP',
        color: range.color,
      });
    } else {
      setEditingRange(null);
      setRangeForm({ name: '', minHours: 0, maxHours: '', prizeType: 'symbolic', prizeDescription: '', prizeAmount: '', prizeCurrency: 'COP', color: '#3b82f6' });
    }
    setShowRangeModal(true);
  };

  const saveRange = async () => {
    if (!rangeForm.name.trim() || !rangeForm.prizeDescription.trim()) {
      notify.error('Nombre y descripción del premio son requeridos');
      return;
    }
    try {
      const payload = {
        name: rangeForm.name,
        minHours: rangeForm.minHours,
        maxHours: rangeForm.maxHours === '' ? null : Number(rangeForm.maxHours),
        prizeType: rangeForm.prizeType,
        prizeDescription: rangeForm.prizeDescription,
        prizeAmount: rangeForm.prizeAmount ? Number(rangeForm.prizeAmount) : undefined,
        prizeCurrency: rangeForm.prizeCurrency,
        color: rangeForm.color,
      };

      if (editingRange) {
        await apiClient.put(`/training/bonuses/ranges/${editingRange._id}`, payload);
        notify.success('Rango actualizado');
      } else {
        await apiClient.post('/training/bonuses/ranges', payload);
        notify.success('Rango creado');
      }
      setShowRangeModal(false);
      loadData();
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al guardar');
    }
  };

  const deleteRange = async (id: string) => {
    try {
      await apiClient.delete(`/training/bonuses/ranges/${id}`);
      notify.success('Rango desactivado');
      loadData();
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  // ─── BONUSES ──────────────────────────────────────────────────────────────────

  const calculateBonuses = async () => {
    setCalculating(true);
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>('/training/bonuses/calculate', { quarter: calcQuarter, year: calcYear });
      notify.success(res.data.message);
      loadData();
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al calcular');
    } finally { setCalculating(false); }
  };

  const markPaid = async (bonusId: string) => {
    try {
      await apiClient.put(`/training/bonuses/${bonusId}/pay`);
      notify.success('Bono marcado como pagado');
      loadData();
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Gestión de Bonificaciones" />
      <div data-test-context="bonus-management-page">
        <div className="rounded-xl bg-white shadow-1 dark:bg-gray-dark">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('ranges')}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium ${activeTab === 'ranges' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-gray-500'}`}
            >
              <Gift size={16} /> Rangos de Bonificación
            </button>
            <button
              onClick={() => setActiveTab('bonuses')}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium ${activeTab === 'bonuses' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-gray-500'}`}
            >
              <Award size={16} /> Bonos Generados
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
              </div>
            ) : activeTab === 'ranges' ? (
              /* ─── TAB: RANGOS ────────────────────────────────────────── */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Los empleados que superen las horas mínimas trimestrales recibirán el bono del rango que les corresponda.</p>
                  <Button size="sm" onClick={() => openRangeModal()}>
                    <Plus size={14} className="mr-1" /> Nuevo Rango
                  </Button>
                </div>

                {ranges.filter(r => r.active).length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">No hay rangos configurados.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {ranges.filter(r => r.active).map(range => (
                      <div key={range._id} className="rounded-xl border border-gray-100 p-4 dark:border-gray-700" style={{ borderLeftColor: range.color, borderLeftWidth: '4px' }}>
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-800 dark:text-white">{range.name}</h4>
                          <div className="flex gap-1">
                            <button onClick={() => openRangeModal(range)} className="p-1 text-gray-400 hover:text-brand-500"><Edit3 size={14} /></button>
                            <button onClick={() => deleteRange(range._id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{range.minHours}h — {range.maxHours ? `${range.maxHours}h` : '∞'}</p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{range.prizeDescription}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-300">{PRIZE_TYPES[range.prizeType]}</span>
                          {range.prizeAmount && <span className="text-xs font-medium text-green-600">${range.prizeAmount.toLocaleString()} {range.prizeCurrency}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ─── TAB: BONOS GENERADOS ────────────────────────────────── */
              <div className="space-y-4">
                {/* Calcular */}
                <div className="flex flex-wrap items-end gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Trimestre</label>
                    <select value={calcQuarter} onChange={(e) => setCalcQuarter(Number(e.target.value))}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                      <option value={1}>Q1 (Ene-Mar)</option>
                      <option value={2}>Q2 (Abr-Jun)</option>
                      <option value={3}>Q3 (Jul-Sep)</option>
                      <option value={4}>Q4 (Oct-Dic)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Año</label>
                    <input type="number" value={calcYear} onChange={(e) => setCalcYear(Number(e.target.value))}
                      className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                  </div>
                  <Button size="sm" onClick={calculateBonuses} disabled={calculating}>
                    <Calculator size={14} className="mr-1" /> {calculating ? 'Calculando...' : 'Calcular Bonos'}
                  </Button>
                </div>

                {/* Lista de bonos pendientes */}
                {bonuses.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">No hay bonos pendientes de pago.</p>
                ) : (
                  <div className="space-y-2">
                    {bonuses.map(bonus => (
                      <div key={bonus._id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: bonus.bonusRange.color }} />
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">{bonus.employee.name}</p>
                            <p className="text-xs text-gray-400">Q{bonus.quarter}/{bonus.year} — {bonus.totalHours}h — {bonus.bonusRange.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{bonus.bonusRange.prizeDescription}</span>
                          {bonus.status === 'pending' ? (
                            <Button size="sm" variant="outline" onClick={() => markPaid(bonus._id)}>
                              <DollarSign size={12} className="mr-1" /> Marcar Pagado
                            </Button>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 size={12} /> {bonus.status === 'paid' ? 'Pagado' : 'Reconocido'}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal de rango */}
        <Modal isOpen={showRangeModal} onClose={() => setShowRangeModal(false)} className="max-w-md p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            {editingRange ? 'Editar Rango' : 'Nuevo Rango de Bonificación'}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre *</label>
              <input type="text" value={rangeForm.name} onChange={(e) => setRangeForm(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Oro"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Horas mínimas *</label>
                <input type="number" value={rangeForm.minHours} onChange={(e) => setRangeForm(p => ({ ...p, minHours: Number(e.target.value) }))} min={0}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Horas máximas</label>
                <input type="number" value={rangeForm.maxHours} onChange={(e) => setRangeForm(p => ({ ...p, maxHours: e.target.value }))} placeholder="∞"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de premio</label>
              <select value={rangeForm.prizeType} onChange={(e) => setRangeForm(p => ({ ...p, prizeType: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option value="symbolic">Simbólico (certificado, reconocimiento)</option>
                <option value="monetary">Monetario</option>
                <option value="time_off">Tiempo libre</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción del premio *</label>
              <input type="text" value={rangeForm.prizeDescription} onChange={(e) => setRangeForm(p => ({ ...p, prizeDescription: e.target.value }))} placeholder="Ej: $100.000 COP + Certificado"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </div>
            {rangeForm.prizeType === 'monetary' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Monto</label>
                  <input type="number" value={rangeForm.prizeAmount} onChange={(e) => setRangeForm(p => ({ ...p, prizeAmount: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Moneda</label>
                  <select value={rangeForm.prizeCurrency} onChange={(e) => setRangeForm(p => ({ ...p, prizeCurrency: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    <option value="COP">COP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
              <input type="color" value={rangeForm.color} onChange={(e) => setRangeForm(p => ({ ...p, color: e.target.value }))} className="h-10 w-20 rounded border-0 cursor-pointer" />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRangeModal(false)}>Cancelar</Button>
            <Button onClick={saveRange}>{editingRange ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </Modal>
      </div>
    </>
  );
});

export default BonusManagement;
