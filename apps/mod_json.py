import json
import pandas as pd

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

id_map = pd.read_csv('c3fl_id_map.csv', header=None, dtype={0: str}).set_index(0).squeeze().to_dict()

for sid in sids:
    dev_state_sid = dev_states[sid]
    print(dev_state_sid)
    dev_state_sid["sn"] = id_map[sid]
    #
    dev_states_new['dev_state'][sid] = dev_state_sid

with open('rlevel_stations.json', 'w') as outfile:  
    json.dump(dev_states_new, outfile, indent=4)
