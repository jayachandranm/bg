from __future__ import print_function
import boto3
import json

s3rc = boto3.resource('s3')
s3client = boto3.client('s3')

#with open("../xmlSFTPoam/station-ids.json") as json_file:
#    try:
#        json_data = json.load(json_file)
#    except:
#        print("Error loading JSON file.")

#stations = json_data['stations']

bucket_name = 'pubc5wl'

# List objects for each station-id.
# Rearrange the name.
# Copy and delete old.
#for sid in stations:
#    print(sid)

res = s3client.list_objects_v2(
    Bucket='pubc5wl',
    Delimiter='-',
    Prefix='sms_log/'
)


for obj in res['CommonPrefixes']:
    prefix = obj['Prefix']
    if "WWS001" in prefix:
        print("--------------------")
        print(prefix)
        res = s3client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=prefix
        )

        for obj in res['Contents']:
            objkey = obj['Key']
            once = objkey.split('/')
            num_elem = len(once)
            if (num_elem == 2):
                newkey = 'sms_log/reports/' + once[1]
                print(newkey)
                src = bucket_name + '/' + objkey
                s3rc.Object(bucket_name, newkey).copy_from(CopySource=src)

