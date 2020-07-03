# Install postgres and dependence
sudo yum install postgresql11
sudo yum install postgresql11-devel
sudo systemctl start postgresql-11.service

sudo postgresql-setup initdb # If you have to use 9.2...
systemctl restart postgresql.service
# change the setting in pg_hba.conf all to password

# Create roles
### If postgres is not a registered user in the linux, you must create it first.
sudo su - postgres # Switch to postgres




# Create database to login and create a superuser
psql
CREATE ROLE "liu.6544a";
CREATE DATABASE "liu.6544a";
ALTER ROLE "liu.6544a" with password '0EjBzT2CUk2B85m8hF64';
ALTER ROLE "liu.6544a" WITH LOGIN SUPERUSER;

CREATE ROLE "root";
CREATE DATABASE "root";
ALTER ROLE "root" with password '0EjBzT2CUk2B85m8hF64';
ALTER ROLE "root" WITH LOGIN SUPERUSER;


psql postgres://liu.6544a:0EjBzT2CUk2B85m8hF64@localhost:5432/morpc

psql postgres://yulu:nHhMdDAdtGk42zi0@localhost:5432/morpc


CREATE DATABASE morpc;
\connect morpc;
CREATE SCHEMA dashboard;

# Then you can login in with your name without su.


# Python dependence install
pip3 install psycopg2 --user
sudo yum install gcc # You need to install gcc also


# Install pipenv and relevant dependence for the API.
pip install pipenv --user
pipenv shell
sudo yum install postgresql-devel python-devel
pipenv install flask flask-sqlalchemy psycopg2 flask-migrate flask-script marshmallow flask-bcrypt pyjwt GeoAlchemy2

psql 
SHOW config_file;
SHOW hba_file;

# change all 


# blog_api/
#   |-src
#     	|- __init__.py
#         |- shared
#             |- __init__.py
#             |- Authentication.py
#     	|- models
#             |- __init__.py
#             |- UserModel.py
#             |- BlogpostModel.py
#         |- views
#             |- __init__.py
#             |- UserView.py
#             |- BlogpostView.py
#         |- app.py
#         |- config.py
#     |- manage.py
#     |- run.py
#     |- Pipfile
#     |- Pipfile.lock


export FLASK_ENV=development
export DATABASE_URL=postgres://liu.6544a:0EjBzT2CUk2B85m8hF64@localhost:5432/morpc
export JWT_SECRET_KEY=supersafepassword


# For CURA-PC
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/morpc

# test:
curl -d '{"email": "337845818@gmail.com", "password":"mcshitou", "name": "Esperanto Cotez"}' -H 'Content-Type: application/json' http://127.0.0.1:5000/api/v1/users/

curl -d '{"email": "a@b.com", "password":"aaaa", "name": "dad"}' -H 'Content-Type: application/json' http://localhost:5000/api/v1/users/

curl --header 'api-token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1Njg3NDk3ODksImlhdCI6MTU2ODY2MzM4OSwic3ViIjo0fQ.ZRi21YlwfZSZge5jwh7ypzaagnrDeE_2fJoN1psqwEU' http://localhost:5000/api/v1/users/me

# PostGIS installation

# tar xvfz postgis-2.5.3.tar.gz
# cd postgis-2.5.3
# ./configure --with-pgconfig=/usr/pgsql-11/bin/pg_config --with-projdir=/usr/proj49

# --with-xml2config=

# make
# make install

# find /home/username/ -name "*.err"

# I finally gave up. To install postgis on postgresql 11 is impossible. Just use 9.2 instead with postgis 2.0.7





# Docker
# sudo docker rename tender_sammet rhel7
# sudo docker exec -it morpc /bin/bash

# sudo docker pull kartoza/postgis
# sudo docker run --name "postgis" -p 25432:5432 -d -t kartoza/postgis

sudo docker pull mdillon/postgis
sudo docker run -p 5432:5432 -v "/home/liu.6544a/data/postgresql/:/home/liu.6544a/data/postgresql/" --name morpc_2 -e POSTGRES_PASSWORD=mysecretpassword -d mdillon/postgis 

docker run -it --link morpc_2:postgres --rm postgres \
    sh -c 'exec psql -h "127.0.0.1" -p "5432" -U postgres'

# If ipv4 is disabled: try:
/etc/sysctl.conf: net.ipv4.ip_forward=1



sudo docker exec -it morpc_2 /bin/bash # Start bash

sudo docker start -a morpc_2 # Start with process hints
chcon -Rt svirt_sandbox_file_t /var/run/postgresql # Change SElinux context

sudo docker stop morpc
sudo docker rm morpc


netstat -nlp | grep 5432

# Install postgREST, Just SFTP it and tar it. Then move it to /usr/local/bin to make it global.
# Follow the instruction exactly: http://postgrest.org/en/v5.2/tutorials/tut0.html

# To make it work, I changed the pg_hba.conf using root.
# Change all METHOD to password instead of ident.

# To make it work, you have to first run information_schema code.
psql -d myDataBase -a -f /usr/pgsql-11/share/information_schema.sql

# Then assign corresponding priviledges for different users.
psql
grant usage on schema dashboard to web_anon;
grant select on dashboard.altfuelstation to web_anon;
grant usage on schema dashboard to web_authenticator;
grant select on dashboard.altfuelstation to web_authenticator;
grant usage on schema pg_catalog to web_anon;
grant select on all tables in schema pg_catalog to web_authenticator;

# Now, create a conf file with name config.conf.
db-uri = "postgres://web_authenticator:XXXXX@127.0.0.1:5432/morpc"
db-schema = "dashboard"
db-anon-role = "web_anon"
server-port=5555

# After all, you should be able to run the postgEST by:
postgrest config.conf

# Now, if you curl locally:
curl localhost:5555/altfuelstations

# Then the questions is: how to make this entry public?

https://cura-sco-dev.asc.ohio-state.edu:5555/altfuelstations



conda activate api
cd /home/liu.6544a/gitlab/morpc-rsd/server/REST/
python run.py

cd /home/mani.46la/morpc-rsd/pipeline/src
python3 manage.py run

psql postgres://liu.6544a:0EjBzT2CUk2B85m8hF64@localhost:5432/morpc


128.146.194.41
GEOG-CURA-P7810.asc.ohio-state.edu