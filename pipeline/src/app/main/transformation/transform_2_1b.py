import pandas as pd
import sys
import pickle
import datetime

#pm2.5:year by year ingestion
def Indicator2_1b(data_dic):
    '''
        input:[
            data_dict: {

                'name': 'approved_facilities'

                'schema_name': 'approved_facilities_schema',

                'schema_version': '1.0',

                'created_at': datetime.datetime(2020, 2, 28, 11, 0, 0, 447019)

                'data': [{



                                },

                    ]}

                ]
        output: region: region table
                county_result: county table
    '''
    #read data from dict
    df1 =  pd.DataFrame(data_dic[0]['data'])
    df1['state_code'] = df1['state_code'].astype('str')
    df1['state_code'] = df1['state_code'].apply(lambda x: x.zfill(2))
    df1['county_code']= df1['county_code'].astype('str')
    df1['county_code'] = df1['county_code'].apply(lambda x: x.zfill(3))
    df1['id'] = df1['state_code']+df1['county_code']
    #select ohio region and sepcific columns
    df_oh = df1.loc[(df1['id'].isin(['39101','39091', '39159', '39097', '39047', '39041','39117', '39049', \
                                    '39129','39141','39083', '39089','39045', '39127', '39073'])) & (df1['first_max_value'] > 35.4), \
                                    ['id','first_max_value','date_local']].copy()

    #transform value to category
    if len(df_oh)!= 0:
        df_oh.loc[(df_oh['first_max_value'] >35.4) & (df_oh['first_max_value'] <= 55.4), 'aqi_category'] = "unhealthy_for_sensitive_groups"
        df_oh.loc[(df_oh['first_max_value'] >55.4) & (df_oh['first_max_value'] <= 150.4), 'aqi_category'] = "unhealthy"
        df_oh.loc[df_oh['first_max_value'] >150.4 , 'aqi_category'] = "very_unhealthy"

        process = df_oh.drop_duplicates(subset=['id','date_local'], keep="last").copy()

        process.loc[:,'year'] = data_dic[0]['created_at'].year
        process.loc[:,'count'] = 1

        #region
        region = process.groupby(['year','aqi_category'],as_index = False)['count'].sum()
        region_final = region.pivot(index='year', columns='aqi_category', values='count').fillna(0)
        region_final.reset_index(inplace=True)

        if 'unhealthy_for_sensitive_groups' not in region_final.columns:
            region_final['unhealthy_for_sensitive_groups']=0
        if 'unhealthy' not in region_final.columns:
            region_final['unhealthy'] = 0
        if 'very_unhealthy' not in region_final.columns:
            region_final['very_unhealthy'] = 0
        region_final = region_final[['year', 'unhealthy_for_sensitive_groups','unhealthy','very_unhealthy']]

        #county
        county = process.groupby(['year','aqi_category','id'],as_index = False)['count'].sum()
        county_final = county.pivot_table(index=['id','year'], columns='aqi_category', values='count').fillna(0)
        county_final.reset_index(inplace=True)
        if 'unhealthy_for_sensitive_groups' not in county_final.columns:
            county_final['unhealthy_for_sensitive_groups']=0
        if 'unhealthy' not in county_final.columns:
            county_final['unhealthy'] = 0
        if 'very_unhealthy' not in county_final.columns:
            county_final['very_unhealthy'] = 0
        county_final = county_final[['id','year', 'unhealthy_for_sensitive_groups','unhealthy','very_unhealthy']]
    else:
        #year didn't contain data
        region_final = pd.DataFrame(columns = ['year', 'unhealthy_for_sensitive_groups','unhealthy','very_unhealthy'])
        county_final = pd.DataFrame(columns = ['id','year', 'unhealthy_for_sensitive_groups','unhealthy','very_unhealthy'])

    print('Indicator2.1b transform success for year ' + str(data_dic[0]['created_at'].year))
    return region_final, county_final

'''def test(excel_file):
    #read data
    df1 = pd.read_excel(excel_file)
    # transform col name and Type into lower charactors without space
    
    df1.rename(columns=lambda x: str(x).lower().replace(' ', '_').strip(), inplace=True)
    #print(df1.head())
    data = df1.to_dict('records')

    data_dict = [{
        'name': 'pm2000',

        'schema_name': 'pm2000_schema',

        'schema_version': '1.0',

        'created_at': datetime.datetime(2000, 2, 28, 11, 0, 0, 447019),

        'data': data
        }]
    return data_dict

if __name__ == '__main__':
    #with open("output_list.pkl", "rb") as fp:
        #b = pickle.load(fp)
    data_dict = test('pm2000.xlsx')
    region,county = Indicator2_1b(data_dict)'''
