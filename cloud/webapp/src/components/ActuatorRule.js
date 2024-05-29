import React, { useState, useEffect } from 'react';
import './SensorRule.css';

const possible_bounds = {
  "bool": ["==", "!="],
  "number": ["==", "!=", ">", "<", ">=", "<="],
};

const initialParameters = {
  "device": "",
  "parameter": "",
  "value": "",
};

const ActuatorRule = ({ onChange, index, devices, onParameterChange }) => {
  const [localParameters, setLocalParameters] = useState(initialParameters);

  useEffect(() => {
    onParameterChange(index, localParameters);
  }, [localParameters]);

  const handleParameterChange = (event) => {
    handlePropParameterChange("parameter", event.target.value);
  };
  
  const handleValueChange = (event) => {
    handlePropParameterChange("value", event.target.value);
  };

  const getDeviceParameters = () => {
    console.log(devices);
    const device = devices.find(device => device.id === localParameters.device);
    return device ? device.parameters : {};
  };

  const getParameterBounds = () => {
    const device = devices.find(device => device.id === localParameters.device);
    const type = device ? device.parameters[localParameters.parameter] : '';
    return possible_bounds[type] || [];
  };

  const handlePropParameterChange = (key, value) => {
    const updatedParameters = { ...localParameters, [key]: value };
    setLocalParameters(updatedParameters);
  };

  const handleDeviceChange = (event) => {
    const device = event.target.value;
    handlePropParameterChange("device", device);
  };

  return (
    <div className="rule">
      <select value={localParameters.device} onChange={handleDeviceChange}>
        <option key={-1} value="">Select Device</option>
        {devices.map((device, index) => (
          <option key={index} value={device.id}>
            {device.name}
          </option>
        ))}
      </select>
      <select value={localParameters.parameter} onChange={handleParameterChange}>
        <option key={-1} value="">Select Parameter</option>
        {Object.keys(getDeviceParameters()).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={localParameters.value}
        placeholder="Value"
        onChange={handleValueChange}
      />
      <button className="btn">
        <svg viewBox="0 0 15 17.5" height="17.5" width="15" xmlns="http://www.w3.org/2000/svg" className="icon">
          <path transform="translate(-2.5 -1.25)" d="M15,18.75H5A1.251,1.251,0,0,1,3.75,17.5V5H2.5V3.75h15V5H16.25V17.5A1.251,1.251,0,0,1,15,18.75ZM5,5V17.5H15V5Zm7.5,10H11.25V7.5H12.5V15ZM8.75,15H7.5V7.5H8.75V15ZM12.5,2.5h-5V1.25h5V2.5Z" id="Fill"></path>
        </svg>
      </button>
    </div>
  );
};

export default ActuatorRule;
