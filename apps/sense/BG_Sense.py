import smbus
import time
from datetime import datetime
import RPi.GPIO as GPIO
import requests
import json
import serial
import os
from sht1x.Sht1x import Sht1x as SHT1x    # Use this for Pi3
#from pi_sht1x import SHT1x                # Use this for Pi2 

GPIO.setmode(GPIO.BOARD)
GPIO.setup(11,GPIO.IN,pull_up_down=GPIO.PUD_UP)
GPIO.setwarnings(False)
dataPin = 11
clkPin = 7

ser = serial.Serial("/dev/ttyAMA0")
print "Serial Connected!"
ser.flushInput()
time.sleep(1)
bus = smbus.SMBus(1)
#config params
#LOOP_TIME=9.995
LOOP_TIME=0.5
START_TIME=time.time()
NUM_SAMP_AVG=5
BACKLOG_BUFF_LEN=59

# Read Configuration JSON file
with open('/home/arkbg/dev/config/BG_Config.json', 'r') as config_file:
    # Convert JSON to DICT
    config = json.load(config_file)
print config['DEVICE_ID']
dev_ID=config['DEVICE_ID']
# Build destination server path
# NUS Server
NUS_Server = "http://" + config['NUS_Server'] + config['SERVER_PATH']
print "NUS Server: ", NUS_Server
# AWS Server
BG_Server = "http://" + config['BG_Server'] + config['SERVER_PATH']
print "AWS Server: ", BG_Server

# SERVER_ADDR=config['SERVER_ADDR']


templ=[]
humdl=[]
cotol=[]
luml=[]

tofile=[]

while 1:
        #Check the sensor sampling interval value
        #Checking temp buffer and sending back to network

#        t = time.strftime("%Y-%m-%d %H:%M:%S")

   t = time.strftime("%Y-%m-%d %H:%M:%S")
#   print (t)

   if (len(tofile))>0:
           print t,": Network connection re-established ; Send data buffer to server"
   try:
#           Put data to NUS Server
           r1 = requests.put(NUS_Server, data=json.dumps(tofile), timeout=5)
           print t,r1.status_code,": NUS server response."
   except:
           print t, ": Failed sending data to NUS Server"

   try:
#           Put data to AWS Server
           r1 = requests.put(BG_Server, data=json.dumps(tofile), timeout=5)
           print t,r1.status_code,": AWS server response."
           del tofile[:]
   except:
           print t, ": Failed sending data to BG Server"

   #Reading Sensor Values
   for k in range(0,NUM_SAMP_AVG):
           try:
                   sht1x = SHT1x(dataPin, clkPin, SHT1x.GPIO_BOARD)      # Use this for Pi3
                   temperature = sht1x.read_temperature_C()              # Use this for Pi3
                   humidity = sht1x._read_humidity(30.04)                # Use this for Pi3
#                   with SHT1x(11,7, gpio_mode=GPIO.BOARD) as sensor:      # Use this for Pi2 
#                      temperature = sensor.read_temperature()             # Use this for Pi2
#                      humidity = sensor.read_humidity()                   # Use this for Pi2
#                   print("Temperature: {} Humidity: {}".format(temperature, humidity))
                   templ.append(temperature)  # This is temperature value
#                   print "Temperature = "+str(templ[k])+" deg C"
                   humdl.append(humidity) # This is humidity value
#                   print "Humidity = "+str(humdl[k])+" %"
           except:
                   print t,": STH Error"

           try:
                   ser.write("\xFE\x44\x00\x08\x02\x9F\x25")
                   time.sleep(.01)
                   resp = ser.read(7)
                   high = ord(resp[3])
                   low = ord(resp[4])
                   cotol.append((high*256) + low)  # This is Co2 value
#                   print "Co2 = " + str(cotol[k])+" ppm"
           except:
                   print t,": Co2 Error"
           
           try:
                   data = bus.read_i2c_block_data(0x23,0x11)
                   luml.append((data[1] + (256 * data[0])) / 1.2) #This is luminance value
#                   print "Luminosity " + str(luml[k])  + " lux"
           except:
                   print t,": Luminance  Error"

           time.sleep(LOOP_TIME)

#   print "Averaging for 1 min"
#   print "Length = " + str(len(templ))

   temp=(sum(templ)/len(templ))
   humd=(sum(humdl)/len(humdl))
   coto=(sum(cotol)/len(cotol))
   lum=(sum(luml)/len(luml))

#   Wait for top of the nminute
#   print "Sleep"
   time.sleep(60.0 - ((time.time() - START_TIME) % 60.0))
#   print "Woke up "
  
   t = time.strftime("%Y-%m-%d %H:%M:00")
#   print "Average Temparature = ", temp, " Humidity = ", humd, " CO2 = ", coto, " Luminocity = ", lum
   # Reset the lists
   del templ[:]
   del humdl[:]
   del cotol[:]
   del luml[:]

   #Completed all sensor values
   payload = {"deviceID":dev_ID, "tempsensor": temp,"lumnsensor": lum, "humdsensor":humd, "cotosensor":coto, "time":t}
   print "\n",payload
   tofile.append(payload)

   if len(tofile)>BACKLOG_BUFF_LEN:
       dir_name= "/home/arkbg/dev/"+time.strftime("%Y-%m-%d")
       try:
           os.makedirs(dir_name)
       except OSError:
           if os.path.exists(dir_name):
                   print t,": Already directory exists"
           else:
                   print t,": Some system Error in creating directory"

           print t,": Failed creating the directory"

       try:
           base_filename=time.strftime("%H_%M_%S")
           abs_file_name=os.path.join(dir_name, base_filename + "." + "txt")
           f = open(abs_file_name, 'w')
           print>>f, json.dumps(tofile)
           del tofile[:]
       except:
           print t,": Failed to create file"
GPIO.cleanup()


