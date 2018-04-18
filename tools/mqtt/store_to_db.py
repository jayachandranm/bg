import json
import pymysql.cursors
import pymysql

connection = pymysql.connect(host='host',
                             user='user',
                             password='pass',
                             db='mydb',
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)

def temp_data_handler(jsonData):
    #Parse Data 
    json_Dict = json.loads(jsonData)
    SensorID = json_Dict['sid']
    Timestamp = json_Dict['ts']
    Temperature = json_Dict['val']
	
    #Push into DB Table
    #dbObj = DatabaseManager()
    #dbObj.add_del_update_db_record("insert into sensor_data (ts, sid, val) values (?,?,?)",[Timestamp, SensorID, Temperature])
    #del dbObj
    try:
        with connection.cursor() as cursor:
            sql = "INSERT INTO `sensor_data` (`ts`, `sid`, `val`) VALUES (%s, %s, %s)"
            cursor.execute(sql, (int(Timestamp), int(SensorID), int(Temperature)))
        connection.commit()
        print "Inserted Temperature Data into Database."
        print ""
    finally:
        #connection.close()
        print("DB final.")
