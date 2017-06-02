from __future__ import print_function # Python 2/3 compatibility
import boto3
import json
import decimal
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')

table = dynamodb.Table('pubc5wl-ddb')

response = table.query(
     ProjectionExpression='#ts, wa, md',
     ExpressionAttributeNames={ '#ts': 'ts' },  
     ExpressionAttributeValues={ 
         ':v1': { 'S': 'WL1002' }
     },  
     Limit=1,
     ScanIndexForward=False,
     KeyConditionExpression=Key('sid').eq('WL1002')
)
     #KeyConditionExpression=Key('sid').eq("WL1002") & Key('ts').between('A', 'L')

for i in response['Items']:
        print(i['ts'], ":", i['sid'])

# optional
while 'LastEvaluatedKey' in response:
    response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
    data.extend(response['Items'])

client = boto3.client('iot-data')
client = boto3.client('iot-data', region_name='ap-southeast-1')

response = client.get_thing_shadow(
    thingName='string'
)
