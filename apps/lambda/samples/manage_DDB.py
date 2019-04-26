from __future__ import print_function

import os
from StringIO import StringIO
import boto3

import json
import decimal
from boto3.dynamodb.conditions import Key, Attr

#import urllib2

from datetime import datetime
import time
import pytz

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
table = dynamodb.Table('pubc3fl-ddb')

iot_client = boto3.client('iot-data', region_name='ap-southeast-1')
s3dev_state = boto3.resource('s3')

with open("config.json") as config_json_file:
    try:
        config = json.load(config_json_file)
    except:
        print("Error loading config JSON file.")

def lambda_handler(event, context):

    content_object = s3dev_state.Object(config_bucket, config_folder + '/' + config_file)
    file_content = content_object.get()["Body"].read().decode('utf-8')
    dev_state_s3 = json.loads(file_content)
    dev_state_by_sids = dev_state_s3["dev_state"]
    stations = dev_state_by_sids.keys()
    stations.sort()
    print(stations)

    sid = "TST"

    # Read all stations from the table.
    for sid in stations:
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
            # If no records found, skip this sid and continue.
            print("DB access error.")
            #continue
        # Get Shadow.
        response = iot_client.get_thing_shadow(
            thingName=str(sid)
        )
        streamingBody = response["payload"]
        jsonState = json.loads(streamingBody.read())
        loc = jsonState["state"]["reported"]["location"]
        cope = jsonState["state"]["reported"]["cope_level"]
        invert = jsonState["state"]["reported"]["invert_level"]
        offset = jsonState["state"]["reported"]["offset"]
        dev_state_sid = dev_state_s3["dev_state"][sid]
        #print(dev_state_sid)
        lat = dev_state_sid["latitude"]
        lon = dev_state_sid["longitude"]
        lat_str = "{0:.7f}".format(lat)
        lon_str = "{0:.7f}".format(lon)


    # Write entries to table
    start_time = 1556247840
    end_time = 1556247840
    ts_val = start_time
    while (ts < end_time):
        jitter = random.randrange(0, 250, 1)
        ts_val = ts_val + 60000 + jitter
        #wa_val = 101.031
        #ts_r=2019-04-26 11:28:00
        utc_dt = datetime.fromtimestamp(ts_val)
        utc_dt = utc_dt.replace(tzinfo=pytz.UTC)
        sg_tz = pytz.timezone('Asia/Singapore')
        sg_time = utc_dt.astimezone(sg_tz)
        dt1 = sg_time.strftime('%Y-%m-%d')
        hm1 = sg_time.strftime('%H:%M:%S')
        #
        ts_r_val =  dt1 + " " + hm1
        #
        sid_val = "WHMC306"
        bd_val = 10.7
        bl_val = 10.7
        err_val = 0
        fl_val = 0
        snr_val = 50 + random.randrange(0, 9, 1) / 10
        ss_val = 20 + random.randrange(0, 8, 1)
        ty_val = 2
        vl_val = 0
        #md_val = 1
        wh_val = 0
        wp_val = 0
        wt_val = 26 + random.randrange(70, 75, 1) / 100

        flow_item = {
            "sid": sid_val,
            "ts": ts_val,
            "ts_r":ts_r_val,
            "bd": bd_val,
            "bl": bl_val,
            "ty": ty_val,
            "ss": ss_val,
            "err": err_val,
            "wt": wt_val,
            "wp": wp_val,
            "wh": wh_val,
            "fl": fl_val,
            "snr": snr_val,
            "vl": vl_val
        }
        #    "md": md_val,
        #
        try:
            response = table.put_item(
                Item = flow_item
            )
        except:
            print("PutItem succeeded:")
            #print(json.dumps(response, indent=4, cls=DecimalEncoder))
        

