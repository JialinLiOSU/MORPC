import json
import numpy as np
import random
import geojson 
path='C:\\Users\\jiali\\Desktop\\MORPC\\data\\CountiesofOhio.geojson'

with open(path) as data_file:
    data = json.load(data_file)

variableNames=['a','b','c','d','e','f']

# feature_collection = geojson.FeatureCollection(data)
for feature in data['features']:
    propertyList=[]
    for j in range(6):
        randNums=[]
        for i in range(6):
            dic_temp={variableNames[i]:random.randint(1,101)}
            randNums.append(dic_temp)
        propertyList.append(randNums)
    feature['properties']['2012']=propertyList[0]
    feature['properties']['2013']=propertyList[1]
    feature['properties']['2014']=propertyList[2]
    feature['properties']['2015']=propertyList[3]
    feature['properties']['2016']=propertyList[4]
    feature['properties']['2017']=propertyList[5]
  
# data = {}  
# data['num_veh'] = []  
# for i in range(len(num_veh_list)):
#     data['num_veh'].append({  
#         'index_cam': i,
#         'number_veh': num_veh_list[i]
#     })

with open('CountiesofOhioModified.geojson', 'w') as outfile:  
    json.dump(data, outfile)

