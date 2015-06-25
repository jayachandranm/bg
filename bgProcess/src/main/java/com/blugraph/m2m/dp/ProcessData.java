package com.blugraph.m2m.dp;

import java.util.List;
import java.util.ArrayList;


public class ProcessData {
    List<Double> resLeq1hr;

    /*
    * Constructor. 
    */
    public ProcessData() {
        resLeq1hr = new ArrayList<Double>();
    }
   
    public List<Double> process4Station(double hoursFromStart, List<DataSample> dataSample1Hr, List<DataSample> dataHourlySample) {
        // Initialize to invalid values.
        double Leq12hr = -1.0;
        double predLeq5mtsMax = -1.0;
        double predLeq12hrs = -1.0;
        double dosePercentage = -1.0;
        resLeq1hr.clear();

        double Leq1hr = calcLeq1hr(dataSample1Hr);
        System.out.println("ProcessData: Leq1hr=" +Leq1hr);
        if(Leq1hr < 0) {
            // If an invalid Leq1hr, do not calculcate anything, just return an empty result object.
            return resLeq1hr;
        }
        // TODO: validate LEQ 1 HR result.
        int hoursRemaining = (int) ( AppGlobals.INSTANCE.WORK_HRS_LIMIT - (hoursFromStart+1) );

        if (hoursRemaining > 0) {
            // When dataHourlySample is empty, values will be calculated based on current value.
            predLeq12hrs =  getPredLeq12hr(hoursRemaining, Leq1hr, dataHourlySample);
            predLeq5mtsMax= getMaxLeq5mts(hoursRemaining, Leq1hr, dataHourlySample);
            dosePercentage = getDosePercentage(Leq1hr, dataHourlySample);
            // TODO: validate LEQ 12 HR result.
        } else if(hoursRemaining == 0) {
        // for the last slot, hoursRemaining=0
        // TODO: If this condition is missed, Leq12hr will never be updated.
            predLeq12hrs =  getPredLeq12hr(hoursRemaining, Leq1hr, dataHourlySample);
            Leq12hr = predLeq12hrs;
            dosePercentage = getDosePercentage(Leq1hr, dataHourlySample);
            predLeq5mtsMax = -1; // Not relevant anymore.
        } else if(hoursRemaining < 0) {
            //
            // TODO: If the code enters here after the WORK_END time is over, 
            // predicted value continues to remain same as 12hr value (default INVALID)).
            Leq12hr = predLeq12hrs;
            predLeq5mtsMax = -1; // Not relevant anymore.
        }

        System.out.println("ProcessData: Leq12hr=" +Leq12hr);
        System.out.println("ProcessData: predLeq12hrs=" +predLeq12hrs);
        System.out.println("ProcessData: predLeq5mtsMax=" +predLeq5mtsMax);
        System.out.println("ProcessData: dosePercentage=" +dosePercentage);

        resLeq1hr.add(Leq1hr);
        resLeq1hr.add(Leq12hr);
        resLeq1hr.add(predLeq12hrs);
        resLeq1hr.add(predLeq5mtsMax);
        resLeq1hr.add(dosePercentage);

        //return true;
        return resLeq1hr;
    }

