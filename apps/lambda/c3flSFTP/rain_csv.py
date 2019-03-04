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

#import datetime
from datetime import datetime
import time
import pytz

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

def lambda_handler(event, context):
    #
    ssh_host = os.environ.get('SSH_HOST', config_host)
    ssh_username = os.environ.get('SSH_USERNAME', config_user)
    ssh_password = os.environ.get('SSH_PASSWORD', config_pass)
    ssh_dir = os.environ.get('SSH_DIR', config_dir)
    #ssh_dir = os.environ.get('SSH_DIR')
    ssh_port = int(os.environ.get('SSH_PORT', config_port))
    #key_filename = os.environ.get('SSH_KEY_FILENAME', 'key.pem')
    
    content_object = s3dev_state.Object(config_bucket, config_folder + '/' + config_file)
    file_content = content_object.get()["Body"].read().decode('utf-8')
    dev_state_s3 = json.loads(file_content)
    dev_state_by_sids = dev_state_s3["dev_state"]
    stations = dev_state_by_sids.keys()
    stations.sort()
    print(stations)

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

    #curr_t = int(time.time())
    #tm = time.strftime('%Y-%m-%d_%H-%M-%S')
    #tm = datetime.fromtimestamp(curr_t+28800).strftime('%Y-%m-%d_%H-%M-%S')
    utc_time = datetime.utcnow()
    utc_time = utc_time.replace(tzinfo=pytz.UTC)
    sg_tz = pytz.timezone('Asia/Singapore')
    sg_time = utc_time.astimezone(sg_tz)
    tm = sg_time.strftime('%Y-%m-%d_%H-%M-%S')
    dest = tm + ".csv"
    print(dest)
    csvfile = sftp.file(dest, "w", -1)

    # Write header
    csv_to_write = "StationID," \
                    + "Time," \
                    + "Rainfall (mm)," \
                    + "Status\n"
    print(csv_to_write)
    
    try:
        csvfile.write(csv_to_write)  
        #file.flush()
    except:
        print("File write error for title.")

    #
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
        try:
            data_row0 = response["Items"][0]
        except:
            continue
        #print(data_row0)
        ra = 0.0
        ts_millis = 0.0
        ts = 0
        try:
            ra = data_row0['ra']
        except:
            print("No ra in DDB")
        #
        try:
            ts_millis = data_row0['ts']
        except:
            print("No ts in DDB")
        #
        #wa = wa/100
        ts = int(ts_millis / 1000)
        #dt1 = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d')
        #hm1 = datetime.datetime.fromtimestamp(ts).strftime('%H:%M:%S')
        #dt1 = datetime.fromtimestamp(ts+28800).strftime('%Y-%m-%d')
        #hm1 = datetime.fromtimestamp(ts+28800).strftime('%H:%M:%S')
        #dt_hm1 = datetime.fromtimestamp(ts+28800).strftime('%Y-%m-%d %H:%M:%S')
        utc_dt = datetime.fromtimestamp(ts)
        utc_dt = utc_dt.replace(tzinfo=pytz.UTC)
        sg_time = utc_dt.astimezone(sg_tz)
        dt1 = sg_time.strftime('%Y-%m-%d')
        hm1 = sg_time.strftime('%H:%M:%S')
        dt_hm1 = sg_time.strftime('%Y-%m-%dT%H:%M:%S')
        #
        #
        md_f = 0
        try:
            if 'md' in data_row0:
                #print("There is md here")
                md = data_row0['md']
                #print(md)
                if md == "maintenance":
                    md_f = 1
            #else:
            #    print("There is no md here")
            #
        except:
            print("Exception in handling md.")

        #print(flag)
        #
        response = iot_client.get_thing_shadow(
            thingName=str(sid)
        )
        streamingBody = response["payload"]
        jsonState = json.loads(streamingBody.read())
        invert = jsonState["state"]["reported"]["invert_level"]
        #offset_o = jsonState["state"]["reported"]["offset_o"]
        offset = jsonState["state"]["reported"]["offset"]
        #
        #if wa <= ( 0.08 + (offset_o / 100) ):
        #    wa = offset_o / 100
        #mrl_val = decimal.Decimal(invert) + decimal.Decimal(wa)
        #mrl_str = "{0:.3f}".format(mrl_val)

        # TODO:
        rf_str = "{0:.3f}".format(ra)

        csv_to_write = str(sid) + "," \
                       + dt_hm1 + "," \
                       + rf_str + "," \
                       + str(md_f) + "\n"
        print(csv_to_write)
        try:
            csvfile.write(csv_to_write)  
            #file.flush()
        except:
            print("File write error.")
    #      print ("Print completed")
    #    sftp.put(source, dest)
    #      print ("Transfer completed")
    try:
        csvfile.flush()
    except:
        print("File write error.")

    return "File uploaded."

