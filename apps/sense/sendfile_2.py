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

if len(file_list)==0:
	print "There are no files in the directory"

for k in range(0,len(file_list)):
        try:
#		f = open(file_list[k], 'r')
#		tofile.append=f.read()
		try:
#			for line in f:
#    				tofile.append(line.rstrip('\n').rstrip('"'))
			print file_list[k]
#			with open(file_list[k],'rU') as f:
			with open(file_list[k],'r') as f:
#				print "Reading File"
#    				tofile = jason.dumps(f.read().splitlines())	
#				tofile= f.read().splitlines()
				print "File opened for reading."
#				tofile_json = json.load(f)
				tofile_json = f.read()
#			for l in range (0,len(tofile)):
#				tofilen[l]=json.dumps(tofile[l])
#			print tofilen	
#			print json.dumps(tofile[0])
#			print "*****"
#			print tofile_json
#			print "============"
#			print json.dumps(tofile[0])
#			with open(file_list[k], 'r') as f:
#				tofile.append(f.readlines())
#				print line	
#			with open(file_list[k], 'r') as f:
#			    	tofile = [line.strip() for line in f]
		except:
			print "The file can not be read"
		
		try:		
#			print tofile
#               	r1 = requests.put("http://172.18.53.42:81/BluIEQ/sensordata.php", data=json.dumps(payload), timeout=0.1)
#	               	r1 = requests.put("http://172.18.53.42:81/BluIEQ/sensordata.php", data=tofile_json, timeout=0.1)
                	r1 = requests.put("http://52.74.191.39/BluIEQ/sensordata.php", data=tofile_json, timeout=0.1)
                	print r1.status_code
#                	print r1.content
			del tofile[:]
			try:
			        os.remove(file_list[k])
			except OSError, e:  ## if failed, report it back to the user ##
        			print ("Error: %s - %s." % (e.filename,e.strerror))
				
		except:
 	               print "Network Failed Error:"
        except:
                print "File Error"
