from . import db, engine
import datetime
from marshmallow import fields, Schema
from sqlalchemy.orm import sessionmaker
from geoalchemy2 import Geometry, functions as geofunc
from sqlalchemy import func
import simplejson, json

from sqlalchemy.sql import select
from sqlalchemy import MetaData, Table


prominent_15 = ["47", "91", "129", "73", "41", "117", "101",
                "127", "141", "97", "49", "159", "45", "83", "89"]

Session = sessionmaker()
Session.configure(bind=engine)


class GeoModel(db.Model):
    """
    Geo Model
    """
    # __table__ = Table('mytable', db.Model.metadata,
    #                     autoload=True, autoload_with=some_engine)
    __tablename__ = 'counties'

    gid = db.Column(db.Integer, primary_key=True)
    countyns = db.Column(db.String(128), nullable=False)
    geoid = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    geom = db.Column(Geometry(geometry_type='POLYGON'))

    def __init__(self, data):
        pass

    @staticmethod
    def get_all_geos():
        return GeoModel.query.all()

    @staticmethod
    def get_prominent_15():
        return GeoModel.query.filter(GeoModel.geoid.in_(prominent_15))

    @staticmethod
    def get_one_geo(id):
        return GeoModel.query.get(id)

    def __repr__(self):
        return '<id {}>'.format(self.gid)

    @staticmethod
    def get_prominent_15_geojson():
        return db.session.query(geofunc.ST_AsGeoJSON(GeoModel.geom), GeoModel.gid, GeoModel.countyfp, GeoModel.tractce, GeoModel.geoid).filter(GeoModel.countyfp.in_(prominent_15)).all()

    @staticmethod
    def get_one_geojson(gid):
        return db.session.query(geofunc.ST_AsGeoJSON(GeoModel.geom), GeoModel.gid, GeoModel.countyfp, GeoModel.tractce, GeoModel.geoid).filter(GeoModel.gid == gid).all()
    
    @staticmethod
    def get_one_indicator_counties(indicator_id, data_type):
        session = Session()
        record = session.query(SetupModel).filter(SetupModel.data_name == indicator_id).filter(SetupModel.data_type == "indicator_county").all()
        record.sort(key = sortKey)
        
        #for each, item in record[0].__dict__.items():
        #    print(each, item)
        
        
        #print("record: ", record[0].schema_name)
        table_name = "1_7a_approved_facilities_county_1_0"
        
        metadata = MetaData()
        indicator_table = Table(table_name, metadata, autoload = True, autoload_with=engine)
                

        if data_type == "kml":      
            indicator_query = session.query(indicator_table).all()
            column_descriptions = session.query(indicator_table).column_descriptions
            non_value_field = ["created_at", "year", "geoid"]      
            county_table = Table("counties", metadata, autoload=True, autoload_with=engine)
            county_query = session.query(county_table).with_entities(geofunc.ST_AsKML(county_table.c.geom), county_table.c.geoid, county_table.c.name).all()
            kml_string = '<?xml version="1.0" encoding="utf-8" ?><kml xmlns="http://www.opengis.net/kml/2.2"><Document id="ohio"><Schema name="ohio" id="ohio">{}</Schema><Folder><name>ohio</name>{}</Folder></Document></kml>'
            data_string = '<SimpleData name="{}">{}</SimpleData>'
            placemark_string = '<Placemark><name>{}</name><ExtendedData><SchemaData schemaUrl="#ohio">{}</SchemaData></ExtendedData>{}</Placemark>'
            all_placemark_string = ""
            fields_string = '<SimpleField name="geoid" type="string"></SimpleField>'
            simple_field_string = '<SimpleField name="{}" type="float"></SimpleField>'

            fields_list = []
            for each_county in county_query:
                MultiGeometry_string = each_county[0]
                name = each_county[2]
                geoid = each_county[1]
                fields = ''
                tag = False

                for each_record in indicator_query:
                    a_geoid = each_record[-1]
                    a_year = each_record[1]
                    if int(geoid) == int(a_geoid):
                        tag = True
                        for each_field_index in range(len(column_descriptions)):
                            each_field = column_descriptions[each_field_index]['name']
                            if each_field == "geoid":
                                fields += data_string.format(each_field, each_record[each_field_index])

                            if each_field not in non_value_field:
                                spatiotemporal_field = str(each_field) + "+" + str(a_year)
                                fields += data_string.format(spatiotemporal_field, each_record[each_field_index])
                                fields_list.append(spatiotemporal_field)
                    

                                
                if tag:
                    new_placemark = placemark_string.format(name, fields, MultiGeometry_string)
                    #print(fields)
                    all_placemark_string += new_placemark
            
            fields_set = set(fields_list)
            for each_fields in fields_set:
                fields_string += simple_field_string.format(each_fields)
            
            return kml_string.format(fields_string, all_placemark_string)

        elif data_type == "csv":
            
            county_table = Table("counties", metadata, autoload=True, autoload_with=engine)
            indicator_query = session.query(indicator_table, county_table.c.name).join(indicator_table, (indicator_table.c.geoid) == (county_table.c.geoid)).all()
            column_descriptions = session.query(indicator_table).column_descriptions
            non_value_field = ["created_at", "year", "geoid"]
            
            csv_string = ""
            for each_field_index in range(len(column_descriptions)):
                each_field = column_descriptions[each_field_index]['name']
                csv_string += each_field + ','
            csv_string += 'county_name,'
            csv_string += "\n"
            for each_record in indicator_query:
                last_count = 0
                for each_field_index in range(len(column_descriptions)):
                    each_field_value = each_record[each_field_index]
                    each_field_name = column_descriptions[each_field_index]['name']
                    if each_field_name == "created_at":
                        each_field_value = str(each_field_value.strftime("%Y%m%d"))
                    else:
                        if each_field_name not in non_value_field:
                            try:
                                each_field_value = str(float(each_field_value))
                            except:
                                each_field_value = ""
                        else:
                            try:
                                each_field_value = str(int(each_field_value))
                            except:
                                each_field_value = ""
                            
                    csv_string += each_field_value + ","
                    last_count += 1
                csv_string += each_record[last_count] + ","
                csv_string += "\n"
            return csv_string


        
    @staticmethod
    def get_one_indicator_counties_csv(indicator_county):
        session = Session()
        table_name = "1_7a_approved_facilities_county_1_0"
        
        metadata = MetaData()
        indicator_table = Table(table_name, metadata, autoload = True, autoload_with=engine)
        indicator_query = session.query(indicator_table).all()
        column_descriptions = session.query(indicator_table).column_descriptions
        print(indicator_query)
        return 



