from __future__ import print_function
import boto3

s3rc = boto3.resource('s3')
s3client = boto3.client('s3')

with open("station-ids.json") as json_file:
    try:
        json_data = json.load(json_file)
    except:
        print("Error loading JSON file.")

stations = json_data['stations']

# List objects for each station-id.
# Rearrange the name.
# Copy and delete old.
for sid in stations:
    print(sid)

res = s3client.list_objects_v2(
    Bucket='pubc5wl',
    Delimiter='-',
    Prefix='CWS001',
)

print(res)

#s3rc.Object('my_bucket','my_file_new').copy_from(CopySource='my_bucket/my_file_old')
#s3rc.Object('my_bucket','my_file_old').delete()
