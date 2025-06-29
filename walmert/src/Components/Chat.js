import React,{useState,useRef,useEffect} from 'react';
import Typewriter from 'typewriter-effect';
import '../CSS/Chat.css';
import faq_question from '../faq.json';

function Chat(props) {
const {setisloading}=props;
const initialMsg = JSON.parse(localStorage.getItem('msg') || '[]');
const [message, setmessage] = useState(initialMsg);
const [userdata, setuserdata] = useState(null);
const bottomRef = useRef(null);
const [isfeching, setisfeching] = useState(false);

useEffect(() => {
  localStorage.setItem('msg', JSON.stringify(message));
}, [message]);


const handlefaq=(ques)=>{
  setmessage(prevMessages => [
  ...prevMessages,
  {
    message: ques,
    position: "right"
  }
  ]);
  const answer=faq_question.find(item => item.question === ques)
   setmessage(prevMessages => [
  ...prevMessages,
  {
    message: answer['answer'],
    position: "left"
  }
  ]);
}
const scroll=()=>{
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
}
  // Scroll to bottom when message list updates
  useEffect(() => {
    scroll()
  }, [message]);

  useEffect(() => {
    const token = localStorage.getItem("token");
      if (token) {
        setisloading(true);
        const fetchUser = async () => {
          try {
            const res = await fetch("http://localhost:5000/api/auth/getuser", {
              method: "GET", 
              headers: {
                "Content-Type": "application/json",
                authtoken: token,
              },
            });
  
            if (!res.ok) {
              throw new Error("Failed to fetch user");
            }
  
            const data = await res.json();
            // console.log(data)
            setuserdata(data);
          } catch (err) {
            console.error(err);
          }
  
        };
        setisloading(false);
  
        fetchUser();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []);
 
   const [inputmessage, setinputMessage] = useState('');

  const handleChange = (e) => {
    setinputMessage(e.target.value);
  };

  

// submit query  
const handlesubmit= async(e)=>{
  e.preventDefault();
  setmessage(prevMessages => [
  ...prevMessages,
  {
    message: inputmessage,
    position: "right"
  }
  ]);
  setinputMessage('')

  setmessage(prev=>[
    ...prev,
    {
      message:"analysing....",
      position:"left"
    }
  ])
  
  setisfeching(true);
  try {
      const res = await fetch("http://localhost:8000/getresponse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
           question: inputmessage,
           city:userdata['address'],
           state:userdata['state'],
           country:userdata['country'],
           id:userdata['_id']
          })
      });

      const data = await res.json();
      // console.log(data)
      setmessage(prev => [...prev].slice(0, -1));
      if(data===""){
         setmessage(prevMessages => [
  ...prevMessages,
  {
        message: "<p><b>We’re Sorry!</b><br>An unexpected error occurred while processing your request. Please try again after some time.We apologize for the inconvenience and appreciate your patience as we work to resolve the issue.If the problem persists, feel free to contact our support team for further assistance.<br>Let me know if you'd like to tailor it for a specific use case (e.g., website error, customer service, API response, etc.).</p>",
    position: "left"
  }])
      }else{
      setmessage(prevMessages => [
  ...prevMessages,
  {
    message: data,
    position: "left"
  }
  ]);
}
    } catch (error) {
      console.error("Error fetching response:", error);
      setmessage(prev => [...prev].slice(0, -1));
      setmessage(prevMessages => [
  ...prevMessages,
  {
    message: "<p><b>We’re Sorry!</b><br>An unexpected error occurred while processing your request. Please try again after some time.We apologize for the inconvenience and appreciate your patience as we work to resolve the issue.If the problem persists, feel free to contact our support team for further assistance.<br>Let me know if you'd like to tailor it for a specific use case (e.g., website error, customer service, API response, etc.).</p>",
    position: "left"
  }])
    } finally {
      setisfeching(false);
    }



 }


  return (
<>
    <div className='cont'>
      <div className="msg-cont">
        <div className="faq">
          <h6>Frequently asked questions:</h6>
          {
            faq_question.map((ques,index)=>(
              <button key={index} className="faq_question"  onClick={() => handlefaq(ques['question'])}>{ques['question']}</button>
            ))
          }
          
        </div>
     {
     message.map((msg, index) => (
            <div key={index} className={`msg ${msg.position}`}>
      {msg.position==="left"?(msg.message!=="analysing...."?
                (<Typewriter
  onInit={(typewriter) => {
    // Start an interval to call scroll every 5 seconds
    const scrollInterval = setInterval(() => {
      scroll();
    }, 100);

    typewriter
      .typeString(msg.message)
      .callFunction(() => {
        // Final scroll and stop the interval when typing finishes
        scroll();
        clearInterval(scrollInterval);
      })
      .start();
  }}
  options={{
    delay: 8,
    cursor: null,
  }}
/>
):(msg.message)
      ):(msg.message)}
            </div>)
    )
     }
    <div ref={bottomRef} />
    </div>

    <div className="form-cont">
 <form action="">
      <div className="input-group-me mb-3">
  <textarea rows="4" cols="50"  type="text" className="form-control" placeholder='Ask anything..' aria-label="Recipient's username" aria-describedby="button-addon2" required value={inputmessage} onChange={handleChange}/>
  <div className="send-cont"><button className='send-btn' disabled={!inputmessage || isfeching} onClick={handlesubmit}>{!isfeching?<i className="fa-solid fa-arrow-up"></i>:<i className="fa-solid fa-square"></i>}</button></div>
</div>
    </form>
    </div>
    </div>
   
</>
  );
}

export default Chat;
