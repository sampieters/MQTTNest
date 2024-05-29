import paho.mqtt.client as mqtt
import time
import json
import random

# MQTT broker settings
broker_address = "0.0.0.0"
broker_port = 1883
client_type = "thermometer"

# MQTT device topics
client_id = "device_" + str(1)
discovery_topic = "home/devices/register"
ack_topic = f"home/devices/info/{client_id}"
sending_topic = f"home/devices/data/{client_id}"

# TOher settings
subscribed = False
current_milliseconds = int(time.time() * 1000)
random.seed(current_milliseconds)

# Callback function when the client connects to the MQTT broker
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker")
        print("Sending discovery message, waiting for acknowledgement")
        # Publish to the discovery topic to let a client know this device wants to connnect
        payload_dict = {
            "client_id": client_id,
            "client_type": client_type
        }
        payload_json = json.dumps(payload_dict)
        client.publish(discovery_topic, payload_json)
        # Subscribe to the acknowledgment topic to know if it is connected
        client.subscribe(ack_topic)
        # Subscribe to receive state data from other clients
        client.subscribe(sending_topic)

# Callback function when a message is received
def on_message(client, userdata, msg):
    global subscribed

    message = eval(msg.payload.decode())
    if msg.topic == ack_topic:
        # If acknowledgement received, publish device info, subscribe to the assigned room, and publish the first data
        print(f"Acknowledgment received: {message}")
        if 'parameters' not in message:
            info_message = {
                'id': client_id,
                'type': client_type,
                'name': message['name'],
                'room': message['room'],
                'parameters': {
                    'temperature' : 'number',
                }
            }
            json_data = json.dumps(info_message)
            client.publish(ack_topic, json_data, True)

        topic = "home/" + message["room"] + "/" + client_id
        client.subscribe(topic)
        print("Subscribed to topic:", topic)

        data_message = {
            'temperature': 0
        }
        json_data = json.dumps(data_message)
        client.publish(sending_topic, json_data)

        # Start publishing loop after acknowledgment
        topic = "home/devices/status/" + client_id
        client.publish(topic, "1", retain=True)

        subscribed = True
    elif msg.topic == sending_topic:
        print(f"Device: {message}")
    else:
        # Handle unknown messages
        print(f"Received unknown message {message} on topic:", msg.topic)



# Create an MQTT client instance
client = mqtt.Client(client_id)
client.will_set("home/devices/status/" + client_id, "0", retain=True) 

# Assign callback functions
client.on_connect = on_connect
client.on_message = on_message

# Connect to the MQTT broker
client.connect(broker_address, broker_port)

# Start the MQTT client loop to process messages
client.loop_start()
while True:
    if subscribed:
        number = random.uniform(18.0, 40.0)

        data_message = {
            'temperature': number
        }
        json_data = json.dumps(data_message)
        client.publish(sending_topic, json_data)
        time.sleep(3)
