import pycom
from network import WLAN
import time
import usocket as socket
import ustruct as struct
from machine import UART
from mqtt import MQTTClient
import os
import json

pycom.heartbeat(False)

client_id = "fipy1"
client_type = "light"

register_topic = "home/devices/register"
ack_topic = "home/devices/info/" + client_id
sending_topic = "home/devices/data/" + client_id
status_topic = "home/devices/status/" + client_id


uart = UART(0, baudrate=115200)
os.dupterm(uart)

print('Connecting to Wifi')
wlan = WLAN(mode=WLAN.STA)
wlan.connect("telenet-AD530", auth=(WLAN.WPA2, "BtM0SbAb8X1Z"), timeout=10000)

while not wlan.isconnected():
     time.sleep_ms(500)
print(wlan.ifconfig())
print("Connected to Wifi")

print("Connecting to MQTT Client")
client = MQTTClient("fipy", "192.168.0.226",user="", password="", port=1883)

def sub_cb(topic, msg):
    # Convert bytes to string
    topic = topic.decode('utf-8')
    # Convert bytes to dictionary
    msg = json.loads(msg.decode('utf-8'))
    print(topic, msg)
    if topic == ack_topic:
        print("Acknowledgement received")
        client.subscribe(topic='home/' + msg['room'] + '/' + msg['id'])
        print("Subscribed to topic: " + 'home/' + msg['room'] + '/' + msg['id'])
        client.publish(topic=status_topic, msg="1", retain=True)
         
        if 'parameters' in msg and not msg['parameters']:
            info_message = {
                'id': client_id,
                'type': 'light',
                'name': msg['name'],
                'room': msg['room'],
                'parameters': {'status': 'bool'}
                }
            json_data = json.dumps(info_message)
            client.publish(ack_topic, json_data, True)
            first_data = {
                'status': 0
            }
            json_data = json.dumps(first_data)
            client.publish(topic=sending_topic, msg=json_data, retain=True)
    if topic == sending_topic:
        print(msg['status'])
        if msg['status'] == 0:
            pycom.rgbled(0x000000) 
        elif msg['status'] == 1:
            pycom.rgbled(0xFFFFFF)    # make the LED light up in white color

client.set_callback(sub_cb)
client.connect()

register_message = {
    'client_id': client_id,
    'client_type': "light", 
}

# Convert dictionary to JSON string
json_data = json.dumps(register_message)

client.publish(topic=register_topic, msg=json_data)
client.subscribe(topic=ack_topic)
client.subscribe(topic=sending_topic)

while True:
    client.check_msg()
    time.sleep(1)
