from marshmallow import fields, Schema
from app.main.models import db
import datetime


class DataSchemaModel(db.Model):

    __tablename__ = 'data_schema'
    __table_args__ = {'extend_existing': True}

    schema_name = db.Column(db.String(128), nullable=False, primary_key=True)
    schema_version = db.Column(db.String(128), nullable=False, primary_key=True)
    table_fields = db.Column(db.JSON)
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)

    def __init__(self, data):

        self.schema_name = data.get('schema_name')
        self.schema_version = data.get('schema_version')
        self.table_fields = data.get('table_fields')
        self.created_at = datetime.datetime.utcnow()
        self.modified_at = datetime.datetime.utcnow()

    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, data):
        for key, item in data.items():
            setattr(self, key, item)

        self.modified_at = datetime.datetime.utcnow()
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def get_all_schemas():
        return DataSchemaModel.query.all()

    @staticmethod
    def get_schema_by_name_version(schema_name, schema_version):
        return DataSchemaModel.query.filter_by(schema_name=schema_name).filter_by(schema_version=schema_version).first()


class DataSchema(Schema):

    schema_name = fields.Str(required=True)
    schema_version = fields.Str(required=True)
    table_fields = fields.List(fields.Dict(), required=True)
    created_at = fields.DateTime(dump_only=True)
    modified_at = fields.DateTime(dump_only=True)

