package com.blugraph.m2m.dp;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.List;

/**
 * Created by mjay on 6/12/15.
 */
public enum SendSMS {
    INSTANCE;

    private String authname="API8C3H7EVPER";
    private String authpass="API8C3H7EVPER8C3H7";
    private String urlAPI = "http://gateway.onewaysms.sg:10002/api.aspx";
    private String phnum = "12345678";
    private String sid = "BG Tech";
    private String msg = "Test Message";

    private String baseUrl = urlAPI;

    public void SendSMS() {
        // Init with URL.
        baseUrl = urlAPI + "?"
                + "apiusername=" + authname + "&"
                + "apipassword=" + authpass + "&"
                + "mobileno=" + phnum + "&"
                + "senderid=" + sid + "&"
                + "languagetype" + "1"; // normal 160 char message.
    }

    public boolean sendMessage(List<Double> leq1hrResult) {
        //
        return true;
    }

    public boolean sendMessage(String message) {
        //
        msg=message;
        deliverSMS(msg);
        return true;
    }

    private void deliverSMS(String sMsg) {
        //String sMsg = "test sms from api";
        // "http://sample.onewaysms.com.au:xxxx/api.aspx?apiusername=xyz&apipassword=xyz
        // &mobileno=6141234567&senderid=onewaysms&languagetype=1&message="
        String sURL =  baseUrl + "&message=" + URLEncoder.encode(sMsg);
        String result = "";
        HttpURLConnection conn = null;
        try  {
            URL url = new URL(sURL);
            conn = (HttpURLConnection)url.openConnection();
            conn.setDoOutput(false);
            conn.setRequestMethod("GET");
            conn.connect();
            int iResponseCode = conn.getResponseCode();
            if ( iResponseCode == 200 ) {
                BufferedReader oIn = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                String sInputLine = "";
                String sResult = "";
                while ((sInputLine = oIn.readLine()) != null) {
                    sResult = sResult + sInputLine;
                }
                if (Long.parseLong(sResult) > 0)
                {
                    System.out.println("success - MT ID : " + sResult);
                }
                else
                {
                    System.out.println("fail - Error code : " + sResult);
                }
            }
            else {
                System.out.println("fail ");
            }
        }
        catch (Exception e){
            e.printStackTrace();
        }
        finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }
}
