import requests
import json
#import MySQLdb
import pymysql
from pymysql.cursors import DictCursor
import configparser
from datetime import date
from datetime import datetime
import locale
import calendar
import pytz
import urllib


config = configparser.ConfigParser()
config.read('config.ini')

con =  pymysql.connect(host=config['mysqlDB']['host'],
                     user=config['mysqlDB']['user'],
                     passwd=config['mysqlDB']['pass'],
                     db=config['mysqlDB']['db'])


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
    res = requests.post(url)
    return res.reason

def reset_stations():
    with con.cursor(DictCursor) as cursor:
        try:
            sql = """select stationID,smsflag,stationflag,Time,smsmessageOFF,userphone from bl_stations"""
            cursor.execute(sql)
        except:
            print("DB access error for station details")
            exit(0)
    #numrows = cursor.rowcount
        # for x in range(0, numrows):
    for row in cursor.fetchall():
        # print row[0]
        #row = cursor.fetchone()
        st_id = row['stationID']
        sms_flag = row['smsflag']
        evt_time = row['Time']
        sms_messageOFF = row['smsmessageOFF']
        sms_to = row['userphone']
        #
        sg_tz = pytz.timezone('Asia/Singapore')
        #sg_now = datetime.now().astimezone(sg_tz)
        sg_now = datetime.now(sg_tz)
        dt_now_str = sg_now.strftime('%Y-%m-%d %H:%M:%S')
        #
        fmt = '%Y-%m-%d %H:%M:%S'
        #dt_evt = datetime.strptime(evt_time, fmt)
        dt_now = datetime.strptime(dt_now_str, fmt)
        diff_mts = (dt_now - evt_time).total_seconds()/60.0
        #
        if (diff_mts > 5) and (sms_flag==1):
            # Reset the flag for this station.
            sql = """UPDATE bl_stations 
             SET stationflag = %d, smsflag = %d, Time = %s 
             WHERE stID= %s"""
            sql_data = (0, 0, dt_now_str, st_id)
            try:
                cursor = con.cursor(DictCursor)
                # TODO: Enable after testing.
                # cursor.execute(sql, sql_data)
                # con.commit()
            # except Error as error:
            except:
                print("DB update error")
                exit(0)
            #
            sms_msg = sms_messageOFF + "\r\n" + dt_now_str
            print("SMS Status - OFF message: ")
            print(sms_msg)
            #gw_send_sms(sms_to, sms_msg)

if __name__ == "__main__":
    reset_stations()
    # TODO: handle outstation seperately?
    # Close mysql connection.
    con.close()


