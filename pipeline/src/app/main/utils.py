from flask import json, Response
import sqlalchemy
import smtplib
import traceback
import avro
import os

root_dir = 'app/main/'


def custom_response(result, status_code):
    return Response(
        mimetype="application/json",
        response=json.dumps(result),
        status=status_code
    )


def helper_response(message, status_code, trace=None):
    response = dict()
    response['status'] = status_code
    response['message'] = message
    if status_code != 200:
        response['trace'] = trace
    return response


def create_avro_schema(schema_name, schema_version, table_fields):

    try:
        # schema_name = schema_name
        # schema_version = schema.schema_version
        avro_schema = dict()
        file_name = schema_name + '_' + schema_version
        file_name = file_name.replace('.', '_')
        avro_schema['namespace'] = file_name + '.avsc'
        avro_schema['type'] = 'record'
        avro_schema['name'] = file_name

        schema_field_list = table_fields
        avro_field_list = list()
        for field in schema_field_list:
            field_dict = avro_field_helper(field)
            avro_field_list.append(field_dict)

        avro_schema['fields'] = avro_field_list

        with open(root_dir + 'schema/' + file_name + '.avsc', 'w') as avro_schema_file:
            json.dump(avro_schema, avro_schema_file)

        return helper_response('Avro Schema has been created successfully', 200)
    except:
        return helper_response('Could not create Avro Schema', 500, traceback.format_exc())


def delete_avro_schema(schema):

    try:
        schema_name = schema.schema_name
        schema_version = schema.schema_version
        file_name = schema_name + '_' + schema_version
        file_name = file_name.replace('.', '_')
        if os.path.isfile(root_dir + 'schema/' + file_name + '.avsc'):
           os.remove(root_dir + 'schema/' + file_name + '.avsc')
    except:
        return helper_response('Rollback failed: Could not delete avro schema', 500, traceback.format_exc())


def avro_field_helper(field):

    field_dict = dict()
    field_dict['name'] = field['field_name']
    if field['field_type'].lower() == 'record':
        field_dict['type'] = dict()
        field_dict['type']['type'] = 'record'
        field_dict['type']['name'] = field['field_name'] + '_record'
        field_dict['type']['fields'] = list()
        for f in field['sub_fields']:
            sub_fields = avro_field_helper(f)
            field_dict['type']['fields'].append(sub_fields)
    elif field['field_type'].lower() == 'date':
        field_dict['type'] = []
        field_dict['type'].append('null')
        sub_type = dict()
        sub_type['type'] = 'int'
        sub_type['logicalType'] = field['field_type']
        field_dict['type'].append(sub_type)
        field_dict['default'] = None
    elif field['field_type'].lower() == 'array':
        field_dict['type'] = list()
        field_dict['type'].append('null')
        sub_type = dict()
        sub_type['type'] = 'array'
        sub_type['items'] = field['subfield_type']
        field_dict['type'].append(sub_type)
        field_dict['default'] = None
    elif field['field_type'].lower() == 'integer':
        field_dict['type'] = []
        field_dict['type'].append('null')
        field_dict['type'].append('int')
    elif field['field_type'].lower() == 'boolean':
        field_dict['type'] = []
        field_dict['type'].append('null')
        field_dict['type'].append('boolean')
    elif field['field_type'].lower() == 'long':
        field_dict['type'] = []
        field_dict['type'].append('null')
        field_dict['type'].append('long')
    elif field['field_type'].lower() == 'decimal':
        field_dict['type'] = []
        field_dict['type'].append('null')
        field_dict['type'].append('double')
        # field_dict['logicalType'] = 'decimal'
        # field_dict['precision'] = 6
    elif field['field_type'].lower() == 'datetime':
        field_dict['type'] = []
        field_dict['type'].append('null')
        sub_type = dict()
        sub_type['type'] = 'long'
        sub_type['logicalType'] = 'timestamp-millis'
        field_dict['type'].append(sub_type)
        field_dict['default'] = None
    elif field['field_type'].lower() == 'string':
        field_dict['type'] = []
        field_dict['type'].append('null')
        field_dict['type'].append('string')
    else:
        field_dict['type'] = field['field_type']

    return field_dict


def get_column_type(column_type_str):
    if column_type_str.lower() == 'string':
        return sqlalchemy.String
    elif column_type_str.lower() == 'integer':
        return sqlalchemy.INTEGER
    elif column_type_str.lower() == 'decimal':
        return sqlalchemy.DECIMAL
    elif column_type_str.lower() == 'smallint':
        return sqlalchemy.SMALLINT
    elif column_type_str.lower() == 'bigint':
        return sqlalchemy.BIGINT
    elif column_type_str.lower() == 'numeric':
        return sqlalchemy.NUMERIC
    elif column_type_str.lower() == 'real':
        return sqlalchemy.REAL
    elif column_type_str.lower() == 'record':
        return sqlalchemy.JSON
    elif column_type_str.lower() == 'json':
        return sqlalchemy.JSON
    elif column_type_str.lower() == 'array':
        return sqlalchemy.JSON
    elif column_type_str.lower() == 'datetime':
        return sqlalchemy.DateTime
    elif column_type_str.lower() == 'date':
        return sqlalchemy.DATE
    elif column_type_str.lower() == 'boolean':
        return sqlalchemy.BOOLEAN
    elif column_type_str.lower() == 'long':
        return sqlalchemy.BIGINT


def read_avro_schema(schema_name, schema_version):

    avro_schema_file = schema_name + '_' + schema_version
    avro_schema_file = avro_schema_file.replace('.', '_')

    schema = avro.schema.Parse(open(root_dir + 'schema/' + avro_schema_file + '.avsc', 'r').read())

    return schema


def send_email(email_address, content):

    sender_email = 'noreply_cura@osu.edu'
    port = 25
    
    server = smtplib.SMTP("localhost", port)

    # setup the parameters of the message
    from_address = sender_email
    to_address = email_address
    text = content
    # add in the message body

    server.sendmail(from_address, to_address, str(text))

