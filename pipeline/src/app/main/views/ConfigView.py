from flask import request
from app.main.models.DataConfigModel import DatasetConfigModel, DatasetConfigSchema
from flask_restplus import Resource, reqparse, Namespace
from app.main.utils import custom_response

config_api = Namespace('config', description='Config related API')
config_schema = DatasetConfigSchema()

config_parser = reqparse.RequestParser()
config_parser.add_argument('config', location='json', required=True, help='Configuration Information in JSON Format')


@config_api.route('/<config_name>', methods=['GET', 'PUT', 'DELETE'])
@config_api.param('config_name', 'Name of the data ')
class Config(Resource):

    @config_api.doc('Get the configuration')
    def get(self, config_name):

        data = DatasetConfigModel.get_dataset_config_by_name(config_name)
        if not data:
            return custom_response('Error: Configuration not found', 400)

        schema = config_schema.dump(data)
        return schema

    @config_api.doc("Delete the configuration")
    def delete(self, config_name):
        config = DatasetConfigModel.get_dataset_config_by_name(config_name)
        if not config:
            return custom_response('Error: Configuration not found', 400)
        config.delete()
        return custom_response('Success: Configuration has been deleted successfully', 200)

    @config_api.doc('Update the configuration')
    @config_api.expect(config_parser, validate=True)
    def put(self, config_name):
        input_data = request.json
        data = config_schema.load(input_data, partial=True)
        if not data:
            return custom_response('Error: The given configuration definition is invalid', 500)

        config = DatasetConfigModel.get_dataset_config_by_name(config_name)
        if not config:
            return custom_response('Error: Configuration not found', 400)
        config.update(input_data)
        return custom_response('Success: Configuration has been updated successfully', 200)


@config_api.route('/', methods=['POST'])
class ConfigList(Resource):

    @config_api.doc('Create Config')
    @config_api.expect(config_parser, validate=True)
    def post(self):

        input_data = request.json
        name = input_data['dataset_config_name']
        config = DatasetConfigModel.get_dataset_config_by_name(name)
        if config:
            return custom_response('Error: Configuration name and version already exist, please use a different name/version', 500)

        data = config_schema.load(input_data)
        if not data:
            return custom_response('Error: The given configuration definition is invalid', 500)

        config = DatasetConfigModel(data)
        config.save()
        return custom_response('Success: Config has been created successfully', 200)

