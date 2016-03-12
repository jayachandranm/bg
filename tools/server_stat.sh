#!/bin/bash
#
#
######################################################################

WPA_DIR="/etc/wpa_supplicant"
WPA_FILE="wpa_supplicant.conf"

# Check server status, also used as HTTP keepalive for server. key=val
curl "http://myhost.com/getstatus.php"| sed 's/\(.*\)=\(.*\)/\1 \2/' | while read key val; do echo $key#$val; done

function change_wifi_pass() {
    # keep backup of current supplicant file.
    now=`date +"%m_%d_%Y"`
    bkup_file="wpa_supplicant_conf_$now"
    cp "$WPA_DIR/$WPA_FILE" "$WPA_DIR/$bkup_file"
    # update wifi info.
    # https://blog.ergatides.com/2012/01/24/using-sed-to-search-and-replace-contents-of-next-line-in-a-file/
    # http://stackoverflow.com/questions/9063730/how-to-change-a-word-in-a-file-with-linux-shell-script
    # AWK option, http://www.unix.com/unix-for-dummies-questions-and-answers/37430-replace-password-field-using-ed-sed.html
    sed -i -r "/BGWIFI/I{n; s/.*/\    psk="$1"/}" /etc/wpa_supplicant/wpa_supplicant.conf
}


if ["$key" == "pw"]; then
    # pass change.
    change_wifi_pass "$val"
    # restart connection (will be done by the reset_wifi.sh later). 
    #It will take some time for pass change to happen on server side.
elif ["$key" == "hello"]; then
    #echo "Hello"
else
    echo "Unknown key."
fi



