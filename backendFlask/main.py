from langgraph.graph import StateGraph,START,END
from walmert_function import graph_satate,is_formal,formal_agent,geade_query,get_ans,get_final_answer,get_product,get_weather,search_upcoming_event,decide_path,decide_way
from complaint_agent import complaint_agent



flow = StateGraph(graph_satate)

flow.add_node("run_grade_query", geade_query)
flow.add_node("formal_check", is_formal)
flow.add_node("formal_agent", formal_agent)
flow.add_node("get_product", get_product)
flow.add_node("get_weather", get_weather)
flow.add_node("search_upcoming_event", search_upcoming_event)
flow.add_node("search_upcoming_event_another", search_upcoming_event)
flow.add_node("complaint_agent", complaint_agent)
flow.add_node("get_ans", get_ans)
flow.add_node("get_final_answer", get_final_answer)




flow.add_edge(START, "formal_check")

flow.add_conditional_edges(
    "formal_check",
    decide_way,
    {
        "formal": "formal_agent",
        "not": "run_grade_query",
    },
)

flow.add_edge("formal_agent", END)


flow.add_conditional_edges(
    "run_grade_query",
    decide_path,
    {
        "support": "complaint_agent",
        "prod": "get_product",
        "normal": "get_weather",
    },
)

flow.add_edge("complaint_agent", END)
flow.add_edge("get_product", "search_upcoming_event_another")
flow.add_edge("search_upcoming_event_another", "get_ans")
flow.add_edge("get_ans", END)
flow.add_edge("get_weather", "search_upcoming_event")
flow.add_edge("search_upcoming_event", "get_final_answer")
flow.add_edge("get_final_answer", END)

flow = flow.compile()

def get_reply(input_state):
    result = flow.invoke(input_state)
    return result


# input_state = {
#     "query": "give 5 product of cloth",
#     "grade_query": "",          
#     "query_class": "",        
#     "user_city": "kolkata",
#     "user_state": "west bengal",
#     "user_country": "india",
#     "product": "",
#     "weather": "",
#     "nearest_festival": "",
#     "final_answer": "",
# }

# # Run it:
# result = get_reply(input_state)
# print("final answer :",result['final_answer'])


