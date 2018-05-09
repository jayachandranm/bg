from __future__ import print_function

import boto3
import json

#import os
#from StringIO import StringIO

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

s3dev_state = boto3.resource('s3')

print(config_bucket, config_folder + '/' + config_file)

content_object = s3dev_state.Object(config_bucket, config_folder + '/' + config_file)
file_content = content_object.get()["Body"].read().decode('utf-8')
dev_state_s3 = json.loads(file_content)
dev_state_by_sids = dev_state_s3["dev_state"]

stations = dev_state_by_sids.keys()
stations.sort()
print(stations)

stations = ['TST001', 'TST002']

sns_client = boto3.client('sns')

levels = [75, 90, 100]

iot_client = boto3.client('iot-data', region_name='ap-southeast-1')

def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))
    #raise Exception('Something went wrong')
    
    data_series = []

    for x in stations:
        print("<-------------------->")
        print(x)

        for y in levels:
            topic_name = x + "-" + str(y)

            print(topic_name)

            response = sns_client.create_topic( Name=topic_name )

