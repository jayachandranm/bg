from __future__ import print_function
import boto3

s3 = boto3.resource('s3')

# List objects for each station-id. 
# Rearrange the name.
# Copy and delete old.

s3.Object('my_bucket','my_file_new').copy_from(CopySource='my_bucket/my_file_old')
s3.Object('my_bucket','my_file_old').delete()
