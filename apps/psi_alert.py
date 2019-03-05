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


map_url = "http://api.nea.gov.sg/api/WebAPI/?dataset=pm2.5_update&keyref=781CF461BB6606ADEA01E0CAF8B3527437F4C1B8ED5B986D"

#doc = requests.get(map_url)
doc = urllib2.urlopen(map_url)

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


