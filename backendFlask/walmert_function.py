import pandas as pd
from langchain_community.agent_toolkits import create_sql_agent
from langchain.chat_models import init_chat_model
from connect import build_engine
from typing_extensions import TypedDict
from langchain.utilities import GoogleSerperAPIWrapper
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

# preprocess
def preprocess(text: str):
    text = text.lower()
    text = text.replace("\n", " ")
    text = re.sub("\s+", " ", text)
    text = re.sub("^\s+", "", text)
    return text

# graph state
class graph_satate(TypedDict):
    query: str;
    weather: str;
    grade_query: str;
    query_class: str;
    user_id:str;
    user_city: str;
    user_state: str;
    user_country: str;
    product: str;
    nearest_festival: str;
    final_answer: str;
    # call_support: str;

# query isformal or not
def is_formal(state: graph_satate):
    question = state["query"]
    system_prompt = """You are a classifier agent that determines whether a user query is informal or not.

          If the user query is a greeting, casual message, or informal word such as "hi", "hello", "hey", "yo", "what's up", etc., reply only with:
          Yes

          For any other type of query (such as a formal request, question, or sentence with specific content), reply only with:
          No

          Your response should be exactly one word: Yes or No, without punctuation, explanation, or elaboration.

          Do not assume or infer extra context. Base your answer strictly on the tone and content of the user’s message."""

    question_g = genai.GenerativeModel('gemini-1.5-flash-latest')
    documents_prompt = "User's message: {question}"
    prompt = documents_prompt.format(question=question)

    response = question_g.generate_content(f"{system_prompt}\n\n{prompt}")
    ans = preprocess(response.text)

    return {"query_grade": ans, "query": state["query"]}

#decide way
def decide_way(state:graph_satate):
  gen = state["grade_query"]
  if gen == "Yes":
    return "formal"
  else:
    return "not"

# if formal-formal agent
def formal_agent(state: graph_satate):
    question = state["query"]
    system_prompt = " you answer the query as it is stated in the query formally"

    formal_llm= genai.GenerativeModel('gemini-1.5-flash-latest')
    documents_prompt = "User's message: {question}"
    prompt = documents_prompt.format(question=question)
    response = formal_llm.generate_content(f"{system_prompt}\n\n{prompt}")

    return {"final_answer": response.text, "query": state["query"]}

#if not grade-query
def geade_query(state: graph_satate):
    question = state["query"]
    system_prompt = """You are a classification agent for Walmart support.
                      Your task is to analyze the user's input and respond with only one word from the following categories based on the nature of the query:

                      "issue" – if the query is about delivery problems, order status, delays, missing packages, returns, or any customer service-related issues.

                      "product" – if the query is about a specific product, such as its features, availability, price, category (e.g., toy, household item, electronics, shoes, groceries, etc.).

                      "other" – if the query is about suggestions, general inquiries, Walmart policies, store locations, or anything not directly related to delivery or a specific product.

                      Your response should be only one of these three words: "issue", "product", or "other". Do not include any explanation.

                      🧪 Example Inputs & Expected Outputs:
                      Input: "Where is my order? It was supposed to arrive yesterday."
                      → Output: issue

                      Input: "Does this shoe come in size 9?"
                      → Output: product

                      Input: "Can you suggest some budget-friendly gifts for kids?"
                      → Output: other"""

    question_grader= genai.GenerativeModel('gemini-1.5-pro')
    documents_prompt = "User's message: {question}"
    prompt = documents_prompt.format(question=question)
    response = question_grader.generate_content(f"{system_prompt}\n\n{prompt}")
    ans = preprocess(response.text)
    print(ans)
    return {"query_class": ans, "query": state["query"]}

# decide path
def decide_path(state: graph_satate) -> str:
    gen = (state.get("query_class") or "").strip().lower()
    print("decide_path saw:", gen)   
    if gen == "issue":
        return "support"
    elif gen == "product":
        return "prod"
    else:
        return "normal"

#if product get the product
def get_product(state: graph_satate):
    question = state["query"]
    query = question + ", give the product with the product link, image url and price."
    print(question)
    out = agent_executor.invoke({"input": query})
    print(str(out['output']))
    return {"product": str(out['output']), "query": state["query"]}  

