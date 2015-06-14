package com.blugraph.m2m.dp;
 
//import javax.xml.bind.annotation.XmlRootElement;
 
//@XmlRootElement
public class DataSample {
 
    //private int id;
    private long timestamp;
    private double val;
    //private String username;
    private int userid;
    private int stationid;
    private int sensorid;

    public DataSample() {
        this.timestamp = 0;
        this.val = 0.0f;
        this.userid = 0;
        this.stationid = 0;
        this.sensorid = 0;
    }

    public DataSample(long timestamp, double value, int userid, int sensorid) {
        this.timestamp = timestamp;
        this.val = value;
        //this.username = stationname;
        this.userid = userid;
        this.sensorid = sensorid;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public double getVal() {
        return val;
    }

    public void setVal(double val) {
        this.val = val;
    }

    public int getUserid() {
        return userid;
    }

    public void setUserid(int userid) {
        this.userid = userid;
    }

    public int getStationid() {
        return stationid;
    }

    public void setStationid(int stationid) {
        this.stationid = stationid;
    }

    public int getSensorid() {
        return sensorid;
    }

    public void setSensorid(int sensorid) {
        this.sensorid = sensorid;
    }
}
