#include <ArduinoBLE.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

bool connected = false;
bool wifiConnected = false;

// Define Bluetooth
BLEService customService("19b10000-e8f2-537e-4f6c-d104768a1214");
BLECharacteristic customWriteCharacteristic("19b10001-e8f2-537e-4f6c-d104768a1214", BLEWrite | BLEWriteWithoutResponse, 128);
BLECharacteristic customReadCharacteristic("19b10002-e8f2-537e-4f6c-d104768a1214", BLERead | BLENotify, 128);

// Define Wifi 
char ssid[32] = "";
char password[64] = "";
WiFiClient espClient;

// Define MQTT Broker
const char *mqtt_broker = "192.168.0.226";
const char *topic = "devices/";
const char *device_id = "device1";
const char *device_type = "thermometer";
const char *mqtt_username = "emqx";
const char *mqtt_password = "public";
const int mqtt_port = 1883;
PubSubClient client(espClient);

// Define others 
char device_name[32] = "";
char device_room[32] = "";

// Define last sent time
unsigned long lastSentTime = 0;
const unsigned long interval = 1000; // 5 seconds

void reconnect() {
  Serial.print("Attempting MQTT connection...");
  if (client.connect(device_id, mqtt_username, mqtt_password)) {
    Serial.println("connected");


    StaticJsonDocument<200> doc;
    doc["id"] = device_id;
    doc["type"] = device_type;
    doc["name"] = device_name;
    doc["room"] = device_room;
    // Add parameters
    JsonObject parameters = doc.createNestedObject("parameters");
    parameters["temperature"] = "number";

    char buffer[256];
    serializeJson(doc, buffer);
    char ack_topic[50];
    sprintf(ack_topic, "home/devices/info/%s", device_id);
    client.publish(ack_topic, buffer, true);

    char status_topic[50];
    sprintf(status_topic, "home/devices/status/%s", device_id);
    client.publish(status_topic, "1", true);

    StaticJsonDocument<200> adoc;
    adoc["status"] = 0;
    char abuffer[256];
    serializeJson(adoc, abuffer);

    char data_topic[50];
    sprintf(data_topic, "home/devices/data/%s", device_id);
    client.publish(data_topic, abuffer, true);

    //sprintf(data_topic, "home/devices/data/%s", device_id);
    //client.subscribe(data_topic);
  } else {
    Serial.print("failed, rc=");
    Serial.print(client.state());
    Serial.println(" try again in 1 second");
    delay(1000);
  }
}

void setupWifi() {
    Serial.print("Connecting to WiFi...");
    WiFi.begin(ssid, password);
    unsigned long startAttemptTime = millis();
    
    while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 20000) {
        delay(500);
        Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED) {
        wifiConnected = true;
        Serial.println("Connected!");
        client.setServer(mqtt_broker, mqtt_port);
    } else {
        Serial.println("Failed to connect to WiFi");
    }
}

void setup() {
  Serial.begin(115200);

  if (!connected) {
    if (!BLE.begin()) {
      Serial.println("Starting BLE failed!");
      while (1);
    }

    BLE.setLocalName("ArduinoThermometer");
    BLE.setAdvertisedService(customService);
    customService.addCharacteristic(customWriteCharacteristic);
    customService.addCharacteristic(customReadCharacteristic);
    BLE.addService(customService);

    customWriteCharacteristic.setEventHandler(BLEWritten, onCharacteristicWritten);

    BLE.advertise();
    Serial.println("Bluetooth device active, waiting for connections...");
  }
}

void connectBluetooth() {
  BLEDevice central = BLE.central();

  if (central) {
    Serial.print("Connected to central: ");
    Serial.println(central.address());

    while (central.connected()) {
      BLE.poll();
    }

    Serial.println("Disconnected from central");
  }
}

void setupMQTT() {
  if (!client.connected()) {
    reconnect();
  } else {
    unsigned long currentTime = millis();
    if (currentTime - lastSentTime >= interval) {
      lastSentTime = currentTime;
      
      StaticJsonDocument<200> adoc;
      adoc["temperature"] = 10.5;
      char abuffer[256];
      serializeJson(adoc, abuffer);

      char data_topic[50];
      sprintf(data_topic, "home/devices/data/%s", device_id);
      client.publish(data_topic, abuffer, true);
    }
  }
  client.loop();
}

void loop() {
  if (!wifiConnected) {
    if (!connected) {
      connectBluetooth();
    } else {
      setupWifi();
    }
  } else {
    setupMQTT();
  }
}

void onCharacteristicWritten(BLEDevice central, BLECharacteristic characteristic) {
  int length = characteristic.valueLength();
  char buffer[length + 1]; // +1 for null terminator
  memcpy(buffer, characteristic.value(), length);
  buffer[length] = '\0'; // Null-terminate the string

  Serial.print("Received data: ");
  Serial.println(buffer);

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, buffer);

  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }

  strlcpy(ssid, doc["wifiname"] | "", sizeof(ssid));
  strlcpy(password, doc["wifipassword"] | "", sizeof(password));
  strlcpy(device_name, doc["name"] | "", sizeof(device_name));
  strlcpy(device_room, doc["room"] | "", sizeof(device_room));

  Serial.print("WiFi SSID: ");
  Serial.println(ssid);
  Serial.print("WiFi Password: ");
  Serial.println(password);
  Serial.print("Device Name: ");
  Serial.println(device_name);
  Serial.print("Device Room: ");
  Serial.println(device_room);

  connected = true;

    // Stop BLE advertising and disconnect
  BLE.stopAdvertise();
  BLE.disconnect();
}
