package com.blugraph.m2m.dp;

//import org.apache.log4j.Logger;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Properties;

/**
 * Created by mjay on 6/24/15.
 */
public enum AppGlobals {
    INSTANCE;
    //Logger logger;

    public int WAKEUP_INTERVAL = 10; // 5*60*1000; 5mts

    public int WORK_HRS_START_HR = 7;
    public int WORK_HRS_START_MTS = 0;
    public int MIN_DATA_WINDOW = 30*60*1000;

    double SENSOR_UPDATE_FREQ = 5.0*60; // in seconds
    double LEQ12HR_LIMIT = 75.0;
    double LEQ5MTS_LIMIT = 90.0;
    double WORK_HRS_LIMIT = 12.0;


    AppGlobals() {
        //logger = org.apache.log4j.Logger.getLogger(AppLoader.class.getName());
        Properties AppProps = new Properties();

        //FileInputStream in;
        String propFileName = "config/bgnoise.properties";

        try {
            //in = new FileInputStream(filename);
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream(propFileName);

            if (inputStream != null) {
                AppProps.load(inputStream);
                inputStream.close();
            } else {
                throw new FileNotFoundException("property file '" + propFileName + "' not found in the classpath");
            }

            WAKEUP_INTERVAL = Integer.parseInt(AppProps.getProperty("wakeup_interval"));

            WORK_HRS_START_HR = Integer.parseInt(AppProps.getProperty("work_start_hr"));
            WORK_HRS_START_MTS = Integer.parseInt(AppProps.getProperty("work_start_mts"));
            MIN_DATA_WINDOW = Integer.parseInt(AppProps.getProperty("min_data_window"));

            SENSOR_UPDATE_FREQ = Double.parseDouble(AppProps.getProperty("sensor_update_freq"));
            LEQ12HR_LIMIT = Double.parseDouble(AppProps.getProperty("leq12hr_limit"));
            LEQ5MTS_LIMIT = Double.parseDouble(AppProps.getProperty("leq5mts_limit"));
            WORK_HRS_LIMIT = Double.parseDouble(AppProps.getProperty("work_hrs_limit"));

            System.out.println("Loaded App properties. ");
        } catch (FileNotFoundException ex) {
            //logger.error(ex.toString());
            System.out.println(ex.toString());
        } catch (IOException ex) {
            //logger.error(ex.toString());
            System.out.println(ex.toString());
        }
    }

    public void printTime() {
        Calendar cal = Calendar.getInstance();
        cal.getTime();
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss");
        System.out.println( sdf.format(cal.getTime()) );
    }

}

