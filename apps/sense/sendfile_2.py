import os
import time
from os import listdir
from os.path import isfile, join
import glob, os
import requests

file_list=[]
tofile=[]
tofilen=[]

dir_name= "/home/arkbg/dev/"+time.strftime("%Y-%m-%d")

os.chdir(dir_name)
for file in glob.glob("*.txt"):
    file_list.append(file)

print "There are " + str(len(file_list)) + " files in the directory"

#print file_list
tnow = time.strftime("%Y-%m-%d %H:%M:%S")

if len(file_list) > 0:
	print tnow,": There are files to be uploaded."

for k in range(0,len(file_list)):
        try:
		try:
#			print file_list[k]
			with open(file_list[k],'r') as f:
#				print "File opened for reading."
				tofile_json = f.read()
		except:
			print tnow,": The file can not be read"
		
		try:		
#               	r1 = requests.put("http://172.18.53.42:81/BluIEQ/sensordata.php", data=json.dumps(payload), timeout=0.1)
	               	r1 = requests.put("http://172.18.53.42:81/BluIEQ/sensordata.php", data=tofile_json, timeout=0.1)
#                	r1 = requests.put("http://52.74.191.39/BluIEQ/sensordata.php", data=tofile_json, timeout=0.1)
#                	print r1.status_code
			del tofile[:]
			try:
			        os.remove(file_list[k])
			except OSError, e:  ## if failed, report it back to the user ##
        			print ("Error: %s - %s." % (e.filename,e.strerror))
				
		except:
 	               print tnow,": Network Failed Error:"
        except:
                print tnow,": File Error"
