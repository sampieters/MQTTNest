import paho.mqtt.client as mqtt
import time
import json
import random

# MQTT broker settings
broker_address = "0.0.0.0"
broker_port = 1883
client_type = "temperature"


current_milliseconds = int(time.time() * 1000)
random.seed(current_milliseconds)
client_id = "device_" + str(1)
discovery_topic = "home/devices/register"
ack_topic = f"home/devices/info/{client_id}"
sending_topic = f"home/devices/data/{client_id}"

subscribed = False

# Callback function when the client connects to the MQTT broker
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker")
        # Send discovery message
        print("Sending discovery message, waiting for acknowledgement")
        # Define dictionary to be published
        payload_dict = {
            "client_id": client_id,
            "client_type": client_type
        }

        # Serialize dictionary to JSON string
        payload_json = json.dumps(payload_dict)

        # Publish JSON string payload
        client.publish(discovery_topic, payload_json)
        client.subscribe(ack_topic)
        client.subscribe(sending_topic)

# Callback function when a message is received
def on_message(client, userdata, msg):
    global subscribed

    message = eval(msg.payload.decode())
    if msg.topic == ack_topic:
        print(f"Acknowledgment received: {message}")
        topic = "home/" + message["room"] + "/" + client_id
        client.subscribe(topic)
        print("Subscribed to topic:", topic)

        # Start publishing loop after acknowledgment
        topic = "home/devices/status/" + client_id
        client.publish(topic, "1", retain=True)

        subscribed = True
    elif msg.topic == sending_topic:
        print(f"Device: {message}")
    else:
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
        formatted_number = f"{number:.2f}"
        client.publish(sending_topic, formatted_number)
        time.sleep(5)
