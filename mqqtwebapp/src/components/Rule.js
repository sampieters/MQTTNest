import React, { useState, useEffect } from 'react';
import './Rule.css';

const possible_bounds = {
  "bool": ["==", "!="],
  "number": ["==", "!=", ">", "<", ">=", "<="],
};

const initialParameters = {
  "device": "",
  "parameters": "",
  "bound": "",
  "value": "",
};

const Rule = ({ onChange, index, devices, onParameterChange }) => {
  const [localParameters, setLocalParameters] = useState(initialParameters);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedParameter, setSelectedParameter] = useState('');
  const [selectedBound, setSelectedBound] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    onParameterChange(index, localParameters);
  }, [localParameters]);

  const handleParameterChange = (event) => {
    const parameter = event.target.value;
    setSelectedParameter(parameter);
    handlePropParameterChange("parameter", parameter);
  };

  const handleBoundChange = (event) => {
    const bound = event.target.value;
    setSelectedBound(bound);
    handlePropParameterChange("bound", bound);
  };

  const handleValueChange = (event) => {
    const value = event.target.value;
    setSelectedValue(value);
    handlePropParameterChange("value", value);
  };

  const getDeviceParameters = () => {
    const device = devices.find(device => device.id === selectedDevice);
    return device ? device.parameters : {};
  };

  const getParameterBounds = () => {
    return possible_bounds[selectedParameter] || [];
  };

  const handlePropParameterChange = (key, value) => {
    const updatedParameters = { ...localParameters, [key]: value };
    setLocalParameters(updatedParameters);
  };

  const handleDeviceChange = (event) => {
    const device = event.target.value;
    setSelectedDevice(device);
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
      <select value={selectedParameter} onChange={handleParameterChange}>
        <option key={-1} value="">Select Parameter</option>
        {Object.keys(getDeviceParameters()).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      <select value={selectedBound} onChange={handleBoundChange}>
        <option key={-1} value="">Select Bound</option>
        {getParameterBounds().map((bound, index) => (
          <option key={index} value={bound}>
            {bound}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={selectedValue}
        placeholder="Value"
        onChange={handleValueChange}
      />
      <button title="Add New" className="btn">
        <svg viewBox="50 -960 800 800" height="17.5" width="15" xmlns="http://www.w3.org/2000/svg" className="add-icon">
          <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"></path>
        </svg>
      </button>
      <button className="btn">
        <svg viewBox="0 0 15 17.5" height="17.5" width="15" xmlns="http://www.w3.org/2000/svg" className="icon">
          <path transform="translate(-2.5 -1.25)" d="M15,18.75H5A1.251,1.251,0,0,1,3.75,17.5V5H2.5V3.75h15V5H16.25V17.5A1.251,1.251,0,0,1,15,18.75ZM5,5V17.5H15V5Zm7.5,10H11.25V7.5H12.5V15ZM8.75,15H7.5V7.5H8.75V15ZM12.5,2.5h-5V1.25h5V2.5Z" id="Fill"></path>
        </svg>
      </button>
    </div>
  );
};

export default Rule;
