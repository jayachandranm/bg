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
deactivate  

cp -rf wsftp-env/lib/python2.7/site-packages/* zipall/.  
cp -rf wsftp-env/lib64/python2.7/site-packages/* zipall/.  
cd zipall/  
zip -r wsxmlftp.zip *  
