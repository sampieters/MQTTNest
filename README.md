# MQTTNest
A home automation application based on MQTT. This project includes devices such as the ESP32 and pysense boards. They are connected to a mqtt broker and include bluetooth connectivity for initial set up. The web application allows the control of the devices from a distance. This project could possibly be extended with other protocols such as Zigbee and LoRa.

## Mosquitto Broker
The mosquitto broker is the most important part of the project as it allows clients (such as devices and web applications) to interact with each other.


### MQTT broker
The MQTT broker is a server that receives messages from publishers and delivers them to subscribers based on their topic subscriptions. It manages client connections, handles subscriptions and unsubscriptions, and ensures message delivery according to the specified Quality of Service (QoS) levels.

### MQTT Clients
MQTT clients can be publishers, subscribers, or both. Publishers send messages to the MQTT broker, while subscribers receive messages from the broker. Clients can be any device or application that can establish a connection to the MQTT broker using the MQTT protocol, such as IoT devices, mobile applications, or other servers.

### Topics
Topics are hierarchical strings that define the subject or category of a message. When publishers send messages to the broker, they associate them with a specific topic. Subscribers express their interest in receiving messages by subscribing to one or more MQTT topics. The broker then routes messages to the appropriate subscribers based on their topic subscriptions.

## Running the cloud segment

The cloud segment, consisting of the web host for the frontend and the MQTT broker can be run by running the Docker Compose v3 configuration found in the `cloud/` directory.

### Development

The docker images work with frozen filesystems and thus aren't particularly suitable for development purposes. To run the segments separately, the following commands should be run:

**MQTT Broker:** (Installing mosquitto on your host system is required beforehand.)
1. `cd cloud/mosquitto_broker`
2. `<path_to_mosquitto_executable> -c mosquitto.conf`

**React frontend:**
1. `cd cloud/webapp`
2. `npm i`
3. `npm run start`

## Devices
Devices are physical boards (arduino, ESP32, or Pysense) whose task is to simply publish sensor data (temperature, humidity, amount of people) or receive data and perform an action (switch light on/off). We call them sensors and actors correspondingly.

### Operation Principles
In this section the overall principle of a device is given. Some principles depend on a 
counter reaction of another client (like the web application). 

#### Initial connection
A device can do two things when it is powered on (normally for the first time but the devices don't support keeping data on the device YET), a device can be configured with MQTT or bluetooth. Both operations need a reply from another client (web application) to work. Optimally they should only support the bluetooth version as the other version requires some hardcoding, setting the wifi ssid and password, on the board itself.

##### MQTT Version
If the device supports the mqtt version, the following steps will be performed:
- Try to connect to wifi with predefined (hardcoded) ssid and password.
    - If connected, connect to the MQTT broker.
    - If not connected, reconnect.
- Try to connect to MQTT broker with predefined address (public).
    - If connected: 
        - Set last will of topic "home/devices/status/<_device_id_>" to 0 (retain message). 
        - Publish client id and type to "home/devices/register".
        - Subscribe to "home/devices/info/<_device_id_>" topic.
        - Subscribe to "home/devices/data/<_device_id_>" topic (if the device is an actor).
    - If not connected, reconnect in 5 seconds.
- Wait until the device gets a message on topic "home/devices/info/<_device_id_>".
    - The message contains information such as the room, name, ... of the device.
    - Subscribe to "home/<_room_>/<_device_id_>" topic.
    - Publish 1 to topic "home/devices/status/<_device_id_>" (retain message).

##### Bluetooth Version
If the device supports the bluetooth version, the following steps will be performed:
- Set the local name of the BLE device. This is the name that will appear when other   devices scan for available BLE devices.
- Set the BLE service that will be advertised to other devices. This means that when other devices scan for BLE services, they will see 19b10000-e8f2-537e-4f6c-d104768a1214.
- Add a two custom characteristic to the BLE service. Characteristics are pieces of data that can be read from or written to by connected BLE devices.
    - Add a custom writable characteristic to the BLE service.
    - Add a custom readable characteristic to the BLE service.
- Set an event handler for the custom write characteristic. This means that when a BLE client writes to this characteristic, the given function will be called.
- Starts advertising the BLE service. This makes the device discoverable by other BLE devices.
- Wait until the callback function of the read characteristic receives a message:
    - The message contains the wifi ssid and password (TODO: type of wifi), the room and the name of the device.
    - Stop advertising and disconnect the bluetooth service.
    - Connect to wifi with received wifi ssid and password.
        - If connected, connect to the MQTT broker.
        - If not connected, reconnect.
- Try to connect to MQTT broker with predefined address (public).
    - If connected: 
        - Set last will of topic "home/devices/status/<_device_id_>" to 0 (retain message). 
        - Publish device id, device type, name, room, and parameter names with their corresponding type to "home/devices/info/<_device_id_>" topic.
        - Subscribe to "home/devices/data/<_device_id_>" topic (if the device is an actor).
    - If not connected, reconnect in 5 seconds.
- Wait until the device gets a message on topic "home/devices/info/<_device_id_>".
    - The message contains information such as the room, name, ... of the device.
    - Subscribe to "home/<_room_>/<_device_id_>" topic.
    - Publish 1 to topic "home/devices/status/<_device_id_>" (retain message).
    - Publish initial data to the "home/devices/data/<_device_id_>" topic.
    - Subscribe to  "home/devices/data/<_device_id_>"

#### Transmitting/receiving data
If the device is properly connected to the MQTT broker, the device can send or receive data (or both).

- If the device is a sensor:
    - Publish data to the "home/devices/data/<_device_id_>" topic every specific amount of time (3 seconds).

- If the device is a actor:
    - Wait until the callback function receives data from the topic "home/devices/data/<_device_id_>".
    - If data is received, perform the corresponding action.

### Dummy Devices
The dummy devices folder are mock devices programmed in python to understand MQTT and to test the broker and the connections. Dummy devices do not suppport bluetooth as they are 
mostly ran on the same devices as the development of the web application.

To run a dummy device:
- create a virtual environment.
```
TODO
```
```
source venv/bin/activate
```
- Install the needed libraries delivered in requirements.txt. 
```
pip install -r requirements.txt
```
- After this, run the correspodning dummy device via python.
```
python3 <device_file>
```

### Pysense Devices
These devices do not (yet) support bluetooth setup as the uuid's are configured differently. 

To run a pysense device:
- Install vscode and pymakr.
- Before running the code, do a soft reboot of the device.
- Upload the corresponding library files.
- Run the code on the device.

### "Arduino" (ESP32) Devices
The so called arduino devices are actually ESP32's but we call them arduino devices as the ESP32's are connected to sensors from the arduino brand. These devices both support the bluetooth setup as well as the MQTT setup.

To run on a ESP32 device:
- Install Arduino IDE and configure the right board (ESP32 DEV board).
- Install the appropriate libraries.
- Verify and upload the code to the device.

### Operation Principles
When the web application is started, the page consists mostly 


# TODO:

- Add docker containerization for each map 
- Create background file (python) for processing device data and sending sometihng back
- Add Lora to project if Wifi fails
