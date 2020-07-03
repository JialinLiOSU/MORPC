#cleaned county water from 2010-2019
#per_capita_daily_gal: County / Region per Person Water Consumption (in gallons)
import pandas as pd
import sys
from app.main.transformation import county_code


countycode = county_code.countycode()

def Indicator2_5(data_dict):
    waterdf = pd.DataFrame(data_dict[0]['data'])
    waterdf['county'] = waterdf.county.str.lower().str.replace(' ', '_').str.strip()
    #countycode['county'] = countycode.county.str.lower().str.replace(' ', '_').str.strip()
    #select region: 15-county_region
    region_select = waterdf.loc[waterdf['county'] == '15-county_region']
    #region_select.set_index("year",inplace=True)
    region = region_select[['year','per_capita_daily_gal']]
    #region.reset_index(inplace=True)
    county_select = waterdf[waterdf.county != '15-county_region']
    #left join county_select and countycode
    county_result = county_select.merge(countycode[['geoid','county_name']],left_on = 'county',right_on = 'county_name',how = 'left')
    #print(county_result.head())
    county = county_result[['geoid', 'year','per_capita_daily_gal']]
    #county.set_index(['geoid','year'],inplace = True)
    print('Indicator 2.5 processed finished')
    return region, county




'''def test(water_path):
    waterdf = pd.read_excel(water_path)
    waterdf.rename(columns=lambda x: str(x).lower().replace(' ', '_').strip(),inplace = True)
    #countycode = pd.read_excel(county_path)
    #countycode.rename(columns=lambda x: str(x).lower().replace(' ', '_').strip(),inplace = True)
    data = waterdf.to_dict('records')
    data_dict = [{
        'name': 'Cleaned_County_Water_Population_2010_2019',

        'schema_name': 'cleaned_county_water_population_2010_2019_schema',

        'schema_version': '1.0',

        'created_at': '2020, 2, 28, 11, 0, 0, 447019',

        'data': data
        }]
    return data_dict

if __name__ == "__main__":
    data_dict= test('Data from EPA\Cleaned_County_Water_Population_2010_2019.xlsx')
    region, county = Indicator2_5(data_dict)'''
