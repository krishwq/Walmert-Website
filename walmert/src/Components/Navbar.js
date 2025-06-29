import React from 'react';
import { Link,useHistory } from "react-router-dom";


function Navbar(props) {
  const history=useHistory()
    const handlelogout=()=>{
        localStorage.removeItem("token");
        props.authenticate(false)
        // props.setuserdata(null);
        history.push('/')
    }
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
  <div className="container-fluid">
    <Link className="navbar-brand" to="/">Walmert</Link>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item">
          <Link className="nav-link" aria-current="page" to={props.isAuthenticated?"/chat":"/login"}>Chat with ai</Link>
        </li>
         <li className="nav-item " style={{position:'absolute',left:'50%',transform:'translate(-50%)'}}>
           <form className="d-flex" role="search">
        <input className="form-control me-2" type="search" style={{width:'400px'}} placeholder="Search" aria-label="Search"/>
      </form>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to={props.isAuthenticated?"/cart":"/login"}>Cart</Link>
        </li>
        
      </ul>
     
      
    </div>
    {!props.isAuthenticated?(
        <>
    <button type="button" className="btn btn-secondary mx-2"><Link className='nav-link' to="/signup">Signup</Link></button>
    <button type="button" className="btn btn-success mx-2"><Link className='nav-link' to="/login">Login</Link></button>
</>
    ):(
    <button type="button" className="btn btn-info mx-2" onClick={handlelogout}>Logout</button>
    )
}
  </div>
</nav>
  );
}

export default Navbar;
