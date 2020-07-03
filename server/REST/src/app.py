from flask import Flask

from .config import app_config
from .models import db, bcrypt # add this new line

from .views.UserView import user_api as user_blueprint # add this line
from .views.GeoView import geo_api as geo_blueprint # add this line
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def create_app(env_name):
    """
    Create app
    """

    # app initiliazation
    app = Flask(__name__)

    app.config.from_object(app_config[env_name])

    bcrypt.init_app(app)  # add this line

    db.init_app(app) # add this line

    app.register_blueprint(user_blueprint, url_prefix='/api/v1/users') 
    app.register_blueprint(geo_blueprint, url_prefix='/api/v1/geos') 

    @app.route('/', methods=['GET'])
    def index():
        """
        example endpoint
        """
        return 'Congratulations! Your first endpoint is workin'
        
    return app


if __name__ == '__main__':
    app.run(debug=True)
