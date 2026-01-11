import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { format, isAfter, isBefore, isToday, isSameDay } from "date-fns";
import { campusEvents } from "../data/mockData";
import Sidebar from "../components/Sidebar";
import "../styles/Events.css";

export default function Events() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const now = new Date();
  
  // Filter Logic
  const upcomingEvents = campusEvents.filter(event => isAfter(new Date(event.date), now));
  const pastEvents = campusEvents.filter(event => isBefore(new Date(event.date), now) && !isToday(new Date(event.date)));
  const ongoingEvents = campusEvents.filter(event => {
    const eventDate = new Date(event.date);
    return isToday(eventDate) || (event.endDate && isBefore(new Date(event.date), now) && isAfter(new Date(event.endDate), now));
  });

  const eventsOnSelectedDate = campusEvents.filter(event => 
    isSameDay(new Date(event.date), selectedDate)
  );

  // Helper Component for Event Card
  const EventCard = ({ event }) => (
    <div className="event-card">
      <img src={event.image} alt={event.title} className="event-thumb" />
      <div className="event-details">
        <div className="event-top-row">
          <h3 className="event-name">{event.title}</h3>
          <span className={`category-badge cat-${event.category}`}>
            {event.category}
          </span>
        </div>
        <p className="event-desc">{event.description}</p>
        
        <div className="event-meta">
          <div className="meta-item">
            <CalendarDays size={14} />
            {format(new Date(event.date), "MMM d, yyyy")}
          </div>
          <div className="meta-item">
            <Clock size={14} />
            {event.time}
          </div>
          <div className="meta-item">
            <MapPin size={14} />
            {event.location}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="events-container">
        <Sidebar />
      {/* Header */}
      <div className="events-header">
        <div className="events-icon-wrapper">
          <CalendarDays size={28} />
        </div>
        <div className="events-title">
          <h1>Campus Events</h1>
          <p>Discover what's happening on campus</p>
        </div>
      </div>

      <div className="events-layout">
        
        {/* Left Column: Events List */}
        <div className="events-main">
          
          {/* Custom Tabs */}
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
              {upcomingEvents.length > 0 && <span className="count-badge">{upcomingEvents.length}</span>}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'ongoing' ? 'active' : ''}`}
              onClick={() => setActiveTab('ongoing')}
            >
              Ongoing
              {ongoingEvents.length > 0 && <span className="count-badge green">{ongoingEvents.length}</span>}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Past
            </button>
          </div>

          {/* List Content */}
          <div className="event-list">
            {activeTab === 'upcoming' && upcomingEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
            {activeTab === 'ongoing' && ongoingEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
            {activeTab === 'past' && pastEvents.map(ev => <EventCard key={ev.id} event={ev} />)}

            {/* Empty State */}
            {activeTab === 'upcoming' && upcomingEvents.length === 0 && <p className="text-center text-gray-500 mt-8">No upcoming events.</p>}
          </div>

        </div>

        {/* Right Column: Calendar */}
        <div className="events-sidebar">
          
          <div className="calendar-card">
            <h3 className="card-title">Calendar</h3>
            <Calendar 
              onChange={setSelectedDate} 
              value={selectedDate} 
              className="custom-calendar"
            />
          </div>

          <div className="selected-day-events">
            <h3 className="card-title">{format(selectedDate, "MMMM d, yyyy")}</h3>
            
            {eventsOnSelectedDate.length > 0 ? (
              eventsOnSelectedDate.map(event => (
                <div key={event.id} className="mini-event">
                  <h4>{event.title}</h4>
                  <p className="flex items-center gap-1">
                     <Clock size={12} /> {event.time}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No events on this date.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}