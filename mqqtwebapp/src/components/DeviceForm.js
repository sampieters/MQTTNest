import React, { useState, useEffect } from 'react';
import './DeviceForm.css'
import { GrClose } from "react-icons/gr";

function DeviceForm({ onClose, onSubmit, client, device_data}) {
  const handleToggle = (key, cur_value) => {
    if (client) {
        const new_value = cur_value === 0 ? 1 : 0;
        const message = {[key]: new_value};
        client.publish('home/devices/data/' + device_data.id, JSON.stringify(message),  { retain: true }, (err) => {
            if (err) {
                console.error('Error publishing message:', err);
            } else {
                console.log('Message published successfully:' + JSON.stringify(message));
            }
        });
    }
  };

  const renderParameter = (key, value) => {
    if (value.toString() === 'bool') {
        // TODO: change cur_value with the right value
      const cur_value = device_data.data[key];
      return (
        <div className='param-container'>
            <div className='param-name'>{key}</div>
            <input type="checkbox" className="l" checked={cur_value} onClick={() => handleToggle(key, cur_value)}></input>
        </div>
      );
    } else if (typeof value === 'number') {
      return (
        <input
          key={key}
          type="number"
          value={value}
          readOnly
          onClick={() => console.log(`${key} input clicked`)}
        />
      );
    } else if (typeof value === 'string') {
      return (
        <input
          key={key}
          type="text"
          value={value}
          readOnly
          onClick={() => console.log(`${key} input clicked`)}
        />
      );
    } else {
      return (
        <div key={key} onClick={() => console.log(`${key} clicked`)}>
          {key}: {value.toString()}
        </div>
      );
    }
  };

  return (
    <div className="container">
        <div className='field'>
            <div className='header'>
                <GrClose className="close-btn" onClick={onClose} />
                <h2>{device_data.name}</h2>
            </div>
            <div className='input-params'>
                {Object.entries(device_data.parameters).map(([key, value]) => renderParameter(key, value))}
            </div>
        </div>
    </div>
  );
}

export default DeviceForm;
