import urllib, json
from urllib.request import urlopen
import psycopg2

def translateType(content):
    if type(content) is int:
        return "integer"
    elif type(content) is str:
        return "varchar"
    elif type(content) is float:
        return "double precision"
    elif content == None or content == "null":
        return "varchar"


baseURL = "https://developer.nrel.gov//api/alt-fuel-stations/v1.json"
apiKey = "api_key=5h28DmdAcUQxI5hlDmxiRo0muiWtsifGIssBivDM"
query = "state=OH"

userName = 'liu.6544a'
password = "0EjBzT2CUk2B85m8hF64"
databaseName = "morpc"
tableName = "altfuelstations"

allURL = baseURL + "?" + apiKey + "&" + query
response = urlopen(allURL)
allData = json.loads(response.read())
allStations = allData['fuel_stations']


conn = psycopg2.connect(database= databaseName, user= userName, password= password, port="5432", host="/var/run/postgresql") 
cur = conn.cursor()

firstRecord = allStations[0]
createTableSQL = 'CREATE TABLE IF NOT EXISTS dashboard.'+ tableName + " (id serial PRIMARY KEY"

print(len(allStations) , " records grabbed.")

for name, content in firstRecord.items():
    typeString = translateType(content)
    if typeString == False or name == "id":
        continue
    createTableSQL += ", " + name + " " + typeString
createTableSQL += ");"

cur.execute(createTableSQL)
count = 0
error_count = 0
for eachRecord in allStations:
    insertRecordSQL = "INSERT INTO dashboard."+ tableName + " ("
    valueString = "("
    valueTuple = ()
    for name, content in eachRecord.items():
        if type(content) is dict:
            continue
        if valueString == "(":
            insertRecordSQL += name
            valueString += "%s"
        else:
            insertRecordSQL += ", " + name
            valueString += ", " + "%s"
        valueTuple = valueTuple + (content,)
    valueString += ")"
    insertRecordSQL += ") VALUES " + valueString
    try:
        cur.execute(insertRecordSQL, valueTuple)
    except:
        error_count += 1
        # print(error_count)
    else:
        count += 1
conn.commit()

print(count, " records inserted.", error_count, " records skipped.")
