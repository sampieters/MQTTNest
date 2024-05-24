import React, { useState } from 'react';
import { GrClose } from "react-icons/gr";
import { FaBluetoothB, FaPlus } from "react-icons/fa";

import './BluetoothComponent.css'

const BluetoothScanner = ({onClose}) => {
  const [devices, setDevices] = useState([]);

  const [wifiName, setWifiName] = useState('');
  const [type, setType] = useState('TODO');
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [params, setParameters] = useState({});
  const [wifiPassword, setWifiPassword] = useState('');

  const [characteristic, setCharacteristic] = useState('');

  const startScan = async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [
                { services: ['19b10000-e8f2-537e-4f6c-d104768a1214'] }, // Filter by service UUID
            ]
        });
        
        // Connect to the device
        const server = await device.gatt.connect();

        // Get the service
        const service = await server.getPrimaryService('19b10000-e8f2-537e-4f6c-d104768a1214');

        // Get the characteristic
        setCharacteristic(await service.getCharacteristic('19b10001-e8f2-537e-4f6c-d104768a1214'));


      setDevices(prevDevices => [...prevDevices, device]);
      console.log('Found device:', device);
    } catch (error) {
      console.error('Error scanning for devices:', error);
    }
  };

  const sendMessage = async () => {
    try {
      const dictToSend = { 'wifiname': wifiName, 'wifipassword': wifiPassword, 'name': name, 'room': room };
      const jsonStr = JSON.stringify(dictToSend);
      const encodedData = new TextEncoder().encode(jsonStr);

      await characteristic.writeValue(encodedData);
      console.log('Data sent:', dictToSend);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  const [selectedSecurity, setSelectedSecurity] = useState('');

  const securityTypes = [
    'Open',
    'WEP',
    'WPA',
    'WPA2',
  ];

  const handleChange = (event) => {
    setSelectedSecurity(event.target.value);
  };

  return (
    <div>
        <div className='icon-container' onClick={startScan}>
          <FaBluetoothB className='bluetooth-icon'/>
          <FaPlus className='plus-icon'/>
        </div>
        {devices.length > 0 && (
            <div className='container'>
                <div className='field'>
                    <div className='header'>
                        <GrClose className="close-btn" onClick={onClose} />
                        <h2>Connect new device</h2>
                    </div>
                    <div className="popup-inner">
                        <form onSubmit={sendMessage}>
                            <div className="form-group">
                                <label htmlFor="wifiname">Wifi name:</label>
                                <input type="text" id="wifiname" value={wifiName} onChange={(e) => setWifiName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Wifi type:</label>
                                <select id="wifi-security" value={selectedSecurity} onChange={handleChange}>
                                    <option value="" disabled hidden>Select a security type</option>
                                    {securityTypes.map((type, index) => (
                                    <option key={index} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedSecurity === 'WPA' && (
                                <div className="form-group">
                                    <label htmlFor="wifipassword">Wifi password:</label>
                                    <input type="text" id="wifipassword" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} required />
                                </div>
                            )} 
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
        )}
    </div>
  );
};

export default BluetoothScanner;