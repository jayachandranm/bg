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
table = dynamodb.Table('pubc5wl-ddb')

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
def create_series(data):
    """
    Create a time series XML element for single div
    """
    dt = data["dt"]
    tm = data["tm"]
    wa = data["wa"]
    mrl = data["mrl"]
    series = objectify.Element("series")
    header = objectify.SubElement(series, "header")
    header.type = "instantaneous" #data["type"]
    header.locationId = data["locationId"]
    header.parameterId = "WaterLevel"
    header.timeStep = objectify.Element("timeStep", unit="nonequidistant")
    header.startDate = objectify.Element("startDate", date=dt, time=tm, tz="Asia/Singapore")
    header.endDate = objectify.Element("endDate", date=dt, time=tm, tz="Asia/Singapore")
    header.missVal = -999.9
    header.x = data["x"]
    header.y = data["y"]
    header.fileDescription = data["fileDescription"]
    event = objectify.SubElement(series, "event", date=dt, time=tm, tz="Asia/Singapore", value=mrl)
    return series
 
#----------------------------------------------------------------------


def lambda_handler(event, context):
    #
    ssh_host = os.environ.get('SSH_HOST', config_host)
    ssh_username = os.environ.get('SSH_USERNAME', config_user)
    ssh_password = os.environ.get('SSH_PASSWORD', config_pass)
    ssh_dir = os.environ.get('SSH_DIR', config_dir)
    ssh_port = int(os.environ.get('SSH_PORT', config_port))
    #key_filename = os.environ.get('SSH_KEY_FILENAME', 'key.pem')
    
    content_object = s3dev_state.Object(config_bucket, config_folder + '/' + config_file)
    file_content = content_object.get()["Body"].read().decode('utf-8')
    dev_state_s3 = json.loads(file_content)
    dev_state_by_sids = dev_state_s3["dev_state"]
    stations = dev_state_by_sids.keys()
    stations.sort()
    print(stations)
 
    #xml = '''<?xml version="1.0" ?>
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
        try:
            if 'md' in data_row0:
                #print("There is md here")
                md = data_row0['md']
                #print(md)
                # TODO:
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
        offset_o = jsonState["state"]["reported"]["offset_o"]
        #print(loc)
        dev_state_sid = dev_state_s3["dev_state"][sid]
        lat = dev_state_sid["latitude"]
        lon = dev_state_sid["longitude"]
        #lat_str = float("{0:.7f}".format(lat))
        #lon_str = float("{0:.7f}".format(lon))
        lat_str = "{0:.7f}".format(lat)
        lon_str = "{0:.7f}".format(lon)
        # Calibrate near zero.
        if wa <= ( 0.08 + (offset_o / 100) ):
            wa = offset_o / 100
        mrl_val = decimal.Decimal(invert) + decimal.Decimal(wa)
        mrl_str = "{0:.3f}".format(mrl_val)
        cope_str = "{0:.3f}".format(cope)
        invert_str = "{0:.3f}".format(invert)
        op_level = invert + (offset_o / 100)
        op_str = "{0:.3f}".format(op_level)

        desc = "cope_level=\"" + cope_str + "\" invert_level=\"" + invert_str + "\" operation_level=\"" + op_str + "\""

        appt = create_series({
                        "locationId": sid,
                        "dt": dt1,
                        "tm": hm1,
                        "x": lat_str,
                        "y": lon_str,
                        "fileDescription": desc,
                        "wa": wa,
                        "mrl": mrl_str
                        })

        root.append(appt)

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
        trans.connect(username=ssh_username, password=ssh_password)
        print("Connected")
    except:
        print("Connect Error.")
    try:
        sftp = paramiko.SFTPClient.from_transport(trans)
        print(sftp)
    except paramiko.SSHException:
        print("Connection Error")

    try:
        sftp.chdir(ssh_dir)
        print("Changed remote to: " + ssh_dir)
    except:
        print("chdir failure") 

    tm = time.strftime('%Y-%m-%d_%H-%M-%S')
    dest = tm + ".xml"
    xmlfile = sftp.file(dest, "w", -1)
    #file.write("<?xml version=\"1.0\" ?>" + "<TimeSeries>")

    try:
        xmlfile.write(obj_xml)  
        xmlfile.flush()
    except:
        print("File write error.")
    #    sftp.put(source, dest)

    return "File uploaded."

