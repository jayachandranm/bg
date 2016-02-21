import smbus
import time
from datetime import datetime
import RPi.GPIO as GPIO
import requests
import json
import serial
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

while 1:

        bus = smbus.SMBus(1)
        with SHT1x(11,7, gpio_mode=GPIO.BOARD) as sensor:
                temp = sensor.read_temperature()
                print "Temperature = "+str(temp)+" deg C"
                humd = sensor.read_humidity(temp)
                print "Humidity = "+str(humd)+" %"

        ser.write("\xFE\x44\x00\x08\x02\x9F\x25")
        time.sleep(.01)
        resp = ser.read(7)
        high = ord(resp[3])
        low = ord(resp[4])
        coto = (high*256) + low
        print "Co2 = " + str(coto)+" ppm"

        data = bus.read_i2c_block_data(0x23,0x11)
        lum=str((data[1] + (256 * data[0])) / 1.2)
        print "Luminosity " + str(lum)  + " lux"
	
        i = time.strftime("%Y-%m-%d %H:%M:%S")
	i = time.strftime("%Y-%m-%d %H:%M")
        print (i)
        payload = [{"deviceID":"D1004", "tempsensor": temp,"lumnsensor": lum, "humdsensor":humd, "cotosensor":coto, "time":i}]
        print "Send Data to server"
        r1 = requests.put("http://52.74.191.39/BluIEQ/sensordata.php", data=json.dumps(payload))
        print r1.status_code

        print r1.content

        r = requests.put("http://52.74.191.39/BluIEQ/stationstatus.php", data="D1004")
        print r.status_code
        print (r.content)
        data = json.loads(r.content)
        if data[0]==None:
                delay = 60
                print "Default delay"
        else:
                delay = float(data[0])

        print "first",delay

        time.sleep(delay)
GPIO.cleanup()
