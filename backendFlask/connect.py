import pandas as pd
import os
from typing import Dict
from langchain_community.utilities import SQLDatabase
from sqlalchemy import create_engine
# import google.generativeai as genai

# Set the Gemini API key
# GEMINI_API_KEY = "AIzaSyBxLNQmXMtFOKFkXkTHm4MCbZ0fcTfkG3M"
# os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY
# genai.configure(api_key=GEMINI_API_KEY)
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "C:/Users/krishnendu Bir/Downloads/adroit-set-463413-p0-a39a4d238ca9.json"



# def build_engine(data: pd.DataFrame) -> SQLDatabase:
#     """Creates SQLite engine, stores the DataFrame as a table, and returns a SQLDatabase object."""
#     engine = create_engine("sqlite:///walmart.db")
    
#     data.to_sql("walmart", engine, index=False, if_exists="replace")

#     # Wrap the engine in a LangChain SQLDatabase object
#     db = SQLDatabase(engine=engine)

#     # Print diagnostics
#     print(f"Database dialect: {db.dialect}")
#     print(f"Usable table names: {db.get_usable_table_names()}")

#     return db

def build_engine(
    tables: Dict[str, pd.DataFrame],           # key = table name, value = DataFrame
    db_uri: str = "sqlite:///walmart.db",
    if_exists: str = "replace"                 # "append" if you don’t want to overwrite
) -> SQLDatabase:
    """
    Create / open the SQLite database at `db_uri`,
    write each DataFrame to its own table, and return a LangChain SQLDatabase.
    """
    engine = create_engine(db_uri)

    # write every table
    for table_name, df in tables.items():
        df.to_sql(table_name, engine, index=False, if_exists=if_exists)

    db = SQLDatabase(engine=engine)

    print("Dialect:", db.dialect)
    print("Tables :", db.get_usable_table_names())   # should list all tables you just inserted
    return db

