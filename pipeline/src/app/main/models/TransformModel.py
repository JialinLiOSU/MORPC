from marshmallow import fields, Schema
from app.main.models import db
import datetime


class TransformModel(db.Model):

    __tablename__ = 'transform'
    __table_args__ = {'extend_existing': True}

    indicator_name = db.Column(db.String(128), nullable=False, primary_key=True)
    config = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, primary_key=True)
    modified_at = db.Column(db.DateTime)

    def __init__(self, data):

        self.indicator_name = data.get('indicator_name')
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
    def get_all_indicators():
        return TransformModel.query.all()

    @staticmethod
    def get_indicator_by_name(indicator_name):
        return TransformModel.query.filter_by(indicator_name=indicator_name).order_by(TransformModel.created_at.desc()).first()


class TransformSchema(Schema):

    indicator_name = fields.Str(required=True)
    config = fields.Dict(keys=fields.Str(), required=True)
    created_at = fields.DateTime(dump_only=True)
    modified_at = fields.DateTime(dump_only=True)

