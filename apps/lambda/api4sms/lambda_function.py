from __future__ import print_function

import boto3
import json
#import simplejson

import decimal
from boto3.dynamodb.conditions import Key, Attr

from datetime import datetime
import time
#from dateutil import tz
#from pytz import timezone

import os
from StringIO import StringIO

import urllib2

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

print('Loading function')

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
table = dynamodb.Table('pubc5wl-ddb')

iot_client = boto3.client('iot-data', region_name='ap-southeast-1')

def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))
    #try:
    #    sid
    #except NameError:
    #    return {}
    # TODO: Work around. Fix this with validator in API.
    if 'sid' not in event:
        return {}
    sid = event['sid']
    if not sid:
        return {}
    #var name = (event.name === undefined ? 'No-Name' : event.name);
    #return "Hello There"  # Echo back the first key value
    #raise Exception('Something went wrong')
    
    #data_series = []

    print(sid)
    response = table.query(
        Limit=1,
        ScanIndexForward=False,
        KeyConditionExpression=Key('sid').eq(sid)
    )
    data_row0 = response["Items"][0]
    wa = 0.0
    ts_millis = 0.0
    ts = 0
    #
    try:
        wa = (data_row0['wa'])
    except:
        print("No data")
    #
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
        #print(sid)
        al = (data_row0['al'])
        #print(al)
    except:
        print("No SID")

    if al > 2:
        al = 2
    flag = al
    
    try:
        if 'md' in (data_row0):
            print("There is md here")
            md = data_row0['md']
            print(md)
            if md == "maintenance":
                flag = 3
            #if md == "spike":
            #    flag = 3
        else:
            print("There is no md here")
        print(flag)
    except:
        print("No time")
        
    # if no data for more than 30mts, set to maintenance
    if time_lag > 1800:
        flag = 3

    response = iot_client.get_thing_shadow(
        thingName=str(sid)
    )
    #print(response)
    #print (json.loads(response["payload"].read())["state"]["reported"]["location"])
    streamingBody = response["payload"]
    jsonState = json.loads(streamingBody.read())
    loc = (jsonState["state"]["reported"]["location"])
    print(loc)
    #
    get_sid_url = "http://13.228.68.232/stationname.php?stationid=" + sid
    loc2 = urllib2.urlopen(get_sid_url).read()
    loc2 = loc2.strip()
    print(loc2)
    #
    series = {}
    series["waterlevel"] = str(wa)
    series["flag"] = str(flag)
    series["observation_time"] = dt1 + " " + hm1
    series["station_id"] = sid
    series["desc"] = loc2

    print (json.dumps(series))
    #data_series.append(series)
    return series


