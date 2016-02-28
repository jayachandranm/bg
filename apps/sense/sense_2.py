import smbus
import time
from datetime import datetime
import RPi.GPIO as GPIO
import requests
import json
import serial
import os
from pi_sht1x import SHT1x
GPIO.setmode(GPIO.BOARD)
GPIO.setup(11,GPIO.OUT,pull_up_down=GPIO.PUD_UP)
GPIO.setwarnings(False)
dataPin = 11
clkPin = 7
ser = serial.Serial("/dev/ttyAMA0")
print "Serial Connected!"
ser.flushInput()
time.sleep(1)
bus = smbus.SMBus(1)

#config params
loop_time=9.995
num_samp_avg=6
dev_ID="D1004"
BACKLOG_BUFF_LEN=59
SERVER_ADDR="172.18.53.42:81"

templ=[]
humdl=[]
cotol=[]
luml=[]

tofile=[]

while 1:
    #Check the sensor sampling interval value
#    r = requests.put("http://172.18.53.42:81/BluIEQ/stationstatus.php", data="D1004")   	
#    r = requests.put("http://52.74.191.39/BluIEQ/stationstatus.php", data="D1004")
#    print r.status_code
#    print (r.content)
#    data = json.loads(r.content)
#    if data[0]==None:
#        delay = 60
#         print "Default delay"
#    else:
#        delay = float(data[0])
#    print "first",delay

#Checking temp buffer and sending back to network

    if (len(tofile))>0:
	
	print "Network connection re-established ; Send data buffer to server"
    	try:
#	       	r1 = requests.put("http://172.18.53.42:81/BluIEQ/sensordata.php", data=json.dumps(tofile), timeout=0.1)
        	r1 = requests.put("http://52.74.191.39/BluIEQ/sensordata.php", data=json.dumps(tofile), timeout=0.1)
        	print r1.status_code
        	print r1.content
		del tofile[:]
    	except:
        	print "Network Failed while uploading data buffer:"
#Reading Sensor Values	
	
    for k in range(0,num_samp_avg):
	try:        
		with SHT1x(11,7, gpio_mode=GPIO.BOARD) as sensor:
            		templ.append(sensor.read_temperature())  # This is temperature value
            		print "Temperature = "+str(templ[k])+" deg C"
            		humdl.append(sensor.read_humidity(templ[k])) # This is humidity value
            		print "Humidity = "+str(humdl[k])+" %"
	except:
        	print "STH Error"
	try:
        	ser.write("\xFE\x44\x00\x08\x02\x9F\x25")
        	time.sleep(.01)
        	resp = ser.read(7)
        	high = ord(resp[3])
        	low = ord(resp[4])
        	cotol.append((high*256) + low)  # This is Co2 value
        	print "Co2 = " + str(cotol[k])+" ppm"
        except:
                print "Co2 Error"
	try:
		data = bus.read_i2c_block_data(0x23,0x11)
        	luml.append((data[1] + (256 * data[0])) / 1.2) #This is luminance value
        	print "Luminosity " + str(luml[k])  + " lux"
        except:
                print "Luminance  Error"
	
	time.sleep(loop_time)
	print " "
    
    print "Averaging for 1 min"
    print "Length = " + str(len(templ))
	
    temp=(sum(templ)/len(templ))
    print "Temperature = "+str(temp)+" deg C"
    humd=(sum(humdl)/len(humdl))
    print "Humidity = "+str(humd)+" %"
    coto=(sum(cotol)/len(cotol))
    print "Co2 = " + str(coto)+" ppm"
    lum=(sum(luml)/len(luml))
    print "Luminosity " + str(lum)  + " lux"
    #Completed all sensor values
    # Reset the lists
    del templ[:]
    del humdl[:]
    del cotol[:]
    del luml[:]	 	
    i = time.strftime("%Y-%m-%d %H:%M:%S")
#    i = time.strftime("%Y-%m-%d %H:%M")
    print (i)
    payload = {"deviceID":dev_ID, "tempsensor": temp,"lumnsensor": lum, "humdsensor":humd, "cotosensor":coto, "time":i}
    print "Send Data to server"
    try:	
#    	r1 = requests.put("http://172.18.53.42:81/BluIEQ/sensordata.php", data=json.dumps(payload), timeout=0.1)
	r1 = requests.put("http://52.74.191.39/BluIEQ/sensordata.php", data=json.dumps(payload), timeout=0.1)
    	print r1.status_code
#    	print r1.content
    except:
	print "Network Failed Error:"

#The value is always appeneded to the list. Whenever there is network, it will be sent. 

    tofile.append(payload)
    if len(tofile)>BACKLOG_BUFF_LEN:
	dir_name= "/home/arkbg/dev/"+time.strftime("%Y-%m-%d")
#	print dir_name

	try:
		os.makedirs(dir_name)
		print "Directory Created" 
		
	except OSError:
		if os.path.exists(dir_name):
			print "Already directory exists"
		else:
			print "Some system Error in creating directory"

		print "Failed creating the directory"

	print "Make the file"
	try:
		base_filename=time.strftime("%H_%M_%S")
		abs_file_name=os.path.join(dir_name, base_filename + "." + "txt")
		print abs_file_name
		f = open(abs_file_name, 'w')
		print>>f, json.dumps(tofile)
#		for item in tofile:
#			print>>f, item
		del tofile[:]
	except:  	
		print "Failed to create file"
#    time.sleep(delay)
GPIO.cleanup()
