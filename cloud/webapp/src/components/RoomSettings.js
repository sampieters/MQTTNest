import React, { useState, useEffect } from 'react';
import './RoomSettings.css'
import { GrClose, GrAddCircle } from "react-icons/gr";
import Container from './RuleContainer';

function RoomSettings({ onClose, onSubmit, client, room, roomDevices}) {
    const [addSensor, setAddSensor] = useState(false);
    const [addActuator, setAddActuator] = useState(false);
    const [selectedSensor, setSelectedSensor] = useState('');
    const [selectedActuator, setSelectedActuator] = useState('');
    const [par, setPar] = useState('');
    const [parValue, setParValue] = useState('');

    const [existingSensors, setExistingSensors] = useState([]);

    useEffect(() => {
        const handleMessage = (topic, message) => {
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

    const [containers, setContainers] = useState([]);

    const addContainer = () => {
      const newContainer = { id: Date.now(), content: `Container ${containers.length + 1}` };
      setContainers([...containers, newContainer]);
    };
  
    const handleToggle = () => {
      addContainer();
    };

    return (
        <div className='container'>
          <div className='field'>
            <div className='header'>
              <GrClose className="close-btn" onClick={onClose} />
              <h2>{room}</h2>
            </div>
            <div className='content'>
              {containers.map(container => (
                <Container className={`rule-container test`} container_id={container.id} key={container.id} client={client} room={room} devices={roomDevices}/>
              ))}
                <div className='new-rule-container' onClick={handleToggle}>
                    Add a new rule set
                </div>
            </div>
            <div className="toggle-btn-container">
                <button className="toggle-btn" onClick={handleToggle}>
                  Add Container
                </button>
              </div>
          </div>
        </div>
      );
}

export default RoomSettings;
