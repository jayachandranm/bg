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

#stations = ["CWS001", "CWS002", "CWS003", "CWS007", "CWS012", "CWS014", "CWS015"]
stations = ["CWS001", "CWS002", "CWS003", "CWS007", "CWS010", "CWS011", "CWS012", "CWS013", "CWS014", "CWS015", "CWS155", "CWS017", "CWS019", "CWS020", \
"CWS021", "CWS022", "CWS023", "CWS156", "CWS025", "CWS027", "CWS029", "CWS030", \
"CWS041", "CWS043", "CWS044", "CWS045", "CWS046", "CWS047", "CWS048", "CWS049", "CWS050", \
"CWS051", "CWS052", "CWS055", "CWS056", "CWS057", "CWS058", "CWS060", \
"CWS061", "CWS083", "CWS096", "CWS141", "CWS099", "CWS100", "CWS101", "CWS135", "CWS137", "CWS140", \
"CWS143", "CWS148", "EWS001", "EWS002", "EWS003", "EWS004", "EWS005", "EWS006", "EWS007", \
"EWS008", "EWS010", "EWS011", "EWS012", "EWS014", "EWS015", "EWS016", "EWS017", \
"EWS018", "EWS086", "EWS020", "EWS021", "EWS087", "EWS023", "EWS024", "EWS050", \
"EWS053", "EWS084", "EWS085", "WWS001", "WWS003", "WWS004", "WWS005", "WWS006", \
"WWS008", "WWS009", "WWS011", "WWS012", "WWS013", "WWS016", "WWS019", "WWS020", \
"WWS021", "WWS022", "WWS023", "WWS061", "WWS062", "WWS063", "WWS088", "WWS089"]

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
table = dynamodb.Table('pubc5wl-ddb')

iot_client = boto3.client('iot-data', region_name='ap-southeast-1')

hostname = "localhost"
port = 22
myuser = "user"
mypass = "tst"
#remote_dir = "/home/ubuntu/SFTP\ Folders/Shared\ Folder/Blugraph/"
remote_dir = "SFTP Folders/Shared Folder/Blugraph"

def lambda_handler(event, context):

    try:
        t = paramiko.Transport(hostname, port)
        #print(t)
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

    tm = time.strftime('%Y-%m-%d_%H-%M-%S')
    dest = tm + ".xml"
    file=sftp.file(dest, "w", -1)
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
        wa = wa/100
        ts = int(ts_millis / 1000)
        #dt1 = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d')
        #hm1 = datetime.datetime.fromtimestamp(ts).strftime('%H:%M:%S')
        dt1 = datetime.fromtimestamp(ts+28800).strftime('%Y-%m-%d')
        hm1 = datetime.fromtimestamp(ts+28800).strftime('%H:%M:%S')
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
        loc = jsonState["state"]["reported"]["location"]
        cope = jsonState["state"]["reported"]["cope_level"]
        invert = jsonState["state"]["reported"]["invert_level"]
        #print(loc)
        get_sid_url = "http://13.228.68.232/coords.php?sid=" + sid
        lat_lon_j = urllib2.urlopen(get_sid_url).read()
        lat_lon = json.loads(lat_lon_j)
        lat = lat_lon['lat']
        lon = lat_lon['lon']
        #lat_str = float("{0:.7f}".format(lat))
        #lon_str = float("{0:.7f}".format(lon))
        lat_str = "{0:.7f}".format(lat)
        lon_str = "{0:.7f}".format(lon)
        #print(loc2)
        #      file.write("   "+"<?xml version=\"1.0\" ?>"+'\n'+"<TimeSeries>"'\n')
        #               + "<x>" + "31810.18</x>" \
        #               + "<y>" + "41013.21" + "</y>" \
        xml_to_write = "<series>" \
                       + "<header>" \
                       + "<type>instantaneous</type>" \
                       + "<locationId>" + str(sid) + "</locationId>" \
                       + "<parameterId>" + "WaterLevel" + "</parameterId>" \
                       + "<timeStep unit=""nonequidistant""/>" \
                       + "<startDate date=" + "\"" + dt1 + "\"" + " time=" + "\"" + hm1 + "\"" + " />" \
                       + "<endDate date=" + "\"" + dt1 + "\""  + " time=" + "\"" + hm1 + "\"" + " />" \
                       + "<missVal>" + "-999.9" + "</missVal>" \
                       + "<x>" + lat_str + "</x>" \
                       + "<y>" + lon_str + "</y>" \
                       + "<fileDescription>cope_level=" + str(cope) \
                       + " invert_level=" + str(invert) \
                       + "</fileDescription>" \
                       + "</header>" \
                       + "<event date=" + "\""  + dt1 + "\"" + " time=" + "\"" + hm1 + "\"" + " value=" + str(wa) + " />" \
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

    return "File uploaded."

