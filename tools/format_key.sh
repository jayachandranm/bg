#!/bin/sh
awk 'NF {sub(/\r/, ""); printf "%s\\n", $0;}' *private.pem.key > pr_key_str.txt

