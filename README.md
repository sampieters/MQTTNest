# MQTTNest
A home automation application based on MQTT, could be extended with other protocols

## Dummy Devices

The dummy devices folder are fake devices programmed in python to understand MQTT and to test the broker and the connections. To run a dummy device, create a
virtual environment and install the needed libraries delivered in requirements.txt. After this, run the correspodnign dummy devices via python.

## Mosquitto Broker

In the future this will be a docker container. The Mosquitto broker is the connection for ohter devices and holds the topics and messages. This broker can be 
run in the background. To run this broker, install mosquitto via


After the instalment, change the configuration file "<path_to_mosquitto>/mosquitto.conf" to the provided configuration file "mosquitto.conf". Run the following
command to run the broker:

<path_to_mosquitto> -c <path_to_mosquitto>/mosquitto.conf

## The React Web App

The web application is written in React.js. To install the needed packages run the following command:

npm install

After the packages are installed just run 

npm start

## TODO:

- Add docker containerization for each map 
