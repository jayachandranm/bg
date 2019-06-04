from __future__ import print_function

import os
import io
#from StringIO import StringIO
import boto3

import json
import decimal
from boto3.dynamodb.conditions import Key, Attr

from smart_open import open

#import urllib2

import datetime as dt
from datetime import datetime, timedelta
import time
import pytz

from dateutil.relativedelta import relativedelta

#try:
#    from StringIO import StringIO
#except ImportError:
#    from io import StringIO

with open("config_flow.json") as config_json_file:
    try:
        config = json.load(config_json_file)
    except:
        print("Error loading config JSON file.")

#config_host = config['host']
#config_port = config['port']
#config_user = config['user']
#config_pass = config['pass']
#config_dir = config['remote_dir']
config_ep = config['ep']
config_table = config['table']
config_bucket = config['s3_bucket']
config_folder = config['s3_folder']
config_folder_iot = config['s3_folder_iot']
config_dev_file = config['dev_file']

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
table = dynamodb.Table('pubc3fl-ddb')

iot_client = boto3.client('iot-data', region_name='ap-southeast-1')
s3dev_state = boto3.resource('s3')


fieldnames = ['Time', 'Depth', 'Level', 'Velocity', 'Flow Rate', 'Status']

def lambda_handler(event, context):
    #
    iot_ep = os.environ.get('IOT_EP', config_ep)
    #key_filename = os.environ.get('SSH_KEY_FILENAME', 'key.pem')
    
    content_object = s3dev_state.Object(config_bucket, config_folder_iot + '/' + config_dev_file)
    file_content = content_object.get()["Body"].read().decode('utf-8')
    dev_state_s3 = json.loads(file_content)
    dev_state_by_sids = dev_state_s3["dev_state"]
    stations = dev_state_by_sids.keys()
    #stations.sort()
    print(stations)

    #curr_t = int(time.time())
    #tm = time.strftime('%Y-%m-%d_%H-%M-%S')
    #tm = datetime.fromtimestamp(curr_t+28800).strftime('%Y-%m-%d_%H-%M-%S')
    utc_time = datetime.utcnow()
    utc_time = utc_time.replace(tzinfo=pytz.UTC)
    sg_tz = pytz.timezone('Asia/Singapore')
    sg_time = utc_time.astimezone(sg_tz)
    tm = sg_time.strftime('%Y-%m-%d_%H-%M-%S')
    mm = sg_time.strftime('%Y%m')
    #dest = "F-" + tm + ".csv"
    #csvfile=sftp.file(dest, "w", -1)
    #moment().utcOffset('+0800').startOf('month');
    start_time = dt.time(0,0)
    curr_month_day1 = datetime.today().replace(day=1) 
    curr_month_start = datetime.combine(curr_month_day1, start_time)
    #et = timestamp(curr_month_start)
    #
    #last_month_day1 = curr_month_day1 - timedelta(months=1)
    last_month_start = curr_month_start + relativedelta(months=-1)
    #last_month_start = curr_month_start - timedelta(months=1)
    st = decimal.Decimal(datetime.timestamp(last_month_start) * 1000)
    #
    last_month_end = curr_month_start - timedelta(days=1)
    et = decimal.Decimal(datetime.timestamp(last_month_end) * 1000)

    print(st, et)

    # Write header
    csv_to_write = "Time," \
                    + "Level (mRL)," \
                    + "Depth (m)," \
                    + "Velocity (m/s)," \
                    + "Flow (m3/s)," \
                    + "Status\n"
    #print(csv_to_write)

    f = io.StringIO()

    for sid in stations:
        #print("<-------------------->")
        print(sid)

        print(config_bucket, config_folder, mm)

        csvfilename = config_bucket + '/' + config_folder + '/' + mm + '/' + sid + '_' + mm + '.csv'
        print(csvfilename)
        #
        url = 's3://' + csvfilename
        #transport_params = {'session': boto3.Session(profile_name='smart_open')}
        #with open(url, 'wb', transport_params=transport_params) as fout:
        with open(url, 'wb') as fout:
        #with smart_open.smart_open('s3://' + csvfilename, 'wb') as fout:
            #try:
            response = table.query(
                #ProjectionExpression="#yr, title, info.genres, info.actors[0]",
                #ExpressionAttributeNames={ "#sid": "sid" }, 
                KeyConditionExpression=Key('sid').eq(sid) & Key('ts').between(st, et)
            )
            #except:
            #    print("DB access error.")

            for data_row in response[u'Items']:
                #
                #try:
                #    data_row0 = response["Items"][0]
                #except:
                    # If no records found, skip this sid and continue.
                #    continue

                #print(data_row0)
                wh = 0.0
                ts_millis = 0.0
                ts = 0
                #
                try:
                    ts_millis = data_row['ts']
                except:
                    print("No ts in DDB")
                #
                try:
                    wh = data_row['wh']
                except:
                    print("No wh in DDB")
                #
                try:
                    fl = data_row['fl']
                except:
                    print("No fl in DDB.")
                #
                try:
                    vl = data_row['vl']
                except:
                    print("No vl in DDB.")

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
                # ISO 8601
                dt_hm1 = sg_time.strftime('%Y-%m-%d %H:%M:%S')
                #
                #
                md_f = 0
                try:
                    if 'md' in data_row:
                        #print("There is md here")
                        md = data_row['md']
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
                mrl_val = decimal.Decimal(invert) + decimal.Decimal(wh)
                mrl_str = "{0:.3f}".format(mrl_val)
                depth_str = "{0:.3f}".format(decimal.Decimal(wh))
                vl_str = "{0:.3f}".format(vl)
                fl_str = "{0:.3f}".format(fl)

                csv_to_write = dt_hm1 + "," \
                            + mrl_str + "," + depth_str + "," \
                            + vl_str + "," + fl_str + "," \
                            + str(md_f) + "\n"
                print(csv_to_write)

                #bytes_written = fout.write(csv_to_write)
                fout.write(csv_to_write.encode('utf8'))

                #f.seek(0)
                #f.truncate(0)
                #writer.writerow(csv_to_write)
                #fout.write(f.getvalue())

    f.close()
        #return "File uploaded."

