package com.blugraph.m2m.dp;
 
import java.util.*;
//import javax.xml.bind.annotation.XmlRootElement;
 
public class StationInfo {
 
    public int userid;
    public String username;
    public int stationid;
    public int sensorid;
/*
 */

    public StationInfo() {}

    public StationInfo(int userId, int stationId, int sensorId) {
        this.userid = userId;
	    this.stationid = stationId;
        this.sensorid = sensorId;
    }

    public int getUserid() {
        return userid;
    }

    public void setUserid(int userid) {
        this.userid = userid;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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
