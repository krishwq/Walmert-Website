import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

function Login(props) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const history = useHistory();

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
   props.load(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      const json = await response.json();
      if (json.success) {
        localStorage.setItem("token", json.authtoken);
        history.push("/");
        props.authenticate(true);
      } else {
        setErrorMsg(json.errors || "Invalid email or password");
      }
    } catch (err) {
      setErrorMsg("Server error. Please try again later.");
    }
    props.load(false);
  };

  return (
    <div className="container mt-4 login-cont">
    <div className="image">
        <img src="https://images.axios.com/wuoy6vfxdres_jLNztggu7oMQno=/2024/08/15/1723730001228.jpg" alt="" />
    </div>
    <div className="login">
      <h2>Login</h2>
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <form className="row g-3" onSubmit={handleLogin}>
        <div className="col-md-12">
          <label htmlFor="email" className="form-label">Email ID</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={credentials.email}
            onChange={onChange}
            required
          />
        </div>
        <div className="col-md-12">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={credentials.password}
            onChange={onChange}
            required
          />
        </div>
        <div className="col-12">
          <button className="btn btn-primary" type="submit">Login</button>
        </div>
      </form>
      </div>
      
    </div>
  );
}

export default Login;
