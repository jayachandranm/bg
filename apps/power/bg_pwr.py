import pymodbus
import serial
import time
import struct
import ctypes
import requests
import json
from datetime import datetime

from pymodbus.pdu import ModbusRequest
from pymodbus.client.sync import ModbusSerialClient as ModbusClient  # initialize a serial RTU client instance
from pymodbus.transaction import ModbusRtuFramer
from pymodbus.constants import Endian
from pymodbus.payload import BinaryPayloadDecoder

# import logging
# logging.basicConfig()
# log = logging.getLogger()
# log.setLevel(logging.DEBUG)

# count= the number of registers to read
# unit= the slave unit this request is targeting
# address= the starting address to read from

paramNames = [
'voltage_L1-N',
'voltage_L2-N',
'voltage_L3-N',
'voltage_L1-L2',
'voltage_L3-L2',
'voltage_L1-L3',
'current_L1',
'current_L2',
'current_L3',
'current_N',
'active_power_total',
'active_power_L1',
'active_power_L2',
'active_power_L3',
'reactive_power_total',
'reactive_power_L1',
'reactive_power_L2',
'reactive_power_L3',
'apparent_power_total',
'apparent_power_L1',
'apparent_power_L2',
'apparent_power_L3',
'frequency',
'phase_angle_power_total',
'phase_angle_power_L1',
'phase_angle_power_L2',
'phase_angle_power_L3',
'phase_angle_voltage_L1',
'phase_angle_voltage_L2',
'phase_angle_voltage_L3',
'phase_angle_current_L1',
'phase_angle_current_L2',
'phase_angle_current_L3',
'power_factor_total',
'power_factor_L1',
'power_factor_L2',
'power_factor_L3',
'current_quadrant_total',
'current_quadrant_L1',
'current_quadrant_L2',
'current_quadrant_L3'
]

pwrvals = {}

date = [1002, 1816, 0300]

client = ModbusClient(method="rtu", port="/dev/ttyRPC0", baudrate=19200, stopbits=1, bytesize=8, parity='E')
# client= ModbusClient(method = "rtu", port="/dev/ttyRPC0",baudrate= 19200,stopbits=1,bytesize=8,parity='E')
print client.connect()

# connect to the serial modbus server
print client

import binascii
import ctypes
import array

preg= 0x5B00

def add_hex2(hex1, hex2)
    return hex(int(hex1, 16) + int(hex2, 16))

    # result = client.read_holding_registers(0x5000, 4, unit=0x01)
    # print "Active Import", result.registers
    # client.write_registers(0x8A00, date)
    #
    # result = client.read_holding_registers(0x8A00, 3, unit=0x01)
    # print "Date", result.registers

    # result = client.read_holding_registers(0x5B2C, 1, unit=0x01)
    # print result.registers
    # pwrvals['freq'] = result.registers[0] * 0.01
    #       v1 = struct.unpack('>l', result.registers)[0]
    #        print "Frequency", int(v1), "Hz"

    #        raw = struct.pack('>HH', result.registers[0])
    #       v1 = struct.unpack('>f', raw)[0]
    #       print "Frequency :",int(v1), "A"


for item in range(0, 21):
    # starting add, num of reg to read, slave unit.
    #       result= client.read_input_registers(0x5B00,2,unit=0x01)
    result = client.read_holding_registers(preg, 2, unit=0x01)
    #print "Voltage", result.registers
    raw = struct.pack('>HH', result.registers[0], result.registers[1])
    v1 = struct.unpack('>l', raw)
    print (v1)[0] * 0.1
    pwrvals[paramNames[0]] = result.registers[1] * 0.1
    # #       print result
    # # Python 3.2    v2= int.from_bytes(raw2, byteorder='big', signed=False)
    # raw2 = ctypes.create_string_buffer(4)
    # #       raw2 = array.array('c', '\0' * 4)
    # struct.pack_into('>HH', raw2, 0, result.registers[0], result.registers[1])
    # v2 = struct.unpack('>l', raw2)
    # print v2
    #       print int(raw2.encode('hex'), 16)

    #       v1 = struct.unpack('>l', raw)[0]
    #       print "Voltage :",int(v1), "V"


    with open('data.json', 'w') as f:
        json.dump(pwrvals, f)

    #       i = time.strftime("%Y-%m-%d %H:%M:%S")
    #       print (i)
    #       payload = [{"SID":"P1001","T":i,"V": int(v1),"I":v2,"W":int(-v3),"F":v7,"Pf":v6,"Wh":v8*1000}]
    #       print "Send Data to server"
    #       r1 = requests.put("http://52.74.191.39/blupower/powerdata.php", data=json.dumps(payload))
    #       r1 = requests.put("http://52.74.191.39/blupower/powerdata.php", data=json.dumps(pwrvals))
    #       print r1.status_code
    #       print r1.content

    print " "
    #time.sleep(5)
# closes the underlying socket connection
client.close()
