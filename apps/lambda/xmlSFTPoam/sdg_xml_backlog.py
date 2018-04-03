from __future__ import print_function

import os
from StringIO import StringIO
import boto3
import sys

import json
import decimal
from boto3.dynamodb.conditions import Key, Attr

import urllib2

from datetime import datetime
import time
import pytz

from lxml import etree, objectify

with open("station-ids.json") as json_file:
    try:
        json_data = json.load(json_file)
    except:
        print("Error loading JSON file.")

stations = json_data['stations'] 

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
table = dynamodb.Table('pubc5wl-ddb')

iot_client = boto3.client('iot-data', region_name='ap-southeast-1')

with open("config.json") as config_json_file:
    try:
        config = json.load(config_json_file)
    except:
        print("Error loading config JSON file.")

config_host = config['host']
config_port = config['port']
config_user = config['user']
config_pass = config['pass']
config_dir = config['remote_dir']
config_bucket = config['s3_bucket']
config_folder = config['s3_folder']
config_file = config['s3_file']

s3dev_state = boto3.resource('s3')

tslice =  1519833600

#----------------------------------------------------------------------
def create_series(data, stype):
    """
    Create a time series XML element for single div
    """
    dt = data["dt"]
    tm = data["tm"]
    wa = data["wa"]
    val = data["val"]
    loc = data["locationId"]
    gps_x = data["x"]
    gps_y = data["y"]
    desc = data["fileDescription"]
    md = data["md"]
    series = objectify.Element("series")
    header = objectify.SubElement(series, "header")
    header.type = "instantaneous" #data["type"]
    header.locationId = loc
    header.parameterId = "Level"
    #if stype == "level":
    #    header.parameterId = "Level"
    #elif stype == "depth":
    if stype == "depth":
        header.parameterId = "Depth"
    #else:
        #TODO: undefined.
    header.timeStep = objectify.Element("timeStep", unit="nonequidistant")
    header.startDate = objectify.Element("startDate", date=dt, time=tm)
    header.endDate = objectify.Element("endDate", date=dt, time=tm)
    header.missVal = -999.9
    header.x = gps_x
    header.y = gps_y
    header.units = "mRL"
    #if stype == "level":
    #    header.units = "mRL"
    #elif stype == "depth":
    if stype == "depth":
        header.units = "m"
    header.fileDescription = desc
    event = objectify.SubElement(series, "event", date=dt, time=tm, value=val, flag=str(md))
    return series
 
#----------------------------------------------------------------------


