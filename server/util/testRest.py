import requests
import unicodecsv as csv

LOGFILE = "./test.log"
DATAFILE = "data.geojson"
TOKEN_URL = "https://cura-sco-dev.asc.ohio-state.edu/test/api/v1/users/"
DATA_URL = "https://cura-sco-dev.asc.ohio-state.edu/test/api/v1/geos/"

s = requests.Session()

s.headers = {
	"Content-Type": "application/json",
}

userdata = { "email":"user@email.com", "password":"fjkaeiaj", "name": "Test user" }

try:
	r = s.post(TOKEN_URL, json=userdata)
	print r
except:
	print("ERROR: Failed to access Token API")
	raise SystemExit
	
if( r.json()['success'] == False ):
	print("ERROR: Failed to acquire token")
	raise SystemExit
else:
	s.headers.update({'Authorization': 'Bearer ' + r.json()['token']})	

try:
	r = s.get(DATA_URL)
except:
	print("ERROR: Failed to access data API")
	raise SystemExit

if( type(r.json()) == dict and r.json()['success'] == False ):
	print("ERROR: Data download failed: " + r.json()['message'])
	raise SystemExit
else:
	f = open(DATAFILE, 'wb')

	count = 0
	f.write(r.json)
	f.close()