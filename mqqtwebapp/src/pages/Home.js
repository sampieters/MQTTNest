import React, { useState, useEffect } from 'react';
import NewDeviceForm from '../components/NewDeviceForm';
import mqtt from 'mqtt';
import './Home.css';
import DeviceForm from '../components/DeviceForm';
import RoomSettings from '../components/RoomSettings';
import { SlSettings } from "react-icons/sl";
import { FaRegLightbulb, FaCamera, FaThermometerHalf } from "react-icons/fa";
import BluetoothScanner from '../components/BluetoothComponent';
import BluetoothWiFiConfig from '../components/BluetoothComponent';

const dictionary = {};

const deviceIcons = {
    'light': FaRegLightbulb,
    'camera': FaCamera,
    'temperature': FaThermometerHalf,
};


function Home() {
    const [messages, setMessages] = useState([]);
    const [showDiscoveryComponent, setShowDiscoveryComponent] = useState(false);
    const [showDeviceComponent, setShowDeviceComponent] = useState(false);
    const [showRoomSettings, setShowRoomSettings] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [client, setClient] = useState(null); // Define client state variable
    const [devices, setDevices] = useState([]);
    const [currentDevice, setCurrentDevice] = useState(null);

    const [registermessage, setRegisterMessage] = useState(null);

    const handleMessageReceived = (message) => {
        setMessages(prevMessages => [...prevMessages, message]);

        const payload = JSON.parse(message.message);
        // Check if the topic is '/discovery' and set showDiscoveryComponent accordingly
        if (message.topic === 'home/devices/register') {
            console.log("Device that tries to register: ", payload);
            console.log("current dictionary", dictionary);
            if (!dictionary.hasOwnProperty(payload.client_id)) {
                setRegisterMessage(payload)
                setShowDiscoveryComponent(true);
            }
        }
    };

    const handleClose = () => {
        setShowDiscoveryComponent(false);
      };
    
    const handleSubmit = (data) => {
        if (client) {
            const message = JSON.stringify(data); // Convert data to JSON string (or any other format)
            
            // Publish the message to the specified topic
            // TODO: change string 'client2' to the actual client
            client.publish('home/devices/info/' + data.id, message, { retain: true }, (err) => {
                if (err) {
                    console.error('Error publishing message:', err);
                } else {
                    console.log('Message published successfully: ' + message);
                }
            });

            // Optionally, you can also update the state to hide the discovery component
            setShowDiscoveryComponent(false);
        }
    };

    const handleDeviceClick = (device_id, status) => {
        if (status === "1") {
            setShowDeviceComponent(true);
            setCurrentDevice(device_id);
        }
    }

    const handleDeviceClose = () => {
        setShowDeviceComponent(false);
        setCurrentDevice(null);
    }

    const handleRoomSettings = (room) => {
        setShowRoomSettings(true);
        setCurrentRoom(room);
    }

    const handleRoomSettingsClose = () => {
        setShowRoomSettings(false);
    }

    useEffect(() => {
        const onSuccess = () => {
            console.log('MQTT client connected successfully');
        };

        const onFailure = (error) => {
            console.error('MQTT connection failed:', error);
        };

        const mqttClient = mqtt.connect('ws://127.0.0.1:9001', {
            clientId: 'react_1',
            useSSL: false,
            onSuccess: onSuccess,
            onFailure: onFailure,
            protocolId: 'MQTT',
            protocolVersion: 5,
            rejectUnauthorized: false,
            clean: true,
            reconnectPeriod: 20000,
            connectTimeout: 30 * 1000,
            protocol: 'mqtt',
        });

        mqttClient.on('connect', () => {
            mqttClient.subscribe('home/#',  { qos: 1, retain: true }, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log('Subcribed to the mosquitto broker')
                }
            });
        });

        mqttClient.on('message', (topic, message) => {
            //console.log("Topic: " + topic + ", Message: " + message.toString())
            handleMessageReceived({ topic, message: message.toString() });

            const status_index = topic.indexOf("status");
            const info_index = topic.indexOf("info");
            const data_index = topic.indexOf("data");
            if (status_index !== -1) {
                // Add the length of "status" to get the starting index of the substring
                const substring = topic.substring(status_index + 1 + "status".length);
                const client_id = substring.trim()
                if (dictionary.hasOwnProperty(client_id)) {
                    dictionary[client_id].status = message.toString();
                } else {
                    dictionary[client_id] = {
                        status: message.toString(),
                    }
                }
            }
            else if (info_index !== -1) {
                const json_message = JSON.parse(message);
                console.log(json_message);
                const substring = topic.substring(info_index + 1 + "info".length);
                const info_id = substring.trim()
                setDevices(prevDevices => [...prevDevices, JSON.parse(message)]);

                if (dictionary.hasOwnProperty(info_id)) {
                    dictionary[json_message.id].name = json_message.name;
                    dictionary[json_message.id].room = json_message.room;
                    dictionary[json_message.id].type = json_message.type;
                } else {
                    dictionary[info_id] = {
                        name: json_message.name,
                        room: json_message.room,
                        type: json_message.type
                    }
                }
            }
            else if (data_index !== -1) {
                const substring = topic.substring(data_index + 1 + "data".length);
                const data_id = substring.trim();
                dictionary[data_id].data = JSON.parse(message).message.toString();
            }
        });

        mqttClient.on('reconnect', () => {
            console.log('Attempting to reconnect...');
        });

        mqttClient.on('offline', () => {
            console.log('MQTT client is offline');
        });

        // Set client state variable
        setClient(mqttClient);

        return () => {
            mqttClient.end();
        };
    }, []);

    // Function to group devices by room
    const groupByRoom = () => {
        const groupedDevices = {};
        devices.forEach(device => {
        const room = device.room;
        if (!groupedDevices[room]) {
            groupedDevices[room] = [];
        }
        groupedDevices[room].push(device);
        });
        return groupedDevices;
    };

    // Group devices by room
    const devicesByRoom = groupByRoom();
    console.log(devicesByRoom);
    console.log(devicesByRoom['Kitchen'])
  
    return (
      <div className='page'>
        <h1>MQTTNest</h1>
        <BluetoothWiFiConfig></BluetoothWiFiConfig>

        <div className='mainpage'>
          <div className='connected-devices'>
          {Object.keys(devicesByRoom).map(room => (
                <div key={room}>
                    <div className="room">
                        <h2>{room}</h2>
                        <div className="settings-icon" onClick={() => handleRoomSettings(room)}>
                            <SlSettings />
                        </div>
                    </div>
                    
                    <ul>
                        {devicesByRoom[room].map(device => {
                            const IconComponent = deviceIcons[device.type.toLowerCase()];
                            return (
                                <li key={device.id} onClick={() => handleDeviceClick(dictionary[device.id], dictionary[device.id]?.status)}>
                                    {dictionary[device.id]?.status === "0" && <div className='unavailable'>Disconnected</div>}
                                    {IconComponent && <IconComponent className="device-icon" />}
                                    <p>{device.name}</p>
                                    {device.type === "temperature" && <p>{dictionary[device.id]?.data} °C</p>}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
            </div>
        </div>
        {showDiscoveryComponent && <NewDeviceForm onClose={handleClose} onSubmit={handleSubmit} registermessage={registermessage}/>}
        {showDeviceComponent && <DeviceForm onClose={handleDeviceClose} client={client} device_data={currentDevice}/>}
        {showRoomSettings && <RoomSettings onClose={handleRoomSettingsClose} client={client} room={currentRoom} roomDevices={devicesByRoom[currentRoom]}/>}
      </div>
    );
}

export default Home;