import React, { useState } from 'react';
import axios from 'axios';
import { Link,useHistory  } from "react-router-dom";


function Signup(props) {

  const history=useHistory();
  const [formData, setFormData] = useState({
    firstname: '',
    middlename: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    mobile: '',
    address: '',
    state: '',
    pin: '',
    country: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    props.load(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/createuser", formData);
      if (res.data.success) {
        setSuccess("User registered successfully");
        localStorage.setItem("token", res.data.authtoken);
        history.push('/'); 
        props.authenticate(true)
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].msg || "Signup failed");
      } else if (err.response?.data) {
        setError(err.response.data.errors || "Signup failed");
      } else {
        setError("Something went wrong");
      }
    }
    props.load(false);
  };

  return (
    <div className="container">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
      <form className="row g-3" onSubmit={handleSubmit}>
        <h3 className='mt-3'>Personal Information</h3>

        <div className="col-md-4">
          <label className="form-label">First name</label>
          <input type="text" className="form-control" name="firstname" onChange={handleChange} required />
        </div>

        <div className="col-md-4">
          <label className="form-label">Middle name</label>
          <input type="text" className="form-control" name="middlename" onChange={handleChange} />
        </div>

        <div className="col-md-4">
          <label className="form-label">Last name</label>
          <input type="text" className="form-control" name="lastname" onChange={handleChange} required />
        </div>

        <div className="col-md-4">
          <label className="form-label">Gender</label>
          <select
  className="form-select"
  name="gender"
  value={formData.gender} 
  onChange={handleChange}
  required
>
  <option value="" disabled>Select Gender</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
  <option value="Others">Others</option>
</select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" name="email" onChange={handleChange} required />
        </div>

        <div className="col-md-4">
          <label className="form-label">Mobile</label>
          <input type="text" className="form-control" name="mobile" onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" name="password" onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Confirm Password</label>
          <input type="password" className="form-control" name="confirmPassword" onChange={handleChange} required />
        </div>

        <h3>Address Information</h3>

        <div className="col-md-12">
          <label className="form-label">Address</label>
          <input type="text" className="form-control" name="address" onChange={handleChange} required />
        </div>

        <div className="col-md-4">
          <label className="form-label">State</label>
          <input type="text" className="form-control" name="state" onChange={handleChange} required />
        </div>

        <div className="col-md-4">
          <label className="form-label">Country</label>
          <input type="text" className="form-control" name="country" onChange={handleChange} required />
        </div>

        <div className="col-md-4">
          <label className="form-label">Pin</label>
          <input type="text" className="form-control" name="pin" onChange={handleChange} required />
        </div>

        <div className="col-12">
          <button className="btn btn-primary mb-3" type="submit">Register</button>
        </div>
      </form>

    <p className='mb-3'>
    <span >Already Have Account? </span><span><Link to="/login">Login</Link></span>
    </p>
    </div>
  );
}

export default Signup;
