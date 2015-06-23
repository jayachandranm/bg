package com.blugraph.m2m.dp;

import java.sql.*;

/*
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
*/

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.ArrayList;

public class QueryDataLocal {

    private PreparedStatement preparedStatement = null;
    private Connection connect = null;
    private ResultSet rs = null;

    private static final DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    String sqlurl = "jdbc:mysql://localhost/blunoise";
    String user = "root";
    String password = "root123";
/*
    String sqlurl = "jdbc:mysql://localhost/bg";
    String user = "bg1";
    String password = "bg%user$1";
*/

    public List<DataSample> getDataForStation(StationInfo stationInfo, SensorTypes vType, long qStartTimestamp, long qEndTimestamp) {
        List<DataSample> sensorDataList = new ArrayList<DataSample>();

        // Default table.
        String sensorSqlName = "tbnoisesensor";
        switch (vType.values()[vType.ordinal()]) {
            case SoundNoise:
                sensorSqlName = "tbnoisesensor";
                break;
/*
            case WaterLevel:
                sensorSqlName = "waterlevel";
                break;
            case Location:
                sensorSqlName = "location";
                break;
            case Video:
                sensorSqlName = "video";
                break;
*/
            default:
                System.out.println("Unknown Sensor Type.");
        }

        try {
            connect = DriverManager.getConnection(sqlurl, user, password);
            //int qUserid = stationInfo.getUserId();
            int qStationId = stationInfo.getStationid();
            int qSensorId = stationInfo.getSensorid();

            String query = "SELECT * FROM " + sensorSqlName + " WHERE sender_id=" + qSensorId
                    + " AND  currentdatetime BETWEEN " +  qStartTimestamp + " AND " + qEndTimestamp;
/*
                    + " AND timestamp > " + qStartTimestamp
                    + " AND timestamp < " + qEndTimestamp ;
*/
            Statement st = connect.createStatement();
            rs = st.executeQuery(query);
            while (rs.next()) {
                // TODO:
                //long timestamp = rs.getLong("timestamp");
                long timestamp = rs.getLong("currentdatetime");
                double sensorVal = rs.getDouble("noise_data");
                // TODO:
                //int userId = rs.getInt("user_id");
                int userId = 1;
                int sensorId = rs.getInt("sender_id");
                // int stationid = ?
                // TODO:
                //String stationName = rs.getString("username");
                DataSample sensorData = new DataSample(timestamp, sensorVal, userId, sensorId);
                sensorDataList.add(sensorData);
                //System.out.format("%s, %s, %s\n", timestamp, sensorVal, name);
            }
            st.close();
            connect.close();
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return sensorDataList;
    }


    public List<DataSample> getHourlyDataForStation(StationInfo stationInfo, SensorTypes vType, long qStartTimestamp, long qEndTimestamp) {
        List<DataSample> leq1hrDataList = new ArrayList<DataSample>();

        // Default table.
        String leqSqlName = "tblleq1hr";

        try {
            connect = DriverManager.getConnection(sqlurl, user, password);
            //int qUserid = stationInfo.getUserId();
            int qStationId = stationInfo.getStationid();
            int qSensorId = stationInfo.getSensorid();

            String query = "SELECT * FROM " + leqSqlName + " WHERE sensorid=" + qSensorId
                    + " AND  serverTime BETWEEN " +  qStartTimestamp + " AND " + qEndTimestamp;
/*
                    + " AND timestamp > " + qStartTimestamp
                    + " AND timestamp < " + qEndTimestamp ;
*/
            Statement st = connect.createStatement();
            rs = st.executeQuery(query);
            while (rs.next()) {
                //long timestamp = rs.getLong("timestamp");
                long timestamp = rs.getLong("serverTime");
                double dataVal = rs.getDouble("leq1hr");
                int userId = rs.getInt("userid");
                int sensorId = rs.getInt("sensorid");
                // TODO:
                //String stationName = rs.getString("username");
                DataSample sensorData = new DataSample(timestamp, dataVal, userId, sensorId);
                leq1hrDataList.add(sensorData);
                //System.out.format("%s, %s, %s\n", timestamp, sensorVal, name);
            }
            st.close();
            connect.close();
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return leq1hrDataList;
    }


    /*
     * Get details on all sessions as a list.
     * ptimestamp refers to the time till data is already processed.
     */
    public List<StationInfo> getCurrentStations() {
        List<StationInfo> stationInfoList = new ArrayList<StationInfo>();
/*
        try {
            connect = DriverManager.getConnection(sqlurl, user, password);
            String query = "SELECT * FROM active_stations";
            Statement st = connect.createStatement();
            rs = st.executeQuery(query);
            // Each row represents one station.
            while (rs.next()) {
                int userid = rs.getInt("user_id");
                //String username = rs.getString("username");
                int stationid = rs.getInt("station_id");
                int sensorid = rs.getInt("sensor_id");
                StationInfo stationInfo = new StationInfo(userid, stationid, sensorid);
                stationInfoList.add(stationInfo);
                System.out.format("%s, %s, %s\n", userid, stationid, sensorid);
            }
            st.close();
            connect.close();
        } catch (SQLException e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        } finally {
            try {
                if (preparedStatement != null) {
                    preparedStatement.close();
                }
                if (connect != null) {
                    connect.close();
                }

            } catch (SQLException ex) {
                System.out.println("Error: " + ex.toString());
            }
        }
*/
        // TODO: for testing.
        int userid = 1;
        //String username = rs.getString("username");
        int stationid = 1;
        int sensorid = 1;
        StationInfo stationInfo = new StationInfo(userid, stationid, sensorid);
        stationInfoList.add(stationInfo);

        return stationInfoList;
    }

    /*
     */

    public void updateResultsToDb(StationInfo stationInfo, SensorTypes vType, List<Double> resultVals) {
        int userid = stationInfo.getUserid();
        String username = "test";
        //String username = stationInfo.getUserName();
        int stationid = stationInfo.getStationid();
        int sensorid = stationInfo.getSensorid();

        Calendar cal = new GregorianCalendar();
        long serverTime = cal.getTimeInMillis(); // System.currentTimeMillis()

        // Default table.
        String leqTable = "tblleq1hr";
        switch (vType.values()[vType.ordinal()]) {
            case SoundNoise:
                leqTable = "tblleq1hr";
                break;
/*
            case WaterLevel:
                leqTable = "bg.test";
                break;
            case Location:
                leqTable = "bg.test";
                break;
            case Video:
                leqTable = "bg.test";
                break;
*/
            default:
                System.out.println("Unknown Sensor Type.");
        }

        double leq1hr = 0;
        double leq12hr = 0;
        double predLeq12hrs = 0;
        double predLeq5mtsVal = 0;
        double dosePercentage = 0;

        if (resultVals.size() == 5) {
            leq1hr = resultVals.get(0);
            leq12hr = resultVals.get(1);
            predLeq12hrs = resultVals.get(2);
            predLeq5mtsVal = resultVals.get(3);
            dosePercentage = resultVals.get(4);
        }

        try{
            connect = DriverManager.getConnection(sqlurl, user, password);

            preparedStatement = null;
            preparedStatement = connect.prepareStatement("insert into " + leqTable + " values (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            // Parameters start with 1
            preparedStatement.setLong(1, userid);
            preparedStatement.setString(2, username);
            preparedStatement.setInt(3, sensorid);
            preparedStatement.setLong(4, serverTime);
            preparedStatement.setString(5, dateFormat.format(serverTime));
            preparedStatement.setDouble(6, leq1hr);
            preparedStatement.setDouble(7, leq12hr);
            preparedStatement.setDouble(8, predLeq12hrs);
            preparedStatement.setDouble(9, predLeq5mtsVal);
            preparedStatement.setDouble(10, dosePercentage);

            preparedStatement.executeUpdate();

            preparedStatement.close();
            connect.close();
        } catch (SQLException ex) {
           System.out.println("Error: " + ex.toString());
        } finally {
           try {
               if (preparedStatement != null) {
                   preparedStatement.close();
               }
               if (connect != null) {
                   connect.close();
               }

           } catch (SQLException ex) {
                   System.out.println("Error: " + ex.toString());
           }
       }

    }
}
