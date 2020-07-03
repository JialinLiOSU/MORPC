import glob, json

import os 
dir_path = os.path.dirname(os.path.realpath(__file__))

import psycopg2
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, Integer, Float, BigInteger, BIGINT, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship

Base = declarative_base()

SQLALCHEMY_DATABASE_URI = "postgres://liu.6544a:0EjBzT2CUk2B85m8hF64@localhost:5432/morpc"
# SQLALCHEMY_DATABASE_URI = "postgres://postgres:postgres@localhost:5432/MORPC"

all_jsons = glob.glob(dir_path + "/*.json")

print(all_jsons)
engine = create_engine(SQLALCHEMY_DATABASE_URI, echo=True)
Session = sessionmaker(bind=engine)

session = Session()

for each_json in all_jsons:
    json_name = os.path.basename(each_json).split(".")[0]
    print(json_name)
    with open(each_json) as json_file:
        data = json.load(json_file)
        

        if json_name == "goal_1_7a" or json_name == "goal_1_7b":
            class goal_1_7Table(Base):
                __tablename__ = json_name + "_" + "general"
                __table_args__ = {'schema' : 'dashboard'}

                key = Column(String, primary_key=True)
                Battery = Column(Float, primary_key=False)
                Biomass = Column(Float, primary_key=False)
                Heat = Column(Float, primary_key=False)
                Hydro = Column(Float, primary_key=False)
                SolarPV = Column(Float, primary_key=False)
                SolidWaste = Column(Float, primary_key=False)
                Wind = Column(Float, primary_key=False)

                def __init__(self, data):
                    print(data)
                    self.key = data['key']
                    self.Battery = data['Battery']
                    self.Biomass = data['Biomass']
                    self.Heat = data['Heat']
                    self.Hydro = data['Hydro']
                    self.SolarPV = data['SolarPV']
                    self.SolidWaste = data['SolidWaste']
                    self.Wind = data['Wind']
            
            try:
                goal_1_7Table.__table__.drop(bind = engine)
            except:
                pass
            try:
                goal_1_7Table.__table__.create(bind = engine)
            except:
                pass
            for each_record in data:
                insert_record = goal_1_7Table(each_record)
                session.add(insert_record)
        elif json_name == "goal_1_5":

            class goal_1_5Table(Base):
                __tablename__ = json_name + "_" + "general"
                __table_args__ = {'schema' : 'dashboard'}

                key = Column(String, primary_key=True)
                BD = Column(Float, primary_key=False)
                CNG = Column(Float, primary_key=False)
                E85 = Column(Float, primary_key=False)
                ELEC = Column(Float, primary_key=False)
                HY = Column(Float, primary_key=False)
                LNG = Column(Float, primary_key=False)
                LPG = Column(Float, primary_key=False)

                def __init__(self, data):
                    self.key = data['key']
                    self.CNG = data['CNG']
                    self.BD = data['BD']
                    self.E85 = data['E85']
                    self.ELEC = data['ELEC']
                    self.HY = data['HY']
                    self.LNG = data['LNG']
                    self.LPG = data['LPG']
            try:
                goal_1_5Table.__table__.drop(bind = engine)
            except:
                pass
            try:
                goal_1_5Table.__table__.create(bind = engine)
            except:
                pass
            for each_record in data:
                insert_record = goal_1_5Table(each_record)
                session.add(insert_record)
        elif json_name == "goal_1_2b":

            class goal_1_2bTable(Base):
                __tablename__ = json_name + "_" + "general"
                __table_args__ = {'schema' : 'dashboard'}

                key = Column(String, primary_key=True)
                Biked = Column(Float, primary_key=False)
                PublicTransit = Column(Float, primary_key=False)
                Walked = Column(Float, primary_key=False)

                def __init__(self, data):
                    self.key = data['key']
                    self.Biked = data['Biked']
                    self.PublicTransit = data['PublicTransit']
                    self.Walked = data['Walked']

            try:
                goal_1_2bTable.__table__.drop(bind = engine)
            except:
                pass
            try:
                goal_1_2bTable.__table__.create(bind = engine)
            except:
                pass
            for each_record in data:
                insert_record = goal_1_2bTable(each_record)
                session.add(insert_record)
        else:
            class KeyValueTable(Base):
                __tablename__ = json_name + "_" + "general"
                __table_args__ = {'schema' : 'dashboard'}

                key = Column(String, primary_key=True)
                value = Column(Float, primary_key=False)

                def __init__(self, data):
                    self.key = data['key']
                    self.value = data['value']
            for each_record in data:
                insert_record = KeyValueTable(each_record)
                session.add(insert_record)
            
            try:
                KeyValueTable.__table__.drop(bind = engine)
            except:
                pass
            try:
                KeyValueTable.__table__.create(bind = engine)
            except:
                pass
            session.add(insert_record)

    session.commit()

session.close()
        
        