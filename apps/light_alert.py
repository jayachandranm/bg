import requests
import json
#import MySQLdb
import pymysql
from pymysql.cursors import DictCursor
import configparser
from math import cos, acos, sin, asin, radians, degrees
from datetime import date
from datetime import datetime
import locale
import calendar
import pytz
import urllib

config = configparser.ConfigParser()
config.read('config.ini')

service_url = 'http://www.weather.gov.sg/lightning/LightningStrikeServlet/'
data_obj = {'lightningType' : 'checkAlertRing'}
data_json = json.dumps(data_obj)

res = requests.post(service_url, data_json)

lighting_events = json.loads(res.text)

con =  pymysql.connect(host=config['mysqlDB']['host'],
                     user=config['mysqlDB']['user'],
                     passwd=config['mysqlDB']['pass'],
                     db=config['mysqlDB']['db'])


def distance(st_lat, st_long, evt_lat, evt_long, unit):
    theta = st_long - evt_long
    dist = sin(radians(st_lat)) * sin(radians(evt_lat))
    + cos(radians(st_lat)) * cos(radians(evt_lat)) * cos(radians(theta))
    dist = acos(dist)
    dist = degrees(dist)
    miles = dist * 60 * 1.1515
    unit = unit.upper()
    if unit == "K":
        return (miles * 1.609344)
    elif unit == "N":
        return (miles * 0.8684)
    else:
        return miles


def gw_send_sms(sms_to, sms_msg):
    sms_user = config['SMS']['sms_user']
    sms_pass = config['SMS']['sms_pass']
    sms_from = config['SMS']['sms_from']

    url1 = "api2.aspx?apiusername=" + sms_user + "&apipassword=" + sms_pass
    url2 = "&senderid=" + urllib.urlencode(sms_from) +  "&mobileno=" + urllib.urlencode(sms_to)
    url3 = "&message=" + urllib.urlencode(sms_msg.replace('/', '')) + "&languagetype=1"
    url = "http://gateway80.onewaysms.sg/" + url1 + url2 + url3
    # TODO: fix this. Enable SMS
    print(url)
    #res = requests.post(url)
    #if res.status_code == 200:
    #    ok = "success"
    #else:
    #    print("Please refer to API on Error : " + res.reason)
    #    ok = "fail"
    return res.reason


def affected_stations():
    stations = {}
    for event in lighting_events:
        evt_long = event['longitude']
        # the key can be type or tsStatus
        desc = '0'
        if 'type' in event:
            evt_type = event['type']
        else:
            evt_type = event['tsStatus']
            # TODO: needed?
            desc = event['tsStatus']
        # Ground lighning or thunderstrom
        #evt_lat = -1
        if (evt_type == 'G') or (desc == '1'):
            if 'latitude' in event:
                evt_lat = event['latitude']
            elif 'lattitude' in event:
                evt_lat = event['lattitude']
            else:
                # Something wrong, skip this item and proceed to next.
                continue
            # Go through each station and update status.
            with con.cursor(DictCursor) as cursor:
                try:
                    sql = """select stID,stationID,stName,schoolrange,lattitude,longitude,
                          userphone,smsmessageON,smsmessageOFF,smsflag,stationflag,smsid 
                          from bl_stations"""
                    cursor.execute(sql)
                    # con.commit
                except:
                    print("DB access error for station details")
                    exit(0)

            numrows = cursor.rowcount
            #for row in cursor.fetchall():
            #    print row[0]
            for x in range(0, numrows):
                row = cursor.fetchone()
                st_id = row['stID']
                print(st_id)
                st_range = row['schoolrange']
                st_lat = row['lattitude']
                st_long = row['longitude']
                # Calculate distance between station and event.
                dist = distance(st_lat, st_long, evt_lat, evt_long, 'K')

                # If event within range for the station, add this station to the list
                #  for further processing.
                if dist <= st_range:
                    st_details = {}
                    st_details['stName'] = row['stName']
                    #st_details['schoolrange'] = row['schoolrange']
                    #st_details['latitude'] = row['lattitude']
                    #st_details['longitude'] = row['longitude']
                    st_details['userphone'] = row['userphone']
                    st_details['smsmessageON'] = row['smsmessageON']
                    st_details['smsmessageOFF'] = row['smsmessageOFF']
                    st_details['smsflag'] = row['smsflag']
                    st_details['stationflag'] = row['stationflag']
                    st_details['smsid'] = row['smsid']
                    # add to list/dict
                    stations[st_id] = st_details
    return stations

def alert_stations(st_list):
    # TODO: use date-time from the JSON?
    #locale.setlocale(locale.LC_ALL, 'en_SG')
    now = date.today()
    currentday = calendar.day_name[now.weekday()]
    sg_tz = pytz.timezone('Asia/Singapore')
    #sg_now = datetime.now().astimezone(sg_tz)
    sg_now = datetime.now(sg_tz)
    currenthour = sg_now.hour

    for st in st_list:
        smsid = st['smsid']
        dayval = 'weekdays'
        if smsid == 2:
            dayval = 'weekly'
        elif smsid == 3:
            dayval = currentday

        sql = """select mflag, smsflag from bl_stations where stationID = %s"""
        with con.cursor(DictCursor) as cursor:
            try:
                cursor.execute(sql, (st))
            except:
                print("DB access error for mflag")
                exit(0)
        #
        if cursor.rowcount == 0:
            # No entries for the station id, skip to next station.
            continue
        row = cursor.fetchone()
        mflag = row['mflag']
        smsflag = row['smsflag']
        # if masterflag set, do nothing, skip to next station.
        if mflag == 1:
            continue

        sql = """select starttime,endtime,smsstarttime,smsendtime 
              from bl_induvidualdays where stationID = %s  
              and dayvalue = %s"""
        sql_data = (st, currentday)
        with con.cursor(DictCursor) as cursor:
            try:
                cursor.execute(sql, sql_data)
            except:
                print("DB access error for time-range")
                exit(0)
        #
        if cursor.rowcount == 0:
            # No results for the query, skip to next station.
            continue
        row = cursor.fetchone()
        starttime = row['starttime']
        endtime = row['endtime']
        sms_starttime = row['smsstarttime']
        sms_endtime = row['smsendtime']
        #
        if (currenthour >= starttime and currenthour <= endtime):
            # Update the DB with event if it's change of status.
            #   Or just update the time of latest report.
            dt = sg_now.strftime('%Y-%m-%d') + ' ' + sg_now.strftime('%H:%M:%S')
            sql = """UPDATE bl_stations
             SET stationflag = %d, smsflag = %d, Time = %s 
             WHERE stID= %s"""
            sql_data = (1, 1, dt, st)
            try:
                cursor = con.cursor(DictCursor)
                # TODO: Enable after testing.
                #cursor.execute(sql, sql_data)
                #con.commit()
            # except Error as error:
            except:
                print("DB update error")
                exit(0)
            #
            # send SMS if smsflag is zero (no SMS sent for this event)
            if smsflag == 0:
                if (currenthour >= sms_starttime and currenthour < sms_endtime):
                    print("SMS Status - ON message: ")
                    sms_msg = st['smsmessageON'] + "\r\n" + dt
                    sms_to = st['userphone']
                    print(sms_msg)
                    #
                    #gw_send_sms(sms_to, sms_msg)
                else:
                    print("SMS Status - SMS time out of range")

        #


if __name__ == "__main__":
    st_list = affected_stations()
    alert_stations(st_list)
    # Close mysql connection.
    con.close()

