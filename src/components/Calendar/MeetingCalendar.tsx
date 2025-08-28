"use client";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Dialog } from "@headlessui/react";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  status: "available" | "requested" | "confirmed";
}

export default function MeetingCalendarPage({ initialEvents = [] }: { initialEvents?: CalendarEvent[] }) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [activeTab, setActiveTab] = useState<"calendar" | "upcoming" | "add">("calendar");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState<CalendarEvent | null>(null);

  const getStatusClasses = (status: CalendarEvent["status"]) => {
    switch (status) {
      case "available": return "bg-blue-100 text-blue-800 border-blue-500";
      case "requested": return "bg-yellow-100 text-yellow-800 border-yellow-400";
      case "confirmed": return "bg-green-100 text-green-800 border-green-500";
      default: return "bg-gray-100 text-gray-800 border-gray-400";
    }
  };

  const openModal = (event?: CalendarEvent) => {
    setModalEvent(event || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalEvent(null);
    setIsModalOpen(false);
  };

  const saveEvent = (title: string, status: CalendarEvent["status"], start: Date, end: Date) => {
    if (modalEvent) {
      // Edit existing
      setEvents(events.map(ev => ev.id === modalEvent.id ? { ...ev, title, status, start, end } : ev));
    } else {
      // Add new
      setEvents([...events, { id: String(Date.now()), title, status, start, end }]);
    }
    closeModal();
  };

  const deleteEvent = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const handleDateClick = (info: DateSelectArg) => {
    openModal({ id: "", title: "", start: info.start!, end: info.end ?? info.start!, status: "available" });
  };

  const handleEventClick = (info: EventClickArg) => {
    const clicked = events.find(e => e.id === info.event.id);
    if (!clicked) return;
    openModal(clicked);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-indigo-600">📅 Meeting Scheduler</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-300 mb-4">
        {["calendar", "upcoming", "add"].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 font-semibold rounded-t-lg transition ${activeTab === tab ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab === "calendar" ? "📅 Calendar" : tab === "upcoming" ? "📌 Upcoming Meetings" : "➕ Add/Modify Slots"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* Calendar Section */}
        {activeTab === "calendar" && (
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              selectable
              select={handleDateClick}
              eventClick={handleEventClick}
              height="700px"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events.map(ev => ({ ...ev, display: "block" }))}
              eventContent={(info) => (
                <div className={`p-2 rounded-lg border-l-4 shadow-sm flex flex-col gap-1 ${getStatusClasses(info.event.extendedProps.status)}`}>
                  <span className="font-medium text-sm">{info.event.title}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border">
                    {info.event.extendedProps.status.toUpperCase()}
                  </span>
                </div>
              )}
            />
          </div>
        )}

        {/* Upcoming Meetings Section */}
        {activeTab === "upcoming" && (
          <div className="bg-white p-6 rounded-2xl shadow-md space-y-3">
            {events.length === 0 ? (
              <p className="text-gray-500">No upcoming meetings</p>
            ) : (
              events.map(e => (
                <div key={e.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                  <div>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-xs text-gray-600">{new Date(e.start).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${getStatusClasses(e.status)}`}>
                      {e.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => openModal(e)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(e.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}


        {/* Add/Modify Slots Section */}
        {activeTab === "add" && (
          <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
            <h3 className="font-semibold text-lg">➕ Add New Availability Slot</h3>
            <button
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              onClick={() => openModal()}
            >
              Add Slot
            </button>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit */}
      <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg space-y-4">
            <Dialog.Title className="text-lg font-bold">{modalEvent ? "Edit Slot" : "Add Slot"}</Dialog.Title>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = formData.get("title") as string;
                const status = formData.get("status") as CalendarEvent["status"];
                const start = new Date(formData.get("start") as string);
                const end = new Date(formData.get("end") as string);
                saveEvent(title, status, start, end);
              }}
              className="space-y-3"
            >
              <input
                type="text"
                name="title"
                defaultValue={modalEvent?.title || ""}
                placeholder="Event title"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              <select
                name="status"
                defaultValue={modalEvent?.status || "available"}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="available">Available</option>
                <option value="requested">Requested</option>
                <option value="confirmed">Confirmed</option>
              </select>
              <input
                type="date"
                name="start"
                defaultValue={modalEvent ? new Date(modalEvent.start).toISOString().slice(0, 10) : ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              <input
                type="date"
                name="end"
                defaultValue={modalEvent ? new Date(modalEvent.end).toISOString().slice(0, 10) : ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
