import React, { useState, useEffect } from 'react';
import './DeviceForm.css'
import { GrClose } from "react-icons/gr";
import { ChromePicker } from 'react-color';

function DeviceForm({ onClose, onSubmit, client, device_data}) {
  const handleToggle = (key, cur_value) => {
    if (client) {
        device_data.data[key] = cur_value === 0 ? 1 : 0;
        const message = device_data.data;
        client.publish('home/devices/data/' + device_data.id, JSON.stringify(message),  { retain: true }, (err) => {
            if (err) {
                console.error('Error publishing message:', err);
            } else {
                console.log('Message published successfully:' + JSON.stringify(message));
            }
        });
    }
  };

  const handleChange = (newColor, key, value) => {
    if (client) {
      const hex_str = newColor.hex.toString();
      const hexWithPrefix = "0x" + hex_str.substring(1);
      device_data.data[key] = hexWithPrefix;

      client.publish('home/devices/data/' + device_data.id, JSON.stringify(device_data.data),  { retain: true }, (err) => {
          if (err) {
              console.error('Error publishing message:', err);
          } else {
              console.log('Message published successfully:' + JSON.stringify(device_data.data));
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
    } else if (value.toString() === 'number') {
      const cur_value = device_data.data[key];
      return (
        <div className='param-container'>
            <div className='param-name'>{key}: {cur_value}</div>
        </div>
      );
    } else if (value.toString() === 'string') {
      return (
        <input
          key={key}
          type="text"
          value={value}
          readOnly
          onClick={() => console.log(`${key} input clicked`)}
        />
      );
    } else if (value.toString() === 'color') {
      const cur_value = device_data.data[key];
      const new_value = `#${cur_value.slice(2).toUpperCase()}`;
      return (
        <div className='param-container'>
          <ChromePicker color={new_value} onChange={(newColor) => handleChange(newColor, key, cur_value)} />
        </div>
      );
    } 
    
    
    else {
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
