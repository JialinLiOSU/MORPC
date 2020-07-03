from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy import create_engine

# initialize our db
db = SQLAlchemy()

bcrypt = Bcrypt()

SQLALCHEMY_DATABASE_URI = "postgres://liu.6544a:0EjBzT2CUk2B85m8hF64@localhost:5432/morpc_pipeline"

engine = create_engine(SQLALCHEMY_DATABASE_URI, echo=True)