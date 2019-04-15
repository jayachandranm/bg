from __future__ import print_function

import boto3
import json

import decimal
from boto3.dynamodb.conditions import Key, Attr

from datetime import datetime
import time

import os
from StringIO import StringIO

#import simplejson
#from dateutil import tz
#from pytz import timezone


with open("config.json") as config_json_file:
    try:
        config = json.load(config_json_file)
    except:
        print("Error loading config JSON file.")

config_bucket = config['s3_bucket']
config_folder = config['s3_folder']
config_file = config['s3_file']

# Helper class to convert a DynamoDB item to JSON.
# Extends JSONEncoder
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)


s3dev_state = boto3.resource('s3')

content_object = s3dev_state.Object(config_bucket, config_folder + '/' + config_file)
file_content = content_object.get()["Body"].read().decode('utf-8')
dev_state_s3 = json.loads(file_content)
dev_state_by_sids = dev_state_s3["dev_state"]

stations = dev_state_by_sids.keys()
stations.sort()
print(stations)

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
table = dynamodb.Table('pubc5wl-ddb')

iot_client = boto3.client('iot-data', region_name='ap-southeast-1')

def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))
    #raise Exception('Something went wrong')
    
    data_series = []

    for x in stations:
        print("<-------------------->")
        print(x)
        response = table.query(
            Limit=1,
            ScanIndexForward=False,
            KeyConditionExpression=Key('sid').eq(x)
        )
        data_row0 = response["Items"][0]
        wa = 0.0
        ts_millis = 0.0
        ts = 0
        # assume in maintenance, by default.
        flag = 3
        try:
            wa = (data_row0['wa'])
        except:
            print("No data")
        try:
            ts_millis = data_row0['ts']
        except:
            print("No time")
            
        wa = wa/100
        ts = int(ts_millis / 1000)

        curr_t = int(time.time())
        time_lag = curr_t - ts
        
        #ts_UTC = datetime.fromtimestamp(ts).replace(tzinfo=timezone('UTC'))
        dt1 = datetime.fromtimestamp(ts+28800).strftime('%Y-%m-%d')
        hm1 = datetime.fromtimestamp(ts+28800).strftime('%H:%M:%S')
        #ts_SG = ts_UTC.astimezone(timezone('Asia/Singapore'))
        #dt1 = ts_SG.strftime('%Y-%m-%d')
        #hm1 = ts_SG.strftime('%H:%M:%S')
        
        #from_zone = tz.gettz('UTC')
        #to_zone = tz.gettz('Singapore')
        #print(dt1, hm1)
        
        try:
            sid = (data_row0['sid'])
            al = (data_row0['al'])
        except:
            print("No SID")

        if al < 2:
            flag = 0
        else:
            flag = al - 1       

        try:
            if 'md' in (data_row0):
                #print("There is md here")
                md = data_row0['md']
                print(md)
                if md == "maintenance":
                    flag = 3
                #if md == "spike":
                #    flag = 3
            #else:
                #print("There is no md here")
            #print(flag)
        except:
            print("Error in reading md.")

        # if no data for more than 30mts, set to maintenance
        if time_lag > 1800:
            flag = 3

        response = iot_client.get_thing_shadow(
            thingName=str(sid)
        )
        streamingBody = response["payload"]
        jsonState = json.loads(streamingBody.read())
        loc = (jsonState["state"]["reported"]["location"])
        offset_o = (jsonState["state"]["reported"]["offset_o"])
        #
        dev_state_sid = dev_state_s3["dev_state"][sid]
        alias = dev_state_sid["alias"]
        st_name = alias
        if station_name_flag == 'SID':
            st_name = sid
        #       
        #print(loc)
        # Calibration near zero
        if wa <= ( 0.08 + (offset_o / 100) ):
            wa = offset_o / 100
        #
        series = {}
        series["waterlevel"] = str(wa)
        series["flag"] = str(flag)
        series["observation_time"] = dt1 + " " + hm1
        series["station_id"] = st_name
        series["desc"] = loc

        print (json.dumps(series))
        data_series.append(series)
    return data_series


