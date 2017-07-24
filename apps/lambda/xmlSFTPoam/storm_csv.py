from __future__ import print_function

import os
from StringIO import StringIO
import boto3
import paramiko
import sys, paramiko

import json
import decimal
from boto3.dynamodb.conditions import Key, Attr

import urllib2

#import datetime
from datetime import datetime
import time
import pytz

with open("station-ids.json") as json_file:
    try:
        json_data = json.load(json_file)
    except:
        print("Error loading JSON file.")

stations = json_data['stations'] 

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
table = dynamodb.Table('pubc5wl-ddb')

iot_client = boto3.client('iot-data', region_name='ap-southeast-1')

with open("config.json") as config_json_file:
    try:
        config = json.load(config_json_file)
    except:
        print("Error loading config JSON file.")

hostname = config['host']
port = config['port']
myuser = config['user']
mypass = config['pass']
remote_dir = config['remote_dir']

def lambda_handler(event, context):

    try:
        trans = paramiko.Transport(hostname, port)
        trans.connect(username=myuser, password=mypass)
        print("Connected")
    except:
        print("Connect Error.")
    try:
        sftp = paramiko.SFTPClient.from_transport(trans)
        print(sftp)
    except paramiko.SSHException:
        print("Connection Error")

#    try:
#        sftp.chdir(remote_dir)
#        print("Changed remote to: " + remote_dir)
#    except:
#        print("chdir failure") 

    #curr_t = int(time.time())
    #tm = time.strftime('%Y-%m-%d_%H-%M-%S')
    #tm = datetime.fromtimestamp(curr_t+28800).strftime('%Y-%m-%d_%H-%M-%S')
    utc_time = datetime.utcnow()
    utc_time = utc_time.replace(tzinfo=pytz.UTC)
    sg_tz = pytz.timezone('Asia/Singapore')
    sg_time = utc_time.astimezone(sg_tz)
    tm = sg_time.strftime('%Y-%m-%d_%H-%M-%S')
    dest = tm + ".csv"
    file=sftp.file(dest, "w", -1)
    for sid in stations:
        #print("<-------------------->")
        #print(x)
        try:
            response = table.query(
                Limit=1,
                ScanIndexForward=False,
                KeyConditionExpression=Key('sid').eq(sid)
            )
        except:
            print("DB access error.")
        #
        data_row0 = response["Items"][0]
        #print(data_row0)
        wa = 0.0
        ts_millis = 0.0
        ts = 0
        try:
            wa = data_row0['wa']
        except:
            print("No data")
        #
        try:
            ts_millis = data_row0['ts']
        except:
            print("No time")
        #
        wa = wa/100
        ts = int(ts_millis / 1000)
        #dt1 = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d')
        #hm1 = datetime.datetime.fromtimestamp(ts).strftime('%H:%M:%S')
        dt1 = datetime.fromtimestamp(ts+28800).strftime('%Y-%m-%d')
        hm1 = datetime.fromtimestamp(ts+28800).strftime('%H:%M:%S')
        dt_hm1 = datetime.fromtimestamp(ts+28800).strftime('%Y-%m-%d %H:%M:%S')
        try:
            #sid = data_row0['sid']
            #print(sid)
            al = data_row0['al']
            #print(al)
        except:
            print("No SID")

        # TODO:
        if al > 2:
            al = 2
        flag = al
        #
        md_f = 0
        try:
            if 'md' in data_row0:
                #print("There is md here")
                md = data_row0['md']
                #print(md)
                if md == "maintenance":
                    md_f = 1

                # TODO:
                if md == "spike":
                    flag = 3
                    #md_f = 0
            #else:
            #    print("There is no md here")
            #
        except:
            print("No time")

        #print(flag)
        #
        response = iot_client.get_thing_shadow(
            thingName=str(sid)
        )
        streamingBody = response["payload"]
        jsonState = json.loads(streamingBody.read())
        invert = jsonState["state"]["reported"]["invert_level"]
        #
        mrl_val = decimal.Decimal(invert) + decimal.Decimal(wa)
        mrl_str = "{0:.2f}".format(mrl_val)
        csv_to_write = str(sid) + "," \
                       + dt_hm1 + "," \
                       + mrl_str + "," \
                       + str(md_f) + "\n"
        print(csv_to_write)
        try:
            file.write(csv_to_write)  
            #file.flush()
        except:
            print("File write error.")
    #      print ("Print completed")
    #    sftp.put(source, dest)
    #      print ("Transfer completed")
    try:
        file.flush()
    except:
        print("File write error.")

    return "File uploaded."

