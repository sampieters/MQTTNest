import tkinter as tk
from tkinter import ttk
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib.animation as animation
import paho.mqtt.client as mqtt
import time
import threading
import queue

# MQTT broker settings
BROKER = "0.0.0.0"
PORT = 1883
TOPIC = "home/devices/data/#"

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
    try:
        temperature = float(msg.payload.decode('utf-8'))
        temperature.append(temperature)
    except ValueError:
        print("Invalid temperature value")

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
client.loop_start()

# Function to update the plot
def update_plot(frame):
    while not temperature_queue.empty():
        temperature = temperature_queue.get()
        temperatures.append(temperature)
    ax.clear()
    ax.plot(temperatures, marker='o', linestyle='-')
    ax.set_title('Temperature Over Time')
    ax.set_xlabel('Reading')
    ax.set_ylabel('Temperature')

# Set up the main application window
root = tk.Tk()
root.title("Real-time Temperature Plot")

# Create a matplotlib figure and axis
fig, ax = plt.subplots()

# Create a canvas to display the plot in the Tkinter window
canvas = FigureCanvasTkAgg(fig, master=root)
canvas_widget = canvas.get_tk_widget()
canvas_widget.pack(fill=tk.BOTH, expand=True)

# List to store temperature readings
temperatures = []

# Set up the animation to update the plot every 5 seconds (5000 milliseconds)
ani = animation.FuncAnimation(fig, update_plot, interval=5000)

# Start the Tkinter event loop in the main thread
try:
    root.mainloop()
except KeyboardInterrupt:
    print("Exiting...")
finally:
    client.loop_stop()
    client.disconnect()
