import os
from StringIO import StringIO
import boto3
import paramiko
import sys, paramiko


def lambda_handler(event, context):
    hostname = "52.220.188.123"
    source = os.environ['LAMBDA_TASK_ROOT'] + "/test.txt"
    dest = "/home/ubuntu/xfiles/test.txt"
    key_filename = os.environ['LAMBDA_TASK_ROOT'] + "/lx_sg1.pem"
    user = "ubuntu"
    port = 22
    print "Reached so far only"
    key_filename = paramiko.RSAKey.from_private_key_file(key_filename)

    try:
        t = paramiko.Transport(hostname, port)
        print t
        t.connect(username=user, pkey=key_filename)
        print "Connected"
        try:
            sftp = paramiko.SFTPClient.from_transport(t)
            print sftp
        except paramiko.SSHException:
            print "Connection Error"
        file = sftp.file(dest, "w", -1)
        #    file.write('Hello World!\n')
        wl = str(7.3)
        file.write("<waterlevel>" + wl + "</waterlevel>" + '\n')
        fl = str(0)
        file.write("<flag>" + fl + "</flag>" + '\n')
        tm = "2010-12-09 00:26:03"
        file.write("<observation_time>" + tm + "</observation_time>" + '\n')
        sid = "WWS001"
        file.write("<station_id>" + sid + "</station_id>" + '\n')
        loc = "Boon Lay Way"
        file.write("<desc>" + loc + "</desc>" + "\n")

        file.flush()
        print "Print completed"
        #    sftp.put(source, dest)
        print "Transfer completed"
    except OSError:
        pass
