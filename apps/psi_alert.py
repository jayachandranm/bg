#import requests
import json
import pymysql
from pymysql.cursors import DictCursor
import configparser
from datetime import date
from datetime import datetime
import calendar
import pytz
import urllib2

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
    print(url)
    #res = requests.post(url)
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
    ThreeH_PSI = 0;
    OneH_NO2 = 0;
    TwentyfourH_PM10 = 0;
    TwentyfourH_PM25 = 0;
    TwentyfourH_SO2 = 0;
    EightH_CO = 0;
    EightH_O3 = 0;
    NPSI_CO = 0;
    NPSI_NO2 = 0;
    NPSI_O3 = 0;
    NPSI_PM10 = 0;
    NPSI_PM25 = 0;
    NPSI_SO2 = 0;
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
        print("DB update error")
        exit(0)

# Second stage
#
with con.cursor(DictCursor) as cursor:
    try:
        sql = """select id,psi_station_id,user_station_name,psi_station_name,
            user_phone,sms_on_message,sms_of_message,psi_smsflag 
            from bl_psi_user_stations"""
        num_rows_station = cursor.execute(sql)
        con.commit
    except:
        print("DB access error for station details")
        exit(0)

    num_rows_station = cursor.rowcount
    print(num_rows_station)

    now = date.today()
    currentday = calendar.day_name[now.weekday()]
    sg_tz = pytz.timezone('Asia/Singapore')
    # sg_now = datetime.now().astimezone(sg_tz)
    sg_now = datetime.now(sg_tz)
    dt = sg_now.strftime('%d/%m/%Y') + ' ' + sg_now.strftime('%H:%M:%S')

    for x in range(0, num_rows_station):
        row = cursor.fetchone()
        id = row['id']
        psi_station_id = row['psi_station_id']
        user_station_name = row['user_station_name']
        psi_station_name = row['psi_station_name']
        sms_to = row['user_phone']
        sms_messageON = row['sms_on_message']
        sms_messageOFF = row['sms_of_message']
        psi_smsflag = row['psi_smsflag']
        #
        sql = """select bl_psi_stations.psi_station_sname as 'psi_station_sname' from bl_psi_stations 
        JOIN bl_psi_user_stations on bl_psi_user_stations.psi_station_name = bl_psi_stations.psi_station_name 
        where bl_psi_user_stations.psi_station_name=%s"""
        sql_data = ( psi_station_name )
        with con.cursor(DictCursor) as cursor:
            try:
                cursor.execute(sql, sql_data)
            except:
                print("DB access error for time-range")
                exit(0)
        #
        print(cursor.rowcount)
        if cursor.rowcount == 0:
            # No results for the query, skip to next station.
            continue
        row = cursor.fetchone()
        station_SName = row['psi_station_sname']
        #
        sql = """select timestamp,psi_value from bl_psi 
        where location_id=%s order by timestamp DESC LIMIT 1"""
        sql_data = (station_SName)
        with con.cursor(DictCursor) as cursor:
            try:
                cursor.execute(sql, sql_data)
            except:
                print("DB access error for time-range")
                exit(0)
        #
        print(cursor.rowcount)
        if cursor.rowcount == 0:
            # No results for the query, skip to next station.
            continue
        row = cursor.fetchone()
        station_timestamp = row['timestamp']
        station_psiValue = row['psi_value']
        #
        sql = """select trigger_cat from bl_psi_user_stations where psi_station_id=%s"""
        sql_data = (psi_station_id)
        with con.cursor(DictCursor) as cursor:
            try:
                cursor.execute(sql, sql_data)
            except:
                print("DB access error for time-range")
                exit(0)
        #
        print(cursor.rowcount)
        if cursor.rowcount == 0:
            # No results for the query, skip to next station.
            continue
        row = cursor.fetchone()
        trigger_category = row['trigger_cat']

        #
        current_psi_value = "Current PSI Value:"
        if psi_smsflag == 0:
            if station_psiValue >= 56:
                print station_psiValue
                if (station_psiValue >= 56 && station_psiValue <=150):
                    current_psi_status = "Band II / Elevated"
                    trigger_cat = 1
                elif (station_psiValue >= 151 && station_psiValue <= 250):
                    current_psi_status = "Band III / High"
                    trigger_cat = 2
                elif station_psiValue >= 251:
                    current_psi_status = "Band IV / Very High"
                    trigger_cat = 3
                #
                sms_msg = sms_messageON + "\r\n" \
                          + current_psi_value + station_psiValue + "\r\n" \
                          + current_psi_status + "\r\n" + dt
                print "SMS Status - ON message: "
                gw_send_sms(sms_to, sms_msg)
                #
                sql = """UPDATE bl_psi_user_stations SET psi_smsflag=%s, trigger_cat=%s where id=%s"""
                sql_data = (1, trigger_cat, id)
                try:
                    cursor = con.cursor(DictCursor)
                    # TODO: Enable after testing.
                    #cursor.execute(sql, sql_data)
                    #con.commit()
                # except Error as error:
                except:
                    print("DB update error")
                    exit(0)
        else: # psi_smsflag
            if station_psiValue >= 56:
                if (station_psiValue >= 56 && station_psiValue <= 150):
                    if trigger_category != 1:
                        current_psi_status = "II / Elevated"
                        sms_msg = sms_messageON + "\r\n" \
                                  + current_psi_value + station_psiValue + "\r\n" \
                                  + current_psi_status + "\r\n" + dt
                        print "SMS Status - ON message: "
                        gw_send_sms(sms_to, sms_msg)
                        sql = """UPDATE bl_psi_user_stations SET psi_smsflag=%s, trigger_cat=%s where id=%s"""
                        sql_data = (1, 1, id)
                        try:
                            cursor = con.cursor(DictCursor)
                            # TODO: Enable after testing.
                            #cursor.execute(sql, sql_data)
                            #con.commit()
                        # except Error as error:
                        except:
                            print("DB update error")
                            exit(0)
                if (station_psiValue >= 151 && station_psiValue <= 250):
                    if trigger_category != 2:
                        current_psi_status = "III / High"
                        sms_msg = sms_messageON + "\r\n" \
                                  + current_psi_value + station_psiValue + "\r\n" \
                                  + current_psi_status + "\r\n" + dt
                        print "SMS Status - ON message: "
                        gw_send_sms(sms_to, sms_msg)
                        sql = """UPDATE bl_psi_user_stations SET psi_smsflag=%s, trigger_cat=%s where id=%s"""
                        sql_data = (1, 2, id)
                        try:
                            cursor = con.cursor(DictCursor)
                            # TODO: Enable after testing.
                            #cursor.execute(sql, sql_data)
                            #con.commit()
                        # except Error as error:
                        except:
                            print("DB update error")
                            exit(0)

                if station_psiValue >= 251:
                    if trigger_category != 3:
                        current_psi_status = "IV / Very High"
                        sms_msg = sms_messageON + "\r\n" \
                                  + current_psi_value + station_psiValue + "\r\n" \
                                  + current_psi_status + "\r\n" + dt
                        print "SMS Status - ON message: "
                        gw_send_sms(sms_to, sms_msg)
                        sql = """UPDATE bl_psi_user_stations SET psi_smsflag=%s, trigger_cat=%s where id=%s"""
                        sql_data = (1, 3, id)
                        try:
                            cursor = con.cursor(DictCursor)
                            # TODO: Enable after testing.
                            #cursor.execute(sql, sql_data)
                            #con.commit()
                        # except Error as error:
                        except:
                            print("DB update error")
                            exit(0)
            else: # station_psiValue
                current_psi_status = "I / Normal"
                sms_msg = sms_messageOFF + "\r\n" \
                          + current_psi_value + station_psiValue + "\r\n" \
                          + current_psi_status + "\r\n" + dt
                print "SMS Status - OFF message: "
                gw_send_sms(sms_to, sms_msg)
                sql = """UPDATE bl_psi_user_stations SET psi_smsflag=%s, trigger_cat=%s where id=%s"""
                sql_data = (0, 0, id)
                try:
                    cursor = con.cursor(DictCursor)
                    # TODO: Enable after testing.
                    # cursor.execute(sql, sql_data)
                    # con.commit()
                # except Error as error:
                except:
                    print("DB update error")
                    exit(0)

