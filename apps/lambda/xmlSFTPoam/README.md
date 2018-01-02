Use virtualenv to install necessary python packages.  

Then copy over the required packages to zipall directory, edit the main file and zip for lambda.  

sudo pip install virtualenv  
sudo pip install --upgrade pip  
rm -rf wsftp-env/  
virtualenv wsftp-env  
sudo yum groupinstall "Development tools" -y  
sudo yum install libffi-devel  
sudo yum install openssl-devel  
source wsftp-env/bin/activate  
pip install pycrypto  
pip install paramiko  
pip install pytz  
pip install lxml  
deactivate  
--  
cp -rf wsftp-env/lib/python2.7/site-packages/* zipall/.  
cp -rf wsftp-env/lib64/python2.7/site-packages/* zipall/.  
cd zipall/  
edit config.json  
(Filename for OMS is in UTC)  
zip -r oms_xmlftp.zip *  
edit config.json  
(Change IP address and directory for STORM)  
zip -r storm_csvftp.zip *  

