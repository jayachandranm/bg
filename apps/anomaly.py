import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
#import luminol as ll
from luminol import anomaly_detector

cws022 = pd.read_csv('CWS022_201905.csv')
c022d = cws022.drop(cws022.index[0:6])
c022d.drop(c022d.columns[[2,3,4]], axis=1, inplace=True)
c022d.columns = ['date','depth']
#c022d['date']=pd.to_datetime(c022d.date)
#c022d['date']=pd.to_datetime(c022d.date, format='%d/%m/%Y %H:%M')
c022d.index=pd.to_datetime(c022d.date, format='%d/%m/%Y %H:%M')
c022d.drop(columns=['date'], axis=1, inplace=True)
plt.plot(c022d['date'],c022d['depth'])
detector = anomaly_detector.AnomalyDetector(c022d_dict['depth'])
#c022d.set_index('date')
#c022d.plot()

cws022 = pd.read_csv('CWS022_201905.csv')
c022r = cws022.drop(cws022.index[0:6])
c022r.drop(c022r.columns[[1,2,4]], axis=1, inplace=True)
c022r.columns = ['date','change']
