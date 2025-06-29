import React,{useEffect,useState} from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import './App.css';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import Chat from './Components/Chat';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Cart from './Components/Cart';
import Spinner from './Components/Spinner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isloading, setisloading] = useState(false);
  useEffect(()=>{
    const token = localStorage.getItem("token");
    if(token){
      setIsAuthenticated(true);
    }
  },[isAuthenticated]);
  
return(
  <>
      <Router>
        {isloading?<Spinner/>:""}
        <Navbar isAuthenticated={isAuthenticated} authenticate={setIsAuthenticated} />
        <div className="container">
          <Switch>
            <Route exact path="/">
              <Home isAuthenticated={isAuthenticated}  setisloading={setisloading}/>
            </Route>
            <Route exact path="/chat">
              <Chat setisloading={setisloading}/>
            </Route>
            <Route exact path="/login">
              <Login authenticate={setIsAuthenticated} load={setisloading} />
            </Route>
            <Route exact path="/signup">
              <Signup authenticate={setIsAuthenticated} load={setisloading}/>
            </Route>
             <Route exact path="/cart">
              <Cart isAuthenticated={isAuthenticated} setisloading={setisloading}/>
            </Route>
          </Switch>
        </div>
      </Router>
    </>
);
}

export default App;
