import json
import pandas as pd
from datetime import datetime
from datetime import timedelta

with open("rlevel_stations.json") as json_file:
    try:
        json_data = json.load(json_file)
    except:
        print("Error loading JSON file.")

#print(json_data)

dev_states = json_data['dev_state'] 
sids = dev_states.keys()

dev_states_new = {}
dev_states_new['dev_state'] = {} 

id_map = pd.read_csv('rlevel_comms_dates.csv', header=None, dtype={0: str}).set_index(0).squeeze().to_dict()

for sid in sids:
    dev_state_sid = dev_states[sid]
    print(dev_state_sid)
    comms_dt = datetime.strptime(id_map[sid], '%m/%d/%y')
    st_date = comms_dt + timedelta(days=1)
    comms_dt_str = comms_dt.strftime('%d-%m-%Y')
    dev_state_sid["comms_dt"] = comms_dt_str
    #
    dev_states_new['dev_state'][sid] = dev_state_sid

with open('rlevl_stations_new.json', 'w') as outfile:  
    json.dump(dev_states_new, outfile, indent=4)
