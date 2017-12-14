import paho.mqtt.client as mqtt #import the client1
from store_to_db import temp_data_handler
import time
import ssl

# MQTT Settings 
MQTT_Broker = "localhost"
MQTT_Port = 8883
Keep_Alive_Interval = 45
MQTT_Topic = "#"

############
#Subscribe to all Sensors at Base Topic
#def on_connect(mosq, obj, rc):
#    print("On Connect..")
    #mqttc.subscribe(MQTT_Topic, 0)

def on_message(client, userdata, message):
    print("message received " ,str(message.payload.decode("utf-8")))
    print("message topic=",message.topic)
    print("message qos=",message.qos)
    print("message retain flag=",message.retain)
    temp_data_handler(message.payload)

def on_subscribe(mosq, obj, mid, granted_qos):
    pass
########################################

print("creating new instance")
client = mqtt.Client("P1") #create new instance
client.tls_set(ca_certs='./ca.crt', certfile='./client.crt', keyfile='./client.key', tls_version=2)
client.username_pw_set(username="admin", password="pass")

client.on_message=on_message #attach function to callback
#client.on_connect = on_connect
client.on_subscribe = on_subscribe

print("connecting to broker")
#connect to broker
client.connect(MQTT_Broker, int(MQTT_Port), int(Keep_Alive_Interval)) 
#start the loop
#client.loop_start() 
print("Subscribing to topic","house/bulbs/bulb1")
client.subscribe(MQTT_Topic)
#print("Publishing message to topic","house/bulbs/bulb1")
#client.publish("house/bulbs/bulb1","OFF")
#time.sleep(4) # wait
#client.loop_stop() #stop the loop

# Continue the network loop
client.loop_forever()
