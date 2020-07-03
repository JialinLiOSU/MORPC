from app import blueprint
from app.main import create_app, db
from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager


app = create_app('development')
app.register_blueprint(blueprint)
app.app_context().push()

manager = Manager(app)

migrate = Migrate(app, db)

manager.add_command('db', MigrateCommand)


@manager.command
def run():
    app.run(port=2000, host='0.0.0.0', threaded=True)


if __name__ == '__main__':
    manager.run()
