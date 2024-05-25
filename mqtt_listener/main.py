
import paho.mqtt.client as mqtt
import time

# MQTT broker settings
BROKER = "0.0.0.0"
PORT = 1883
TOPIC = "#"

temperature = []

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
client.loop_forever()