def sortKey(A):
    return A.modified_at
    

class GeoSchema(Schema):
    """
    Geo Schema
    """
    gid = fields.Int(dump_only=True)
    countyns = fields.Str(dump_only=True)
    geoid = fields.Str(dump_only=True)
    name = fields.Str(dump_only=True)


class SetupModel(db.Model):
    __tablename__ = "data_ingestion"

    def __init__(self, data):
        pass
    
    data_name = db.Column(db.String(128), primary_key=True)
    schema_name = db.Column(db.String(128), primary_key=False)
    schema_version = db.Column(db.String(128), primary_key=True)
    data_config_name = db.Column(db.String(128), primary_key=False)
    data_type = db.Column(db.String(128), primary_key=False)
    created_at =  db.Column(db.DateTime, primary_key=False)
    modified_at = db.Column(db.DateTime, primary_key=False)

    # id = db.Column(db.String(30), primary_key=False)
    # goal = db.Column(db.String(30), primary_key=False)
    # titleid = db.Column(db.String(30), primary_key=False)
    # title = db.Column(db.String(128), primary_key=False)
    # fullname = db.Column(db.String(128), primary_key=False)
    # lowerrange = db.Column(db.Numeric, primary_key=False)
    # upperrange = db.Column(db.Numeric, primary_key=False)
    # atype = db.Column(db.String(30), primary_key=False)
    # targetyears = db.Column(db.Integer, primary_key=False)
    # targetvalues = db.Column(db.Numeric, primary_key=False)
    # baselineyears = db.Column(db.Integer, primary_key=False)
    # baselinevalues = db.Column(db.Numeric, primary_key=False)
    # text = db.Column(db.String(2048), primary_key=False)

    @staticmethod
    def setup():
        queryresult = SetupModel.query.all()
        print("queryResult", queryresult)
        return queryresult
    
    @staticmethod
    def get_general_data():
        queryresult = SetupModel.query.all()
        queryPlot = SetupSchema().dump(queryresult, many=True)
        for each_setting in queryPlot:
            plotID = each_setting['id']
            plotTableID = each_setting['id'] + "_general"
            if plotID == "goal_1_7a" or plotID == "goal_1_7b":
                currentModel = type("defaultModel", (db.Model,), {
                    "__tablename__": plotTableID, 
                    "__table_args__": {'schema': 'dashboard', 'extend_existing':True}, 
                    "key": db.Column(db.String(60), primary_key=True), 
                    "Battery": db.Column(db.Numeric, primary_key=False),
                    "Biomass": db.Column(db.Numeric, primary_key=False),
                    "Heat": db.Column(db.Numeric, primary_key=False),
                    "Hydro": db.Column(db.Numeric, primary_key=False),
                    "SolarPV": db.Column(db.Numeric, primary_key=False),
                    "SolidWaste": db.Column(db.Numeric, primary_key=False),
                    "Wind": db.Column(db.Numeric, primary_key=False)
                    })
                currentSchema = type("defaultSchema", (Schema,), {
                    "key": fields.Str(dump_only=True), 
                    "Battery": fields.Decimal(dump_only=True),
                    "Biomass": fields.Decimal(dump_only=True),
                    "Heat": fields.Decimal(dump_only=True),
                    "Hydro": fields.Decimal(dump_only=True),
                    "SolarPV": fields.Decimal(dump_only=True),
                    "SolidWaste": fields.Decimal(dump_only=True),
                    "Wind": fields.Decimal(dump_only=True),
                    "value": fields.Decimal(dump_only=True)
                    })
            elif plotID == "goal_1_5":
                currentModel = type("defaultModel", (db.Model,), {
                    "__tablename__": plotTableID, 
                    "__table_args__": {'schema': 'dashboard', 'extend_existing':True}, 
                    "key": db.Column(db.String(60), primary_key=True), 
                    "BD": db.Column(db.Numeric, primary_key=False),
                    "CNG": db.Column(db.Numeric, primary_key=False),
                    "E85": db.Column(db.Numeric, primary_key=False),
                    "ELEC": db.Column(db.Numeric, primary_key=False),
                    "HY": db.Column(db.Numeric, primary_key=False),
                    "LNG": db.Column(db.Numeric, primary_key=False),
                    "LPG": db.Column(db.Numeric, primary_key=False)
                    })
                currentSchema = type("defaultSchema", (Schema,), {
                    "key": fields.Str(dump_only=True), 
                    "BD": fields.Decimal(dump_only=True),
                    "CNG": fields.Decimal(dump_only=True),
                    "E85": fields.Decimal(dump_only=True),
                    "ELEC": fields.Decimal(dump_only=True),
                    "HY": fields.Decimal(dump_only=True),
                    "LNG": fields.Decimal(dump_only=True),
                    "LPG": fields.Decimal(dump_only=True)
                    })
            elif plotID == "goal_1_2b":
                currentModel = type("defaultModel", (db.Model,), {
                    "__tablename__": plotTableID, 
                    "__table_args__": {'schema': 'dashboard', 'extend_existing':True}, 
                    "key": db.Column(db.String(60), primary_key=True), 
                    "Biked": db.Column(db.Numeric, primary_key=False),
                    "PublicTransit": db.Column(db.Numeric, primary_key=False),
                    "Walked": db.Column(db.Numeric, primary_key=False)
                    })
                currentSchema = type("defaultSchema", (Schema,), {
                    "key": fields.Str(dump_only=True), 
                    "Biked": fields.Decimal(dump_only=True),
                    "PublicTransit": fields.Decimal(dump_only=True),
                    "Walked": fields.Decimal(dump_only=True)
                    })
            else:
                currentModel = type("defaultModel", (db.Model,), {"__tablename__": plotTableID, "__table_args__": {'schema': 'dashboard', 'extend_existing':True}, "key": db.Column(db.String(60), primary_key=True), "value": db.Column(db.Numeric, primary_key=False)})
                currentSchema = type("defaultSchema", (Schema,), {"key": fields.Str(dump_only=True), "value": fields.Decimal(dump_only=True)})
            
            queryPlotResult = currentModel.query.all()
            plotData = currentSchema().dump(queryPlotResult, many=True)
            
            print(plotData)
            each_setting["data"] = (plotData)
        return queryPlot

    def __repr__(self):
        return '<data_name {}>'.format(self.data_name)


class SetupSchema(Schema):
    """
    Geo Schema
    """
    data_name = fields.Str(dump_only=True)
    schema_name = fields.Str(dump_only=True)
    schema_version = fields.Str(dump_only=True)
    data_config_name = fields.Str(dump_only=True)
    data_type = fields.Str(dump_only=True)
    created_at =  fields.DateTime(dump_only=True)
    modified_at = fields.DateTime(dump_only=True)

    # id = fields.Str(dump_only=True)
    # goal = fields.Str(dump_only=True)
    # titleid = fields.Str(dump_only=True)
    # title = fields.Str(dump_only=True)
    # fullname = fields.Str(dump_only=True)
    # lowerrange = fields.Decimal(dump_only=True)
    # upperrange = fields.Decimal(dump_only=True)
    # atype = fields.Str(dump_only=True)
    # targetyears = fields.Int(dump_only=True)
    # targetvalues = fields.Decimal(dump_only=True)
    # baselineyears = fields.Int(dump_only=True)
    # baselinevalues = fields.Decimal(dump_only=True)
    # text = fields.Str(dump_only=True)


class GeneralDataDefaultSchema(Schema):
    key = fields.Int(dump_only=True)
    value = fields.Str(dump_only=True)