    public double calcLeq1hr(List<DataSample> dataSample1Hr) {
        //
        double Leq1hr = -1.0;

        double partialSum = 0.0f;
        long sampleTime = 0;
        //double totalDurationMillis = 0.0;
        double totalDurationHrs = 0.0;

        // We expect at least 2 elements for processing.
        if(dataSample1Hr.size() < 2)
            return -1;

        for(DataSample sample : dataSample1Hr) {
            sampleTime = sample.getTimestamp();
            // Assume regular data, and the first sample to correspond to just prev 5mts interval.
/*
            // Skip processing the first value.
            // TODO: handle processing of first value. Use historic value from prev 1hr window?
            if(lastSampleTime == 0) {
                lastSampleTime = sampleTime;
                continue;
            }
*/
            double durationHr = 1.0;
/*
            long durationMillis = sampleTime - lastSampleTime;
            durationHr = (double)durationMillis/(1000.0*60.0*60.0);
*/
            // TODO: To keep it independent of rate, use time duration between samples.
            durationHr = AppGlobals.INSTANCE.SENSOR_UPDATE_FREQ/(60.0*60.0);
            totalDurationHrs += durationHr;

            double sampleValdB = sample.getVal();

            if(sampleValdB > AppGlobals.INSTANCE.LEQ5MTS_LIMIT) {
                String message = "LEQ 5mts value is above limit.";
                //SendSMS.INSTANCE.sendMessage(message);
            }

            partialSum += durationHr * Math.pow(10, sampleValdB/10);
            //System.out.println("ProcessData: getLeq1hr -> partialSum=" +partialSum);
        }

        // timestamp for last sample to first sample.
        //long totalDurationHrs = (sampleTime - startTime)/(1000*60*60);
        System.out.println("ProcessData: getLeq1hr -> totalDurationHrs=" +totalDurationHrs);
        totalDurationHrs = 1.0; // Expected to be close to 1hr.

        if(totalDurationHrs >0 ) {
            Leq1hr = 10 * Math.log10(partialSum / totalDurationHrs);
        } else {
            Leq1hr = -2;
        }

        return Leq1hr;
    }

    public double getPredLeq12hr(int hoursRemaining, double currLeq1hr, List<DataSample> dataHourlySample) {
        //
        double predLeq12hrs = -1.0;
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
        partialSum += hoursRemaining * Math.pow(10, currLeq1hr / 10);

        predLeq12hrs = 10 * Math.log10(partialSum/AppGlobals.INSTANCE.WORK_HRS_LIMIT);

        return predLeq12hrs;
    }

    public double getMaxLeq5mts(int hoursRemaining, double currLeq1hr, List<DataSample> dataHourlySample) {
        double maxLeq5mts = 0.0;
        double partialSum = 0.0;

        partialSum = AppGlobals.INSTANCE.WORK_HRS_LIMIT * Math.pow(10, AppGlobals.INSTANCE.LEQ12HR_LIMIT/10);

        for(DataSample sample : dataHourlySample) {
            double sampleValdB = sample.getVal();

            // - t1*(10^(L1/10)
            partialSum = partialSum - Math.pow(10, sampleValdB/10); // t1, t2, etc =1hr.
            //System.out.println("ProcessData: getMaxLeq5mts -> partialSum=" +partialSum);
        }

        // Update for this hour, using the recently calculated value.
        partialSum = partialSum - Math.pow(10, currLeq1hr/10);
        if(hoursRemaining > 0) {
            maxLeq5mts = 10 * Math.log10(partialSum / hoursRemaining);
        } else {
            maxLeq5mts = -2.0;
        }

        if(Double.isNaN(maxLeq5mts)) {
            maxLeq5mts = -2.0;
        }

        return maxLeq5mts;
    }

    public double getDosePercentage(double currLeq1hr, List<DataSample> dataHourlySample) {
        double dosePercentage = 0.0;
        double partialSum = 0.0;
        double powerRatio2Limit = 1.0;
        int durationHrs = 1;

        for(DataSample sample : dataHourlySample) {
            double sampleValdB = sample.getVal();
            powerRatio2Limit = Math.pow(10, (sampleValdB-AppGlobals.INSTANCE.LEQ12HR_LIMIT)/10 );
            durationHrs = 1; // Assumed every hour for now.

            // C1/T1+C2/T2+.., Tn = WORK_HRS_LIMIT/powerRation2Limit, C1,C2,..=durationHrs.
            partialSum = partialSum + (powerRatio2Limit*durationHrs/AppGlobals.INSTANCE.WORK_HRS_LIMIT);
            //System.out.println("ProcessData: getDosePercentage -> partialSum=" +partialSum);
        }

        // Update for this hour, based on recently calculated value.
        powerRatio2Limit = Math.pow(10, (currLeq1hr - AppGlobals.INSTANCE.LEQ12HR_LIMIT)/10 );
        partialSum = partialSum + (powerRatio2Limit*durationHrs/AppGlobals.INSTANCE.WORK_HRS_LIMIT);

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