# get ans
def get_ans(state: graph_satate):
    query = state["query"]
    product = state["product"]
    nearest_festival = state["nearest_festival"]

    system_prompt = f"""You are an intelligent and helpful virtual shopping assistant for Walmart. Your role is to assist customers with festival-based recommendations.

                      You will be provided with:

                      A list of currently available products: {product}

                      The name of the nearest upcoming festival: {nearest_festival}

                      🎯 Your Task:
                      First, display the list of products provided in {product}.

                      Then, based on your understanding of the upcoming festival, suggest additional relevant products that are not in the provided list — but would typically be useful, festive, or popular for that occasion.

                      ✅ Guidelines:
                      Mention the festival by name and explain why the suggested items are relevant for it (e.g., decorations, gifts, clothing, seasonal foods).

                      Use a friendly, warm, and festive tone.

                      You may use bullet points or short descriptive lines for clarity.

                      Do not modify the original product list — show it as-is.

                      The additional suggested items can be any appropriate Walmart products, even if they’re not in the provided list."""
    final_agent= genai.GenerativeModel('gemini-1.5-flash-latest')
    documents_prompt = "User's message: {question}"
    prompt = documents_prompt.format(question=query)
    response = final_agent.generate_content(f"{system_prompt}\n\n{prompt}")

    return {"final_answer": response.text, "query": state["query"]}

# if normal-get weather
def get_weather(state: graph_satate):
    city = state['user_city']
    country = state['user_country']
    limit = 1
    API_KEY = "f9a4413bc98a8e1d5b5e8079251ca75d"
    url1 = f"http://api.openweathermap.org/geo/1.0/direct?q={city},{country}&limit={limit}&appid={API_KEY}"
    response1= requests.get(url1)
    data = response1.json()
    lat = data[0]['lat']
    longi = data[0]['lon']

    url2 = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={longi}&appid={API_KEY}"

    response2 = requests.get(url2)
    data1 = response2.json()
    weather_reaport= "today is a "+ str(data1['weather'][0]['main']) +  " day with a " +str(data1['weather'][0]['description'])+ " and temperatue "+ str(float(data1['main']['temp']-273.15)) + " degree"
    print("wetather Data:",state['query'])
    print('city',city)
    return {"weather": weather_reaport, "query": state["query"]}

#get upcoming event
SERPER_API_KEY = "4b2052e9cf1497bf29120fbe3023ca21982c5cbd"
def search_upcoming_event(flow_state: graph_satate):
    city = flow_state['user_city']
    state_name = flow_state['user_state']

    question = (
        f"What is the upcoming well-known festival in {city}, {state_name} "
        "within the next month?"
    )

    serper = GoogleSerperAPIWrapper(serper_api_key=SERPER_API_KEY)
    result = serper.run(question)
    print(state_name)
    # Pass the original state dict through unchanged
    return {
        "nearest_festival": result,
        "query": flow_state["query"],
    }

#get final ans
def get_final_answer(state: graph_satate):

    weather_report= state["weather"]
    nearest_festival= state["nearest_festival"]
    user_data= state["user_city"]
    question= state["query"]
    print(weather_report)
    system_prompt= f"""You are an intelligent shopping assistant designed to suggest products to the user based only on the provided contextual data. Do not use any external knowledge or make assumptions beyond the explicitly given inputs.

                  You will receive the following structured inputs:

                  Weather Agent: Current weather report.

                  Nearest Festival Agent: Information about upcoming or nearby festivals.

                  User Data: Relevant personal or contextual information about the user.

                  Your final task is to suggest suitable products to the user based on the combined inputs.

                  Your responsibilities:

                  Analyze the user query.

                  If the query is about weather, festivals, or personal context, respond using only that domain’s data.

                  If the query involves general product suggestions or if no specific domain is targeted, use all relevant inputs together to craft a helpful product recommendation.

                  Respond in a friendly, conversational tone, such as:
                  "Oh wow, there's a festival coming up  definitely check out $$product$$!
                  and also checkout this kind of $$product$$ because the weather is now $$weather $$"

                  give an elaborrate product list but not  to large. and return in the format of raw HTML text

                  Suggest products that make sense only based on the provided data. If something is missing or unclear, acknowledge it politely and avoid guessing.

                  Never fabricate or assume anything not present in the input fields.

                  Available Data:
                  Weather Agent Report: {weather_report}
                  Nearest Festival Agent: {nearest_festival}
                  User Data: {user_data}
                    """


    final_agent= genai.GenerativeModel('gemini-1.5-flash-latest')
    documents_prompt = "User's message: {question}"
    prompt = documents_prompt.format(question=question)
    response = final_agent.generate_content(f"{system_prompt}\n\n{prompt}")

    return {"final_answer": response.text, "query": state["query"]}



