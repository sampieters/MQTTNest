import React, { useState } from 'react';
import './RuleContainer.css'; // Ensure you have a CSS file for Container styling
import Rule from './Rule';

const Container = ({ container_id, onValidationChange, room, devices, client}) => {
    console.log("CONTAINER_ID: ", container_id);

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

    const performRuleFunction = (type, item) => {
        console.log("YAAAAY: ", container_id, item);
        // Add your function logic here
        const message = JSON.stringify(item);
        client.publish('home/' + room + '/rule-engine/OR_container_' + container_id + '/' + type, message, { retain: true }, (err) => {
            if (err) {
                console.error('Error publishing message: ', err);
            } else {
                console.log('Message published successfully: ' + message);
            }
        });
    };

    const handleSubmit = () => {
        rules.forEach(rule => {
            performRuleFunction("sensor", rule);
        });
        actions.forEach(action => {
            performRuleFunction("action", action);
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
                    {rules.map((rule, index) => (
                        <div key={index}>
                            <Rule index={index} devices={sensorsGroup} onParameterChange={(index, newParameters) => handleParameterChange("sensor", index, newParameters)}></Rule>
                        </div>
                    ))}
                    <button className="toggle-btn" onClick={addRule}>
                        Add Rule
                    </button>
                </div>
                <div className='actions'>
                    <h3>Action(s)</h3>
                    {actions.map((action, index) => (
                        <div key={index}>
                            <Rule index={index} devices={actuatorsGroup} onParameterChange={(index, newParameters) => handleParameterChange("action", index, newParameters)}></Rule>
                        </div>
                    ))}
                    <button className="toggle-btn" onClick={addAction}>
                    Add Rule
                    </button>
                </div>
            </div>
        </div>
        <button className="toggle-btn" onClick={handleSubmit}>
                    Add Container
            </button>
    </div>
  );
};

export default Container;
