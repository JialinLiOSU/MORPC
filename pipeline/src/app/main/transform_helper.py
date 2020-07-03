from sqlalchemy import MetaData, JSON, Table, Column, select
from app.main.models import db
import sqlalchemy
import traceback
import avro
import datetime
from datetime import timedelta
from app.main import utils


root_dir = 'app/main/'


def get_avro_file_as_object(name, schema_name, schema_version, config):

    try:
        working_dir = root_dir + 'data/avro/'
        avro_file_name = name + '_' + schema_name + '_' + schema_version
        avro_file_name = avro_file_name.replace('.', '_')
        reader = avro.datafile.DataFileReader(open(working_dir + avro_file_name + '_' + config['temporal_identifier'] + '.avro', "rb"), avro.io.DatumReader())
        values = dict()
        values['name'] = name
        values['schema_name'] = schema_name
        values['schema_version'] = schema_version
        values['created_at'] = datetime.datetime.now()
        values['data'] = list()
        for val in reader:
            data = decode_avro(val, schema_name, schema_version)
            values['data'].append(data)
        reader.close()
        return values
    except:
        return utils.helper_response('Could not retrieve the data for dataset: ' + name, 500, traceback.format_exc())


def decode_avro(data, schema_name, schema_version):

    schema = utils.read_avro_schema(schema_name, schema_version)
    schema_avro = schema.to_json()
    columns = schema_avro['fields']
    for i in range(len(columns)):
        if data[columns[i]['name']] is not None and isinstance(columns[i]['type'], list) and 'logicalType' in columns[i]['type'][1] and columns[i]['type'][1]['logicalType'] == 'date':
            data[columns[i]['name']] = datetime.datetime(1970, 1, 1) + timedelta(data[columns[i]['name']])
        elif data[columns[i]['name']] is not None and isinstance(columns[i]['type'], list) and 'logicalType' in columns[i]['type'][1] and columns[i]['type'][1]['logicalType'] == 'timestamp-millis':
            data[columns[i]['name']] = datetime.datetime.fromtimestamp(data[columns[i]['name']] / 1e3)

    return data


def create_table(name, schema_name, schema_version, schema):

    try:
        engine = db.get_engine()
        metadata = MetaData(engine)
        table_name = name + '_' + schema_name + '_' + schema_version
        table_name = table_name.replace('.', '_')
        table_fields = schema.table_fields

        table = Table(table_name, metadata,
                      # Column('id', sqlalchemy.Integer, primary_key=True, autoincrement=True),
                      Column('created_at', sqlalchemy.DateTime, primary_key=True),
                    *(Column(field_object['field_name'], utils.get_column_type(field_object['field_type']), primary_key=field_object['primary_key'] if 'primary_key' in field_object else False) for field_object in table_fields))

        table.create()
        return utils.helper_response('Table has been created successfully', 200)
    except:
        return utils.helper_response('Could not create the table for the given data', 500, traceback.format_exc())


def delete_table(name, schema_name, schema_version, schema):

    try:
        engine = db.get_engine()
        metadata = MetaData(engine)
        table_name = name + '_' + schema_name + '_' + schema_version
        table_name = table_name.replace('.', '_')

        table_fields = schema.table_fields

        table = Table(table_name, metadata,
                      # Column('id', sqlalchemy.Integer, primary_key=True, autoincrement=True),
                      Column('created_at', sqlalchemy.DateTime, primary_key=True),
                    *(Column(field_object['field_name'], utils.get_column_type(field_object['field_type']), primary_key=field_object['primary_key'] if 'primary_key' in field_object else False) for field_object in table_fields))

        table.drop()
        return utils.helper_response('Table has been dropped successfully', 200)
    except:
        return utils.helper_response('Could not rollback successfully. Table has not been deleted', 500, traceback.format_exc())


def insert_data(table_name, data):

    try:
        engine = db.get_engine()
        metadata = MetaData(engine)
        metadata.reflect(views=True)
        curr_table = metadata.tables[table_name]
        conn = engine.connect()

        conn.execute(curr_table.insert(), data)

        return utils.helper_response('Data has been transformed and inserted into the table successfully', 200)

    except:
        return utils.helper_response('Could not insert/transform the data', 500, traceback.format_exc())
