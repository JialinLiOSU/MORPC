from marshmallow import fields, Schema
from app.main.models import db
import datetime


class DatasetConfigModel(db.Model):

    __tablename__ = 'dataset_config'
    __table_args__ = {'extend_existing': True}

    dataset_config_name = db.Column(db.String(128), nullable=False, primary_key=True)
    config = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, primary_key=True)
    modified_at = db.Column(db.DateTime)

    def __init__(self, data):

        self.dataset_config_name = data.get('dataset_config_name')
        self.config = data.get('config')
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
    def get_all_dataset_configs():
        return DatasetConfigModel.query.all()

    @staticmethod
    def get_dataset_config_by_name(dataset_config_name):
        return DatasetConfigModel.query.filter_by(dataset_config_name=dataset_config_name).order_by(DatasetConfigModel.created_at).first()


class DatasetConfigSchema(Schema):

    dataset_config_name = fields.Str(required=True)
    config = fields.Dict(keys=fields.Str(), values=fields.Str(), required=True)
    created_at = fields.DateTime(dump_only=True)
    modified_at = fields.DateTime(dump_only=True)

