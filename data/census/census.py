import glob
import csv
import psycopg2
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, Integer, Float, BigInteger, BIGINT, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship

Base = declarative_base()

base_location = "/home/liu.6544a/data/table/"
SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')

# base_location = "D:/Luyu/CURA-RA/MORPC/data/tables/2010/table/"
# SQLALCHEMY_DATABASE_URI = 'postgres://postgres:postgres@localhost:5432/MORPC'

census_files_list = glob.glob(base_location + "DEC_10_SF1_*_with_ann.csv")
file_base_name = "DEC_10_SF1_"
engine = create_engine(SQLALCHEMY_DATABASE_URI, echo=True)
Session = sessionmaker(bind=engine)

data_id = "census"
geography_level = ["county", "tract", "blockgroup"]

class TableMetadata(Base):
    __tablename__ = "table_metadata"
    __table_args__ = {'schema' : 'dashboard'}

    table_name = Column(String)
    data_id = Column(String, primary_key=True)
    year_id = Column(String, primary_key=True)
    level_id = Column(String, primary_key=True)
    table_id = Column(String, primary_key=True)
    title = Column(String)
    universe = Column(String)
    # columns = relationship("ColumnMetadata", backref="table_metadata")

    def __init__(self, table_name, data_id, year_id, level_id, table_id, title, universe):
        self.table_name = table_name
        self.data_id = data_id
        self.year_id = year_id
        self.level_id = level_id
        self.table_id = table_id
        self.title = title
        self.universe = universe

class ColumnMetadata(Base):
    __tablename__ = "column_metadata"
    __table_args__ = {'schema' : 'dashboard'}

    column_id = Column(String)
    table_name = Column(String)
    data_id = Column(String, primary_key=True)
    year_id = Column(String, primary_key=True)
    level_id = Column(String, primary_key=True)
    table_id = Column(String, primary_key=True)
    # table_name = Column(String, ForeignKey('table_metadata.table_name'))
    column_short_id = Column(String, primary_key=True)
    column_name = Column(String)

    def __init__(self, column_id, table_name, table_name_args, column_short_id, column_name):
        self.column_id = column_id
        self.table_name = table_name
        self.data_id = table_name_args[0]
        self.year_id = table_name_args[1]
        self.level_id = table_name_args[2]
        self.table_id = table_name_args[3]
        self.column_short_id = column_short_id
        self.column_name = column_name

try:
    TableMetadata.__table__.drop(bind = engine)
    ColumnMetadata.__table__.drop(bind = engine)
except:
    pass


try:
    TableMetadata.__table__.create(bind = engine)
    ColumnMetadata.__table__.create(bind = engine)
except:
    pass

