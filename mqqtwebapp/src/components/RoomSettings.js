import React, { useState, useEffect } from 'react';
import './RoomSettings.css'
import { GrClose, GrAddCircle } from "react-icons/gr";

function RoomSettings({ onClose, onSubmit, client, room, roomDevices}) {
      // Helper function
      const groupDevicesByCategory = (devices) => {
        const sensors = {
            'temperature': true,
            'camera': true,
            // Add more sensor types
        };

        const actuators = {
            'light': true,
            // Add more actuator types
        };

        const sensorsGroup = [];
        const actuatorsGroup = [];

        devices.forEach(device => {
            if (sensors[device.type.toLowerCase()]) {
                sensorsGroup.push(device);
            }
            if (actuators[device.type.toLowerCase()]) {
                actuatorsGroup.push(device);
            }
        });

        return { sensorsGroup, actuatorsGroup };
    };

    const { sensorsGroup, actuatorsGroup } = groupDevicesByCategory(roomDevices);
    const [addSensor, setAddSensor] = useState(false);
    const [addActuator, setAddActuator] = useState(false);
    const [selectedSensor, setSelectedSensor] = useState('');
    const [selectedActuator, setSelectedActuator] = useState('');
    const [par, setPar] = useState('');
    const [parValue, setParValue] = useState('');

    const [existingSensors, setExistingSensors] = useState([]);

    useEffect(() => {
        const handleMessage = (topic, message) => {
            console.log("YEET: Topic: " + topic + ", Message: " + JSON.stringify(message));
            if (topic.includes('sensor')) {
                const match = topic.match(/sensor\/(.*)/);
                const newSensor = { "device_id": match ? match[1] : '', "data": JSON.parse(message) };
                setExistingSensors(prevSensors => [...prevSensors, newSensor]);
            }
        };
    
        client.on('message', handleMessage);
    
        // Cleanup function to remove the event listener
        return () => {
            client.off('message', handleMessage);
        };
    }, [client]);


    const handleToggle = () => {
        if (client) {
            const message = "options";
            client.publish('home/devices/data/' + room, JSON.stringify(message), (err) => {
                if (err) {
                    console.error('Error publishing message: ', err);
                } else {
                    console.log('Message published successfully: ' + message);
                }
            });
        }
    };

    const handleCloseSensor = () => {
        setSelectedSensor('');
        setPar('');
        setParValue('');
        setAddSensor(false);
    };

    const handleAddSensor = (device_type) => {
        if (client) {
            const param_name = par;
            const param_value = parValue;
            const message = {"param_name" : param_name, "param_value": param_value};
            console.log(JSON.stringify("WHUT" + JSON.stringify(message) + " " + par + " " + parValue));
            client.publish('home/' + room + '/' + device_type + '/' + selectedSensor, JSON.stringify(message), { retain: true }, (err) => {
                if (err) {
                    console.error('Error publishing message: ', err);
                } else {
                    console.log('Message published successfully: ' + message);
                }
            });
        }

        setSelectedSensor('');
        setPar('');
        setParValue('');
        setAddSensor(false);
    };

    return (
        <div className="container">
            <div className='field'>
                <div className='header'>
                    <GrClose className="close-btn" onClick={onClose} />
                    <h2>{room}</h2>
                </div>
                <div className='content'>
                    <h3>Sensors</h3>
                    <ul>
                        {existingSensors.map((sensor, index) => (
                            <li key={index}>
                                <strong>Device ID:</strong> {sensor.device_id}, <strong>Data:</strong> {sensor.data.param_name} ({sensor.data.param_value})
                            </li>
                        ))}
                    </ul>
                    {!addSensor &&
                        <GrAddCircle onClick={() => setAddSensor(true)}/>
                    }
                    {addSensor && 
                        <div>
                            <select value={selectedSensor} onChange={(e) => setSelectedSensor(e.target.value)}>
                                <option value="" disabled hidden>Select a sensor</option>
                                {sensorsGroup.map(sensor => (
                                    <option key={sensor.id} value={sensor.id}>{sensor.name}</option>
                                ))}
                            </select>
                            <select value={par} onChange={(e) => setPar(e.target.value)}>
                                <option value="" disabled hidden>Select a parameter</option>
                                <option>temperature</option>
                                <option>color</option>
                                <option>options</option>
                            </select>
                            <input type="text" placeholder="Enter a value" value={parValue} onChange={(e) => setParValue(e.target.value)} />
                            <button onClick={() => handleAddSensor('sensor')}>Add</button>
                            <button onClick={() => handleCloseSensor()}>Cancel</button>
                        </div>
                    }

                    <h3>Actuators</h3>
                    {!addActuator &&
                        <GrAddCircle onClick={() => setAddActuator(true)}/>
                    }
                    {addActuator && 
                        <div>
                            <select value={selectedActuator} onChange={(e) => setSelectedActuator(e.target.value)}>
                                <option value="" disabled hidden>Select an actuator</option>
                                {actuatorsGroup.map(actuator => (
                                    <option key={actuator.id} value={actuator}>{actuator.name}</option>
                                ))}
                            </select>
                            <select value={par} onChange={(e) => setPar(e.target.value)}>
                                <option value="" disabled hidden>Select a parameter</option>
                                <option>temperature</option>
                                <option>color</option>
                                <option>options</option>
                            </select>
                            <input type="text" placeholder="Enter a value" value={parValue} onChange={(e) => setParValue(e.target.value)} />
                            <button onClick={() => handleAddSensor('actuator')}>Add</button>
                            <button onClick={() => handleCloseSensor()}>Cancel</button>
                        </div>
                    }


                    <div className="toggle-btn-container">
                        <button className="toggle-btn" onClick={handleToggle}>
                            Submit
                        </button>     
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoomSettings;
