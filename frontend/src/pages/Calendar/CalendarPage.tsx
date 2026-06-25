import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../utils/PageMeta";
import { usePermissions } from "../../hooks/usePermissions";
import SearchableSelect from "../../components/form/SearchableSelect";
import Holidays from "date-holidays";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    isHoliday?: boolean;
    country?: string;
  };
}

const eventColors: Record<string, string> = {
  Danger: "danger",
  Success: "success",
  Primary: "primary",
  Warning: "warning",
};

const CalendarPage: React.FC = () => {
  const { can } = usePermissions();
  const canCreateEvent = can('employees', 'update'); // HR/CEO/Founder tienen este permiso
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLevel, setEventLevel] = useState("Primary");
  const [eventType, setEventType] = useState("other");
  const [eventLink, setEventLink] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  // Cargar festivos y eventos al montar
  useEffect(() => {
    loadHolidays();
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await (await import('../../api/client')).default.get('/calendar/events');
      const dbEvents: CalendarEvent[] = (res.data?.data || []).map((e: any) => ({
        id: e._id,
        title: e.title,
        start: e.startDate?.split('T')[0],
        end: e.endDate?.split('T')[0],
        allDay: e.allDay,
        extendedProps: {
          calendar: e.color === 'primary' ? 'Primary' : e.color === 'success' ? 'Success' : e.color === 'warning' ? 'Warning' : 'Danger',
          isHoliday: false,
          type: e.type,
          startTime: e.startTime || '',
          endTime: e.endTime || '',
          link: e.link || '',
        },
      }));
      setEvents(prev => [...prev.filter(e => e.extendedProps.isHoliday), ...dbEvents]);
    } catch { /* silent */ }
  };

  const loadHolidays = () => {
    const hd = new Holidays();
    const year = new Date().getFullYear();
    const countries = ['CO', 'US']; // Colombia y Estados Unidos
    const holidayEvents: CalendarEvent[] = [];

    countries.forEach(country => {
      hd.init(country);
      const holidays = hd.getHolidays(year);

      holidays.forEach((h: any) => {
        if (h.type === 'public') {
          holidayEvents.push({
            id: `holiday-${country}-${h.date}`,
            title: h.name,
            start: h.date.split(' ')[0],
            allDay: true,
            extendedProps: {
              calendar: country === 'CO' ? 'Warning' : 'Primary',
              isHoliday: true,
              country,
            },
          });
        }
      });
    });

    setEvents(holidayEvents);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (!canCreateEvent) return; // Solo HR/CEO/Founder
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    if (event.extendedProps.isHoliday) return;
    if (!canCreateEvent) return;

    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || event.start?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar || "Primary");
    setEventType(event.extendedProps.type || "other");
    setEventStartTime(event.extendedProps.startTime || "");
    setEventEndTime(event.extendedProps.endTime || "");
    setEventLink(event.extendedProps.link || "");
    openModal();
  };

  const handleAddOrUpdateEvent = async () => {
    if (!eventTitle.trim()) return;

    const apiClient = (await import('../../api/client')).default;
    const colorMap: Record<string, string> = { Primary: 'primary', Success: 'success', Warning: 'warning', Danger: 'danger' };
    const payload = {
      title: eventTitle,
      startDate: eventStartDate,
      endDate: eventEndDate,
      startTime: eventStartTime || undefined,
      endTime: eventEndTime || undefined,
      color: colorMap[eventLevel] || 'primary',
      type: eventType,
      link: eventLink || undefined,
      allDay: !eventStartTime,
    };

    try {
      if (selectedEvent && !selectedEvent.extendedProps?.isHoliday) {
        await apiClient.put(`/calendar/events/${selectedEvent.id}`, payload);
      } else {
        await apiClient.post('/calendar/events', payload);
      }
      await loadEvents();
    } catch { /* silent */ }

    closeModal();
    resetModalFields();
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        const apiClient = (await import('../../api/client')).default;
        await apiClient.delete(`/calendar/events/${selectedEvent.id}`);
        await loadEvents();
      } catch { /* silent */ }
      closeModal();
      resetModalFields();
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventStartTime("");
    setEventEndTime("");
    setEventLevel("Primary");
    setEventType("other");
    setEventLink("");
    setSelectedEvent(null);
  };

  return (
    <>
      <PageMeta title="Calendario - RH UNLIMITECH" description="Calendario con festivos y eventos" />
      <PageBreadcrumb pageTitle="Calendario" />

      {/* Leyenda */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="https://flagcdn.com/16x12/co.png" alt="CO" className="w-4 h-3 rounded-sm" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Festivos Colombia</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="https://flagcdn.com/16x12/us.png" alt="US" className="w-4 h-3 rounded-sm" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Festivos Estados Unidos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Eventos</span>
          </div>
        </div>
        <Link to="/calendar/events" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">
          Ver lista de eventos
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: canCreateEvent ? "prev,next addEventButton" : "prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable={canCreateEvent}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            locale="es"
            buttonText={{
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
            }}
            customButtons={{
              addEventButton: {
                text: "+ Evento",
                click: () => {
                  resetModalFields();
                  setEventStartDate(new Date().toISOString().split("T")[0]);
                  setEventEndDate(new Date().toISOString().split("T")[0]);
                  openModal();
                },
              },
            }}
          />
        </div>

        {/* Modal crear/editar evento */}
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6 lg:p-10">
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar max-h-[75vh]">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 text-xl dark:text-white/90 lg:text-2xl">
                {selectedEvent ? "Editar Evento" : "Nuevo Evento"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Programa un evento en el calendario
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {/* Título */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Título del evento *
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Ej: Reunión de equipo"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              {/* Tipo de evento */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Tipo de evento
                </label>
                <SearchableSelect
                  id="event-type"
                  options={[
                    { value: "meeting", label: "Reunión" },
                    { value: "deadline", label: "Fecha límite" },
                    { value: "reminder", label: "Recordatorio" },
                    { value: "training", label: "Capacitación" },
                    { value: "holiday", label: "Festivo" },
                    { value: "other", label: "Otro" },
                  ]}
                  value={eventType}
                  onChange={(v) => setEventType(v)}
                  placeholder="Seleccionar tipo..."
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Fecha inicio *</label>
                  <input type="date" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Fecha fin *</label>
                  <input type="date" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
                </div>
              </div>

              {/* Horas */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Hora inicio</label>
                  <input type="time" value={eventStartTime} onChange={(e) => setEventStartTime(e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Hora fin</label>
                  <input type="time" value={eventEndTime} onChange={(e) => setEventEndTime(e.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Link del evento (opcional)
                </label>
                <input
                  type="url"
                  value={eventLink}
                  onChange={(e) => setEventLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-400">Color</label>
                <div className="flex flex-wrap items-center gap-4">
                  {Object.entries(eventColors).map(([key]) => (
                    <label key={key} className="flex items-center text-sm text-gray-700 dark:text-gray-400 cursor-pointer">
                      <span className="relative mr-2">
                        <input type="radio" name="event-level" value={key} checked={eventLevel === key} onChange={() => setEventLevel(key)} className="sr-only" />
                        <span className={`rounded-full flex items-center justify-center w-5 h-5 border ${eventLevel === key ? 'border-brand-500 bg-brand-500' : 'border-gray-300 dark:border-gray-700'}`}>
                          {eventLevel === key && <span className="h-2 w-2 rounded-full bg-white"></span>}
                        </span>
                      </span>
                      {key === 'Primary' ? 'Azul' : key === 'Success' ? 'Verde' : key === 'Warning' ? 'Naranja' : 'Rojo'}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6 sm:justify-end">
              {selectedEvent && (
                <button onClick={handleDeleteEvent} type="button" className="flex w-full justify-center rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 sm:w-auto">
                  Eliminar
                </button>
              )}
              <button onClick={closeModal} type="button" className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:w-auto">
                Cancelar
              </button>
              <button onClick={handleAddOrUpdateEvent} type="button" className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto">
                {selectedEvent ? "Actualizar" : "Crear Evento"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const calendar = eventInfo.event.extendedProps.calendar || 'Primary';
  const isHoliday = eventInfo.event.extendedProps.isHoliday;
  const country = eventInfo.event.extendedProps.country;
  
  const bgColors: Record<string, string> = {
    Primary: 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300',
    Success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    Warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    Danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const dotColors: Record<string, string> = {
    Primary: 'bg-brand-500',
    Success: 'bg-green-500',
    Warning: 'bg-orange-500',
    Danger: 'bg-red-500',
  };

  const colorClass = bgColors[calendar] || bgColors.Primary;
  const dotClass = dotColors[calendar] || dotColors.Primary;

  return (
    <div className={`${colorClass} px-2 py-1 rounded text-xs font-medium truncate w-full flex items-center gap-1.5`}>
      {isHoliday && country && (
        <img 
          src={`https://flagcdn.com/16x12/${country.toLowerCase()}.png`} 
          alt={country} 
          className="w-4 h-3 shrink-0 rounded-sm"
        />
      )}
      {!isHoliday && <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`}></span>}
      <span className="truncate">{eventInfo.event.title}</span>
    </div>
  );
};

export default CalendarPage;
