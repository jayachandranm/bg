import datetime
import time
import pytz

import os
import boto3
import pandas as pd
import sys

if sys.version_info[0] < 3: 
    from StringIO import StringIO # Python 2.x
else:
    from io import StringIO # Python 3.x

def lambda_handler(event, context):
    myDate = "2014-08-01 04:41:52,117"
    #timestamp = datetime.datetime.strptime(myDate, "%Y-%m-%d %H:%M:%S,%f").timestamp()
    
    #timezone_sg = pytz.timezone('Asia/Singapore')
    timezone_utc = pytz.timezone('UTC')
    date_time_obj = datetime.datetime.strptime(myDate, '%Y-%m-%d %H:%M:%S,%f')
    #sg_datetime_obj = date_time_obj.replace(tzinfo=timezone_sg)
    #timezone_date_time_obj = timezone.localize(date_time_obj)
    #sg_datetime_obj = date_time_obj.astimezone(timezone_sg)
    sg_datetime_obj = pytz.timezone('Asia/Singapore').localize(date_time_obj)
    utc_datetime_obj = sg_datetime_obj.astimezone(timezone_utc)
    timestamp=time.mktime(utc_datetime_obj.timetuple())
    zero_utc = datetime.datetime(1970, 1, 1, tzinfo=pytz.utc)
    ts = (sg_datetime_obj - zero_utc).total_seconds()
    
    print(utc_datetime_obj.isoformat())  
    print(sg_datetime_obj.isoformat())
    
    print(ts)
    print(timestamp)

    client = boto3.client('s3')
    
    bucket_name = 'pubc3fl-blugraph-services'
    
    object_key = 'iot_data/flow_mnt_flag_june2019.csv'
    csv_obj = client.get_object(Bucket=bucket_name, Key=object_key)
    body = csv_obj['Body']
    csv_string = body.read().decode('utf-8')
    
    df = pd.read_csv(StringIO(csv_string))
    
    print(df.to_string())
    
    with pd.option_context('display.max_rows', None, 'display.max_columns', None):  
        print(df)
