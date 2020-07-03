'To check all schema in the database'
select s.nspname as table_schema,
       s.oid as schema_id,
       u.usename as owner
from pg_catalog.pg_namespace s
join pg_catalog.pg_user u on u.usesysid = s.nspowner
order by table_schema;

'to check all users'
\du

'connect to a database'
\connect

'list of database'
\l or \list

'force delete a database'
bash$ dropdb 'databasename'

'See all tables'
SELECT * FROM pg_catalog.pg_tables;


"Show all tables in a schema"
'In all schemas:'

\dt *.*

'In a particular schema:'

\dt public.*

'Show all columns'
SELECT *
  FROM information_schema.columns
 WHERE table_schema = 'dashboard'
   AND table_name   = 'census_tract'
     ;


"PostGIS import shapefile"
shp2pgsql -s 4326 Ohio_counties_4326.shp public.counties | psql -d morpc_pipeline -U liu.6544a


"Create setup table"
CREATE TABLE dashboard.setup 
(id varchar, goal varchar, titleID varchar, title varchar, fullName varchar, lowerRange double precision, upperRange double precision, atype varchar, 
targetYears integer, targetValues double precision, baselineYears integer, baselineValues double precision, text varchar
);

COPY dashboard.setup FROM '/home/liu.6544a/gitlab/morpc-rsd/data/report_card_demo/setup.csv' WITH (FORMAT csv);

\COPY dashboard.setup FROM '/home/liu.6544a/gitlab/morpc-rsd/data/report_card_demo/setup.tsv' DELIMITER E'\t';

COPY dashboard.setup FROM 'D:\\Luyu\\CURA-RA\\MORPC\\morpc-rsd\\data\\report_card_demo\\setup.tsv' DELIMITER E'\t';

id	goal	titleID	title	fullName	lowerRange	upperRange	type	targetYears	targetValues	baselineYears	baselineValues	text		
