#Reduce solid waste per person
#mutiple year, need transform year by year
#Input: dict with one year solid waste data and population data
#output:Region and County level table 
import pandas as pd
import numpy as np
import os
import datetime
def indicator2_3a(dfs):
    pop = pd.DataFrame(dfs[1]['data'])
    pop.columns = pop.columns.astype(str)
    
    #pop.set_index(['county'],inplace = True)
    df1 = pd.DataFrame(dfs[0]['data'])
    #add year
    df1['year'] = dfs[0]['created_at'].year
    df_select= df1.loc[df1['county'].isin(['MARION','LOGAN', 'UNION', 'MADISON', 'FAYETTE', 'DELAWARE', 'MORROW', \
                                           'FRANKLIN','PICKAWAY', 'ROSS', 'KNOX', 'LICKING', 'FAIRFIELD', 'PERRY', 'HOCKING']),['county','recyclables','year']].copy()
    
    df_select['recyclables'] = df_select['recyclables'].fillna(0)
    df_select['recyclables'] = df_select.recyclables.astype(float)
    #organized data
    df_sum = df_select.groupby(['county','year'])['recyclables'].sum().reset_index()
    #df_sum['recyclables'] = df_sum.recyclables.astype(float)
    #recycle from tons to bound
    df_sum['recyclables_lbs'] = df_sum['recyclables']*2000
    #region
    region = df_sum.groupby(['year'])['recyclables_lbs'].sum().reset_index()
    region['pop'] = pop.loc[pop['county']=='15-County Region',str(dfs[0]['created_at'].year)].values[0]
    region['recyclables_per_cap'] = region['recyclables_lbs']/region['pop']
    final_region = region.loc[:,['year','recyclables_per_cap']].copy()
    #county
    #col = ['id2',str(dfs[0]['created_at'].year),'county']
    pop_county = pop.loc[:,['id2',str(dfs[0]['created_at'].year),'county']].copy()
    county_merge = pd.merge(df_sum,pop_county,on='county')
    county_merge['recyclables_per_cap'] = county_merge['recyclables_lbs']/county_merge[str(dfs[0]['created_at'].year)]
    final_county = county_merge.loc[:,['id2','year','recyclables_per_cap']].copy()
    final_county['id2'] =  final_county.id2.astype(object)
    
    print('Indicator 2.3a finished process for year '+ str(dfs[0]['created_at'].year))
    return final_region,final_county

def test(excel_file,excel_file2):
    df1 = pd.read_excel(excel_file,'2006')
    df1.rename(columns=lambda x: str(x).lower().replace(' ', '_').strip(), inplace=True)
    data = df1.to_dict('records')

    df2 = pd.read_excel(excel_file2)
    df2.rename(columns=lambda x: str(x).lower().replace(' ', '_').strip(), inplace=True)
    data2 = df2.to_dict('records')
    data_dict = [{
        'name': '2006',

        'schema_name': '2006_schema',

        'schema_version': '1.0',

        'created_at': datetime.datetime(2006, 2, 28, 11, 0, 0, 447019),

        'data': data
        },
        {

        'name': 'pop',

        'schema_name': 'pop_schema',

        'schema_version': '1.0',

        'created_at': datetime.datetime(2020, 2, 28, 11, 0, 0, 447019),

        'data': data2


                     }]
    return data_dict
            
if __name__== "__main__":
    data_dict = test(r'EPA Solid Waste 2006_2018.xlsx',r'MORPC_Region_County_Population_2000_2019_wide.xlsx')
    region,county = indicator2_3a(data_dict)
    
                  
    


        
        
    
