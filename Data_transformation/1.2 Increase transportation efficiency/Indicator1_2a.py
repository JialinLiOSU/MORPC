#Increase Transportation Efficiency :drove alone
#mutiple year, need transform year by year
#Input: one year dict
#output:Region and County level table in pecentage
'''
region:
year	Drove	        Carpool	     Pub_Transic	Bicycle	        Walk	      Work_Home
							
2009	0.828347	0.084210	0.014331	0.003688	0.021151	0.040326
2010	0.825412	0.084372	0.014711	0.003865	0.022635	0.041316

county:
Drove	        Carpool	        Pub_Transic	Bicycle	        Walk	        Work_Home	id	year
0.839148	0.066992	0.003396	0.000816	0.012247	0.067065	39041	2009
0.844835	0.086532	0.002903	0.000963	0.015282	0.043875	39045	2009
'''
import pandas as pd
import numpy as np
import os
import datetime
def indicator1_2a(dfs):
    df1 = pd.DataFrame(dfs[0]['data'])
    df1['year'] = dfs[0]['created_at'].year
    df1['state']= df1['state'].astype('str')
    df1['county']= df1['county'].astype('str')
    df1['county'] = df1['county'].apply(lambda x: x.zfill(3))
    df1['id'] = df1['state']+df1['county']
    #print(df1['id'])
    test = df1.loc[df1['id'].isin(['39101','39091', '39159', '39097', '39047', '39041','39117', '39049','39129','39141','39083', '39089','39045', '39127', '39073'])]
    #print(len(test))
    #select required data,change name and data type
    selectdf = test.loc[:,['b08301_001e','b08301_003e','b08301_004e','b08301_010e','b08301_018e','b08301_019e','b08301_021e','id','year']]
    selectdf.rename(columns={'b08301_001e':'tot',
                        'b08301_003e':'drove',
                         'b08301_004e':'carpool',
                         'b08301_010e':'pub_transic',
                         'b08301_018e':'bicycle',
                         'b08301_019e':'walk',
                         'b08301_021e':'work_home'}, inplace=True)
    selectdf['tot']= selectdf['tot'].astype('float')
    selectdf[ 'drove']= selectdf['drove'].astype('float')
    selectdf['carpool']= selectdf['carpool'].astype('float')
    selectdf['pub_transic']= selectdf['pub_transic'].astype('float')
    selectdf['bicycle']= selectdf['bicycle'].astype('float')
    selectdf['walk']= selectdf['walk'].astype('float')
    selectdf['work_home']= selectdf['work_home'].astype('float')

    #organized data
    #region
    region = selectdf.groupby(['year']).sum()
    final_region = region[['drove']].div(region.tot, axis=0)
    final_region = final_region.reset_index()
    #county
    county = selectdf.drop(['carpool','pub_transic','bicycle','walk','work_home'],axis = 1)
    county[['drove']] = county[['drove']].div(county.tot, axis=0)
    final_county = county.drop('tot', axis=1)
    print('Indicator 1.2a finished process for year '+ str(dfs[0]['created_at'].year))
    return final_region,final_county

'''def test1_2(excel_file):
    df1 = pd.read_excel(excel_file)
    df1.rename(columns=lambda x: str(x).lower().replace(' ', '_').strip(), inplace=True)
    data = df1.to_dict('records')
    data_dict = [{
        'name': '2010',

        'schema_name': '2010_schema',

        'schema_version': '1.0',

        'created_at': datetime.datetime(2010, 2, 28, 11, 0, 0, 447019),

        'data': data
        }]
    return data_dict
            
if __name__== "__main__":
    data_dict = test1_2(r'data\2010.xlsx')
    region,county = indicator1_2a(data_dict)'''
    
                  
    


        
        
    
