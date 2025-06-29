import os
import pandas as pd
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from langchain.chat_models import init_chat_model
from connect import build_engine
from langgraph.graph import StateGraph,START,END
from typing_extensions import TypedDict
from langchain.utilities import GoogleSerperAPIWrapper
import os
import re
import google.generativeai as genai
import requests


# Load dataset
# df = pd.read_csv("Walamrt_product_dataset.csv")

# db = build_engine(df)
product_df   = pd.read_csv("Walamrt_product_dataset.csv")
orders_df    = pd.read_csv("delivery_df.csv")
complains_df = pd.read_csv("complains_df.csv")

db = build_engine(
    {
        "products"  : product_df,
        "orders"    : orders_df,
        "complain" : complains_df,
    }
)

# Load Gemini model via LangChain
llm = init_chat_model("gemini-1.5-pro", model_provider="google_genai") 

# Create the SQL Agent
# agent_executor = create_sql_agent(llm, db=db, agent_type="openai-tools", verbose=True)
agent_executor = create_sql_agent(
    llm,
    db=db,
    agent_type="openai-tools",
    verbose=True,
    streaming=False  # ✅ prevent ._stream() and avoid error
)
