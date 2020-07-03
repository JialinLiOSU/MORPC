import pandas as pd
import sys
import pickle
import requests
import json
import timeit

def countycode():
    data = {u'geoid': {0: 39001, 1: 39003, 2: 39005, 3: 39007, 4: 39009, 5: 39011, 6: 39013, 7: 39015, 8: 39017, 9: 39019, 10: 39021, 11: 39023, 12: 39025, 13: 39027, 14: 39029, 15: 39031, 16: 39033, 17: 39035, 18: 39037, 19: 39039, 20: 39041, 21: 39043, 22: 39045, 23: 39047, 24: 39049, 25: 39051, 26: 39053, 27: 39055, 28: 39057, 29: 39059, 30: 39061, 31: 39063, 32: 39065, 33: 39067, 34: 39069, 35: 39071, 36: 39073, 37: 39075, 38: 39077, 39: 39079, 40: 39081, 41: 39083, 42: 39085, 43: 39087, 44: 39089, 45: 39091, 46: 39093, 47: 39095, 48: 39097, 49: 39099, 50: 39101, 51: 39103, 52: 39105, 53: 39107, 54: 39109, 55: 39111, 56: 39113, 57: 39115, 58: 39117, 59: 39119, 60: 39121, 61: 39123, 62: 39125, 63: 39127, 64: 39129, 65: 39131, 66: 39133, 67: 39135, 68: 39137, 69: 39139, 70: 39141, 71: 39143, 72: 39145, 73: 39147, 74: 39149, 75: 39151, 76: 39153, 77: 39155, 78: 39157, 79: 39159, 80: 39161, 81: 39163, 82: 39165, 83: 39167, 84: 39169, 85: 39171, 86: 39173, 87: 39175},
            u'county_name': {0: u'adams', 1: u'allen', 2: u'ashland', 3: u'ashtabula', 4: u'athens', 5: u'auglaize', 6: u'belmont', 7: u'brown', 8: u'butler', 9: u'carroll', 10: u'champaign', 11: u'clark', 12: u'clermont', 13: u'clinton', 14: u'columbiana', 15: u'coshocton', 16: u'crawford', 17: u'cuyahoga', 18: u'darke', 19: u'defiance', 20: u'delaware', 21: u'erie', 22: u'fairfield', 23: u'fayette', 24: u'franklin', 25: u'fulton', 26: u'gallia', 27: u'geauga', 28: u'greene', 29: u'guernsey', 30: u'hamilton', 31: u'hancock', 32: u'hardin', 33: u'harrison', 34: u'henry', 35: u'highland', 36: u'hocking', 37: u'holmes', 38: u'huron', 39: u'jackson', 40: u'jefferson', 41: u'knox', 42: u'lake', 43: u'lawrence', 44: u'licking', 45: u'logan', 46: u'lorain', 47: u'lucas', 48: u'madison', 49: u'mahoning', 50: u'marion', 51: u'medina', 52: u'meigs', 53: u'mercer', 54: u'miami', 55: u'monroe', 56: u'montgomery', 57: u'morgan', 58: u'morrow', 59: u'muskingum', 60: u'noble', 61: u'ottawa', 62: u'paulding', 63: u'perry', 64: u'pickaway', 65: u'pike', 66: u'portage', 67: u'preble', 68: u'putnam', 69: u'richland', 70: u'ross', 71: u'sandusky', 72: u'scioto', 73: u'seneca', 74: u'shelby', 75: u'stark', 76: u'summit', 77: u'trumbull', 78: u'tuscarawas', 79: u'union', 80: u'van_wert',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       81: u'vinton', 82: u'warren', 83: u'washington', 84: u'wayne', 85: u'williams', 86: u'wood', 87: u'wyandot'}}

    df = pd.DataFrame.from_dict(data)
    return df

def coor2county(row):
     try:
         url= "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&featureTypes=&location={}%2C{}".format(row['longitude'],row['latitude'])
        #url= "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&searchExtent=area&maxLocations=2&outFields=*&forStorage=false&Address={}&City={}&Region={}&Postal={}".format(row['Address'],row['City'],row['State'],row['Zip'])
        
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
    countyid = countycode()
    county['county1'] = county.county.str.split(expand=True)[0].str.lower().str.strip()
    county_final = county.merge(countyid[['geoid','county_name']],left_on = 'county1',right_on='county_name',how = 'left')
    county_final.drop(columns=['county1','county','county_name'],inplace = True)
    #print(county_final['geoid'].unique())
    county_final = county_final.loc[:,['year','geoid','cng','e85','elec','lng','lpg','bd','hy']]
    print('Indicator1.5 transform success')
    return region, county_final

'''def test(excel_file):
    #read data
    df1 = pd.read_excel(excel_file)
    # transform col name and Type into lower charactors without space
    
    df1.rename(columns=lambda x: str(x).lower().replace(' ', '_').strip(), inplace=True)
    data = df1.to_dict('records')

    data_dict = [{
        'name': 'approved_facilities',

        'schema_name': 'approved_facilities_schema',

        'schema_version': '1.0',

        'created_at': '2020, 2, 28, 11, 0, 0, 447019',

        'data': data
        }]
    return data_dict

if __name__ == '__main__':
    #with open("output_list.pkl", "rb") as fp:
      #  b = pickle.load(fp)
    data_dict = test('alt_fuel_station.xlsx')
    region,county= Indicator1_5(data_dict)'''
