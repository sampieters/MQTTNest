


from network import Bluetooth
import time

def conn_cb(chr):
    events = chr.events()
    if events & Bluetooth.CLIENT_CONNECTED:
        print('client connected')
    elif events & Bluetooth.CLIENT_DISCONNECTED:
        print('client disconnected')
        update = False

# Initialize Bluetooth
bt = Bluetooth()
bt.set_advertisement(name='FiPy 45', manufacturer_data="Pycom", service_uuid= b'\x14\x12\x8a\x76\x04\xd1\x6c\x4f\x7e\x53\xf2\xe8\x00\x00\xb1\x19')

bt.callback(trigger=Bluetooth.CLIENT_CONNECTED | Bluetooth.CLIENT_DISCONNECTED, handler=conn_cb)
bt.advertise(True)

# Create a GATT server
srv1 = bt.service(uuid=b'\x14\x12\x8a\x76\x04\xd1\x6c\x4f\x7e\x53\xf2\xe8\x00\x00\xb1\x19', isprimary=True)

# Create a characteristic
char1 = srv1.characteristic(uuid=b'\x14\x12\x8a\x76\x04\xd1\x6c\x4f\x7e\x53\xf2\xe8\x02\x00\xb1\x19', properties=Bluetooth.PROP_READ | Bluetooth.PROP_NOTIFY, value=0x1234)

from network import Bluetooth

bluetooth = Bluetooth()
bluetooth.set_advertisement(name='HELP', service_uuid=b'\x14\x12\x8a\x76\x04\xd1\x6c\x4f\x7e\x53\xf2\xe8\x00\x00\xb1\x19')
# Create a GATT server
srv1 = bt.service(uuid=b'\x14\x12\x8a\x76\x04\xd1\x6c\x4f\x7e\x53\xf2\xe8\x00\x00\xb1\x19', isprimary=True)

def conn_cb (bt_o):
    events = bt_o.events()   # this method returns the flags and clears the internal registry
    if events & Bluetooth.CLIENT_CONNECTED:
        print("Client connected")
    elif events & Bluetooth.CLIENT_DISCONNECTED:
        print("Client disconnected")

bluetooth.callback(trigger=Bluetooth.CLIENT_CONNECTED | Bluetooth.CLIENT_DISCONNECTED, handler=conn_cb)

bluetooth.advertise(True)