from marshmallow import fields, Schema
from app.main.models import db
import datetime


class IngestionModel(db.Model):

    __tablename__ = 'data_ingestion'
    __table_args__ = {'extend_existing': True}

    data_name = db.Column(db.String(128), nullable=False, primary_key=True)
    schema_name = db.Column(db.String(128), nullable=False, primary_key=True)
    schema_version = db.Column(db.String(128), nullable=False, primary_key=True)
    data_config_name = db.Column(db.String(128), nullable=True)
    data_type = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)

    def __init__(self, data):

        self.data_name = data.get('data_name')
        self.schema_name = data.get('schema_name')
        self.schema_version = data.get('schema_version')
        self.data_config_name = data.get('data_config_name')
        self.data_type = data.get('data_type')
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
    def get_all_data_ingestions():
        return IngestionModel.query.all()

    @staticmethod
    def get_dataset_ingestion_by_name(data_name):
        return IngestionModel.query.filter_by(data_name=data_name).order_by(IngestionModel.created_at.desc()).first()

    @staticmethod
    def get_indicator_ingestion_by_name_type(data_name, datatype):
        return IngestionModel.query.filter_by(data_name=data_name).filter_by(data_type=datatype).order_by(IngestionModel.created_at.desc()).first()


class IngestionSchema(Schema):

    data_name = fields.Str(required=True)
    schema_name = fields.Str(required=True)
    schema_version = fields.Str(required=True)
    data_config_name = fields.Str(required=False)
    data_type = fields.Str(required=True)
    created_at = fields.DateTime(dump_only=True)
    modified_at = fields.DateTime(dump_only=True)

