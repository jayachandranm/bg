from __future__ import print_function

import os
from StringIO import StringIO

import boto3
import paramiko

import json

PRIVATE_KEY = ''

# default values based on config.
# will be overwritten based on Lambda ENV VAR settings.
with open("config.json") as config_json_file:
    try:
        config = json.load(config_json_file)
    except:
        print("Error loading config JSON file.")

config_host = config['host']
config_port = config['port']
config_user = config['user']
config_pass = config['pass']
config_dir = config['remote_dir']

def lambda_handler(event, context):
    #ssh_username = os.environ['SSH_USERNAME']
    #ssh_host = os.environ['SSH_HOST']
    #ssh_dir = os.environ['SSH_DIR']
    ssh_host = os.environ.get('SSH_HOST', config_host)
    ssh_username = os.environ.get('SSH_USERNAME', config_user)
    ssh_password = os.environ.get('SSH_PASSWORD', config_pass)
    #ssh_dir = os.environ.get('SSH_DIR', config_dir)
    ssh_dir = os.environ.get('SSH_DIR')
    ssh_port = int(os.environ.get('SSH_PORT', config_port))
    key_filename = os.environ.get('SSH_KEY_FILENAME', 'key.pem')

    #pkey = paramiko.RSAKey.from_private_key(StringIO(PRIVATE_KEY))

    if not os.path.isfile(key_filename):
        key_filename = None

    sftp, transport = connect_to_SFTP(
        hostname=ssh_host,
        port=ssh_port,
        username=ssh_username,
        password=ssh_password
        #password=ssh_password,
        #pkey=pkey
    )
    s3 = boto3.client('s3')

    if ssh_dir:
        try:
            sftp.chdir(ssh_dir)
            print("Changed remote to: " + ssh_dir)
        except:
            print("chdir failure") 

    with transport:
        for record in event['Records']:
            #print(record)
            uploaded = record['s3']
            filename = uploaded['object']['key'].split('/')[-1]

            try:
                transfer_file(
                    s3_client=s3,
                    bucket=uploaded['bucket']['name'],
                    key=uploaded['object']['key'],
                    sftp_client=sftp,
                    sftp_dest=filename
                )
            except Exception:
                print('Could not upload file to SFTP')
                raise

            else:
                print('S3 file "{}" uploaded to SFTP successfully'.format(
                    uploaded['object']['key']
                )
                )


#def connect_to_SFTP(hostname, port, username, password, pkey):
def connect_to_SFTP(hostname, port, username, password):
    try:
        transport = paramiko.Transport((hostname, port))
        transport.connect(
            username=username,
            password=password
            #password=password,
            #pkey=pkey
        )
        print("Connected to remote server.")
    except:
        print("SSH connect Error.")
    try:
        sftp = paramiko.SFTPClient.from_transport(transport)
        print("SFTP client created.")
    except paramiko.SSHException:
        print("Error in creating sftp client.")

    return sftp, transport


def transfer_file(s3_client, bucket, key, sftp_client, sftp_dest):
    """
    Download file from S3 and upload to SFTP
    """
    with sftp_client.file(sftp_dest, 'w') as sftp_file:
        s3_client.download_fileobj(
            Bucket=bucket,
            Key=key,
            Fileobj=sftp_file
        )

