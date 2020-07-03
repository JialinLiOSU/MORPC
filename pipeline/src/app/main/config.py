import os


class Development(object):

    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgres://mani.46a:JWq7UQf8rVLqSs5W@localhost:5432/morpc_pipeline'
    # SQLALCHEMY_DATABASE_URI = 'postgres://kaushikmani:Kaushik123@database:5432/data_pipeline'
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class Production(object):
    """
    Production environment configurations
    """
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = 'postgres://mani.46a:JWq7UQf8rVLqSs5W@localhost:5432/morpc_pipeline'
    # SQLALCHEMY_DATABASE_URI = 'postgres://kaushikmani:Kaushik123@localhost:5432/data_pipeline'

app_config = {
    'development': Development,
    'production': Production
}
