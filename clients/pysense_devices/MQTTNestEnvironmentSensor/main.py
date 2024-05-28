import pycom
from network import WLAN
import time
from machine import UART
import os
import json
from mqtt import MQTTClient

from SI7006A20 import SI7006A20
from LTR329ALS01 import LTR329ALS01
from MPL3115A2 import MPL3115A2, PRESSURE
from pycoproc_2 import Pycoproc

# Hardcoded wifi settings
wifi_ssid = "telenet-AD530"
wifi_password = "BtM0SbAb8X1Z"

# MQTT broker settings
broker_address = "192.168.0.226"
broker_port = 1883

# MQTT device topics
client_id = "fipy3"
client_type = "thermometer"

register_topic = "home/devices/register"
ack_topic = "home/devices/info/" + client_id
sending_topic = "home/devices/data/" + client_id
status_topic = "home/devices/status/" + client_id

# Sensor settings
py = Pycoproc()
si = SI7006A20(py)
lt = LTR329ALS01(py)
mp = MPL3115A2(py,mode=PRESSURE)

# Other settings
pycom.heartbeat(False)
uart = UART(0, baudrate=115200)
os.dupterm(uart)

# Connect to Wifi
print('Connecting to Wifi')
wlan = WLAN(mode=WLAN.STA)
wlan.connect(wifi_ssid, auth=(WLAN.WPA2, wifi_password), timeout=5000)

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
                    'temperature': 'number',
                    'humidity': 'number',
                    'pressure': 'number',
                    'light': 'number',
                    'battery': 'number'
                    }
                }
            json_data = json.dumps(info_message)
            client.publish(ack_topic, json_data, True)

client.set_last_will(status_topic, msg="0", retain=True, qos=1)
client.set_callback(sub_cb)
client.connect()

register_message = {
    'client_id': client_id,
    'client_type': client_type, 
}

# Convert dictionary to JSON string
json_data = json.dumps(register_message)

client.publish(topic=register_topic, msg=json_data)
client.subscribe(topic=ack_topic)

while True:
    pressure = round(mp.pressure(), 2)
    light = str(lt.light())
    temp = round(si.temperature(), 2)
    humidity = round(si.humidity())
    battery = round(py.read_battery_voltage(), 1)

    print("Temparature: " + str(temp) + ", humidity: " + str(humidity) + ", battery: " + str(battery))
    data = {
        'temperature': temp,
        'humidity': humidity,
        'pressure': pressure,
        'light': light,
        'battery': battery
    }
    json_data = json.dumps(data)
    client.publish(topic=sending_topic, msg=json_data)

    client.check_msg()
    time.sleep(3)
