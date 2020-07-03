# /src/views/GeoView.py
from flask import request, g, Blueprint, json, Response, jsonify
from ..shared.Authentication import Auth
from ..models.GeoModel import GeoModel, GeoSchema, SetupModel, SetupSchema
import json as nativejson
import time, csv

geo_api = Blueprint('geo_api', __name__)
geo_schema = GeoSchema()
setup_schema = SetupSchema()

@geo_api.route('/setup', methods=['GET'])
def setup():
    """
    return setup specs
    """
    posts = SetupModel.setup()

    # data = simplejson.dumps(posts, use_decimal=True)

    # print(type(posts[1]))
    data = setup_schema.dump(posts, many=True)
    return custom_response(data, 200)

@geo_api.route('/general_data', methods=['GET'])
def get_general_data():
    """
    return setup specs
    """
    posts = SetupModel.get_general_data()

    # data = simplejson.dumps(posts, use_decimal=True)

    # print(type(posts[1]))
    return custom_response(posts, 200)

@geo_api.route('/', methods=['GET'])
@Auth.auth_required
def get_all():
    """
    Get All Geos
    """
    posts = GeoModel.get_all_geos()
    #print(posts)
    data = geo_schema.dump(posts, many=True)
    return custom_response(data, 200)


@geo_api.route('/get_prominent_15', methods=['GET'])
@Auth.auth_required
def get_prominent_15():
    """
    Get All Geos
    """
    posts = GeoModel.get_prominent_15()
    data = geo_schema.dump(posts, many=True)
    print(len(data))
    return custom_response(data, 200)


@geo_api.route('/<int:geo_id>', methods=['GET'])
@Auth.auth_required
def get_one(geo_id):
    """
    Get A Geo
    """
    post = GeoModel.get_one_geo(geo_id)
    if not post:
        return custom_response({'error': 'post not found'}, 404)

    print(type(post))
    data = geo_schema.dump(post)

    # print("return", data)
    return custom_response(data, 200)
    
@geo_api.route('/geojson/<int:geo_id>', methods=['GET'])
@Auth.auth_required
def get_one_geojson(geo_id):
    """
    Get A Geo
    """
    post = GeoModel.get_one_geojson(geo_id)
    if not post:
        return custom_response({'error': 'post not found'}, 404)

    #print(type(post))
    data = produce_geojson(post)

    # print("return", data)
    return custom_response(data, 200)

@geo_api.route('/counties/<data_type>/<indicator_id>', methods=['GET'])
# @Auth.auth_required
def get_one_indicator_counties(data_type, indicator_id):
    """
    Get A Indicator
    """
    post = GeoModel.get_one_indicator_counties(indicator_id, data_type)
    if not post:
        return custom_response({'error': 'post not found'}, 404)
    return custom_response(post, 200, data_type, True, indicator_id)

@geo_api.route('/geojson/get_prominent_15', methods=['GET'])
@Auth.auth_required
def get_prominent_15_geojson():
    """
    Get 15 counties geojson
    """
    post = GeoModel.get_prominent_15_geojson()
    if not post:
        return custom_response({'error': 'post not found'}, 404)

    # data = geo_schema.dump(post)
    data = produce_geojson(post)
    # print("return", data)
    return custom_response(data, 200)

def produce_geojson(post):
    geojson_object = {}

    geojson_object["type"] = "FeatureCollection"
    geojson_object["features"] = []
    for each_tract in post:
        each_tract_object = {}
        each_tract_object["type"] = "Feature"
        each_tract_object["geometry"] = nativejson.loads(each_tract[0])
        each_tract_object["properties"] = {}
        each_tract_object["properties"]["gid"] = int(each_tract[1])
        each_tract_object["properties"]["countyfp"] = int(each_tract[2])
        each_tract_object["properties"]["tractce"] = int(each_tract[3])
        each_tract_object["properties"]["geoid"] = int(each_tract[4])
        geojson_object["features"].append(each_tract_object)
    return geojson_object



def custom_response(res, status_code, date_type="json", CORS = False, optinal_name = False):
    """
    Custom Response Function
    """
    if date_type == 'json':
        r = Response(
            mimetype="application/json",
            response=json.dumps(res),
            status=status_code
        )
    elif date_type == "kml":
        r = Response(
            mimetype="application/xml",
            response=(res),
            status=status_code
        )
        r.headers["Content-Type"] = "text/xml; charset=utf-8"
        r.headers["Content-Disposition"] = "attachment; filename=" + optinal_name + ".kml"
    elif date_type == "csv":
        r = Response(
            mimetype="text/csv",
            response=(res),
            status=status_code
        )
        r.headers["Content-Disposition"] = "attachment; filename=" + optinal_name + ".csv"
    if CORS:
        r.headers["Access-Control-Allow-Origin"] = "*"
    return r
