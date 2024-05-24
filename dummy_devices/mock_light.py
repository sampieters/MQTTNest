import paho.mqtt.client as mqtt
import time
import json
import random

# MQTT broker settings
broker_address = "0.0.0.0"
broker_port = 1883
client_type = "light"

current_milliseconds = int(time.time() * 1000)
random.seed(current_milliseconds)
client_id = "device_" + str(9)
discovery_topic = "home/devices/register"
ack_topic = f"home/devices/info/{client_id}"
sending_topic = f"home/devices/data/{client_id}"

# Callback function when the client connects to the MQTT broker
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker")
        # Define dictionary to be published
        payload_dict = {
            "id": client_id,
            "type": client_type,
            "name": "mock_light",
            "room": "mock_room",
            "parameters": {
                "status": "bool"
            }
        }

        # Serialize dictionary to JSON string
        payload_json = json.dumps(payload_dict)

        # Publish JSON string payload
        client.publish("home/devices/info/" + client_id, payload_json, True)
        client.publish("home/devices/status/" + client_id, "1", True)

        payload_dict = {
            "status": 0,
        }

        # Serialize dictionary to JSON string
        payload_json = json.dumps(payload_dict)
        client.publish("home/devices/data/" + client_id, payload_json, True)




        client.subscribe("home/devices/data/" + client_id)

# Callback function when a message is received
def on_message(client, userdata, msg):
    message = eval(msg.payload.decode())
    print(f"message {message} on topic:", msg.topic)



# Create an MQTT client instance
client = mqtt.Client(client_id)
client.will_set("home/devices/status/" + client_id, "0", retain=True) 

# Assign callback functions
client.on_connect = on_connect
client.on_message = on_message

# Connect to the MQTT broker
client.connect(broker_address, broker_port)

# Start the MQTT client loop to process messages
client.loop_forever()