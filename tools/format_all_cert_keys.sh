#!/bin/sh
curdir=$(pwd)
echo $curdir;
for f in $curdir/*;
  do 
     [ -d $f ] && cd "$f" 
     #echo Entering into $f and running cmd
     #echo Second Entering into $f and running cmd
     awk 'NF {sub(/\r/, ""); printf "%s\\n", $0;}' *.pem.crt > cert_str.txt
     awk 'NF {sub(/\r/, ""); printf "%s\\n", $0;}' *private.pem.key > pr_key_str.txt
  done;

