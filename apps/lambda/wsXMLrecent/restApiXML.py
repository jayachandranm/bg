from __future__ import print_function

import boto3
import json
#import simplejson

import decimal
from boto3.dynamodb.conditions import Key, Attr

from datetime import datetime
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

def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))
    #return "Hello There"  # Echo back the first key value
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
                if md == "spike":
                    flag = 3
            else:
                print("There is no md here")
            print(flag)
        except:
            print("No time")

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
        data_series.append(series)
    return data_series


