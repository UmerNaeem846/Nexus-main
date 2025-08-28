import React, { useState} from "react";
import MeetingCalendar, { CalendarEvent } from "../../components/Calendar/MeetingCalendar";

const initialMeetings: CalendarEvent[] = [
  {
    id: "1",
    title: "Investor Meeting",
    start: "2025-08-30T10:00:00",
    end: "2025-08-30T11:00:00",
    status: "confirmed",
  },
  {
    id: "2",
    title: "Pitch Practice",
    start: "2025-09-01T15:00:00",
    end: "2025-09-01T16:00:00",
    status: "requested",
  },
];
const CalendarPage: React.FC = () => {
    const [meetings, setMeetings] = useState<CalendarEvent[]>(initialMeetings);
    
    return (
        <div className="p-6">
            <MeetingCalendar initialEvents={meetings} />
        </div>
    );
};

export default CalendarPage;