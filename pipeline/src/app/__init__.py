from flask_restplus import Api
from flask import Blueprint
from app.main.views.SchemaView import schema_api as schema_ns
from app.main.views.ConfigView import config_api as config_ns
from app.main.views.IngestionView import ingestion_api as ingestion_ns
from app.main.views.TransformView import transform_api as transform_ns
import flask


class CustomAPI(Api):
    @property
    def specs_url(self):
        '''
        The Swagger specifications absolute url (ie. `swagger.json`)

        :rtype: str
        '''
        return flask.url_for(self.endpoint('specs'), _external=False)


blueprint = Blueprint('api', __name__)

api = CustomAPI(blueprint,
          title='Data Pipeline',
          version='1.0',
          description=' Data Pipeline for MORPC Dashboard')

api.add_namespace(schema_ns, path='/schema')
api.add_namespace(config_ns, path='/config')
api.add_namespace(ingestion_ns, path='/ingestion')
api.add_namespace(transform_ns, path='/transform')



