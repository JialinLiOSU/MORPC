from flask_restplus import Resource, Namespace, reqparse
import werkzeug
from flask import request
import os
import traceback
from app.main.models.IngestionModel import IngestionModel, IngestionSchema
from app.main.models.DataSchemaModel import DataSchemaModel
from app.main.models.DataConfigModel import DatasetConfigModel
from app.main.utils import custom_response
from app.main import utils, ingestion_helper
from threading import Thread
import flask
import requests
import json

ingestion_api = Namespace('ingestion', description='Ingestion related API')
ingestion_schema = IngestionSchema()

url_request_parser = reqparse.RequestParser()
url_request_parser.add_argument('request_parameters', location='json', required=True, help='Request Parameters for API')



file_upload = reqparse.RequestParser()
file_upload.add_argument('file',
                         type=werkzeug.datastructures.FileStorage,
                         location='files',
                         required=True,
                         help='Upload file')

root_dir = 'app/main/'


def execute_job(app, args):

    with app.app_context():
        if args['method'] == 'download':
            response = ingestion_helper.download_data(args['url'], args['file_path'])
            if response['status'] == 500:
                utils.send_email(args['config'].config['email_address'], 'Error: ' + response['message'] + '. ' + response['trace'] if response['trace'] is not None else '')
                raise Exception('Error: ' + response['message'] + '. ' + response['trace'] if response['trace'] is not None else '')

        data = IngestionModel.get_dataset_ingestion_by_name(args['name'])

        if not data:
            input_data = dict()
            input_data['data_name'] = args['name']
            input_data['schema_name'] = args['schema_name']
            input_data['schema_version'] = args['schema_version']
            input_data['data_config_name'] = args['config_name']
            input_data['data_type'] = 'dataset'
            data = ingestion_schema.load(input_data)

            if not data:
                return custom_response('Error: The given input definition is invalid', 500)

            ingestion_data = IngestionModel(data)
            ingestion_data.save()
        avro_schema_name = args['schema_name'] + '_' + args['schema_version'] + '.avsc'

        config_val = args['config'].config
        if not os.path.exists(root_dir + "schema/"):
            os.makedirs(root_dir + "schema")

        if not os.path.isfile(root_dir + 'schema/' + avro_schema_name):
            schema = args['schema']
            response = utils.create_avro_schema(schema.schema_name, schema.schema_version, schema.table_fields)
            if response['status'] == 500:
                ingestion_data = IngestionModel.get_dataset_ingestion_by_name(args['name'])
                ingestion_data.delete()
                utils.send_email(config_val['email_address'], 'Error: ' + response['message'] + '. ' + response['trace'] if response['trace'] is not None else '')
                raise Exception('Error: ' + response['message'] + '. ' + response['trace'] if response['trace'] is not None else '')

        response = ingest_data(args['file_name'], args['name'], args['schema_name'], args['schema_version'], config_val)
        if response['status'] == 500:
            ingestion_data = IngestionModel.get_dataset_ingestion_by_name(args['name'])
            ingestion_data.delete()
            utils.delete_avro_schema(args['schema'])
            utils.send_email(args['config'].config['email_address'], 'Error: ' + response['message'] + '. ' + response['trace'] if response['trace'] is not None else '')
            raise Exception('Error: ' + response['message'] + '. ' + response['trace'] if response['trace'] is not None else '')

        utils.send_email(config_val['email_address'], "Data has been ingested successfully")


def ingest_data(file_name, name, schema_name, schema_version, config):

    file_type = config['file_type']
    if not os.path.exists(root_dir + 'data/avro/'):
        os.makedirs(root_dir + 'data/avro/')
    if file_type.lower() == 'csv':
        return ingestion_helper.csv_ingestion(file_name, name, schema_name, schema_version, config)
    elif file_type.lower() == 'xls' or file_type.lower() == 'xlsx':
        return ingestion_helper.xls_ingestion(file_name, name, schema_name, schema_version, config)
    elif file_type.lower() == 'json':
        return ingestion_helper.json_ingestion(file_name, name, schema_name, schema_version, config)
    else:
        return utils.helper_response('Error: Unsupported Type', 500, None)


@ingestion_api.route('/upload/<name>/<schema_name>/<schema_version>/<config_name>', methods=['POST'])
@ingestion_api.param('name', 'Name of the data ')
@ingestion_api.param('schema_name', 'Name of the schema ')
@ingestion_api.param('schema_version', 'Version of the schema')
@ingestion_api.param('config_name', 'Name of the configuration ')
class SchemaList(Resource):

    @ingestion_api.doc('Ingest Data - Upload')
    @ingestion_api.expect(file_upload, validate=True)
    def post(self, name, schema_name, schema_version, config_name):

        uploaded_file = request.files['file']

        schema = DataSchemaModel.get_schema_by_name_version(schema_name, schema_version)
        if not schema:
            return custom_response('Error: Schema not found', 400)

        config = DatasetConfigModel.get_dataset_config_by_name(config_name)

        if not config:
            return custom_response('Error: Configuration not found', 400)

        data = IngestionModel.get_dataset_ingestion_by_name(name)

        file_name = name + '_' + schema_name + '_' + schema_version
        file_name = file_name.replace('.', '_')
        file_type = config.config['file_type']
        if not os.path.exists(root_dir + "data/raw"):
            os.makedirs(root_dir + "data/raw")

        uploaded_file.save(root_dir + "data/raw/" + file_name + '_' + config.config['temporal_identifier'] + '.' + file_type.lower())

        job_args = dict()
        job_args['name'] = name
        job_args['schema_name'] = schema_name
        job_args['schema_version'] = schema_version
        job_args['file_name'] = file_name
        job_args['schema'] = schema
        job_args['config'] = config
        job_args['config_name'] = config_name
        job_args['method'] = 'upload'

        thread = Thread(target=execute_job, args=(flask.current_app._get_current_object(), job_args,))
        thread.daemon = True
        thread.start()

        return custom_response('Dataset is being ingested! You will recieve an email once it has been ingested successfully. ', 200)


