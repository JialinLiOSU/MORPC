from flask import request
from app.main.models.DataSchemaModel import DataSchemaModel, DataSchema
from flask_restplus import Resource, reqparse, Namespace
from app.main.utils import custom_response

schema_api = Namespace('Schema', description='Schema related APIs')
data_schema = DataSchema()

schema_parser = reqparse.RequestParser()
schema_parser.add_argument('schema', location='json', required=True, help='Schema Definition in JSON Format')


@schema_api.route('/<schema_name>/<schema_version>/', methods=['GET', 'DELETE', 'PUT'])
@schema_api.param('schema_name', 'Name of the Schema')
@schema_api.param('schema_version', 'Version of the Schema')
class Schema(Resource):

    @schema_api.doc('Get the Schema')
    def get(self, schema_name, schema_version):

        data = DataSchemaModel.get_schema_by_name_version(schema_name, schema_version)
        if not data:
            return custom_response('Error: Schema not found', 400)

        schema = data_schema.dump(data)
        return schema

    @schema_api.doc("Delete the Schema")
    def delete(self, schema_name, schema_version):
        schema = DataSchemaModel.get_schema_by_name_version(schema_name, schema_version)
        if not schema:
            return custom_response('Error: Schema not found', 400)
        schema.delete()
        return custom_response('Success: Schema has been deleted successfully', 200)

    @schema_api.doc('Update the Schema')
    @schema_api.expect(schema_parser, validate=True)
    def put(self, schema_name, schema_version):
        input_data = request.json
        data = data_schema.load(input_data, partial=True)
        if not data:
            return custom_response('Error: The given schema definition is invalid', 500)

        schema = DataSchemaModel.get_schema_by_name_version(schema_name, schema_version)
        if not schema:
            return custom_response('Error: Schema not found', 400)
        schema.update(input_data)
        return custom_response('Success: Schema has been updated successfully', 200)


@schema_api.route('/', methods=['POST'])
class SchemaList(Resource):

    @schema_api.doc('Create Schema')
    @schema_api.expect(schema_parser, validate=True)
    def post(self):

        input_data = request.json
        name = input_data['schema_name']
        version = input_data['schema_version']
        schema = DataSchemaModel.get_schema_by_name_version(name, version)
        if schema:
            return custom_response('Error: Schema name and version already exist, please use a different name/version', 500)

        data = data_schema.load(input_data)
        if not data:
            return custom_response('Error: The given schema definition is invalid', 500)

        schema = DataSchemaModel(data)
        schema.save()
        return custom_response('Success: Schema has been created successfully', 200)