file_count = 0
for each_file_name in census_files_list:
    session = Session()
    name_segment_list = each_file_name.split("_")
    year_id = name_segment_list[1]
    table_id = name_segment_list[3]

    id_list = []
    name_list = []

    table_title = None

    with open(each_file_name) as each_file:
        each_reader = csv.reader(each_file, delimiter=',')
        line_count = 0
        
        for row in each_reader:
            if line_count == 0: # Create table in sqlalchemy
                row = list(row)
                for column_id in row:
                    if column_id == "GEO.id":
                        column_id = "GEO_id"
                    elif column_id == "GEO.display-label":
                        column_id = "GEO_display_label"
                    elif column_id == "GEO.id2":
                        column_id = "GEO_id2"
                    id_list.append(column_id)
                    # for level_id in geography_level:
                    #     if column_id == "GEO_id" or column_id == "GEO_display_label":
                    #         class_dic_list[level_id]["GEO_id"] = Column(String)
                    #     elif column_id == "GEO_id2":
                    #         class_dic_list[level_id]["GEO_id2"] = Column(BigInteger, primary_key=True)
                    #     else:
                    #         class_dic_list[level_id][column_id] = Column(BigInteger)
                
                meta_file_name = file_base_name + table_id + ".txt"
                with open(base_location+ meta_file_name) as meta_file:
                    meta_file.readline()
                    title = meta_file.readline()
                    meta_file.readline()
                    universe = meta_file.readline().split(":")[1]
                    table_title = universe
                    table_title=table_title.split("\n")[0]

                    print("****----------------------------------------------------------****")
                    print(title, universe)
                    print("****----------------------------------------------------------****")
                    level_id= "county"
                    table_name = data_id + "_" + year_id + "_" + level_id + "_" + table_id
                    class CountyCensus(Base):
                        __tablename__ = table_name
                        __table_args__ = {'schema' : 'dashboard'}

                        for column_id in id_list:
                            if column_id == "GEO_id" or column_id == "GEO_display_label":
                                harder_code = column_id + " = Column(String)"
                            elif column_id == "GEO_id2":
                                harder_code = column_id + " = Column(BIGINT, primary_key=True)"
                            else:
                                harder_code = column_id + " = Column(BIGINT)"
                            exec(harder_code)

                        def __init__(self, arg_list):
                            for index in range(len(id_list)):
                                hard_code = "self." + id_list[index] + " = arg_list["+ str(index) + "]"
                                exec(hard_code)
                    tableMetadata = TableMetadata(table_name, data_id, year_id, level_id, table_id, title, universe)
                    session.add(tableMetadata)

                    level_id = "tract"
                    table_name = data_id + "_" + year_id + "_" + level_id + "_" + table_id
                    class TractCensus(Base):
                        __tablename__ = table_name
                        __table_args__ = {'schema' : 'dashboard'}

                        for column_id in id_list:
                            if column_id == "GEO_id" or column_id == "GEO_display_label":
                                harder_code = column_id + " = Column(String)"
                            elif column_id == "GEO_id2":
                                harder_code = column_id + " = Column(BIGINT, primary_key=True)"
                            else:
                                harder_code = column_id + " = Column(BIGINT)"
                            exec(harder_code)

                        def __init__(self, arg_list):
                            for index in range(len(id_list)):
                                hard_code = "self." + id_list[index] + " = arg_list["+ str(index) + "]"
                                exec(hard_code)
                    tableMetadata = TableMetadata(table_name, data_id, year_id, level_id, table_id, title, universe)
                    session.add(tableMetadata)

                    level_id = "blockgroup"
                    table_name = data_id + "_" + year_id + "_" + level_id + "_" + table_id
                    class BlockgroupCensus(Base):
                        __tablename__ = table_name
                        __table_args__ = {'schema' : 'dashboard'}
                        for column_id in id_list:
                            if column_id == "GEO_id" or column_id == "GEO_display_label":
                                harder_code = column_id + " = Column(String)"
                            elif column_id == "GEO_id2":
                                harder_code = column_id + " = Column(BIGINT, primary_key=True)"
                            else:
                                harder_code = column_id + " = Column(BIGINT)"
                            exec(harder_code)

                        def __init__(self, arg_list):
                            for index in range(len(id_list)):
                                hard_code = "self." + id_list[index] + " = arg_list["+ str(index) + "]"
                                exec(hard_code)
                    tableMetadata = TableMetadata(table_name, data_id, year_id, level_id, table_id, title, universe)
                    session.add(tableMetadata)
                            
            elif line_count == 1: # Create Column metadata
                for column_name in row:
                    name_list.append(column_name) # pass
                
                for index in range(len(name_list)):
                    level_id= "county"
                    table_name = data_id + "_" + year_id + "_" + level_id + "_" + table_id
                    column_id = table_name + "_" + id_list[index]
                    columnMetadata = ColumnMetadata(column_id, table_name,[data_id, year_id, level_id, table_id], id_list[index], name_list[index])
                    session.add(columnMetadata)

        
            else: # Load data
                raw_data = row
                length = len(raw_data[1])
                data = []
                count = 0
                for each_item in raw_data:
                    count+=1
                    if count==1 or count==3:
                        data.append(each_item)
                        continue
                    else:
                        try:
                            each_item = int(each_item)
                        except:
                            each_item.split("(")
                            each_item = each_item[0]
                            try:
                                each_item = int(each_item)
                            except:
                                each_item = 0
                    data.append(each_item)

                if length == 5:
                    insert_record = CountyCensus(data)
                elif length == 11:
                    insert_record = TractCensus(data)
                elif length == 12:
                    insert_record = BlockgroupCensus(data)
                session.add(insert_record)


            line_count += 1
        
        try:
            CountyCensus.__table__.drop(bind = engine)
            TractCensus.__table__.drop(bind = engine)
            BlockgroupCensus.__table__.drop(bind = engine)
        except:
            pass

        try:
            CountyCensus.__table__.create(bind = engine)
            TractCensus.__table__.create(bind = engine)
            BlockgroupCensus.__table__.create(bind = engine)
        except:
            pass
        session.commit()
        session.close()

    file_count += 1
    print("----------------------------------------------------------")
    print(f'Table: {table_title}, processed {line_count} lines. Progress: {file_count} out of {len(census_files_list)}')
    print("----------------------------------------------------------")

print(len(census_files_list))
