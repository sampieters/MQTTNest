import React, { useState } from 'react';
import './RuleContainer.css'; // Ensure you have a CSS file for Container styling
import SensorRule from './SensorRule';
import ActuatorRule from './ActuatorRule';

const Container = ({ container_id, onValidationChange, room, devices, client}) => {
  const [subcontainers, setSubcontainers] = useState([]);
  const [rules, setRules] = useState([]);
  const [actions, setActions] = useState([]);

  const addSubcontainer = () => {
    setSubcontainers([...subcontainers, {}]);
  };

  const addRule = () => {
    setRules([...rules, '']);
  };

  const addAction = () => {
    setActions([...actions, '']);
  };


  const handleRuleChange = (index, value) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
    validateRules(newRules);
  };

  const validateRules = (rules) => {
    const allValid = rules.every(rule => rule.trim() !== '');
    onValidationChange(allValid);
  };

    // Helper function
    const groupDevicesByCategory = (devices) => {
        const sensors = {
            'thermometer': true,
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

    const performRuleFunction = (type, item, index) => {
        const message = JSON.stringify(item);
        client.publish('home/' + room + '/rule-engine/OR_' + container_id + '/' + type + '/' + index, message, { retain: true }, (err) => {
            if (err) {
                console.error('Error publishing message: ', err);
            } else {
                console.log('Message published successfully: ' + message);
            }
        });
    };

    const handleSubmit = () => {
        rules.forEach((rule, index) => {
            performRuleFunction("sensor", rule, index);
        });
        actions.forEach((action, index) => {
            performRuleFunction("action", action, index);
        });
    };

    const handleParameterChange = (agroup, index, newParameters) => {
        if (agroup === "sensor") {
            const updatedRules = [...rules];
            updatedRules[index] = newParameters;
            setRules(updatedRules);
        } else {
            const updatedActions = [...actions];
            updatedActions[index] = newParameters;
            setActions(updatedActions);

        }
    };

    const { sensorsGroup, actuatorsGroup } = groupDevicesByCategory(devices);

  return (
    <div>
        <div className='rule-container'>
            <div className="content">
                <div className='rules'>
                    <h3>Rule(s)</h3>
                    {!sensorsGroup || sensorsGroup.length === 0 ? (
                        <div className="error-message">No sensors available. Please add sensors to the room to create rules.</div>
                    ) : (
                        <>
                            {rules.map((rule, index) => (
                                <div key={index}>
                                    <SensorRule 
                                        index={index} 
                                        devices={sensorsGroup} 
                                        onParameterChange={(index, newParameters) => handleParameterChange("sensor", index, newParameters)} 
                                    />
                                </div>
                            ))}
                            <button className="toggle-btn" onClick={addRule}>
                                Add Rule
                            </button>
                        </>
                    )}
                </div>
                <div className='actions'>
                    <h3>Action(s)</h3>
                    {actions.map((action, index) => (
                        <div key={index}>
                            <ActuatorRule index={index} devices={actuatorsGroup} onParameterChange={(index, newParameters) => handleParameterChange("action", index, newParameters)}></ActuatorRule>
                        </div>
                    ))}
                    <button className="toggle-btn" onClick={addAction}>
                    Add Rule
                    </button>
                </div>
            </div>
        </div>
        <button className="toggle-btn" onClick={handleSubmit}>
                    Submit
            </button>
    </div>
  );
};

export default Container;