if __name__ == "__main__":
    #
    print("Starting..")
    content_object = s3dev_state.Object(config_bucket, config_folder + '/' + config_file)
    file_content = content_object.get()["Body"].read().decode('utf-8')
    dev_state_s3 = json.loads(file_content)

    running = True

    while running:
        # add 10 minutes
        #tslice =  1519833600000
        tslice = tslice + 10*60
        #2018-03-05_08-23-20.xml
        #tend = 1520238000 - 10*60
        #2018-03-28_09-23-17.xml
        tend = 1522229040 - 10*60

        if tslice > tend:
            running = False
            break

        #tm = time.strftime('%Y-%m-%d_%H-%M-%S')
        utc_st = datetime.fromtimestamp(tslice)
        utc_st = utc_st.replace(tzinfo=pytz.UTC)
        tm = utc_st.strftime('%Y-%m-%d_%H-%M-%S')
        dest = "./gen_files/" + tm + ".xml"
        #file = sftp.file(dest, "w", -1)
        file = open(dest, "w")
        #file.write("<?xml version=\"1.0\" ?>" + "<TimeSeries>")
        print(dest)

        xml = '''<?xml version="1.0" encoding="UTF-8"?>
        <TimeSeries>
        </TimeSeries>
        '''
        root = objectify.fromstring(xml)

        for sid in stations:
            #print("<-------------------->")
            #print(sid)
            try:
                response = table.query(
                    Limit=1,
                    ScanIndexForward=False,
                    KeyConditionExpression=Key('sid').eq(sid) & Key('ts').lt(tslice*1000)
                )
                    #KeyConditionExpression=Key('sid').eq(sid)
            except:
                print("DB access error.")
            #
            data_row0 = response["Items"][0]
            #print(data_row0)
            wa = 0.0
            ts_millis = 0.0
            ts = 0
            try:
                wa = data_row0['wa']
            except:
                print("No data")
            #
            try:
                ts_millis = data_row0['ts']
            except:
                print("No time")
            #
            wa = wa/100
            ts = int(ts_millis / 1000)
            curr_t = int(time.time())
            time_lag = curr_t - ts

            #dt1 = datetime.fromtimestamp(ts+28800).strftime('%Y-%m-%d')
            #hm1 = datetime.fromtimestamp(ts+28800).strftime('%H:%M:%S')
            utc_dt = datetime.fromtimestamp(ts)
            utc_dt = utc_dt.replace(tzinfo=pytz.UTC)
            sg_tz = pytz.timezone('Asia/Singapore')
            sg_time = utc_dt.astimezone(sg_tz)
            dt1 = sg_time.strftime('%Y-%m-%d')
            hm1 = sg_time.strftime('%H:%M:%S')
            try:
                #sid = data_row0['sid']
                #print(sid)
                al = data_row0['al']
                #print(al)
            except:
                print("No SID")

            # TODO:
            if al > 2:
                al = 2
            #flag = al
            flag = 0
            #
            md = "normal"
            try:
                if 'md' in data_row0:
                    #print("There is md here")
                    md = data_row0['md']
                    #print(md)
                    # TODO:
                    if md == "maintenance":
                        #flag = 3
                        flag = 1
                #else:
                #    print("There is no md here")
                #
            except:
                print("No time")

            # if no data for more than 30mts, set to maintenance
            #if time_lag > 1800:
                #flag = 3
            #    flag = 1

            #print(flag)
            #
            response = iot_client.get_thing_shadow(
                thingName=str(sid)
            )
            streamingBody = response["payload"]
            jsonState = json.loads(streamingBody.read())
            loc = jsonState["state"]["reported"]["location"]
            cope = jsonState["state"]["reported"]["cope_level"]
            invert = jsonState["state"]["reported"]["invert_level"]
            offset_o = jsonState["state"]["reported"]["offset_o"]
            #print(loc)
            #get_sid_url = "http://13.228.68.232/coords.php?sid=" + sid
            #lat_lon_j = urllib2.urlopen(get_sid_url).read()
            #lat_lon = json.loads(lat_lon_j)
            dev_state_sid = dev_state_s3["dev_state"][sid]
            #print(dev_state_sid)
            #lat = lat_lon['lat']
            #lon = lat_lon['lon']
            lat = dev_state_sid["latitude"]
            lon = dev_state_sid["longitude"]
            #lat_str = float("{0:.7f}".format(lat))
            #lon_str = float("{0:.7f}".format(lon))
            lat_str = "{0:.7f}".format(lat)
            lon_str = "{0:.7f}".format(lon)
            # Calibrate near zero.
            if wa <= ( 0.08 + (offset_o / 100) ):
                wa = offset_o / 100
            mrl_val = decimal.Decimal(invert) + decimal.Decimal(wa)
            mrl_str = "{0:.3f}".format(mrl_val)
            cope_str = "{0:.3f}".format(cope)
            invert_str = "{0:.3f}".format(invert)
            op_level = invert + (offset_o / 100)
            op_str = "{0:.3f}".format(op_level)
            #print(loc2)
            #      file.write("   "+"<?xml version=\"1.0\" ?>"+'\n'+"<TimeSeries>"'\n')
            #               + "<x>" + "31810.18</x>" \
            #               + "<y>" + "41013.21" + "</y>" \

            desc = "cope_level=\"" + cope_str + "\" invert_level=\"" + invert_str + "\" operation_level=\"" + op_str + "\""

            appt1 = create_series({
                            "locationId": sid,
                            "dt": dt1,
                            "tm": hm1,
                            "x": lat_str,
                            "y": lon_str,
                            "fileDescription": desc,
                            "wa": wa,
                            "val": mrl_str,
                            "md": flag
                            }, "level")

            root.append(appt1)

            wa_str = "{0:.3f}".format(wa)
            appt2 = create_series({
                            "locationId": sid,
                            "dt": dt1,
                            "tm": hm1,
                            "x": lat_str,
                            "y": lon_str,
                            "fileDescription": desc,
                            "wa": wa,
                            "val": wa_str,
                            "md": flag
                            }, "depth")

            root.append(appt2)

        # remove lxml annotation
        objectify.deannotate(root)
        etree.cleanup_namespaces(root)

        # create the xml string
        obj_xml = etree.tostring(root,
                                 pretty_print=True,
                                 xml_declaration=True)
        print(obj_xml)

        try:
            file.write(obj_xml)
            file.flush()
            file.close()
        except:
            print("File write error.")
        #    sftp.put(source, dest)
