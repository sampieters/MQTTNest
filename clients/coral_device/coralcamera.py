import paho.mqtt.client as mqtt
import json
import time

# Define constants
CLIENT_ID = "CoralDevCamera"
CLIENT_TYPE = "camera"

REGISTER_TOPIC = "home/devices/register"
ACK_TOPIC = "home/devices/info/" + CLIENT_ID
SENDING_TOPIC = "home/devices/data/" + CLIENT_ID
STATUS_TOPIC = "home/devices/status/" + CLIENT_ID

SENDING_INTERVAL_SECONDS = 5

# MQTT broker details
broker_address = "0.0.0.0"
port = 1883


# Define the function that returns the room occupancy count
def count_room_occupancy():
    return 2


# Create an MQTT client instance
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)


# Function to connect to the MQTT broker
def connect_mqtt():
    try:
        client.connect(broker_address, port)
        print("Connected to MQTT broker at {}:{}".format(broker_address, port))
    except Exception as e:
        print("Failed to connect to MQTT broker:", e)
        raise e


# Function to publish registration message
def register_device():
    registration_message = {
        "client_id": CLIENT_ID,
        "client_type": CLIENT_TYPE
    }
    message_json = json.dumps(registration_message)
    result = client.publish(REGISTER_TOPIC, message_json)
    status = result.rc
    if status == 0:
        print("Sent `{}` to topic `{}`".format(message_json, REGISTER_TOPIC))
    else:
        print("Failed to send message to topic {}".format(REGISTER_TOPIC))


def on_message(client, userdata, msg):
    if msg.topic == ACK_TOPIC:
        print("Acknowledgement received")
        client.subscribe(topic='home/' + msg['room'] + '/' + msg['id'])
        print("Subscribed to topic: " + 'home/' + msg['room'] + '/' + msg['id'])
        client.publish(topic=STATUS_TOPIC, msg="1", retain=True)

        if 'parameters' not in msg:
            info_message = {
                'id': CLIENT_ID,
                'type': CLIENT_TYPE,
                'name': msg['name'],
                'room': msg['room'],
                'parameters': {
                    'people': 'number'
                }
            }
            json_data = json.dumps(info_message)
            client.publish(ACK_TOPIC, json_data, True)


# Function to publish occupancy message
def publish_occupancy():
    i = 0
    while True:
        i += 1
        if i >= SENDING_INTERVAL_SECONDS:
            i = 0

            occupancy = count_room_occupancy()
            message = {"people": occupancy}
            message_json = json.dumps(message)
            result = client.publish(SENDING_TOPIC, message_json)

            # Check if the message was published successfully
            status = result.rc
            if status == 0:
                print("Sent `{}`.".format(message_json))
            else:
                print("Failed to send {} to topic {}. Error code: {}".format(message_json, SENDING_TOPIC, status))
        # Keep connection alive.
        client.loop()

        # Wait for 5 seconds before sending the next message
        time.sleep(1)


if __name__ == "__main__":
    # Set last will message.
    client.will_set(STATUS_TOPIC, payload="0", qos=2, retain=True)
    connect_mqtt()
    client.publish(STATUS_TOPIC, "1", retain=True)
    register_device()
    client.on_message = on_message

    try:
        publish_occupancy()
    except KeyboardInterrupt:
        print("Transmitting status 0.")
        client.publish(STATUS_TOPIC, "0", retain=True)
        print("Exiting...")
        client.disconnect()
        client.loop_stop()

    print("Done! Goodbye!")
