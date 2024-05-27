
import paho.mqtt.client as mqtt
import time
import rule_engine
import re
import json

# MQTT broker settings
BROKER = "0.0.0.0"
PORT = 1883
TOPIC = "home/#"

rules = []

actions = []

# devices should be kept in a json like follows
devices = [
    {
        'id': 'DUMM1',
        'name': 'alight',
        'type': 'light',
        'room': 'Living',
        'status': '1',
        'parameters': '',
        'data': '',
    },
    {
        'id': 'DUMMY2',
        'name': 'thermometer',
        'type': 'temperature',
        'room': 'Kitchen',
        'status': '1',
        'parameters': '',
        'data': '',
    }
]

sensor_types = ['thermometer']

comics = [
  {
    'title': 'Batman',
    'publisher': 'DC',
    'issue': 89,
    'released': "idk"
  },
  {
    'title': 'Flash',
    'publisher': 'DC',
    'issue': 753,
    'released': "idk"
  },
  {
    'title': 'Captain Marvel',
    'publisher': 'Marvel',
    'issue': 18,
    'released': "idk"
  }
]


# Callback when the client receives a CONNACK response from the server
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
        client.subscribe(TOPIC)
    else:
        print(f"Failed to connect, return code {rc}")

# Callback when the client disconnects from the broker
def on_disconnect(client, userdata, rc):
    print("Disconnected from MQTT Broker")
    if rc != 0:
        print("Unexpected disconnection. Reconnecting...")
        try_reconnect(client)

# Callback when a PUBLISH message is received from the server
def on_message(client, userdata, msg):
    print(f"Message received: {msg.topic} -> {msg.payload.decode('utf-8')}")

    pattern = r"info/(.*)"
    info_match = re.search(pattern, msg.topic)
    if info_match:
        result = info_match.group(1)
        print("DEVICE:", result)
        print("DATA: ", eval(msg.payload.decode('utf-8')))

        devices.append(eval(msg.payload.decode('utf-8')))

    pattern = r"data/(.*)"
    data_match = re.search(pattern, msg.topic)
    if data_match:
        result = data_match.group(1)
        print("DEVICE:", result)
        print("DATA: ", eval(msg.payload.decode('utf-8')))

        for device in devices:
            if device["id"] == result:
                device["data"] = eval(msg.payload.decode('utf-8'))
                if device["type"] not in sensor_types:
                    return
        
        # TODO: ONLY IF DEVICE IS A SENSOR OTHERWISE IT WILL KEEP LOOPING
        for index, rule in enumerate(rules):
            print(rule.filter(devices))
            
            # Step 3: Use the filter method to get items that match the rule
            matching_items = list(rule.filter(devices))

            # Step 4: Check if any items result in True
            if matching_items:
                print("The rule results True.")
                the_topic = "home/devices/data/" + actions[index]["device"]

                for device in devices:
                    if device["id"] == actions[index]["device"]:
                        print("PREVIOUS DATA", device["data"])
                        the_parameter = actions[index]["parameter"]
                        the_value = actions[index]["value"]
                        the_data = device["data"]
                        the_data[the_parameter] = the_value
                        print("NEW DATA", the_data)
                        client.publish(the_topic, json.dumps(the_data))
            else:
                print("No items matched the rule.")

    pattern = r"/sensor"
    sensor_match = re.search(pattern, msg.topic)
    if sensor_match:
        #result = sensor_match.group(1)
        rule_dict = eval(msg.payload.decode('utf-8'))
        rule_string = f"id == \"{rule_dict["device"]}\" and data[\"{rule_dict["parameter"]}\"] {rule_dict["bound"]} {str(rule_dict["value"])}"
        print("RULE: " + rule_string)

        rules.append(rule_engine.Rule(rule_string))

    pattern = r"/action"
    actor_match = re.search(pattern, msg.topic)
    if actor_match:
        action_dict = eval(msg.payload.decode('utf-8'))
        print("ACTION: " + msg.payload.decode('utf-8'))
        actions.append(action_dict)

# Function to attempt reconnection
def try_reconnect(client):
    while True:
        try:
            client.reconnect()
            print("Reconnected to MQTT Broker")
            break
        except:
            print("Reconnection failed. Trying again in 5 seconds...")
            time.sleep(5)

# Initialize MQTT Client
client = mqtt.Client()

# Assign event callbacks
client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_message = on_message

# Connect to the broker
print(f"Connecting to {BROKER}...")
client.connect(BROKER, PORT)
# Start the loop
client.loop_start()

try:
    while True:
        time.sleep(5)
except Exception as e:
    # Exception handling
    print(f"An error occurred: {e}")
finally:
    # Stop the MQTT client
    client.loop_stop()