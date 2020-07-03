# Data Pipeline

A pipeline which will be used to ingest data into our database.

Here is a simple workflow of the pipeline for ingestion of any indicator.

1. Use schema API's to ingest the schema for any datasets related to indicator.
2. Create configuration for the datasets using Configuration API's.
3. Ingest the datasets required for the indicator using Ingestion APIs.
4. Create transformation configuration for the indicator and ensure that transformation scripts are in the transformation folder in the pipeline.
5. Create schema's for the tables for the indicator using Schema APIs.
6. Run transformation.

The pipeline has 4 parts:

1. Schema

    Schema is the structure of the data to be ingested. We provide API's to create, read, update and delete schema's. The structure of a sample schema is provided [here](https://gitlab.com/osucura/morpc-rsd/blob/kaushik/pipeline/src/app/main/configurations/approved_facilities_schema.json).
    We support the following data types:
    *  String
    *  Integer
    *  SmallInt
    *  BigInt
    *  Decimal
    *  Numeric
    *  Real
    *  Date
    *  Datetime
    *  Boolean
    *  Array - Array data type needs to have a sub_field type.
    
    We internally store the column names in the schema by removing any unnecessary symbols, lowering the case of letters and replacing the spaces by '_'. For example, if a column's name is entered as 'A B C', we store it as 'a_b_c'.
    
    We have 4 API's to perform operations on Schema:
    
    
    *   Get - Get the schema based on the schema name and schema version.<br>
            Parameters: <br>
                - schema_name - Name of the schema <br>
                - schema_version - Version of the schema
    
    
    *   Delete - Delete an existing schema. <br>
            Parameters: <br>
                - schema_name - Name of the schema <br>
                - schema_version - Version of the schema
        
    
    *   Update - Update an existing schema.<br>
            Parameters: <br>
                - schema_name - Name of the schema <br>
                - schema_version - Version of the schema <br>
                - schema - Schema in JSON structure

    
    *   Create - Create a new schema.<br>
            Parameters: <br>
                - schema - Schema in JSON structure
    

2. Configuration

    Configuration is the configuration information required to ingest for the datasets in the indicator. The structure of a sample dataset configuration is provided     [here](https://gitlab.com/osucura/morpc-rsd/blob/kaushik/pipeline/src/app/main/configurations/approved_facilities_config.json).

    The following information is necessary in the configuration.

    * Dataset Name
    * Ingestion Type - Upload/Download
    * Data Type - CSV/XLSX/JSON
    * Temporal Identifier - An time based identifier for the dataset 
    * Email Address - Email address you would like to be contacted to get an update on the ingestion process.
    
    Incase of JSON files, we also require the "main_field" key, where the actual data is present in the JSON.

     We have 4 API's to perform operations on Configuration:
    
    
    *   Get - Get the configuration based on the config name.<br>
            Parameters: <br>
                - config_name - Name of the configuration <br>
    
    
    *   Delete - Delete an existing configuration. <br>
            Parameters: <br>
                - config_name - Name of the configuration <br>
        
    
    *   Update - Update an existing configuration.<br>
            Parameters: <br>
                - config_name - Name of the configuration <br>
                - config - Configuration in JSON structure

    
    *   Create - Create a new configuration.<br>
            Parameters: <br>
                - config - Configuration in JSON structure
                
3. Ingestion

    Ingestion is the process of ingesting the datasets either through download or upload and converting them to Avro format. This will also involve schema validation. It is an asynchronous process, where you will be sent an email (given in your dataset configuration) on both the success and failure of ingestion.
    
    We have 3 API's to perform operations for Ingestion:
    
    * Upload - Ingest a file through upload.<br>
          Parameters: <br>  
            - file - Upload the file to be ingested
            - name - Name of the dataset
            - schema_name - Name of the schema for the dataset
            - schema_version - Version of the schema for the dataset
            - config_name - Name of the configuration for the dataset
            
            
    * Download - Ingest a file through download.<br>
         Parameters: <br>
            - name - Name of the dataset
            - request_url - API URL without any parameters
            - schema_name - Name of the schema for the dataset
            - schema_version - Version of the schema for the dataset
            - config_name - Name of the configuration for the dataset
            
            
    * API - Ingest a file through an API.<br>
         Parameters: <br>
            - name - Name of the dataset
            - url - URL where the dataset exists (Should be an exact URL for the file itself)
            - request_parameters - Request parameters for API in JSON form.
            - schema_name - Name of the schema for the dataset
            - schema_version - Version of the schema for the dataset
            - config_name - Name of the configuration for the dataset
            
    
4. Transformation

    Transformation is the processing of combining all the datasets in an indicator and performing operations on the data and then making the data available in the database. Transformation is for the indicator while Ingestion is for the dataset. Configuration for the indicator is provided in the form of a JSON. The structure of a sample indicator configuration is provided [here](https://gitlab.com/osucura/morpc-rsd/-/blob/kaushik/pipeline/src/app/main/configurations/1_7a_transform.json).
    
    The following information is necessary in the indicator configuration.

    * Indicator Name
    * Datasets - List of all the datasets (name provided during ingestion) for the indicator
    * Schemas - List of schemas of all the tables to be created/updated for the indicator
    * Transformation API - Name of the API to be called for transformation
    * Transformation file - Name of the file for transformation. Please don't include the extension. 
    * Transformation directory - Path of the file from the root directory of the pipeline. It should be a sub-directory of the pipeline module.
    * Email Address - Email address you would like to be contacted to get an update on the transformation process.
    
    
    We have 5 API's to perform operations for Transformation:
    
    *   Get - Get the transformation configuration based on the indicator name.<br>
            Parameters: <br>
                - indicator_name - Name of the indicator <br>
    
    
    *   Delete - Delete an existing configuration for the indicator. <br>
            Parameters: <br>
                - indicator_name - Name of the indicator <br>
        
    
    *   Update - Update an existing configuration for the indicator.<br>
            Parameters: <br>
                - indicator_name - Name of the indicator <br>
                - config - Configuration of the indicator in JSON structure

    
    *   Create - Create a new configuration for the indicator.<br>
            Parameters: <br>
                - config - Configuration in JSON structure
                
    *   Run - Run the transformation process for a specific indicator. <br>
            Parameters: <br>
                - indicator_name - Name of the indicator <br>
                
 
 
 To run the pipeline, please move into pipeline/src. Then use “python3 manage.py run”. The database has been setup in the dev system.

You can go to the following link to use the Swagger UI to run the API’s : http://cura-sco-dev.asc.ohio-state.edu/pipeline/               