from flask import Flask
from app.main.models import db
from app.main.config import app_config
from app.main import reverse_proxy


def create_app(config_name):

    app = Flask(__name__)
    app.wsgi_app = reverse_proxy.ReverseProxied(app.wsgi_app)
    config = app_config[config_name]
    app.config.from_object(config)
    db.init_app(app)

    return app
