import os

from src.app import create_app

if __name__ == '__main__':
  os.environ["FLASK_ENV"] = "development"
  os.environ["DATABASE_URL"] = "postgres://liu.6544a:0EjBzT2CUk2B85m8hF64@localhost:5432/morpc"
  os.environ["JWT_SECRET_KEY"] = "supersafepassword"


  env_name = os.getenv('FLASK_ENV')
  app = create_app(env_name)
  # run app
  app.run()