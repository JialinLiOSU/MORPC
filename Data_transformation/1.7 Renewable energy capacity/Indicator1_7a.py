import pandas as pd
import sys
sys.path.append('../Ohio_county_code')
import countycode
#global var:add geoid
countycode = countycode.countycode()
def Indicator1_7a(data_dic):
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
    df1['county']= df1.county.str.lower().str.replace(' ', '_').str.strip()
    df1 = df1.dropna(subset=['approved', 'county','state','technology'])
    #add year and filter with Ohio
    df1['year']=pd.to_datetime(df1['approved']).dt.year
    df_oh = df1[df1['state']== 'OH']
    # filter with 15 county
    df_oh1 = df_oh[df_oh['county'].isin(['marion','logan', 'union', 'madison', 'fayette', 'delaware', 'morrow', 'franklin','pickaway', 'ross', 'knox', 'licking', 'fairfield', 'perry', 'hocking'])]
    #data cleaning
    df_oh1 = df_oh1.drop_duplicates()
    df_oh1 = df_oh1.fillna({'capacity_(mw)':0})
    df_oh1['count'] = 1    
    # regional 
    df1_year = df_oh1.groupby(['year','technology'],as_index = False)['count'].sum()
    pivot_df = df1_year.pivot(index='year', columns='technology', values='count')
    region = pivot_df.fillna(0)
    region.reset_index(inplace=True)
    # county
    grouped_county = df_oh1.groupby(['county','technology','year'],as_index = False)['count'].sum()
    pivot_df_county = grouped_county.pivot_table(index=['county','year'], columns='technology', values='count')
    pivot_df_county.reset_index(inplace=True)
    #join geoid with pivot_df_county
    county_result = pivot_df_county.merge(countycode[['geoid','county_name']],left_on = 'county',right_on = 'county_name',how = 'left')
    county_result =county_result.fillna(0)
    county_result = county_result.drop(['county','county_name'], axis = 1)
    print('Indicator1.7a transform success')
    return region, county_result

'''def test(excel_file):
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
    data_dict = test('Approved Facilities.xlsx')
    region,county = Indicator1_7a(data_dict)'''
