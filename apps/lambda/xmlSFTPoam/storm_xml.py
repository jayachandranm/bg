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

import datetime
import time

stations = ["CWS001", "CWS002", "CWS003", "CWS007", "CWS012", "CWS014", "CWS015"]

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
table = dynamodb.Table('pubc5wl-ddb')

iot_client = boto3.client('iot-data', region_name='ap-southeast-1')

#source = os.environ['LAMBDA_TASK_ROOT'] + "/test.txt"
#hostname = "52.220.188.123"
hostname = "49.128.56.55"
port = 22
user = "ubuntu"
myuser = "user"
mypass = "tst"
#remote_dir = "/home/ubuntu/SFTP\ Folders/Shared\ Folder/Blugraph/"
#remote_dir = "SFTP Folders/Shared Folder/Blugraph"
remote_dir = "STORM SFTP/Blugraph"
#remote_dir = "xfiles/myx"

def lambda_handler(event, context):
    print
    "Reached so far only"
    key_filename = os.environ['LAMBDA_TASK_ROOT'] + "/lx_sg1.pem"
    key_filename = paramiko.RSAKey.from_private_key_file(key_filename)

    try:
        t = paramiko.Transport(hostname, port)
        #print(t)
        #t.connect(username=user, pkey=key_filename)
        t.connect(username=myuser, password=mypass)
        print("Connected")
    except:
        print("Connect Error.")
    try:
        sftp = paramiko.SFTPClient.from_transport(t)
        print(sftp)
    except paramiko.SSHException:
        print("Connection Error")

    try:
        sftp.chdir(remote_dir)
        print("Changed remote to: " + remote_dir)
    except:
        print("chdir failure") 

    tm = time.strftime('%Y-%m-%d_%H-%M')
    #file = open(tm + ".txt", 'w')
    #dest = "/home/ubuntu/xfiles/" + tm + ".xml"
    #dest = sub_path + tm + ".xml"
    dest = tm + ".xml"
    file=sftp.file(dest, "w", -1)
    #    file.write('Hello World!\n')
    file.write("<?xml version=\"1.0\" ?>" + "<TimeSeries>")
    for x in stations:
        #print("<-------------------->")
        #print(x)
        try:
            response = table.query(
                Limit=1,
                ScanIndexForward=False,
                KeyConditionExpression=Key('sid').eq(x)
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
        ts = int(ts_millis / 1000)
        dt1 = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d')
        hm1 = datetime.datetime.fromtimestamp(ts).strftime('%H:%M:%S')
        try:
            sid = data_row0['sid']
            #print(sid)
            al = data_row0['al']
            #print(al)
        except:
            print("No SID")

        if al > 2:
            al = 2
        flag = al
        #
        try:
            if 'md' in data_row0:
                #print("There is md here")
                md = data_row0['md']
                #print(md)
                if md == "spike":
                    flag = 3
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
        loc = (jsonState["state"]["reported"]["location"])
        #print(loc)
        #
        get_sid_url = "http://13.228.68.232/stationname.php?stationid=" + sid
        loc2 = urllib2.urlopen(get_sid_url).read()
        loc2 = loc2.strip()
        #print(loc2)
        #      file.write("   "+"<?xml version=\"1.0\" ?>"+'\n'+"<TimeSeries>"'\n')
        xml_to_write = "<series>" \
                       + "<header>" \
                       + "<type>instantaneous</type>" \
                       + "<locationId>" + str(sid) + "</locationId>" \
                       + "<parameterId>" + "WaterLevel" + "</parameterId>" \
                       + "<timeStep unit=""nonequidistant""/>" \
                       + "<startDate date=" + dt1 + " time=" + hm1 + " />" \
                       + "<endDate date=" + dt1 + " time=" + hm1 + " />" \
                       + "<missVal>" + "-999.9" + "</missVal>" \
                       + "<x>" + "31810.18</x>" \
                       + "<y>" + "41013.21" + "</y>" \
                       + "<fileDescription>cope_level=" + "108.23" \
                       + " invert_level=""105.73" \
                       + "</fileDescription>" \
                       + "</header>" \
                       + "<event date=" + dt1 + " time=" + hm1 + " value=" + str(wa) + " />" \
                       + "</series>"
        print(xml_to_write)
        try:
            file.write(xml_to_write)  
            #file.flush()
        except:
            print("File write error.")
    #      print ("Print completed")
    #    sftp.put(source, dest)
    #      print ("Transfer completed")
    try:
        file.write("</TimeSeries>")
        file.flush()
    except:
        print("File write error.")

