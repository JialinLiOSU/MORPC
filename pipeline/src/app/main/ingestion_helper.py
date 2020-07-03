import traceback
import avro
import re
import datetime
import avro.datafile
import avro.io
import csv, json, openpyxl
from app.main import utils
from dateutil import parser
import pytz
import urllib3
import certifi

root_dir = 'app/main/'


def csv_ingestion(file_name, name, schema_name, schema_version, config):

    try:
        schema = utils.read_avro_schema(schema_name, schema_version)
        working_dir = root_dir + 'data/avro/'
        avro_file_name = name + '_' + schema_name + '_' + schema_version
        avro_file_name = avro_file_name.replace('.', '_')
        writer = avro.datafile.DataFileWriter(open(working_dir + avro_file_name + '_' + config['temporal_identifier'] + '.avro', 'wb'), avro.io.DatumWriter(), schema)
        with open(root_dir + 'data/raw/' + file_name + '_' + config['temporal_identifier'] + '.csv', newline='', encoding='utf-8-sig', errors='ignore') as csv_file:
            csv_f = csv.reader(csv_file)
            i = 0
            columns = []
            for row in csv_f:
                if i == 0:
                    schema_avro = schema.to_json()
                    columns = schema_avro['fields']
                else:
                    current_obj = {}
                    for k in range(len(columns)):
                        current_obj[columns[k]['name']] = encode_avro(columns[k], row[k])
                    writer.append(current_obj)
                i += 1
        writer.close()

        return utils.helper_response('Avro file has been created successfully', 200)
    except:
        return utils.helper_response('Could not create avro file: ', 500, traceback.format_exc())


def xls_ingestion(file_name, name, schema_name, schema_version, config):

    try:
        schema = utils.read_avro_schema(schema_name, schema_version)

        working_dir = root_dir + 'data/avro/'
        avro_file_name = name + '_' + schema_name + '_' + schema_version
        avro_file_name = avro_file_name.replace('.', '_')
        writer = avro.datafile.DataFileWriter(open(working_dir + avro_file_name + '_' + config['temporal_identifier'] + '.avro', 'wb'), avro.io.DatumWriter(), schema)

        # with open(root_dir + 'data/raw/' + file_name + '_' + config['temporal_identifier'] + '.xlsx', newline='', encoding='utf-8', errors='ignore') as xls_file:
        xls_f = openpyxl.load_workbook(filename=root_dir + 'data/raw/' + file_name + '_' + config['temporal_identifier'] + '.xlsx')
        sheet_obj = xls_f.active
        total_columns = sheet_obj.max_column
        total_rows = sheet_obj.max_row
        current_obj = {}
        columns = []
        for i in range(1, total_rows+1):
            if i == 1:
                schema_avro = schema.to_json()
                columns = schema_avro['fields']
            else:
                for k in range(1, total_columns+1):
                    current_obj[columns[k-1]['name']] = encode_avro(columns[k-1], sheet_obj.cell(row=i, column=k).value)
                writer.append(current_obj)
        writer.close()
        return utils.helper_response('Avro file has been created successfully', 200)
    except:
        return utils.helper_response('Could not create avro file', 500, traceback.format_exc())


def json_ingestion(file_name, name, schema_name, schema_version, config):

    try:
        schema = utils.read_avro_schema(schema_name, schema_version)
        main_field = config['main_field']
        working_dir = root_dir + 'data/avro/'
        avro_file_name = name + '_' + schema_name + '_' + schema_version
        avro_file_name = avro_file_name.replace('.', '_')
        schema_avro = schema.to_json()
        columns = schema_avro['fields']
        writer = avro.datafile.DataFileWriter(open(working_dir + avro_file_name + '_' + config['temporal_identifier'] + '.avro', 'wb'), avro.io.DatumWriter(), schema)
        with open(root_dir + 'data/raw/' + file_name + '_' + config['temporal_identifier'] + '.json', 'r', newline='', encoding='utf-8') as json_file:
            json_f = json.load(json_file)
            values = json_f[main_field]
            for i in range(len(values)):
                curr_row = values[i]
                current_obj = {}
                for k in range(len(columns)):
                    current_obj[columns[k]['name']] = encode_avro(columns[k], curr_row[columns[k]['name']])
                writer.append(current_obj)
        writer.close()

        return utils.helper_response('Avro file has been created successfully', 200)
    except:
        return utils.helper_response('Could not create avro file: ', 500, traceback.format_exc())


def get_filtered_columns(columns):

    new_columns = []
    for col in columns:
        col = re.sub(r"[-\(\)]", "", str(col))
        split_col = str(col).lower().split(" ")
        new_col = "_".join(split_col)
        new_col = new_col.strip(" ")
        new_columns.append(new_col)

    return new_columns


def encode_avro(columns, row):

    if isinstance(columns['type'], list) and columns['type'][1] == 'double':
        if row == '' or row is None:
            return None
        else:
            return float(row)
    elif isinstance(columns['type'], list) and columns['type'][1] == 'int':
        if row == '' or row is None:
            return None
        else:
            return int(row)
    elif isinstance(columns['type'], list) and columns['type'][1] == 'long':
        if row == '' or row is None:
            return None
        else:
            return int(row)
    elif isinstance(columns['type'], list) and columns['type'][1] == 'boolean':
        if row == '' or row is None:
            return None
        elif str(row).lower() == 'true':
            return True
        elif str(row).lower() == 'false':
            return False
    elif isinstance(columns['type'], list) and 'logicalType' in columns['type'][1] and columns['type'][1]['logicalType'] == 'date':
        if row == '' or row is None:
            return None
        else:
            date_time_obj = parser.parse(str(row))
            return int((date_time_obj - datetime.datetime(1970, 1, 1)).days)
    elif isinstance(columns['type'], list) and 'logicalType' in columns['type'][1] and columns['type'][1]['logicalType'] == 'timestamp-millis':
        if row == '' or row is None:
            return None
        else:
            epoch = datetime.datetime.utcfromtimestamp(0)
            date_time_obj = parser.parse(str(row))
            new_epoch = epoch.replace(tzinfo=pytz.UTC)
            new_date_time_obj = date_time_obj.replace(tzinfo=pytz.UTC)
            return int((new_date_time_obj - new_epoch).seconds * 1000)
    elif isinstance(columns['type'], list) and isinstance(columns['type'][1], dict) and columns['type'][1]['type'] == 'array':
        if row == '' or row is None:
            return None
        else:
            if isinstance(row, list):
                return row
            else:
                val = list()
                val.append(row)
                return val
    elif isinstance(columns['type'], list) and columns['type'][1] == 'string':
        if row == '' or row is None:
            return None
        else:
            return str(row)
    else:
        return row


def download_data(url, file_name):

    try:
        chunk_size = 65536
        http = urllib3.PoolManager(cert_reqs='CERT_REQUIRED', ca_certs=certifi.where())
        r = http.request('GET', url, preload_content=False)

        with open(file_name, 'wb') as out:
            while True:
                data = r.read(chunk_size)
                if not data:
                    break
                out.write(data)

        r.release_conn()
        return utils.helper_response('File has been downloaded successfully', 200)
    except:
        return utils.helper_response('Could not download file: ', 500, traceback.format_exc())
