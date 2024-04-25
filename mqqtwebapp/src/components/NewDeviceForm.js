import React, { useState } from 'react';
import './NewDeviceForm.css'

const NewDeviceForm = ({ onClose, onSubmit, registermessage }) => {
  const [id, setId] = useState(registermessage["client_id"]);
  const [type, setType] = useState(registermessage["client_type"]);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call the onSubmit prop with the name and room values
    onSubmit({ id, type, name, room });
    // Clear input fields
    setName('');
    setRoom('');
  };

  return (
    <div className='container'>
      <div className="field">
        <div className="popup-inner">
          <button className="close-btn" onClick={onClose}>Close</button>
          <h2>Enter details for device: {id}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="type">Type:</label>
              <input type="text" id="type" value={type} readOnly required />
            </div>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="room">Room:</label>
              <input type="text" id="room" value={room} onChange={(e) => setRoom(e.target.value)} required />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewDeviceForm;