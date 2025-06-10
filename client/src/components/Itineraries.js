import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import Modal from 'react-modal';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Itineraries.css';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function Itineraries() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(),
    location: '',
    notes: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/itineraries');
      const formattedEvents = response.data.flatMap(itinerary => 
        itinerary.Activities.map(activity => ({
          id: activity.id,
          title: activity.name,
          start: new Date(activity.date),
          end: new Date(new Date(activity.date).getTime() + 60 * 60 * 1000), // 1 hour duration
          desc: activity.notes,
          location: activity.location,
          itineraryId: itinerary.id
        }))
      );
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSelect = ({ start, end }) => {
    setFormData({
      title: '',
      description: '',
      start,
      end,
      location: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.desc || '',
      start: event.start,
      end: event.end,
      location: event.location || '',
      notes: event.desc || ''
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const activityData = {
        name: formData.title,
        date: formData.start,
        location: formData.location,
        notes: formData.notes
      };

      if (selectedEvent) {
        // Update existing event
        await axios.put(`http://localhost:5000/api/itineraries/${selectedEvent.itineraryId}`, {
          activities: [activityData]
        });
      } else {
        // Create new event
        await axios.post('http://localhost:5000/api/itineraries', {
          title: formData.title,
          description: formData.description,
          startDate: formData.start,
          endDate: formData.end,
          activities: [activityData]
        });
      }

      setIsModalOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      await axios.delete(`http://localhost:5000/api/itineraries/${selectedEvent.itineraryId}`);
      setIsModalOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="itineraries">
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectSlot={handleSelect}
          onSelectEvent={handleEventClick}
          selectable
          views={['month', 'week', 'day', 'agenda']}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button
          className="modal-close"
          onClick={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
        >
          ×
        </button>

        <h2>{selectedEvent ? 'Edit Activity' : 'Add Activity'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Activity Name:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="start">Start Time:</label>
            <input
              type="datetime-local"
              id="start"
              name="start"
              value={format(formData.start, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                start: new Date(e.target.value)
              }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end">End Time:</label>
            <input
              type="datetime-local"
              id="end"
              name="end"
              value={format(formData.end, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                end: new Date(e.target.value)
              }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes:</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit">
              {selectedEvent ? 'Update Activity' : 'Add Activity'}
            </button>
            {selectedEvent && (
              <button
                type="button"
                onClick={handleDelete}
                className="delete-btn"
              >
                Delete Activity
              </button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Itineraries; 