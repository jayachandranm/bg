from __future__ import print_function

import os
from StringIO import StringIO
import boto3
import paramiko
import sys, paramiko

import json
import decimal
from boto3.dynamodb.conditions import Key, Attr

#import urllib2

from datetime import datetime
import time
import pytz

from lxml import etree, objectify

#with open("station-ids.json") as json_file:
#    try:
#        json_data = json.load(json_file)
#    except:
#        print("Error loading JSON file.")

#stations = json_data['stations'] 

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
table = dynamodb.Table('pubc3fl-ddb')

iot_client = boto3.client('iot-data', region_name='ap-southeast-1')
s3dev_state = boto3.resource('s3')

with open("config.json") as config_json_file:
    try:
        config = json.load(config_json_file)
    except:
        print("Error loading config JSON file.")

config_host = config['host']
config_port = config['port']
config_user = config['user']
config_pass = config['pass']
config_dir = config['remote_dir']
config_bucket = config['s3_bucket']
config_folder = config['s3_folder']
config_file = config['s3_file']

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
    header.x = gps_x
    header.y = gps_y
    header.units = "mRL"
    #if stype == "level":
    #    header.units = "mRL"
    #elif stype == "depth":
    if stype == "depth":
        header.units = "m"
    header.fileDescription = desc
    event = objectify.SubElement(series, "event", date=dt, time=tm, value=val, flag=str(md))
    return series
 
#----------------------------------------------------------------------


def lambda_handler(event, context):
    #
    ssh_host = os.environ.get('SSH_HOST', config_host)
    ssh_username = os.environ.get('SSH_USERNAME', config_user)
    ssh_password = os.environ.get('SSH_PASSWORD', config_pass)
    #ssh_dir = os.environ.get('SSH_DIR', config_dir)
    ssh_dir = os.environ.get('SSH_DIR')
    ssh_port = int(os.environ.get('SSH_PORT', config_port))
    #key_filename = os.environ.get('SSH_KEY_FILENAME', 'key.pem')
    
    content_object = s3dev_state.Object(config_bucket, config_folder + '/' + config_file)
    file_content = content_object.get()["Body"].read().decode('utf-8')
    dev_state_s3 = json.loads(file_content)
    dev_state_by_sids = dev_state_s3["dev_state"]
    stations = dev_state_by_sids.keys()
    stations.sort()
    print(stations)
 
    xml = '''<?xml version="1.0" encoding="UTF-8"?>
    <TimeSeries>
    </TimeSeries>
    '''
    root = objectify.fromstring(xml)

    for sid in stations:
        #print("<-------------------->")
        print(sid)
        try:
            response = table.query(
                Limit=1,
                ScanIndexForward=False,
                KeyConditionExpression=Key('sid').eq(sid)
            )
        except:
            print("DB access error.")
        #
        try:
            data_row0 = response["Items"][0]
        except:
            continue

        #print(data_row0)
        wh = 0.0
        ts_millis = 0.0
        ts = 0
        #
        try:
            ts_millis = data_row0['ts']
        except:
            print("No ts from DDB")
        #
        try:
            wh = data_row0['wh']
        except:
            print("No wh from DDB")
        #
        #wa = wa/100
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
        flag = 0
        #
        md = "normal"
        try:
            if 'md' in data_row0:
                #print("There is md here")
                md = data_row0['md']
                #print(md)
                # TODO:
                if md == "maintenance":
                    #flag = 3
                    flag = 1
            #else:
            #    print("There is no md here")
            #
        except:
            print("Exception in handling md.")

        # if no data for more than 30mts, set to maintenance
        if time_lag > 1800:
            #flag = 3
            flag = 1

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
        #offset_o = jsonState["state"]["reported"]["offset_o"]
        offset = jsonState["state"]["reported"]["offset"]
        #print(loc)
        dev_state_sid = dev_state_s3["dev_state"][sid]
        #print(dev_state_sid)
        lat = dev_state_sid["latitude"]
        lon = dev_state_sid["longitude"]
        #lat_str = float("{0:.7f}".format(lat))
        #lon_str = float("{0:.7f}".format(lon))
        lat_str = "{0:.7f}".format(lat)
        lon_str = "{0:.7f}".format(lon)
        # Calibrate near zero.
        #if wa <= ( 0.08 + (offset_o / 100) ):
        #    wa = offset_o / 100
        mrl_val = decimal.Decimal(invert) + decimal.Decimal(wh)
        mrl_str = "{0:.3f}".format(mrl_val)
        #cope_str = "{0:.3f}".format(cope)
        #invert_str = "{0:.3f}".format(invert)
        #op_level = invert + (offset_o / 100)
        #op_level = invert + offset
        #op_str = "{0:.3f}".format(op_level)

        #desc = "cope_level=\"" + cope_str + "\" invert_level=\"" + invert_str + "\" operation_level=\"" + op_str + "\""

        appt1 = create_series({
                        "locationId": sid,
                        "dt": dt1,
                        "tm": hm1,
                        "x": lat_str,
                        "y": lon_str,
                        "fileDescription": "",
                        "wa": wh,
                        "val": mrl_str,
                        "md": flag
                        }, "level")

        root.append(appt1)

    # remove lxml annotation
    objectify.deannotate(root)
    etree.cleanup_namespaces(root)

    # create the xml string
    obj_xml = etree.tostring(root,
                             pretty_print=True,
                             xml_declaration=True)
    print(obj_xml)

    try:
        trans = paramiko.Transport(ssh_host, ssh_port)
        #print(t)
        trans.connect(username=ssh_username, password=ssh_password)
        print("Connected")
    except:
        print("SFTP connect Error.")
    try:
        sftp = paramiko.SFTPClient.from_transport(trans)
        print("SFTP client created.")
    except paramiko.SSHException:
        print("SFTP client creation error.")

    try:
        sftp.chdir(ssh_dir)
        print("Changed remote to: " + ssh_dir)
    except:
        print("chdir failure.") 

    utc_time = datetime.utcnow()
    utc_time = utc_time.replace(tzinfo=pytz.UTC)
    sg_tz = pytz.timezone('Asia/Singapore')
    sg_time = utc_time.astimezone(sg_tz)
    tm = sg_time.strftime('%Y-%m-%d_%H-%M-%S')
    dest = "RL-" + tm + ".xml"
    xmlfile = sftp.file(dest, "w", -1)
    #file.write("<?xml version=\"1.0\" ?>" + "<TimeSeries>")

    try:
        xmlfile.write(obj_xml)  
        xmlfile.flush()
    except:
        print("File write error.")
    #    sftp.put(source, dest)

    return "File uploaded."

