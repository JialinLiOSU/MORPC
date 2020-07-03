from flask import request
from app.main.models.TransformModel import TransformModel, TransformSchema
from app.main.models.IngestionModel import IngestionModel, IngestionSchema
from app.main.models.DataConfigModel import DatasetConfigModel
from app.main.models.DataSchemaModel import DataSchemaModel
from flask_restplus import Resource, reqparse, Namespace
from app.main.utils import custom_response
from app.main import transform_helper, utils
import importlib
from threading import Thread
import flask
import datetime
import traceback

transform_api = Namespace('transform', description='Transformation related API')
transform_schema = TransformSchema()

ingestion_schema = IngestionSchema()

transform_parser = reqparse.RequestParser()
transform_parser.add_argument('config', location='json', required=True, help='Transformation config information in JSON Format')

root_dir = 'app/main/'


def execute_job(app, indicator_name, indicator_data):

    # Fetch corresponding avro file, transform and insert.
    config = indicator_data.config

    output = list()
    with app.app_context():
        for dataset in config['datasets']:
            dataset_info = IngestionModel.get_dataset_ingestion_by_name(dataset)
            config_info = DatasetConfigModel.get_dataset_config_by_name(dataset_info.data_config_name)
            data = transform_helper.get_avro_file_as_object(dataset, dataset_info.schema_name, dataset_info.schema_version, config_info.config)

            data['temp_id'] = config_info.config['temporal_identifier']
            output.append(data)

    with app.app_context():
        try:
            transform = importlib.import_module("." + config['transformation_file'], config['transformation_dir'])
        except:
            utils.send_email(config['email_address'], 'Error: ' + traceback.format_exc())
            response = utils.helper_response('Error: Transformation file not found', 400, traceback.format_exc())
            raise Exception('Error: ' + response['message'] + '. ' + response['trace'] if response['trace'] is not None else '')

        try:
            output_dict = dict()
            output_dict['region'], output_dict['county'] = getattr(transform, config['transformation_api'])(output)
        except:
            utils.send_email(config['email_address'], 'Error: ' + traceback.format_exc())
            response = utils.helper_response('Could not transform indicator', 500, traceback.format_exc())
            raise Exception('Error: ' + response['message'] + '. ' + response['trace'] if response['trace'] is not None else '')

        schemas = config['schemas']

        for key in schemas.keys():
            indicator = schemas[key]
            indicator_schema = indicator['schema']
            indicator_schema_version = indicator['schema_version']

            schema = DataSchemaModel.get_schema_by_name_version(indicator_schema, indicator_schema_version)
            if not schema:
                utils.send_email(config['email_address'], "Error: Indicator Region Schema not found")
                raise Exception('Error: Region Schema not found')

            # Check if table exists or not
            data_type = 'indicator_' + key
            data = IngestionModel.get_indicator_ingestion_by_name_type(indicator_name, data_type)

            output_dict[key] = output_dict[key].to_dict(orient='records')
            flag = 0
            if not data:
                input_data = dict()
                input_data['data_name'] = indicator_name
                input_data['schema_name'] = indicator_schema
                input_data['schema_version'] = indicator_schema_version
                input_data['data_config_name'] = indicator_name + '_config'
                input_data['data_type'] = data_type
                data = ingestion_schema.load(input_data)

                if not data:
                    utils.send_email(config['email_address'], "Error: The given input definition is invalid")
                    raise Exception('Error: The given input definition is invalid')

                ingestion_data = IngestionModel(data)
                ingestion_data.save()
                flag = 1
                response = transform_helper.create_table(indicator_name, indicator_schema, indicator_schema_version, schema)
                if response['status'] == 500:
                    utils.send_email(config['email_address'], 'Error: ' + response['message'] + '. ' + response['trace'] if response['trace'] is not None else '')
                    raise Exception('Error: ' + response['message'] + '. ' + response['trace'] if response['trace'] is not None else '')

            table_name = indicator_name + '_' + indicator_schema + '_' + indicator_schema_version
            table_name = table_name.replace('.', '_')
            time_now = datetime.datetime.utcnow()
            for val in output_dict[key]:
                val['created_at'] = time_now
            #     val['temporal_identifier'] = config['temporal_identifier']

            response = transform_helper.insert_data(table_name, output_dict[key])
            if response['status'] == 500:
                if flag == 1:
                    transform_helper.delete_table(indicator_name, indicator_schema, indicator_schema_version, schema)
                utils.send_email(config['email_address'], 'Error: ' + response['message'] + '. ' + response['trace'] if response['trace'] is not None else '')
                raise Exception('Error: ' + response['message'] + '. ' + response['trace'] if response['trace'] is not None else '')
    
    utils.send_email(config['email_address'], "Data has been transformed successfully")


@transform_api.route('/<indicator_name>', methods=['GET', 'PUT', 'DELETE'])
@transform_api.param('indicator_name', 'Name of the dataset')
class Transform(Resource):

    @transform_api.doc('Get the indicator configuration')
    def get(self, indicator_name):

        data = TransformModel.get_indicator_by_name(indicator_name)
        if not data:
            return custom_response('Error: Configuration not found', 400)

        schema = transform_schema.dump(data)
        return schema

    @transform_api.doc("Delete the indicator configuration")
    def delete(self, indicator_name):
        indicator = TransformModel.get_indicator_by_name(indicator_name)
        if not indicator:
            return custom_response('Error: Configuration not found', 400)
        indicator.delete()
        return custom_response('Success: Configuration has been deleted successfully', 200)

    @transform_api.doc('Update the configuration')
    @transform_api.expect(transform_parser, validate=True)
    def put(self, indicator_name):
        input_data = request.json
        data = transform_schema.load(input_data, partial=True)
        if not data:
            return custom_response('Error: The given indicator definition is invalid', 500)

        config = TransformModel.get_indicator_by_name(indicator_name)
        if not config:
            return custom_response('Error: Configuration not found', 400)
        config.update(input_data)
        return custom_response('Success: Configuration has been updated successfully', 200)


@transform_api.route('/', methods=['POST'])
class TransformList(Resource):

    @transform_api.doc('Create Indicator Config')
    @transform_api.expect(transform_parser, validate=True)
    def post(self):

        input_data = request.json
        name = input_data['indicator_name']
        config = TransformModel.get_indicator_by_name(name)
        if config:
            return custom_response('Error: Configuration name and version already exist, please use a different name/version', 500)

        data = transform_schema.load(input_data)
        if not data:
            return custom_response('Error: The given configuration definition is invalid', 500)

        config = TransformModel(data)
        config.save()
        return custom_response('Success: Config has been created successfully', 200)


@transform_api.route('/run/<indicator_name>', methods=['POST'])
@transform_api.param('indicator_name', 'Name of the indicator')
class TransformRun(Resource):

    @transform_api.doc('Run Indicator Config')
    def post(self, indicator_name):

        indicator_data = TransformModel.get_indicator_by_name(indicator_name)
        if not indicator_data:
            return custom_response('Error: Indicator name and version do not exist', 500)

        thread = Thread(target=execute_job, args=(flask.current_app._get_current_object(), indicator_name, indicator_data,))
        thread.daemon = True
        thread.start()

        return custom_response('Indicator is being transformed! You will recieve an email once it has been ingested successfully.', 200)
