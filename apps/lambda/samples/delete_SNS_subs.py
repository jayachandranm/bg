from __future__ import print_function

import boto3
import json

import os
import io

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

content_object = s3dev_state.Object(config_bucket, config_folder + '/' + config_file)
file_content = content_object.get()["Body"].read().decode('utf-8')
dev_state_s3 = json.loads(file_content)
dev_state_by_sids = dev_state_s3["dev_state"]

stations = dev_state_by_sids.keys()
#stations.sort()
print(stations)

sns_client = boto3.client('sns')
iot_client = boto3.client('iot-data', region_name='ap-southeast-1')

def lambda_handler(event, context):
    global stations
    print("Received event: " + json.dumps(event, indent=2))
    #raise Exception('Something went wrong')
    #stations = ['TST001', 'TST002']
    levels = [50, 60, 75, 90, 100]
    stations = os.environ.get('STATIONS', stations)
    levels = os.environ.get('RISE_LVLS', levels)
    
    data_series = []
    
    sns_acc_arn = 'arn:aws:sns:ap-southeast-1:433339126986'

    for x in stations:
        #print("<-------------------->")
        #print(x)
        
        topic_arn = sns_acc_arn + ':' + x + '-100'
        print(topic_arn)
        
        next_token = "tst"

        response = sns_client.list_subscriptions_by_topic(
            TopicArn=topic_arn, 
            #NextToken=next_token
            )
        subs_list = response['Subscriptions']
        for sub in subs_list:
            ph_num = sub['Endpoint']
            subs_arn = sub['SubscriptionArn']
            #print(ph_num);
            #item = {"stationID": x, "phoneNo" : ph_num}
            #data_series.append(x + "," + ph_num)
            if '6598761333' in ph_num:
                data_series.append(subs_arn)
    #print(data_series)
    
    for subs_arn in data_series:
        print(subs_arn)
        response = sns_client.unsubscribe(
            SubscriptionArn=subs_arn
            )
    