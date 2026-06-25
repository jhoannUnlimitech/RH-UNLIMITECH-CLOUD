import { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router";
import { observer } from "mobx-react-lite";
import flatpickr from "flatpickr";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import SearchableSelect from "../../components/form/SearchableSelect";
import Pagination from "../../components/ui/pagination/Pagination";
import apiClient from "../../api/client";
import { usePermissions } from "../../hooks/usePermissions";
import { PencilIcon, TrashBinIcon, CalenderIcon } from "../../icons";
import { notify } from "../../utils/toast";

interface CalEvent {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  color: string;
  type: string;
  allDay: boolean;
  link?: string;
  createdBy?: { _id: string; name: string; email: string };
}

const typeLabels: Record<string, string> = { meeting: "Reunión", holiday: "Festivo", reminder: "Recordatorio", deadline: "Fecha límite", other: "Otro" };
const colorBadges: Record<string, "info" | "success" | "warning" | "error"> = { primary: "info", success: "success", warning: "warning", danger: "error" };
const typeOptions = [
  { value: "", label: "Todos los tipos" },
  { value: "meeting", label: "Reunión" },
  { value: "holiday", label: "Festivo" },
  { value: "reminder", label: "Recordatorio" },
  { value: "deadline", label: "Fecha límite" },
  { value: "other", label: "Otro" },
];

const EventsList = observer(() => {
  const { can } = usePermissions();
  const canManage = can("employees", "update");
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const datePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadEvents(); }, [typeFilter, fromDate, toDate]);

  // Flatpickr range datepicker
  useEffect(() => {
    if (!datePickerRef.current) return;
    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      dateFormat: "d M",
      locale: Spanish,
      clickOpens: true,
      prevArrow: '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      nextArrow: '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 15L12.5 10L7.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          setFromDate(selectedDates[0].toISOString().split('T')[0]);
          setToDate(selectedDates[1].toISOString().split('T')[0]);
          setCurrentPage(1);
        } else if (selectedDates.length === 0) {
          setFromDate("");
          setToDate("");
        }
      },
    });
    return () => { if (!Array.isArray(fp)) fp.destroy(); };
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (typeFilter) params.type = typeFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const res = await apiClient.get("/calendar/events", { params });
      setEvents(res.data?.data || []);
    } catch { setEvents([]); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este evento?")) return;
    try {
      await apiClient.delete(`/calendar/events/${id}`);
      notify.success("Evento eliminado");
      loadEvents();
    } catch { notify.error("Error al eliminar"); }
  };

  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editType, setEditType] = useState("other");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleEdit = (event: CalEvent) => {
    setEditingEvent(event);
    setEditTitle(event.title);
    setEditLink(event.link || "");
    setEditType(event.type);
    setEditStartDate(event.startDate?.split('T')[0] || "");
    setEditEndDate(event.endDate?.split('T')[0] || "");
    setEditStartTime(event.startTime || "");
    setEditEndTime(event.endTime || "");
    setEditDescription(event.description || "");
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;
    try {
      await apiClient.put(`/calendar/events/${editingEvent._id}`, {
        title: editTitle,
        description: editDescription || undefined,
        link: editLink || undefined,
        type: editType,
        startDate: editStartDate,
        endDate: editEndDate,
        startTime: editStartTime || undefined,
        endTime: editEndTime || undefined,
        allDay: !editStartTime,
      });
      notify.success("Evento actualizado");
      setEditingEvent(null);
      loadEvents();
    } catch { notify.error("Error al actualizar"); }
  };

  const totalPages = Math.ceil(events.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = events.slice(startIdx, startIdx + itemsPerPage);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb pageTitle="Lista de Eventos" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Lista de Eventos
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Consulta y filtra los eventos del calendario
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03]">
        {/* Filtros */}
        <div className="flex flex-col gap-3 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Mostrar</span>
            <select
              className="py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none h-9 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
            </select>
            <span className="text-gray-500 dark:text-gray-400 text-sm">registros</span>
            <div className="w-[160px]">
              <SearchableSelect id="type-filter" options={typeOptions} value={typeFilter} onChange={(v) => { setTypeFilter(v); setCurrentPage(1); }} placeholder="Tipo..." />
            </div>
            <div className="relative inline-flex items-center">
              <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
              <input
                ref={datePickerRef}
                className="h-10 w-48 pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
                placeholder="Rango de fechas"
              />
            </div>
          </div>
          <Link to="/calendar" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">
            ← Calendario
          </Link>
        </div>

        {loading && (
          <div className="p-8 text-center border border-gray-100 dark:border-white/[0.05]">
            <div className="w-8 h-8 border-4 border-gray-300 rounded-full border-t-brand-600 animate-spin mx-auto"></div>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="p-12 text-center border border-gray-100 dark:border-white/[0.05]">
            <p className="text-gray-500">No hay eventos con esos filtros</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <>
            <div className="max-w-full overflow-x-auto border border-gray-100 dark:border-white/[0.05]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader className="py-3 px-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Título</TableCell>
                    <TableCell isHeader className="py-3 px-4 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Tipo</TableCell>
                    <TableCell isHeader className="py-3 px-4 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Fecha</TableCell>
                    <TableCell isHeader className="py-3 px-4 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Horario</TableCell>
                    <TableCell isHeader className="py-3 px-4 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Creado por</TableCell>
                    {canManage && <TableCell isHeader className="py-3 px-4 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Acciones</TableCell>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((event) => (
                    <TableRow key={event._id} className="border-b border-gray-100 dark:border-gray-800">
                      <TableCell className="py-3 px-4">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{event.title}</p>
                          {event.description && <p className="text-xs text-gray-500 mt-1 max-w-[300px]">{event.description}</p>}
                          {event.link && (
                            <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:text-brand-700 mt-1 inline-flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              Link
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <Badge color={colorBadges[event.color] || "info"}>{typeLabels[event.type] || event.type}</Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(event.startDate)}</span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {event.startTime && event.endTime ? `${event.startTime} - ${event.endTime}` : event.startTime || 'Todo el día'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{event.createdBy?.name || "—"}</span>
                      </TableCell>
                      {canManage && (
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {event.link && (
                              <a href={event.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]" title="Abrir link">
                                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              </a>
                            )}
                            <button onClick={() => handleEdit(event)} className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-white/[0.05]" title="Editar">
                              <PencilIcon className="h-[18px] w-[18px]" />
                            </button>
                            <button onClick={() => handleDelete(event._id)} className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-white/[0.05]" title="Eliminar">
                              <TrashBinIcon className="h-[18px] w-[18px]" />
                            </button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="border border-t-0 border-gray-100 dark:border-white/[0.05] rounded-b-xl">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} startIndex={startIdx + 1} endIndex={Math.min(startIdx + itemsPerPage, events.length)} totalItems={events.length} />
            </div>
          </>
        )}
      </div>

      {/* Modal de edición */}
      {editingEvent && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditingEvent(null)}></div>
          <div className="relative w-full max-w-[600px] max-h-[80vh] overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900 shadow-xl">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-5">Editar Evento</h4>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Título *</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Tipo</label>
                <SearchableSelect
                  id="edit-event-type"
                  options={[
                    { value: "meeting", label: "Reunión" },
                    { value: "deadline", label: "Fecha límite" },
                    { value: "reminder", label: "Recordatorio" },
                    { value: "training", label: "Capacitación" },
                    { value: "other", label: "Otro" },
                  ]}
                  value={editType}
                  onChange={(v) => setEditType(v)}
                  placeholder="Seleccionar tipo..."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Descripción</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Fecha inicio *</label>
                  <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Fecha fin *</label>
                  <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Hora inicio</label>
                  <input type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Hora fin</label>
                  <input type="time" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Link (opcional)</label>
                <input type="url" value={editLink} onChange={(e) => setEditLink(e.target.value)} placeholder="https://..." className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setEditingEvent(null)} className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">Cancelar</button>
              <button onClick={handleSaveEdit} className="px-4 py-2.5 rounded-lg bg-brand-500 text-sm font-medium text-white hover:bg-brand-600">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default EventsList;