@ingestion_api.route('/download/<name>/<path:url>/<schema_name>/<schema_version>/<config_name>', methods=['POST'])
@ingestion_api.param('name', 'Name of the data')
@ingestion_api.param('url', 'URL for the data')
@ingestion_api.param('schema_name', 'Name of the schema')
@ingestion_api.param('schema_version', 'Version of the schema')
@ingestion_api.param('config_name', 'Name of the configuration ')
class SchemaListDownload(Resource):

    @ingestion_api.doc('Ingest Data - Download')
    def post(self, name, url, schema_name, schema_version, config_name):

        schema = DataSchemaModel.get_schema_by_name_version(schema_name, schema_version)
        if not url.startswith('https://'):
            url = url.replace('https:/', 'https://')
        if not schema:
            return custom_response('Error: Schema not found', 400)

        config = DatasetConfigModel.get_dataset_config_by_name(config_name)

        if not config:
            return custom_response('Error: Configuration not found', 400)

        file_name = name + '_' + schema_name + '_' + schema_version
        file_name = file_name.replace('.', '_')
        file_type = config.config['file_type']
        if not os.path.exists(root_dir + "data/raw"):
            os.makedirs(root_dir + "data/raw")

        job_args = dict()
        job_args['name'] = name
        job_args['schema_name'] = schema_name
        job_args['schema_version'] = schema_version
        job_args['file_name'] = file_name
        job_args['schema'] = schema
        job_args['config'] = config
        job_args['config_name'] = config_name
        job_args['url'] = url
        job_args['file_path'] = root_dir + "data/raw/" + file_name + '_' + config.config['temporal_identifier'] + '.' + file_type.lower()
        job_args['method'] = 'download'

        thread = Thread(target=execute_job, args=(flask.current_app._get_current_object(), job_args,))
        thread.daemon = True
        thread.start()

        return custom_response('Dataset is being ingested! You will recieve an email once it has been ingested successfully. ', 200)


@ingestion_api.route('/api/<name>/<path:request_url>/<schema_name>/<schema_version>/<config_name>', methods=['POST'])
@ingestion_api.param('name', 'Name of the data')
@ingestion_api.param('request_url', 'URL for the data')
@ingestion_api.param('schema_name', 'Name of the schema')
@ingestion_api.param('schema_version', 'Version of the schema')
@ingestion_api.param('config_name', 'Name of the configuration ')
class SchemaListAPI(Resource):

    @ingestion_api.doc('Ingest Data - API')
    @ingestion_api.expect(url_request_parser, validate=True)
    def post(self, name, request_url, schema_name, schema_version, config_name):

        params = request.json
        if not request_url.startswith('https://'):
            request_url = request_url.replace('https:/', 'https://')
        schema = DataSchemaModel.get_schema_by_name_version(schema_name, schema_version)
        if not schema:
            return custom_response('Error: Schema not found', 400)

        config = DatasetConfigModel.get_dataset_config_by_name(config_name)

        if not config:
            return custom_response('Error: Configuration not found', 400)

        file_name = name + '_' + schema_name + '_' + schema_version
        file_name = file_name.replace('.', '_')
        if not os.path.exists(root_dir + "data/raw"):
            os.makedirs(root_dir + "data/raw")

        api_call = requests.get(url=request_url, params=params)
        if api_call.status_code != 200:
            response = utils.helper_response('API returns an error', 500, api_call.text)
            raise Exception('Error: ' + response['message'] + '. ' + response['trace'] if response['trace'] is not None else '')

        api_response = api_call.json()
        print(api_response)
        with open(root_dir + "data/raw/" + file_name + '_' + config.config['temporal_identifier'] + '.json', 'w') as fp:
            json.dump(api_response, fp)

        job_args = dict()
        job_args['name'] = name
        job_args['schema_name'] = schema_name
        job_args['schema_version'] = schema_version
        job_args['file_name'] = file_name
        job_args['schema'] = schema
        job_args['config'] = config
        job_args['config_name'] = config_name
        job_args['url'] = request_url
        job_args['file_path'] = root_dir + "data/raw/" + file_name + '_' + config.config['temporal_identifier'] + '.json'
        job_args['method'] = 'API'
        job_args['params'] = params

        thread = Thread(target=execute_job, args=(flask.current_app._get_current_object(), job_args,))
        thread.daemon = True
        thread.start()

        return custom_response('Dataset is being ingested! You will recieve an email once it has been ingested successfully. ', 200)
