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

import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.ArrayList;

public class QueryDataLocal {

    private PreparedStatement preparedStatement = null;
    private Connection connect = null;
    private ResultSet rs = null;

    String sqlurl = "jdbc:mysql://localhost/bg";
    String user = "bg";
    String password = "bg%user$1";

    public List<DataSample> getDataForStation(StationInfo stationInfo, SensorTypes vType, long qStartTimestamp, long qEndTimestamp) {
        List<DataSample> sensorDataList = new ArrayList<DataSample>();

        // Default table.
        String sensorSqlName = "noise";
        switch (vType.values()[vType.ordinal()]) {
            case SoundNoise:
                sensorSqlName = "noise";
                break;
            case WaterLevel:
                sensorSqlName = "waterlevel";
                break;
            case Location:
                sensorSqlName = "location";
                break;
            case Video:
                sensorSqlName = "video";
                break;
            default:
                System.out.println("Unknown Sensor Type.");
        }

        try {
            connect = DriverManager.getConnection(sqlurl, user, password);
            //int qUserid = stationInfo.getUserId();
            int qStationId = stationInfo.getStationid();
            int qSensorId = stationInfo.getSensorid();

            String query = "SELECT * FROM bg.vs_" + sensorSqlName + " WHERE sensorid=" + qSensorId
                    + " AND  timestamp BETWEEN " +  qStartTimestamp + " AND " + qEndTimestamp;
/*
                    + " AND timestamp > " + qStartTimestamp
                    + " AND timestamp < " + qEndTimestamp ;
*/
            Statement st = connect.createStatement();
            rs = st.executeQuery(query);
            while (rs.next()) {
                long timestamp = rs.getLong("timestamp");
                float sensorVal = rs.getFloat(sensorSqlName);
                int userId = rs.getInt("userid");
                int sensorId = rs.getInt("sensorid");
                String stationName = rs.getString("username");
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
        String leqSqlName = "leq1hr";

        try {
            connect = DriverManager.getConnection(sqlurl, user, password);
            //int qUserid = stationInfo.getUserId();
            int qStationId = stationInfo.getStationid();
            int qSensorId = stationInfo.getSensorid();

            String query = "SELECT * FROM bg.vs_" + leqSqlName + " WHERE sensorid=" + qSensorId
                    + " AND  timestamp BETWEEN " +  qStartTimestamp + " AND " + qEndTimestamp;
/*
                    + " AND timestamp > " + qStartTimestamp
                    + " AND timestamp < " + qEndTimestamp ;
*/
            Statement st = connect.createStatement();
            rs = st.executeQuery(query);
            while (rs.next()) {
                long timestamp = rs.getLong("timestamp");
                float dataVal = rs.getFloat(leqSqlName);
                int userId = rs.getInt("userid");
                int sensorId = rs.getInt("sensorid");
                String stationName = rs.getString("username");
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
        try {
            connect = DriverManager.getConnection(sqlurl, user, password);
            String query = "SELECT * FROM bg.active_stations";
            Statement st = connect.createStatement();
            rs = st.executeQuery(query);
            // Each row represents one station.
            while (rs.next()) {
                int userid = rs.getInt("userid");
                //String username = rs.getString("username");
                int sessionid = rs.getInt("stationid");
                int sensorid = rs.getInt("sensorid");
                StationInfo stationInfo = new StationInfo(userid, sessionid, sensorid);
                stationInfoList.add(stationInfo);
                System.out.format("%s, %s, %s\n", userid, sessionid, sensorid);
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
        return stationInfoList;
    }

    /*
     */

    public void updateResultsToDb(StationInfo stationInfo, SensorTypes vType, List<Double> resultVals) {
        int userid = stationInfo.getUserid();
        //String username = stationInfo.getUserName();
        int stationid = stationInfo.getStationid();
        int sensorid = stationInfo.getSensorid();

        Calendar cal = new GregorianCalendar();
        long serverTime = cal.getTimeInMillis(); // System.currentTimeMillis()

        // Default table.
        String leqTable = "bg.leq1hr";
        switch (vType.values()[vType.ordinal()]) {
            case SoundNoise:
                leqTable = "bg.leq1hr";
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
            preparedStatement = connect.prepareStatement("insert into " + leqTable + " values (?, ?, ?, ?, ?, ?, ?, ?)");
            // Parameters start with 1
            preparedStatement.setLong(1, serverTime);
            preparedStatement.setInt(2, sensorid);
            preparedStatement.setInt(3, userid);
            preparedStatement.setDouble(4, leq1hr);
            preparedStatement.setDouble(5, leq12hr);
            preparedStatement.setDouble(6, predLeq12hrs);
            preparedStatement.setDouble(7, predLeq5mtsVal);
            preparedStatement.setDouble(8, dosePercentage);

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
