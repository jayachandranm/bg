import requests
import json
import pymysql
from pymysql.cursors import DictCursor
import configparser
from datetime import date
from datetime import datetime
import calendar
import pytz
import urllib2
import urllib

import xml.etree.ElementTree as ET

config = configparser.ConfigParser()
config.read('config.ini')


con =  pymysql.connect(host=config['mysqlDB']['host'],
                     user=config['mysqlDB']['user'],
                     passwd=config['mysqlDB']['pass'],
                     db=config['mysqlDB']['db'])


def gw_send_sms(sms_to, sms_msg):
    #
    sms_user = config['SMS']['sms_user']
    sms_pass = config['SMS']['sms_pass']
    sms_from = config['SMS']['sms_from']

    params = {'apiusername': sms_user,
              'apipassword': sms_pass,
              'senderid': sms_from,
              'mobileno': sms_to,
              'message': sms_msg,
              'languagetype': 1}

    url = "http://gateway80.onewaysms.sg/api2.aspx?" + urllib.urlencode(params)
    # TODO: fix this. Enable SMS
    print("SMS request.")
    res = requests.post(url)
    #if res.status_code == 200:
    #    ok = "success"
    #else:
    #    print("Please refer to API on Error : " + res.reason)
    #    ok = "fail"
    return res.reason


map_url = "http://api.nea.gov.sg/api/WebAPI/?dataset=pm2.5_update&keyref=781CF461BB6606ADEA01E0CAF8B3527437F4C1B8ED5B986D"

#doc = requests.get(map_url)
doc = urllib2.urlopen(map_url).read()

#tree = ET.parse(doc)
#root = tree.getroot()
root = ET.fromstring(doc)

region = []
record = []

#psi_regions = {}
psi_regions = []

