package com.blugraph.m2m.dp;

import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.TimeZone;


/**
 * The main app, starting point.
 */
public class App {

    private static long last_processing_time = 0;
    private static final long millisInHr = 60*60*1000;
    private volatile boolean continueDp = true;

    public static void main(String[] args) {
        System.out.println("Inside App!");
            
        // At the start of program, set a limit to fetch history sensor data.
        Calendar now = new GregorianCalendar();
        // pick 1hr window of history data for start.
        last_processing_time = now.getTimeInMillis() - (AppGlobals.INSTANCE.MIN_DATA_WINDOW);
        App localApp = new App();
    }

    /*
    * Constructor. 
    */
    public App() { //throws InterruptedException
        QueryDataLocal queryIf = new QueryDataLocal();
        ProcessData processData = new ProcessData();

        while (continueDp) {
            try {
                Thread.sleep(AppGlobals.INSTANCE.WAKEUP_INTERVAL);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                //throw ex;
            }

            Calendar now = new GregorianCalendar();
            long currentServerTime = now.getTimeInMillis(); // System.currentTimeMillis() 1434095700.000
            //System.out.println(currentServerTime);
            int hourNow = now.get(Calendar.HOUR_OF_DAY);
            int minuteNow = now.get(Calendar.MINUTE);

            // Consider only the 10 minute window just before the start of an hour.
            if(minuteNow < 50) {
                continue;
            }

            System.out.println("App: Current time =" + currentServerTime + ", Last process time =" + last_processing_time);

            long timeElapsedExec = currentServerTime - last_processing_time;
            // Avoid repeated processing within the 10 minute window. Wait for 30 mts after last processing.
            if( timeElapsedExec < (AppGlobals.INSTANCE.MIN_DATA_WINDOW)) {
                continue;
            }

            System.out.println("App: Start to process all station data.");

            // All conditions satisfied, process the window of data.
            // TODO: Should the last_processing_time be updated, if no active stations now?
            List<StationInfo> stationInfoList = queryIf.getCurrentStations();

            Calendar workStartTime = Calendar.getInstance();
            workStartTime.set(Calendar.MILLISECOND, 0);
            workStartTime.set(Calendar.SECOND, 0);
            workStartTime.set(Calendar.MINUTE, AppGlobals.INSTANCE.WORK_HRS_START_MTS);
            workStartTime.set(Calendar.HOUR_OF_DAY, AppGlobals.INSTANCE.WORK_HRS_START_HR);  // Today, 7am.
/*
                if (workStartTime.before(Calendar.getInstance())) {
                    workStartTime.add(Calendar.HOUR, 1);
                }
*/
            long workStartTimeMillis =  workStartTime.getTimeInMillis(); //1434092400
            double millisFromWorkStart = currentServerTime - workStartTimeMillis;
            System.out.println("App: Work start time =" + workStartTimeMillis);

            // No processing outside the Active work hrs.
            // Give additional few hrs towards the end, just as a buffer.
            // For the first window, process data one hour before the start point.
            // The values calculated for the start hour is not included in any of the algorithms.
            // Used only to indicate conditions at the start of work.
            if( ( (millisFromWorkStart+millisInHr) < 0)
                    || (millisFromWorkStart > (AppGlobals.INSTANCE.WORK_HRS_LIMIT+2)*millisInHr)) {
                // Time before work start time for the day.
                continue;
            }

            // 2.54 => 2.0 hrs
            double hoursFromStart = Math.floor(millisFromWorkStart/millisInHr);

            long currTime = currentServerTime;
            long lastPtime = last_processing_time;
            long qStartTime = lastPtime;
            // If the last processing time was more than one hour ago, ignore it and use data from 1hr window.
            if( (currTime-lastPtime) > (1.5*millisInHr) ) {
                // Exact 1hr window.
                qStartTime = currTime - millisInHr;
            }


            for (StationInfo station : stationInfoList) {

                // Get data for approximate window of one hour.
                List<DataSample> dataSample1Hr = queryIf.getDataForStation(station, SensorTypes.SoundNoise, qStartTime, currTime);
                System.out.println("App: Size of sensor data received within 1hr =" + dataSample1Hr.size());
                // If no samples for the hour, don't update any values.
                // TODO: review this condition.
                if(dataSample1Hr.size() == 0) 
                    continue;
                // start time is 7am of the day.

                // TODO: Fetch only incremental data. Currently fetching data from WORK_HRS_START_HR with every query.
                List<DataSample> dataHourlySample = queryIf.getHourlyDataForStation(station, SensorTypes.SoundNoise, workStartTimeMillis, currTime);
                System.out.println("App: Size of Leq1hr data received =" + dataHourlySample.size());

                // process the new list of 1hr data.
                //boolean result = processData.process4Station(startTime, hourNow, dataSample1Hr, dataHourlySample);
                List<Double> leq1hrResult = processData.process4Station(hoursFromStart, dataSample1Hr, dataHourlySample);
                //boolean result = processData.processAllStations(dataSample1Hr);
                //List<Double> leq1hrResult = processData.getResult(SensorTypes.SoundNoise);

                if( (leq1hrResult != null) && (leq1hrResult.size() > 0) ) {
                    System.out.println("App: Send SMS, update DB.");
                    // Send SMS message, if some threshold exceeded. Runs in separate thread.
                    // TODO: handle result.
                    //SendSMS.INSTANCE.sendMessage(leq1hrResult);
                    queryIf.updateResultsToDb(station, SensorTypes.SoundNoise, leq1hrResult);
                }
            }
            // Save the processing moment.
            last_processing_time = currentServerTime;
        }
    }
}
