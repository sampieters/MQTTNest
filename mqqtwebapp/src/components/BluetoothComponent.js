import React, { useState } from 'react';

const BluetoothWiFiConfig = () => {
  const [devices, setDevices] = useState([]);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');

  const startScan = async () => {
    try {
      const options = {
        filters: [
          { services: ['19b10000-e8f2-537e-4f6c-d104768a1214'] } // Correct UUID format
        ]
      };
      const device = await navigator.bluetooth.requestDevice(options);
      setDevices(prevDevices => [...prevDevices, device]);
      console.log('Found device:', device);
    } catch (error) {
      console.error('Error scanning for devices:', error);
    }
  };

  const connectToDevice = async (device) => {
    try {
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('19b10000-e8f2-537e-4f6c-d104768a1214');
      const characteristic = await service.getCharacteristic('19b10001-e8f2-537e-4f6c-d104768a1214');
      
      // Store the characteristic for later use
      setDevices(prevDevices => prevDevices.map(d => d === device ? { ...d, characteristic } : d));

      console.log('Connected to device:', device);
    } catch (error) {
      console.error(`Error connecting to device ${device.name}:`, error);
    }
  };

  const sendWiFiCredentials = async (device) => {
    if (!device.characteristic) {
      console.error('Device not connected or characteristic not found');
      return;
    }
    
    const encoder = new TextEncoder();
    const wifiCredentials = `${ssid}:${password}`;
    const data = encoder.encode(wifiCredentials);
    await device.characteristic.writeValue(data);
    
    console.log(`Sent WiFi credentials to device ${device.name}`);
  };

  return (
    <div>
      <button onClick={startScan}>Scan for Bluetooth Devices</button>
      <ul>
        {devices.map((device, index) => (
          <li key={index}>
            {device.name} 
            <button onClick={() => connectToDevice(device)}>Connect</button>
            <button onClick={() => sendWiFiCredentials(device)}>Send WiFi Credentials</button>
          </li>
        ))}
      </ul>
      <form>
        <label>
          SSID:
          <input type="text" value={ssid} onChange={(e) => setSsid(e.target.value)} />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
      </form>
    </div>
  );
};

export default BluetoothWiFiConfig;
