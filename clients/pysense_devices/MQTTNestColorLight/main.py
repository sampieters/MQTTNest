import pycom
from network import WLAN
import time
from machine import UART
import os
import json
from mqtt import MQTTClient

# Hardcoded wifi settings
wifi_ssid = "telenet-AD530"
wifi_password = "BtM0SbAb8X1Z"

# MQTT broker settings
broker_address = "192.168.0.226"
broker_port = 1883

# MQTT device topics
client_id = "fipy2"
client_type = "light"

register_topic = "home/devices/register"
ack_topic = "home/devices/info/" + client_id
sending_topic = "home/devices/data/" + client_id
status_topic = "home/devices/status/" + client_id

# Other settings
led_color = "0xFFFFFF"
pycom.heartbeat(False)
uart = UART(0, baudrate=115200)
os.dupterm(uart)

# Connect to Wifi
print('Connecting to Wifi')
wlan = WLAN(mode=WLAN.STA)
wlan.connect("telenet-AD530", auth=(WLAN.WPA2, "BtM0SbAb8X1Z"), timeout=5000)

while not wlan.isconnected():
     time.sleep_ms(500)
print(wlan.ifconfig())
print("Connected to Wifi")

# Connect to MQTT client
print("Connecting to MQTT Client")
client = MQTTClient(client_id, broker_address,user="", password="", port=broker_port)

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
         
        if 'parameters' not in msg:
            info_message = {
                'id': client_id,
                'type': client_type,
                'name': msg['name'],
                'room': msg['room'],
                'parameters': {
                    'status': 'bool', 
                    'color': 'color'
                    }
                }
            json_data = json.dumps(info_message)
            client.publish(ack_topic, json_data, True)
            first_data = {
                'status': 0,
                'color': led_color
            }
            json_data = json.dumps(first_data)
            client.publish(topic=sending_topic, msg=json_data, retain=True)
    if topic == sending_topic:
        print(msg['status'])
        if int(msg['status']) == 0:
            pycom.rgbled(0x000000) 
        elif int(msg['status']) == 1:
            pycom.rgbled(int(msg['color'], 16))    # make the LED light up in white color

client.set_last_will(status_topic, msg="0", retain=True, qos=1)
client.set_callback(sub_cb)
client.connect()

register_message = {
    'client_id': client_id,
    'client_type': client_type, 
}
json_data = json.dumps(register_message)
client.publish(topic=register_topic, msg=json_data)
client.subscribe(topic=ack_topic)
client.subscribe(topic=sending_topic)

while True:
    client.check_msg()
    time.sleep(0.2)