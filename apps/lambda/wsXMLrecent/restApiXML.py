from __future__ import print_function

import boto3
import json

import datetime

import decimal
from boto3.dynamodb.conditions import Key, Attr

import os
from StringIO import StringIO

# Helper class to convert a DynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

print('Loading function')

stations = ["CWS001", "CWS002", "CWS003", "CWS007", "CWS012", "CWS014", "CWS015"]

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
table = dynamodb.Table('pubc5wl-ddb')

iot_client = boto3.client('iot-data', region_name='ap-southeast-1')

def lambda_handler(event, context):
    #print("Received event: " + json.dumps(event, indent=2))
    #return "Hello There"  # Echo back the first key value
    #raise Exception('Something went wrong')
    
    xml_all_sids = "   " + "<?xml version=\"1.0\" ?>" + '\n' + "<TimeSeries>"'\n'
    for x in stations:
        print("<-------------------->")
        print(x)
        response = table.query(
            Limit=1,
            ScanIndexForward=False,
            KeyConditionExpression=Key('sid').eq(x)
        )
        data_row0 = response["Items"][0]
        print(data_row0)
        print(data_row0['ts_r'])
        wa = 0.0
        ts_millis = 0.0
        ts = 0
        try:
            wa = (data_row0['wa'])
            print(wa)
        except:
            print("No data")
        try:
            ts_millis = data_row0['ts']
            print(ts_millis)
        except:
            print("No time")
            
        ts = int(ts_millis / 1000)
        print(ts)
        dt = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d')
        dt1 = dt
        hm = datetime.datetime.fromtimestamp(ts).strftime('%H:%M:%S')
        hm1 = hm
        print(dt1, hm1)
        
        try:
            sid = (data_row0['sid'])
            print(sid)
            al = (data_row0['al'])
            print(al)
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
        print(response)
        #print (json.loads(response["payload"].read())["state"]["reported"]["location"])
        streamingBody = response["payload"]
        jsonState = json.loads(streamingBody.read())
        loc = (jsonState["state"]["reported"]["location"])
        print(loc)
        print(wa)
        print(str(wa))
        #      file.write("   "+"<?xml version=\"1.0\" ?>"+'\n'+"<TimeSeries>"'\n')
        xml_all_sids = xml_all_sids \
                        + "<series>" + '\n' + "<header>" + '\n' + "<type>instantaneous</type>" + '\n' \
                        + "<locationId>" + str(sid) + "</locationId>" + '\n' \
                        + "<parameterId>" + str(wa) + "</parameterId>" + '\n' \
                        + "<timeStep unit=""nonequidistant""/>" \
                        + '\n' + "<startDate date=" + dt + " time=" + hm  + " />" + '\n' \
                        + "<endDate date=" + dt1 + " time=" + hm1 + " />" + '\n' \
                        + "<missVal>" + "-999.9" + "</missVal>" + '\n' \
                        + "<x>" + "31810.18</x>" + '\n' \
                        + "<y>" + "41013.21" + "</y>" + '\n' \
                        + "<fileDescription>cope_level=" + "108.23" \
                        + " invert_level=""105.73" + '\n' \
                        + "</fileDescription>" + '\n' \
                        + "</header>" + '\n' \
                        + "<event date=" + "2011-01-13" + " time=" + "14:51:01" + " value=" + "105.76" + " />" + '\n' \
                        + "</series>" + '\n'

        xml_all_sids = xml_all_sids \
                        + "</series>" + '\n' + "</TimeSeries>" + "<waterlevel>" + str(wa) + "</waterlevel>" + '\n'
    
    return xml_all_sids


