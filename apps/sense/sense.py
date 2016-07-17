import smbus
import time
from datetime import datetime
import RPi.GPIO as GPIO
import requests
import json
import serial
import os
from pi_sht1x import SHT1x
import cPickle as pickle

GPIO.setmode(GPIO.BOARD)
GPIO.setup(11, GPIO.OUT, pull_up_down=GPIO.PUD_UP)
GPIO.setwarnings(False)
dataPin = 11
clkPin = 7
ser = serial.Serial("/dev/ttyAMA0")
print "Serial Connected!"
ser.flushInput()
time.sleep(1)
bus = smbus.SMBus(1)

# config params
loop_time = 9.995
num_samp_avg = 6
dev_ID = "D1004"
BACKLOG_BUFF_LEN = 59
#SERVER_ADDR = "172.18.53.42:81"
SERVER_ADDR = "52.74.191.39"
RUN_DIR = "/home/arkbg/dev/"

templ = []
humdl = []
cotol = []
luml = []

payload = {}
network_status = 1

while 1:

    # Reading Sensor Values
    for k in range(0, num_samp_avg):
        try:
            with SHT1x(11, 7, gpio_mode=GPIO.BOARD) as sensor:
                templ.append(sensor.read_temperature())  # This is temperature value
                print "Temperature = " + str(templ[k]) + " deg C"
                humdl.append(sensor.read_humidity(templ[k]))  # This is humidity value
                print "Humidity = " + str(humdl[k]) + " %"
        except:
            print "STH Error"
        try:
            ser.write("\xFE\x44\x00\x08\x02\x9F\x25")
            time.sleep(.01)
            resp = ser.read(7)
            high = ord(resp[3])
            low = ord(resp[4])
            cotol.append((high * 256) + low)  # This is Co2 value
            print "Co2 = " + str(cotol[k]) + " ppm"
        except:
            print "Co2 Error"
        try:
            data = bus.read_i2c_block_data(0x23, 0x11)
            luml.append((data[1] + (256 * data[0])) / 1.2)  # This is luminance value
            print "Luminosity " + str(luml[k]) + " lux"
        except:
            print "Luminance  Error"

        time.sleep(loop_time)
        print " "

    print "Averaging for 1 min"
    print "Length = " + str(len(templ))

    temp = (sum(templ) / len(templ))
    print "Temperature = " + str(temp) + " deg C"
    humd = (sum(humdl) / len(humdl))
    print "Humidity = " + str(humd) + " %"
    coto = (sum(cotol) / len(cotol))
    print "Co2 = " + str(coto) + " ppm"
    lum = (sum(luml) / len(luml))
    print "Luminosity " + str(lum) + " lux"

    # Completed all sensor values
    # Reset the lists
    del templ[:]
    del humdl[:]
    del cotol[:]
    del luml[:]

    curr_time = time.strftime("%Y-%m-%d %H:%M:%S")
    #payload = {"deviceID": dev_ID, "tempsensor": temp, "lumnsensor": lum, "humdsensor": humd, "cotosensor": coto,
    #           "time": i}
    payload["deviceID"] = dev_ID
    payload["tempsensor"] = temp
    payload["lumnsensor"] = lum
    payload["humdsensor"] = humd
    payload["cotosensor"] = coto
    payload["time"] = curr_time

    print curr_time + " -> Send Data to server: " + json.dumps(payload)
    try:
         svc_url = "http://" + SERVER_ADDR + "/BluIEQ/sensordata.php"
         r1 = requests.put(svc_url, data=json.dumps(payload), timeout=0.1)
         print r1.status_code
         #print r1.content
    except:
        print "Network Failed Error:"
        network_status = 0

    # If there was network failure, save this object to file.
    # Another program will read the file and upload the data.
    if network_status == 0:
        dir_name = RUN_DIR + time.strftime("%Y-%m-%d")
        #	print dir_name

        try:
            # A new directory for a new day.
            os.makedirs(dir_name)
            print "Directory Created"

        except OSError as x:
            print "Directory not created, err: " + x
            if os.path.exists(dir_name):
                print "Already directory exists"
            else:
                print "Some system Error in creating directory"

        # For the same hour, append to existing file. New file for new hour.
        base_filename = "local_" + time.strftime("%Y-%m-%d_%H_%M")
        ext = ".current"
        abs_file_name = os.path.join(dir_name, base_filename) + ext
        print abs_file_name
        # If the file does not exist, this data will be written in new file.
        # Rename any .current files to .dat
        try:
            if not os.path.exists(abs_file_name):
                from glob import glob
                from os import rename
                os.chdir(dir_name)
                for file in glob.glob("*.current"):
                    print(file)
                    rename(file, file.replace(".current", ".dat", 1))

            localfile = open(abs_file_name, 'wa')
        except Exception as x:
            print "File opreration error: " + x

        pickle.dump(payload, localfile, pickle.HIGHEST_PROTOCOL)
#
GPIO.cleanup()
