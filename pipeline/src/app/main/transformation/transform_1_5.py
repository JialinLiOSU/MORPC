import pandas as pd
import requests
import json
import timeit
from app.main.transformation import county_code


def coor2county(row):
     try:
         url= "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&featureTypes=&location={}%2C{}".format(row['longitude'],row['latitude'])

         response = requests.get(url)
        #print(response.json)
     except requests.exceptions:
         return ''
     else:
         data = response.json()
         if (response.status_code == 200)and (data['address'] != []):

             return data["address"]['Subregion']
            #return data
         else:
             return ''



def Indicator1_5(data_dic):
    '''
        output: region: region table
                county_result: county table
    '''
    #read data from dict
    #pd.options.mode.chained_assignment = None
    df1 =  pd.DataFrame(data_dic[0]['data'])
    df1['fuel_type_code'] = df1.fuel_type_code.str.lower().str.replace(' ', '_').str.strip()
    #add year and filter with Ohio
    df1.loc[:,'year']=pd.to_datetime(df1['open_date']).dt.year
    df_oh = df1.loc[(df1.state == 'OH') & (df1.year >=2012),['year', 'latitude','longitude','fuel_type_code']].copy()

    df_oh.drop_duplicates(keep='first',inplace=True)
    df_oh.dropna(inplace=True)
    #geocode
    start = timeit.default_timer()
    df_oh['county'] = df_oh.apply(coor2county, axis=1)
    stop = timeit.default_timer()
    print('GEOCODE FINSIHED, TIME SPENT:',stop - start)
    #Data cleaning
    #print(df_oh['county'].unique())
    #df_process = df_oh.loc[df_oh['county']!='',['county','year','fuel_type_code']].copy()
    #print(len(df_process))
    #filter morpc region
    df_processed = df_oh.loc[df_oh['county'].isin(['Marion County','Logan County', 'Union County', 'Madison County', 'Fayette County', 'Delaware County', 'Morrow County', \
                                                             'Franklin County','Pickaway County', 'Ross County', 'Knox County', 'Licking County', \
                                                        'Fairfield County', 'Perry County', 'Hocking County']),['county','year','fuel_type_code']].copy()
    #print(len(df_processed))
    df_processed.loc[:,'count'] = 1
    #print(len(df_processed))
    #region
    grouped_region = df_processed.groupby(['year','fuel_type_code'],as_index = False)['count'].sum()
    region = grouped_region.pivot(index='year', columns='fuel_type_code', values='count').fillna(0)
    region.reset_index(inplace = True)

    if 'bd' not in region.columns:
        region['bd'] = 0
    if 'hy' not in region.columns:
        region['hy'] = 0
    region = region.loc[:,['year','cng','e85','elec','lng','lpg','bd','hy']]
    #county
    grouped_county = df_processed.groupby(['county','fuel_type_code','year'],as_index = False)['count'].sum()
    county = grouped_county.pivot_table(index=['county','year'], columns='fuel_type_code', values='count').fillna(0)
    county.reset_index(inplace = True)
    if 'bd' not in county.columns:
        county['bd'] = 0
    if 'hy' not in county.columns:
        county['hy'] = 0
    #add geoid to county
    countyid = county_code.countycode()
    county['county1'] = county.county.str.split(expand=True)[0].str.lower().str.strip()
    county_final = county.merge(countyid[['geoid','county_name']],left_on = 'county1',right_on='county_name',how = 'left')
    county_final.drop(columns=['county1','county','county_name'],inplace = True)
    #print(county_final['geoid'].unique())
    county_final = county_final.loc[:,['year','geoid','cng','e85','elec','lng','lpg','bd','hy']]
    print('Indicator1.5 transform success')
    return region, county_final
