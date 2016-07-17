
#! /bin/bash

case "$(pgrep -f sense.py | wc -w)" in

0)  echo "Restarting Sensor"
    sudo python /home/arkbg/dev/sense_2.py
    ;;
*)  echo "Sensor is  already running"
        
    ;;
esac


