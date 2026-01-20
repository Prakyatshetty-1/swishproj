import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarDays, Clock, MapPin, Users, Plus, Trash2, Edit2, X } from "lucide-react";
import { format, isAfter, isBefore, isToday, isSameDay } from "date-fns";
import Sidebar from "../components/Sidebar";
import AddEventModal from "../components/AddEventModal";
import "../styles/Events.css";

const API_URL = 'http://localhost:5000/api/events';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endDate: "",
    location: "",
    category: "academic",
    attendees: 0,
    image: null,
    imagePreview: null,
  });

  const now = new Date();

  // Check if user is admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsAdmin(user.role === "admin");
  }, []);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        setEvents(data.events || []);
        setError("");
      } catch (err) {
        console.error("Fetch events error:", err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter Logic
  const upcomingEvents = events.filter(event => isAfter(new Date(event.date), now));
  const pastEvents = events.filter(event => isBefore(new Date(event.date), now) && !isToday(new Date(event.date)));
  const ongoingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return isToday(eventDate) || (event.endDate && isBefore(new Date(event.date), now) && isAfter(new Date(event.endDate), now));
  });

  const eventsOnSelectedDate = events.filter(event =>
    isSameDay(new Date(event.date), selectedDate)
  );

  // Check if a date has events
  const hasEventsOnDate = (date) => {
    return events.some(event => isSameDay(new Date(event.date), date));
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Please login to create events");
        return;
      }

      const endpoint = editingEvent 
        ? `${API_URL}/${editingEvent._id}` 
        : API_URL;
      
      const method = editingEvent ? "PUT" : "POST";

      // Send as JSON with base64 imageUrl
      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        category: formData.category,
        attendees: parseInt(formData.attendees),
        ...(formData.endDate && { endDate: formData.endDate }),
        ...(formData.imagePreview && { imageUrl: formData.imagePreview }) // Send base64 preview
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save event");
      }

      // Update events list
      if (editingEvent) {
        setEvents(events.map(ev => ev._id === editingEvent._id ? data.event : ev));
      } else {
        setEvents([...events, data.event]);
      }

      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        endDate: "",
        location: "",
        category: "academic",
        attendees: 0,
        image: null,
        imagePreview: null,
      });
      setEditingEvent(null);
      setShowAddModal(false);
      setError("");
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Failed to save event");
    }
  };

  // Handle edit
  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0],
      time: event.time,
      endDate: event.endDate ? event.endDate.split('T')[0] : "",
      location: event.location,
      category: event.category,
      attendees: event.attendees,
      image: null,
      imagePreview: event.image || null, // Cloudinary URL
    });
    setShowAddModal(true);
  };

  // Handle delete
  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_URL}/${eventId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to delete event");

      setEvents(events.filter(ev => ev._id !== eventId));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete event");
    }
  };

  // Helper Component for Event Card
  const EventCard = ({ event }) => (
    <div className="event-card">
      <img src={event.image || "https://via.placeholder.com/400x300"} alt={event.title} className="event-thumb" />
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

        {isAdmin && (
          <div className="event-actions">
            <button
              className="btn-edit"
              onClick={() => handleEdit(event)}
              title="Edit event"
            >
              <Edit2 size={16} />
            </button>
            <button
              className="btn-delete"
              onClick={() => handleDelete(event._id)}
              title="Delete event"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="events-container">
        <Sidebar />
        <div className="events-header">
          <div className="events-icon-wrapper">
            <CalendarDays size={28} />
          </div>
          <div className="events-title">
            <h1>Campus Events</h1>
            <p>Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

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
        {isAdmin && (
          <button
            className="btn-add-event"
            onClick={() => {
              setEditingEvent(null);
              setFormData({
                title: "",
                description: "",
                date: "",
                time: "",
                endDate: "",
                location: "",
                category: "academic",
                attendees: 0,
                image: null,
                imagePreview: null,
              });
              setShowAddModal(true);
            }}
          >
            <Plus size={20} /> Add Event
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

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
            {activeTab === 'upcoming' && upcomingEvents.map(ev => <EventCard key={ev._id} event={ev} />)}
            {activeTab === 'ongoing' && ongoingEvents.map(ev => <EventCard key={ev._id} event={ev} />)}
            {activeTab === 'past' && pastEvents.map(ev => <EventCard key={ev._id} event={ev} />)}

            {/* Empty State */}
            {activeTab === 'upcoming' && upcomingEvents.length === 0 && <p className="text-center text-gray-500 mt-8">No upcoming events.</p>}
            {activeTab === 'ongoing' && ongoingEvents.length === 0 && <p className="text-center text-gray-500 mt-8">No ongoing events.</p>}
            {activeTab === 'past' && pastEvents.length === 0 && <p className="text-center text-gray-500 mt-8">No past events.</p>}
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
              tileClassName={({ date }) => hasEventsOnDate(date) ? "has-events" : ""}
            />
          </div>

          <div className="selected-day-events">
            <h3 className="card-title">{format(selectedDate, "MMMM d, yyyy")}</h3>

            {eventsOnSelectedDate.length > 0 ? (
              eventsOnSelectedDate.map(event => (
                <div key={event._id} className="mini-event">
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

      {/* Add/Edit Event Modal */}
      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        isEditing={editingEvent}
        loading={false}
      />
    </div>
  );
}