from marshmallow import fields, Schema
import datetime
from . import db
from ..app import bcrypt  # add this line
from .GeoModel import GeoSchema

class UserModel(db.Model):
    """
    User Model
    """

    # table name
    __tablename__ = 'users'
    __table_args__ = {'schema' : 'dashboard'}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=True)
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)

    # class constructor
    def __init__(self, data):
        """
        Class constructor
        """
        self.name = data.get('name')
        self.email = data.get('email')
        self.password = self.__generate_hash(
            data.get('password'))  # add this line
        self.created_at = datetime.datetime.utcnow()
        self.modified_at = datetime.datetime.utcnow()
        geos = db.relationship(
            'GeoModel', backref='users', lazy=True)  # add this new line

    def save(self):
        db.session.add(self)
        db.create_all() # ORIGINAL
        db.session.commit()

    def update(self, data):
        for key, item in data.items():
            if key == 'password':  # add this new line
                self.password = self.__generate_hash(
                    value)  # add this new line
            setattr(self, key, item)
        self.modified_at = datetime.datetime.utcnow()
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def __generate_hash(self, password):
        return bcrypt.generate_password_hash(password, rounds=10).decode("utf-8")

    def check_hash(self, password):
        return bcrypt.check_password_hash(self.password, password)

    @staticmethod
    def get_all_users():
        return UserModel.query.all()

    @staticmethod
    def get_one_user(id):
        return UserModel.query.get(id)

    def __repr(self):
        return '<id {}>'.format(self.id)
    
    @staticmethod
    def get_user_by_email(email):
        try:
            return UserModel.query.filter_by(email=email).first()
        except:
            return "nonexist"


class UserSchema(Schema):
    """
    User Schema
    """
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True)
    created_at = fields.DateTime(dump_only=True)
    modified_at = fields.DateTime(dump_only=True)
    geos = fields.Nested(GeoSchema, many=True)
