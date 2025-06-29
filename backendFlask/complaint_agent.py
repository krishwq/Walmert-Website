import google.generativeai as genai
from walmert_function import graph_satate,agent_executor

def build_query_prompt(question: str, user_id: str) -> str:
    base_prompt = question.strip()
    
    # Simple keyword detection (you can improve this with NLP if needed)
    lower_q = question.lower()

    if any(kw in lower_q for kw in ["complain", "issue", "problem", "support"]):
        query = f"{base_prompt}. Retrieve all the information for user ID {user_id} from the 'complain' table and return the result as a JSON array only, without any explanation or extra text."
    elif any(kw in lower_q for kw in ["order", "delivery", "shipment", "status", "track"]):
        query = f"{base_prompt}. Retrieve all the information for user ID {user_id} from the 'orders' table and return the result as a JSON array only, without any explanation or extra text."
    else:
        query = f"{base_prompt}. User ID: {user_id}. Please determine whether this question relates to complaints or orders and fetch all user-specific information accordingly and return the result as a JSON array only, without any explanation or extra text."

    return query


# for  issue type
def complaint_agent(state: graph_satate):
    question = state["query"]
    user_id=state['user_id']
    query = build_query_prompt(question=question,user_id=user_id)
    print(query)
    out = agent_executor.invoke({"input": query})
    print(str(out['output']))

    doc_from_database= out['output']

    # system_prompt= f"""You are a helpful support agent that assists users with delivery-related issues. Your primary tasks are:

    #         Understand the user's query about a delivery problem (e.g., late delivery, incorrect address, missing items).

    #         If a document is provided (e.g., a receipt, tracking info, or internal dispatch record), check it carefully for the delivery boy's contact number.

    #         If the number is found, extract and clearly share it with the user in a helpful tone.

    #         If the number is not available, politely inform the user that the delivery personnel's number is not present in the document.

    #         Do not fabricate any phone numbers or information. Only respond based on what's explicitly in the document or query.

    #         Always be professional, empathetic, and concise. Prioritize the user's issue and guide them if further steps are needed (e.g., contacting support, waiting time).

    #         Let me know if you'd like it tailored to a specific company, platform, or language tone (e.g., more casual or more formal).

    #         here is the given document:{doc_from_database}
    #                             """
    system_prompt = f"""You are a helpful support agent that assists users with delivery-related issues. Your responsibilities include:

1. Understand the user's query about a delivery problem (e.g., late delivery, wrong address, or missing items).

2. The user may provide a document that contains delivery-related data, in the form of an **array of JSON objects**. Each object represents one delivery record (e.g., a receipt, tracking info, or dispatch log).

3. Carefully scan through **each object in the array** and check if it includes the **contact number of the assigned delivery boy**.

4. If any phone number(s) are found, extract and clearly list them for the user, along with any relevant identifying info (e.g., delivery ID or name if present).

5. If no contact number is found in any of the records, politely inform the user that none of the delivery personnel's phone numbers are available in the provided document.

6. Do not make up or guess any data — only use what is explicitly present in the input.

7. Maintain a professional, concise, and empathetic tone. Prioritize the user's concern and, if necessary, guide them on the next steps (e.g., contacting customer support, waiting period, etc.).

Here is the provided delivery data (as a JSON array): {doc_from_database}

You may reply in a tone appropriate for the context. Let me know if you'd like a specific company or language tone applied.

---

🔹 **Complaint‑related queries**

1. If the user's inquiry concerns a *complaint* (e.g., product defect, service dissatisfaction), the document will likewise be an **array of JSON objects**, where each object represents a single complaint record.

2. For each complaint record, look for fields such as `complain_id`, `complain_category`, and `complain_status` (field names may vary slightly).

3. Identify the complaint(s) relevant to the user's question (by complaint ID, user ID, order reference, or other context).

4. Respond with the **complaint category** and its current **status** in a clear, succinct sentence.  
   • *Example*: “Your complaint (ID C1234) falls under ‘Delivery Delay’ and is currently **In Progress**.”

5. If no matching complaint is found, politely state that the document does not contain information about that complaint.

6. Never invent or speculate; only use information explicitly present in the complaint data.

7. Maintain the same professional, empathetic tone as with delivery queries, and suggest next steps where appropriate (e.g., escalation path, expected resolution time).

Here is the provided complaint data (as a JSON array): {doc_from_database}"""



    agent= genai.GenerativeModel('gemini-1.5-flash-latest')
    documents_prompt = "User's message: {question}"
    prompt = documents_prompt.format(question=question)
    print(prompt)
    response = agent.generate_content(f"{system_prompt}\n\n{prompt}")


    return {"final_answer": response.text, "query": state["query"]}
