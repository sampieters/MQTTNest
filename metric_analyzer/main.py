
import paho.mqtt.client as mqtt
import time
import rule_engine
import re

# MQTT broker settings
BROKER = "0.0.0.0"
PORT = 1883
TOPIC = "home/#"

temperature = []

# devices should be kept in a json like follows
devices = [
    {
        'id': 'light2',
        'name': 'alight',
        'type': 'light',
        'room': '',
        'status': '',
        'parameters': '',
        'data': '',
    },
    {
        'id': 'temperature1',
        'name': 'thermometer',
        'type': 'temperature',
        'room': '',
        'status': '',
        'parameters': '',
        'data': '',
    }
]


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

    # TODO: should be improved
    # Using regex to find occurrences of "sensor"
    matches = re.findall(r'sensor', msg.topic)

    if matches:
        rule_dict = eval(msg.payload.decode('utf-8'))
        rule_string = f"id == \"{rule_dict["device"]}\" and parameters[\"{rule_dict["parameters"]}\"] {rule_dict["bound"]} {rule_dict["value"]}"
        print("RULE: " + rule_string)

        rule_engine.Rule(rule_string)

    #try:
    #    temperature = float(msg.payload.decode('utf-8'))
    #    temperature.append(temperature)
    #except ValueError:
    #    print("Invalid temperature value")

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