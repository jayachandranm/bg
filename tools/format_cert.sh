#!/bin/sh
awk 'NF {sub(/\r/, ""); printf "%s\\n", $0;}' *.pem.crt > cert_str.txt

