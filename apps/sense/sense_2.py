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
LOOP_TIME=9.995
NUM_SAMP_AVG=6
dev_ID="A1004"
BACKLOG_BUFF_LEN=59
SERVER_ADDR="172.18.53.42:81"

templ=[]
humdl=[]
cotol=[]
luml=[]

tofile=[]

while 1:
	#Check the sensor sampling interval value
	#Checking temp buffer and sending back to network

	t = time.strftime("%Y-%m-%d %H:%M:%S")
#    print (t)

	if (len(tofile))>0:
		print t,": Network connection re-established ; Send data buffer to server"
    	try:
#	       	r1 = requests.put("http://172.18.53.42:81/BluIEQ/sensordata.php", data=json.dumps(tofile), timeout=0.1)
		r1 = requests.put("http://52.74.191.39/BluIEQ/sensordata.php", data=json.dumps(tofile), timeout=0.1)
		print t,r1.status_code,": server response."
#        	print r1.content
		del tofile[:]
    	except:
		print t,": Network Failed while uploading data buffer:"

	#Reading Sensor Values	
	for k in range(0,NUM_SAMP_AVG):
		try:        
			with SHT1x(11,7, gpio_mode=GPIO.BOARD) as sensor:
				templ.append(sensor.read_temperature())  # This is temperature value
#           			print "Temperature = "+str(templ[k])+" deg C"
				humdl.append(sensor.read_humidity(templ[k])) # This is humidity value
#           			print "Humidity = "+str(humdl[k])+" %"
		except:
			print t,": STH Error"

		try:
			ser.write("\xFE\x44\x00\x08\x02\x9F\x25")
			time.sleep(.01)
			resp = ser.read(7)
			high = ord(resp[3])
			low = ord(resp[4])
			cotol.append((high*256) + low)  # This is Co2 value
#        		print "Co2 = " + str(cotol[k])+" ppm"
		except:
			print t,": Co2 Error"
		#
		try:
			data = bus.read_i2c_block_data(0x23,0x11)
			luml.append((data[1] + (256 * data[0])) / 1.2) #This is luminance value
#        		print "Luminosity " + str(luml[k])  + " lux"
		except:
                	print t,": Luminance  Error"
	
		time.sleep(LOOP_TIME)
#		print " "
    
	print "Averaging for 1 min"
#	print "Length = " + str(len(templ))
	
	temp=(sum(templ)/len(templ))
	humd=(sum(humdl)/len(humdl))
	coto=(sum(cotol)/len(cotol))
	lum=(sum(luml)/len(luml))
	# Reset the lists
	del templ[:]
	del humdl[:]
	del cotol[:]
	del luml[:]	 	
#    print "Temperature = "+str(temp)+" deg C"
#    print "Humidity = "+str(humd)+" %"
#    print "Co2 = " + str(coto)+" ppm"
#    print "Luminosity " + str(lum)  + " lux"
	#Completed all sensor values
	payload = {"deviceID":dev_ID, "tempsensor": temp,"lumnsensor": lum, "humdsensor":humd, "cotosensor":coto, "time":t}
#	try:	
#		print t,": Send Data to server"
#    		r1 = requests.put("http://172.18.53.42:81/BluIEQ/sensordata.php", data=json.dumps(payload), timeout=0.1)
#		r1 = requests.put("http://52.74.191.39/BluIEQ/sensordata.php", data=json.dumps(payload), timeout=0.1)
#		print t,r1.status_code,": server response."
#	except:
#		print t,": Network Failed Error:"
        	# The value is appeneded to the list. Whenever there is network, it will be sent. 
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
#		for item in tofile:
#			print>>f, item
		del tofile[:]
	    except:  	
		print t,": Failed to create file"
#    time.sleep(delay)
GPIO.cleanup()
