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

paramNameList = [
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

client = ModbusClient(method="rtu", port="/dev/ttyAMA0", baudrate=19200, stopbits=1, bytesize=8, parity='E')
#client = ModbusClient(method="rtu", port="/dev/ttyRPC0", baudrate=19200, stopbits=1, bytesize=8, parity='E')
# client= ModbusClient(method = "rtu", port="/dev/ttyRPC0",baudrate= 19200,stopbits=1,bytesize=8,parity='E')
print client.connect()

# connect to the serial modbus server
print client

import binascii
import ctypes
import array

reg_addr= 0x5B00

def add_hex2(hex1, hex2):
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


# for param in paramNames:
for item in range(0, 22):
    paramName = paramNameList[item]
    # starting add, num of reg to read, slave unit.
    #       result= client.read_input_registers(0x5B00,2,unit=0x01)
    result = client.read_holding_registers(reg_addr, 2, unit=0x01)
    #print "Voltage", result.registers
    if item < 10: # unsigned
        raw = struct.pack('>HH', result.registers[0], result.registers[1])
        val = struct.unpack('>l', raw)
    else: # signed
        raw = struct.pack('>HH', result.registers[0], result.registers[1])
        val = struct.unpack('>l', raw)
    # fval = result.registers[1] * 0.1
    result_val = 0.0
    if (item < 6): #  or (item > 22)
        result_val = (val)[0] * 0.01
    else:
        result_val = (val)[0] * 0.1

    print item, paramName, result_val
    pwrvals[paramName] = result_val

    with open('data.json', 'w') as f:
        json.dump(pwrvals, f)


    # For the last one, will skip Freq, as freq is separately handled.
    #add_hex2(reg_addr, 0x2)
    reg_addr = reg_addr + 0x2

    print " "
    #time.sleep(5)

paramName = paramNameList[22]
result = client.read_holding_registers(0x5B2C, 1, unit=0x01)
#val = struct.unpack('>l', result.registers)[0]
result_val = result.registers[0] * 0.01
#result_val = val * 0.01
print "Frequency", int(result_val), "Hz"
pwrvals[paramName] = result_val


for item in range(22, 40):
    paramName = paramNameList[item]
    # starting add, num of reg to read, slave unit.
    #       result= client.read_input_registers(0x5B00,2,unit=0x01)
    result = client.read_holding_registers(reg_addr, 1, unit=0x01)
    #print "Voltage", result.registers
    if item > 36: # unsigned
        #raw = struct.pack('>H', result.registers[0])
        #raw = struct.pack('>HH', result.registers[0], result.registers[1])
        val = result.registers[0] 
        #val = struct.unpack('>l', raw)
    else: # signed
        #raw = struct.pack('>H', result.registers[0])
        #raw = struct.pack('>HH', result.registers[0], result.registers[1])
        val = result.registers[0] 
        #val = struct.unpack('>l', raw)
    # fval = result.registers[1] * 0.1
    result_val = 0.0
    if (item < 33): #  or (item > 22)
        #result_val = (val)[0] * 0.1
        result_val = val * 0.1
    else:
        result_val = val 
        #result_val = (val)[0]

    print item, paramName, result_val
    pwrvals[paramName] = result_val

    with open('data.json', 'w') as f:
        json.dump(pwrvals, f)

    #add_hex2(reg_addr, 0x1)
    reg_addr = reg_addr + 0x2

    print " "

# closes the underlying socket connection
client.close()
