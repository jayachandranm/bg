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

from datetime import datetime
import time
import pytz

from lxml import etree, objectify

with open("station-B-ids.json") as json_file:
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

#----------------------------------------------------------------------
def create_series(data, stype):
    """
    Create a time series XML element for single div
    """
    dt = data["dt"]
    tm = data["tm"]
    wa = data["wa"]
    val = data["val"]
    loc = data["locationId"]
    gps_x = data["x"]
    gps_y = data["y"]
    desc = data["fileDescription"]
    md = data["md"]
    series = objectify.Element("series")
    header = objectify.SubElement(series, "header")
    header.type = "instantaneous" #data["type"]
    header.locationId = loc
    header.parameterId = "Level"
    #if stype == "level":
    #    header.parameterId = "Level"
    #elif stype == "depth":
    if stype == "depth":
        header.parameterId = "Depth"
    #else:
        #TODO: undefined.
    header.timeStep = objectify.Element("timeStep", unit="nonequidistant")
    header.startDate = objectify.Element("startDate", date=dt, time=tm)
    header.endDate = objectify.Element("endDate", date=dt, time=tm)
    header.missVal = -999.9
    header.units = "mRL"
    #if stype == "level":
    #    header.units = "mRL"
    #elif stype == "depth":
    if stype == "depth":
        header.units = "m"
    header.x = gps_x
    header.y = gps_y
    header.fileDescription = desc
    event = objectify.SubElement(series, "event", date=dt, time=tm, value=val, flag=str(md))
    return series
 
#----------------------------------------------------------------------


def lambda_handler(event, context):

    try:
        trans = paramiko.Transport(hostname, port)
        #print(t)
        trans.connect(username=myuser, password=mypass)
        print("Connected")
    except:
        print("Connect Error.")
    try:
        sftp = paramiko.SFTPClient.from_transport(trans)
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
    #file.write("<?xml version=\"1.0\" ?>" + "<TimeSeries>")
 
    xml = '''<?xml version="1.0" encoding="UTF-8"?>
    <TimeSeries>
    </TimeSeries>
    '''
    root = objectify.fromstring(xml)

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
        curr_t = int(time.time())
        time_lag = curr_t - ts

        #dt1 = datetime.fromtimestamp(ts+28800).strftime('%Y-%m-%d')
        #hm1 = datetime.fromtimestamp(ts+28800).strftime('%H:%M:%S')
        utc_dt = datetime.fromtimestamp(ts)
        utc_dt = utc_dt.replace(tzinfo=pytz.UTC)
        sg_tz = pytz.timezone('Asia/Singapore')
        sg_time = utc_dt.astimezone(sg_tz)
        dt1 = sg_time.strftime('%Y-%m-%d')
        hm1 = sg_time.strftime('%H:%M:%S')
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
        md = "normal"
        try:
            if 'md' in data_row0:
                #print("There is md here")
                md = data_row0['md']
                #print(md)
                # TODO:
                if md == "maintenance":
                    flag = 3
            #else:
            #    print("There is no md here")
            #
        except:
            print("No time")

        # if no data for more than 30mts, set to maintenance
        if time_lag > 1800:
            flag = 3

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
        offset_o = jsonState["state"]["reported"]["offset_o"]
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
        # Calibrate near zero.
        if wa <= ( 0.08 + (offset_o / 100) ):
            wa = offset_o / 100
        mrl_val = decimal.Decimal(invert) + decimal.Decimal(wa)
        mrl_str = "{0:.2f}".format(mrl_val)
        op_level = invert + (offset_o / 100)
        #print(loc2)
        #      file.write("   "+"<?xml version=\"1.0\" ?>"+'\n'+"<TimeSeries>"'\n')
        #               + "<x>" + "31810.18</x>" \
        #               + "<y>" + "41013.21" + "</y>" \

        desc = "cope_level=\"" + str(cope) + "\" invert_level=\"" + str(invert) + "\" operation_level=\"" + str(op_level) + "\""

        appt1 = create_series({
                        "locationId": sid,
                        "dt": dt1,
                        "tm": hm1,
                        "x": lat_str,
                        "y": lon_str,
                        "fileDescription": desc,
                        "wa": wa,
                        "val": mrl_str,
                        "md": flag
                        }, "level")

        root.append(appt1)

        wa_str = "{0:.2f}".format(wa)
        appt2 = create_series({
                        "locationId": sid,
                        "dt": dt1,
                        "tm": hm1,
                        "x": lat_str,
                        "y": lon_str,
                        "fileDescription": desc,
                        "wa": wa,
                        "val": wa_str,
                        "md": flag
                        }, "depth")

        root.append(appt2)

    # remove lxml annotation
    objectify.deannotate(root)
    etree.cleanup_namespaces(root)

    # create the xml string
    obj_xml = etree.tostring(root,
                             pretty_print=True,
                             xml_declaration=True)
    print(obj_xml)

    try:
        file.write(obj_xml)  
        file.flush()
    except:
        print("File write error.")
    #    sftp.put(source, dest)

    return "File uploaded."

