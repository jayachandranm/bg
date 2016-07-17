
#! /bin/bash
echo "Uploading Log File."
curl -X POST -T /var/log/syslog.1 https://logs-01.loggly.com/bulk/212069f8-45ba-440c-90c0-34b06bda43f8/tag/file_upload
echo "Log File uploaded."

