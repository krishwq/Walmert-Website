from flask import Flask, request, jsonify
from flask_cors import CORS
from main import get_reply
from convert2html import convert
# from data_engine import run_query

app = Flask(__name__)
CORS(app)


@app.route('/getresponse', methods=['POST'])
def home():
    query = request.get_json()
    print(query)
 
    input_state = {
    "query":query['question'],
    "grade_query": "",          
    "query_class": "",
    "user_id":query['id'],        
    "user_city": query['city'],
    "user_state": query['state'],
    "user_country": query['country'],
    "product": "",
    "weather": "",
    "nearest_festival": "",
    "final_answer": "",
    }
   
    ans = get_reply(input_state)
    final_ans=convert(ans['final_answer'])
    print(final_ans)
    return jsonify(final_ans)


if __name__ == '__main__':
    app.run(debug=True,port=8000)
