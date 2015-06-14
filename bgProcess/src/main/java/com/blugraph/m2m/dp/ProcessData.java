package com.blugraph.m2m.dp;

import java.util.List;
import java.util.ArrayList;


public class ProcessData {
    List<Double> resLeq1hr;
    private static final double LEQ12HR_LIMIT = 75.0;
    private static final double LEQ5MTS_LIMIT = 90.0;
    private static final int WORK_HRS_LIMIT = 12;

    /*
    * Constructor. 
    */
    public ProcessData() {
        resLeq1hr = new ArrayList<Double>();
    }

    //public boolean process4Station(long startTime, int hourNow, List<DataSample> dataSample1Hr, List<DataSample> dataHourlySample) {
    public List<Double> process4Station(long startTime, int hourNow, List<DataSample> dataSample1Hr, List<DataSample> dataHourlySample) {
        //
        double Leq12hr = 0.0;
        resLeq1hr.clear();

        double Leq1hr = getLeq1hr(dataSample1Hr);
        System.out.println("ProcessData: Leq1hr=" +Leq1hr);

        int hoursRemaining = 19 - (hourNow+1);

        double predLeq12hrs =  getPredLeq12hr(hoursRemaining, Leq1hr, dataHourlySample);
        System.out.println("ProcessData: predLeq12hrs=" +predLeq12hrs);
        // for the last slot, hoursRemaining=0
        if(hoursRemaining ==0) {
            //
            Leq12hr = predLeq12hrs;
            System.out.println("ProcessData: Leq12hr=" +Leq12hr);
        } else {
            Leq12hr = -1;
        }

        double predLeq5mtsMax= getMaxLeq5mts(hoursRemaining, Leq1hr, dataHourlySample);
        System.out.println("ProcessData: predLeq5mtsMax=" +predLeq5mtsMax);

        double dosePercentage = getDosePercentage(Leq1hr, dataHourlySample);
        System.out.println("ProcessData: dosePercentage=" +dosePercentage);

        resLeq1hr.add(Leq1hr);
        resLeq1hr.add(Leq12hr);
        resLeq1hr.add(predLeq12hrs);
        resLeq1hr.add(predLeq5mtsMax);
        resLeq1hr.add(dosePercentage);

        //return true;
        return resLeq1hr;
    }

    public double getLeq1hr(List<DataSample> dataSample1Hr) {
        //
        double Leq1hr = 0.0;

        double partialSum = 0.0f;
        long sampleTime = 0;
        long lastSampleTime = 0;
        //double totalDurationMillis = 0.0;
        double totalDurationHrs = 0.0;

        // We expect at least 2 elements for processing.
        if(dataSample1Hr.size() < 2)
            return -1;

        for(DataSample sample : dataSample1Hr) {
            sampleTime = sample.getTimestamp();
            // Skip processing the first value.
            // TODO: handle processing of first value. Use historic value from prev 1hr window?
            if(lastSampleTime == 0) {
                lastSampleTime = sampleTime;
                continue;
            }
            long durationMillis = sampleTime - lastSampleTime;
            double durationHr = (double)durationMillis/(1000.0*60.0*60.0);
            durationHr = 5.0/60.0; // assuming sensor update is every 5mts.
            totalDurationHrs += durationHr;
            lastSampleTime = sampleTime;
            double sampleValdB = sample.getVal();

            if(sampleValdB > LEQ5MTS_LIMIT) {
                String message = "-";
                //SendSMS.INSTANCE.sendMessage(message);
            }

            partialSum += durationHr * Math.pow(10, sampleValdB/10);
            //System.out.println("ProcessData: getLeq1hr -> partialSum=" +partialSum);
        }

        // timestamp for last sample to first sample.
        //long totalDurationHrs = (sampleTime - startTime)/(1000*60*60);
        System.out.println("ProcessData: getLeq1hr -> totalDurationHrs=" +totalDurationHrs);
        totalDurationHrs = 1.0; // Expected to be close to 1hr.

        Leq1hr = 10 * Math.log10(partialSum)/totalDurationHrs;

        return Leq1hr;
    }

    public double getPredLeq12hr(int hoursRemaining, double currLeq1hr, List<DataSample> dataHourlySample) {
        //
        double predLeq12hrs = 0.0;
        double partialSum = 0.0;

        // TODO: Generalize for the case where the duration between values is not fixed to 1hr.
        for(DataSample sample : dataHourlySample) {
            double durationHr = 1;
            double sampleValdB = sample.getVal();

            partialSum += durationHr * Math.pow(10, sampleValdB/10);
            //System.out.println("ProcessData: getPredLeq12hr -> partialSum=" +partialSum);
        }

        // Update for current hour.
        partialSum += Math.pow(10, currLeq1hr/10);
        // If value continues till end of day based on current hour.
        partialSum += hoursRemaining * Math.pow(10, currLeq1hr/10);

        predLeq12hrs = 10 * Math.log10(partialSum)/WORK_HRS_LIMIT;

        return predLeq12hrs;
    }

    public double getMaxLeq5mts(int hoursRemaining, double currLeq1hr, List<DataSample> dataHourlySample) {
        double maxLeq5mts = 0.0;
        double partialSum = 0.0;

        double partialComA = Math.pow(10, (LEQ12HR_LIMIT*WORK_HRS_LIMIT)/10);

        for(DataSample sample : dataHourlySample) {
            double sampleValdB = sample.getVal();

            // - t1*(10^(L1/10)
            partialSum = partialSum - Math.pow(10, sampleValdB/10); // t1, t2, etc =1hr.
            //System.out.println("ProcessData: getMaxLeq5mts -> partialSum=" +partialSum);
        }
        maxLeq5mts = 10 * Math.log10( (partialComA + partialSum)/hoursRemaining);

        return maxLeq5mts;
    }

    public double getDosePercentage(double currLeq1hr, List<DataSample> dataHourlySample) {
        double dosePercentage = 0.0;
        double partialSum = 0.0;

        for(DataSample sample : dataHourlySample) {
            double sampleValdB = sample.getVal();

            double powerRatio2Limit = Math.pow(10, (sampleValdB-LEQ12HR_LIMIT)/10);

            int durationHrs = 1; // Assumed every hour for now.

            // C1/T1+C2/T2+.., Tn = WORK_HRS_LIMIT/powerRation2Limit, C1,C2,..=durationHrs.
            partialSum = partialSum + (powerRatio2Limit*durationHrs/WORK_HRS_LIMIT);
            //System.out.println("ProcessData: getDosePercentage -> partialSum=" +partialSum);
        }

        dosePercentage = partialSum * 100;
        return dosePercentage;
    }

    public boolean processAllStations(List<DataSample> dataSample1Hr) {
        //
        //List<DataSample> sensorDataList = dataSample1Hr.getDataList(SensorTypes.SoundNoise);

        return true;
    }

    public List<Double> getResult(SensorTypes vType) {
        //
        switch (SensorTypes.values()[vType.ordinal()]) {
            case SoundNoise:
                return resLeq1hr;
/*
            case WaterLevel:
                return resLeq1hr;
            case Location:
                return resLeq1hr;
            case Video:
                return resLeq1hr;
*/
            default:
                System.out.println("Unknown Sensor Type.");
                return null;
        }

    }

}
