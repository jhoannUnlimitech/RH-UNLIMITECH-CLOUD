import { useState, useRef, useEffect } from "react";
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
  const [eventLevel, setEventLevel] = useState("Primary");
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
        extendedProps: { calendar: e.color === 'primary' ? 'Primary' : e.color === 'success' ? 'Success' : e.color === 'warning' ? 'Warning' : 'Danger', isHoliday: false, type: e.type },
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
    // No permitir editar festivos
    if (event.extendedProps.isHoliday) return;

    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar);
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
      color: colorMap[eventLevel] || 'primary',
      type: 'other',
      allDay: true,
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
    setEventLevel("Primary");
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
            <span className="w-3 h-3 rounded-full bg-warning-500"></span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Festivos Colombia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand-500"></span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Festivos Estados Unidos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success-500"></span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Eventos</span>
          </div>
        </div>
        <a href="/calendar/events" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Ver lista de eventos →
        </a>
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
            customButtons={canCreateEvent ? {
              addEventButton: {
                text: "+ Evento",
                click: () => {
                  resetModalFields();
                  setEventStartDate(new Date().toISOString().split("T")[0]);
                  setEventEndDate(new Date().toISOString().split("T")[0]);
                  openModal();
                },
              },
            } : undefined}
          />
        </div>

        {/* Modal crear/editar evento */}
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6 lg:p-10">
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
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
                  Título del evento
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Ej: Reunión de equipo"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Color del evento
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {Object.entries(eventColors).map(([key]) => (
                    <label key={key} className="flex items-center text-sm text-gray-700 dark:text-gray-400 cursor-pointer">
                      <span className="relative mr-2">
                        <input
                          type="radio"
                          name="event-level"
                          value={key}
                          checked={eventLevel === key}
                          onChange={() => setEventLevel(key)}
                          className="sr-only"
                        />
                        <span className={`rounded-full flex items-center justify-center w-5 h-5 border ${eventLevel === key ? 'border-brand-500 bg-brand-500' : 'border-gray-300 dark:border-gray-700'}`}>
                          {eventLevel === key && <span className="h-2 w-2 rounded-full bg-white"></span>}
                        </span>
                      </span>
                      {key === 'Primary' ? 'Azul' : key === 'Success' ? 'Verde' : key === 'Warning' ? 'Naranja' : 'Rojo'}
                    </label>
                  ))}
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6 sm:justify-end">
              {selectedEvent && (
                <button
                  onClick={handleDeleteEvent}
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 sm:w-auto"
                >
                  Eliminar
                </button>
              )}
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
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
  const isHoliday = eventInfo.event.extendedProps.isHoliday;
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  
  if (isHoliday) {
    const country = eventInfo.event.extendedProps.country;
    const flag = country === 'CO' ? '🇨🇴' : '🇺🇸';
    return (
      <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm items-center gap-1`}>
        <span className="text-base leading-none">{flag}</span>
        <div className="fc-event-title text-xs truncate">{eventInfo.event.title.replace(/🇨🇴|🇺🇸/, '').trim()}</div>
      </div>
    );
  }

  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default CalendarPage;
