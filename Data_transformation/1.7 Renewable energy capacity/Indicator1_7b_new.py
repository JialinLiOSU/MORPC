import pandas as pd
import sys
import pickle
sys.path.append('../Ohio_county_code')
import countycode
#global var:add geoid
countycode = countycode.countycode()
def Indicator1_7b(data_dic):
    '''
        input:[
            data_dict: {

                'name': 'approved_facilities'

                'schema_name': 'approved_facilities_schema',

                'schema_version': '1.0',

                'created_at': datetime.datetime(2020, 2, 28, 11, 0, 0, 447019)

                'data': [{

                                'name': 'Twenty First Century Energy, LLC',

                                'state': 'OH',

                                'county': 'Greene',

                                'case_reference': '09-0528',

                                'approved': datetime.datetime(2009, 8, 31, 0, 0),

                                'certificate_id': '09-SPV-OH-GATS-0001',

                                'technology': 'Solar PV',

                                'certificate_mw': '0.041'

                                },

                    ]}

                ]
        output: region: region table
                county_result: county table
    '''
    #read data from dict
    df1 =  pd.DataFrame(data_dic[0]['data'])
    df1['technology'] = df1.technology.str.lower().str.replace(' ', '_').str.strip()
    df1.drop(df1[df1['technology'] == 'not_entered'].index, inplace = True) 
    #print(df1['technology'].unique())
    df1['county']= df1.county.str.lower().str.replace(' ', '_').str.strip()
    df1 = df1.dropna(subset=['approved', 'county','state','technology'])
    #add year and filter with Ohio
    df1['year']=pd.to_datetime(df1['approved']).dt.year
    df_oh = df1[df1['state']== 'OH']
    #data cleaning
    df_oh = df_oh.drop_duplicates()
    df_oh['certificate_mw'] = df_oh.certificate_mw.astype(float)
    df_oh = df_oh.fillna({'certificate_mw':0})
    #df_oh['count'] = 1
    #county
    grouped_county = df_oh.groupby(['county','technology','year'],as_index = False)['certificate_mw'].sum()
    pivot_df_county = grouped_county.pivot_table(index=['county','year'], columns='technology', values='certificate_mw')
    pivot_df_county.reset_index(inplace=True)
    # filter with 15 county
    county = pivot_df_county[pivot_df_county['county'].isin(['marion','logan', 'union', 'madison', 'fayette', 'delaware', 'morrow', 'franklin','pickaway', 'ross', 'knox', 'licking', 'fairfield', 'perry', 'hocking'])]
  
    # regional 
    columns = list(df_oh['technology'].unique())
    '''region = county.groupby(['year']).agg({'solar_pv':'sum', 'wind':'sum', 'hydroelectric':'sum', 'not_entered':'sum',
     'abandoned_coal_mine_methane' :'sum','biomass':'sum', 'waste_energy_recovery':'sum',
     'fuelcell' :'sum','solid_waste':'sum'}).reset_index()'''
    region = county.groupby(['year'], as_index = False)[columns].sum()
    
    
    #join geoid with pivot_df_county
    county_result = county.merge(countycode[['geoid','county_name']],left_on = 'county',right_on = 'county_name',how = 'left')
    county_result =county_result.fillna(0)
    county_result = county_result.drop(['county','county_name'], axis = 1)
    print('Indicator1.7b transform success')
    return region, county_result

def test(excel_file):
    #read data
    df1 = pd.read_excel(excel_file,skiprows = 2)
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
    with open("output_list.pkl", "rb") as fp:
        b = pickle.load(fp)
    #data_dict = test('Approved Facilities.xlsx')
    region,county = Indicator1_7b(b)