items = root.find('item')
for region in items.findall('region'):
    #print region.find('id').text
    region_id = region.find('id').text
    latitude = region.find('latitude').text
    longitude = region.find('longitude').text
    record = region.find('record')
    timestamp = record.get('timestamp')
    reading = record.find('reading')
    PSI = reading.get('value')
    #
    psi_details = {}
    psi_details['region_id'] = region_id
    psi_details['latitude'] = latitude
    psi_details['longitude'] = longitude
    psi_details['timestamp'] = timestamp
    psi_details['psi_value'] = PSI
    #psi_regions[region_id] = psi_details
    #print(psi_details)
    psi_regions.append(psi_details)
    #
    ThreeH_PSI = 0
    OneH_NO2 = 0
    TwentyfourH_PM10 = 0
    TwentyfourH_PM25 = 0
    TwentyfourH_SO2 = 0
    EightH_CO = 0
    EightH_O3 = 0
    NPSI_CO = 0
    NPSI_NO2 = 0
    NPSI_O3 = 0
    NPSI_PM10 = 0
    NPSI_PM25 = 0
    NPSI_SO2 = 0
    #
    sql = """INSERT INTO bl_psi 
     (location_id, latitude, longitude, timestamp, psi_value, 
     threeH_PSI, OneH_NO2, TwentyfourH_PM10, TwentyfourH_PM25, TwentyfourH_SO2,
     eightH_CO, eightH_O3, NPSI_CO, NPSI_NO2, NPSI_O3, NPSI_PM10, NPSI_PM25, 
     NPSI_SO2) VALUES (%s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
    sql_data = (region_id, latitude, longitude, timestamp, PSI,
                ThreeH_PSI, OneH_NO2, TwentyfourH_PM10, TwentyfourH_PM25, TwentyfourH_SO2,
                EightH_CO, EightH_O3, NPSI_CO, NPSI_NO2, NPSI_O3, NPSI_PM10, NPSI_PM25, NPSI_SO2)
    try:
        cursor = con.cursor(DictCursor)
        cursor.execute(sql, sql_data)
        con.commit()
    # except Error as error:
    except:
        print("DB insert error")
        exit(0)

#
now = date.today()
currentday = calendar.day_name[now.weekday()]
sg_tz = pytz.timezone('Asia/Singapore')
# sg_now = datetime.now().astimezone(sg_tz)
sg_now = datetime.now(sg_tz)
dt = sg_now.strftime('%d/%m/%Y') + ' ' + sg_now.strftime('%H:%M:%S')
print('DateTime: ', dt)
#print(psi_regions)
#

for details in psi_regions:
    region_id = details['region_id']
    latitude = details['latitude']
    longitude = details['longitude']
    timestamp = details['timestamp']
    station_psiValue = details['psi_value']
    print("----------")
    print('Region ID: ', region_id)
    print('Station PSI: ', station_psiValue)

    with con.cursor(DictCursor) as cursor1:
        # Get all stations for the region_id.
        num_rows_station = 0
        try:
            sql = """select bl_psi_user_stations.psi_station_id, bl_psi_user_stations.user_station_name, bl_psi_user_stations.psi_station_name,
                bl_psi_user_stations.trigger_cat, bl_psi_user_stations.psi_smsflag,  
                bl_psi_user_stations.user_phone, bl_psi_user_stations.sms_on_message, bl_psi_user_stations.sms_of_message   
                from bl_psi_user_stations
                JOIN bl_psi_stations on bl_psi_user_stations.psi_station_name = bl_psi_stations.psi_station_name 
                where bl_psi_stations.psi_station_sname=%s"""
            sql_data = (region_id)
            #print(sql)
            num_rows_station = cursor1.execute(sql, sql_data)
            con.commit()
        except:
            print("DB access error for station details")
            exit(0)
        # num_rows_station = cursor.rowcount
        print('Number of stations for the region: ',num_rows_station)
        # For each station, evaluate event, act and update DB.
        for x in range(0, num_rows_station):
            row = cursor1.fetchone()
            #id = row['id']
            psi_station_id = row['psi_station_id']
            user_station_name = row['user_station_name']
            psi_station_name = row['psi_station_name']
            sms_to = row['user_phone']
            sms_messageON = row['sms_on_message']
            sms_messageOFF = row['sms_of_message']
            psi_smsflag = row['psi_smsflag']
            trigger_category = row['trigger_cat']
            print("->")
            print("Station ID: ", psi_station_id)
            #
            sms_title = "Current PSI Value:"
            sms_msg = ""
            current_psi_status = ""
            smsflag = 0
            trigger_cat = 0
            if psi_smsflag == 0:
                if station_psiValue >= 56:
                    if (station_psiValue >= 56 and station_psiValue <= 150):
                        current_psi_status = "Band II / Elevated"
                        trigger_cat = 1
                    elif (station_psiValue >= 151 and station_psiValue <= 250):
                        current_psi_status = "Band III / High"
                        trigger_cat = 2
                    elif station_psiValue >= 251:
                        current_psi_status = "Band IV / Very High"
                        trigger_cat = 3
                    #
                    smsflag = 1
                    sms_msg = sms_messageON + "\r\n" \
                              + sms_title + station_psiValue + "\r\n" \
                              + current_psi_status + "\r\n" + dt
                    print("SMS Status - ON message: ")
            else:  # psi_smsflag
                if station_psiValue >= 56:
                    if (station_psiValue >= 56 and station_psiValue <= 150):
                        if trigger_category != 1:
                            current_psi_status = "II / Elevated"
                            trigger_cat = 1
                            smsflag = 1
                            sms_msg = sms_messageON + "\r\n" \
                                      + sms_title + station_psiValue + "\r\n" \
                                      + current_psi_status + "\r\n" + dt
                            print("SMS Status - ON message: ")
                    if (station_psiValue >= 151 and station_psiValue <= 250):
                        if trigger_category != 2:
                            current_psi_status = "III / High"
                            trigger_cat = 2
                            smsflag = 1
                            sms_msg = sms_messageON + "\r\n" \
                                      + sms_title + station_psiValue + "\r\n" \
                                      + current_psi_status + "\r\n" + dt
                            print("SMS Status - ON message: ")

                    if station_psiValue >= 251:
                        if trigger_category != 3:
                            current_psi_status = "IV / Very High"
                            smsflag = 1
                            sms_msg = sms_messageON + "\r\n" \
                                      + sms_title + station_psiValue + "\r\n" \
                                      + current_psi_status + "\r\n" + dt
                            trigger_cat = 3
                            print("SMS Status - ON message: ")
                else:  # station_psiValue
                    current_psi_status = "I / Normal"
                    sms_msg = sms_messageOFF + "\r\n" \
                              + sms_title + station_psiValue + "\r\n" \
                              + current_psi_status + "\r\n" + dt
                    trigger_cat = 0
                    smsflag = 0
                    print("SMS Status - OFF message: ")
            #
            gw_send_sms(sms_to, sms_msg)
            sql = """UPDATE bl_psi_user_stations SET psi_smsflag=%s, trigger_cat=%s where psi_station_id=%s"""
            sql_data = (smsflag, trigger_cat, psi_station_id)
            try:
                cursor2 = con.cursor(DictCursor)
                cursor2.execute(sql, sql_data)
                con.commit()
            # except Error as error:
            except:
                print("DB update error")
                exit(0)
