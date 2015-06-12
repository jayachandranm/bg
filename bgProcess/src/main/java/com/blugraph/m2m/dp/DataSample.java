package com.blugraph.m2m.dp;
 
//import javax.xml.bind.annotation.XmlRootElement;
 
//@XmlRootElement
public class DataSample {
 
    //private int id;
    private long timestamp;
    private float val;
    //private String username;
    private int userid;
    private int stationid;
    private int sensorid;

    public DataSample() {}

    public DataSample(long timestamp, float value, int userid, int sensorid) {
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

    public float getVal() {
        return val;
    }

    public void setVal(float val) {
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
