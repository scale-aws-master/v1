import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Start({ user }) {
  const [accessCards, setAccessCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchAccessCards = async () => {
      try {
        const response = await axios.get('/api/access-cards', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAccessCards(response.data);
        const lastUsedCard = localStorage.getItem('lastUsedCard');
        if (lastUsedCard) {
          const card = response.data.find(c => c.accesscard_id === parseInt(lastUsedCard));
          if (card) setSelectedCard(card);
        } else if (response.data.length > 0) {
          setSelectedCard(response.data[0]);
        }
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
        setError(`Failed to fetch access cards: ${errorMessage}`);
        console.error('Fetch error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message
        });
      }
    };
  
    fetchAccessCards();
  }, []);

  const handleCardChange = (card) => {
    setSelectedCard(card);
    localStorage.setItem('lastUsedCard', card.accesscard_id);
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!selectedCard) return <div>Loading...</div>;

  return (
    <div className="start-container">
      <h2>Welcome to the Multi-School Portal</h2>
      
      <div className="access-card-selector">
        <h3>Select Access Card</h3>
        <select 
          value={selectedCard.accesscard_id} 
          onChange={(e) => handleCardChange(accessCards.find(c => c.accesscard_id === parseInt(e.target.value)))}
        >
          {accessCards.map(card => (
            <option key={card.accesscard_id} value={card.accesscard_id}>
              {card.email} - {card.role} {card.global ? '(Global)' : `(${card.school_name})`}
            </option>
          ))}
        </select>
      </div>

      <div className="user-info">
        <h3>Current Access Information</h3>
        <p><strong>Role:</strong> {selectedCard.role}</p>
        <p><strong>School:</strong> {selectedCard.global ? 'All Schools' : selectedCard.school_name}</p>
        <p><strong>Email:</strong> {selectedCard.email}</p>
      </div>

      <div className="role-specific-content">
        <h3>Role-Specific Content</h3>
        {selectedCard.role === 'Student' && (
          <div className="student-content">
            <h4>Student Dashboard</h4>
            {selectedCard.school_name && (
              <div className="school-logo">
                <img 
                  src={selectedCard.logo_url} 
                  alt={`${selectedCard.school_name} logo`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-school-logo.png';
                  }}
                />
              </div>
            )}
            {/* Add student-specific content here */}
          </div>
        )}
        {selectedCard.role === 'Instructor' && (
          <div className="instructor-content">
            <h4>Instructor Dashboard</h4>
            {selectedCard.school_name && (
              <div className="school-logo">
                <img 
                  src={selectedCard.logo_url} 
                  alt={`${selectedCard.school_name} logo`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-school-logo.png';
                  }}
                />
              </div>
            )}
            {/* Add instructor-specific content here */}
          </div>
        )}
        {selectedCard.role === 'Admin' && (
          <div className="admin-content">
            <h4>Admin Dashboard</h4>
            {selectedCard.school_name && (
              <div className="school-logo">
                <img 
                  src={selectedCard.logo_url} 
                  alt={`${selectedCard.school_name} logo`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-school-logo.png';
                  }}
                />
              </div>
            )}
            {/* Add admin-specific content here */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Start; 