import React, { useState } from 'react';
import './DeviceForm.css'
import { GrClose } from "react-icons/gr";

function DeviceForm({ onClose, onSubmit, client, device_data}) {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    setIsOn(!isOn); // Toggle the state of isOn
    if (client) {
        const message = isOn ? 0 : 1;
        
        client.publish('home/devices/data/' + device_data.id, JSON.stringify(message), (err) => {
            if (err) {
                console.error('Error publishing message:', err);
            } else {
                console.log('Message published successfully:' + message);
            }
        });
    }
  };

  return (
    <div className="container">
        <div className='field'>
            <div className='header'>
                <GrClose className="close-btn" onClick={onClose} />
                <h2>{device_data.name}</h2>
            </div>
            {device_data.type === "light" && 
            <div className="toggle-btn-container">
                <button className="toggle-btn" onClick={handleToggle}>
                    {isOn ? 'Turn Off' : 'Turn On'}
                </button>
            </div>}
            {device_data.type === "color-light" && 
            <div className="toggle-btn-container">
                <p>TODO: COLOR PICKER</p>
            </div>}
            {device_data.type === "temperature" && 
            <div className="toggle-btn-container">
                <p>TEMP</p>
            </div>}
            {device_data.type === "camera" &&
            <div>
                <img src={`data:image/jpg;base64,${device_data.data}`} alt="Received Image" />
            </div>}
        </div>
    </div>
  );
}

export default DeviceForm;
