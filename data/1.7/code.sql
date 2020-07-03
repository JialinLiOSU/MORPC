CREATE TABLE dashboard.renewenerfacilities
(
  id serial NOT NULL,
  Fuel_Type_ character varying(150),
  Station_Na character varying(150),
  Street_Add character varying(150),
  City,ZIP character varying(150),
  Station_Ph character varying(150),
  Groups_Wit character varying(150),
  Access_Day character varying(150),
  Latitude character varying(150),
  Longitude character varying(150),
  Owner_Type character varying(150),
  Open_Date character date,
  Access_Cod character varying(150),
  Facility_T character varying(150),
  COUNTY_SEA character varying(150)
);
COPY dashboard.renewenerfacilities (Fuel_Type_,Station_Na,Street_Add,City,ZIP,Station_Ph,Groups_Wit,Access_Day,Latitude,Longitude,Owner_Type,Open_Date,Access_Cod,Facility_T,COUNTY_SEA)
FROM 'D:\Luyu\CURA-RA\MORPC\data\1.5\altfuelstations_simple.csv' DELIMITER ',' CSV HEADER encoding 'windows-1251';


SELECT county_sea, extract(year from open_date) as theyear, count(id)
	FROM dashboard.altfuelstations
	GROUP BY theyear, county_sea
	order by theyear;