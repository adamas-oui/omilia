import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
    //the state is formData(an object with field values), 
    //call setFormData to update the name field
    //default values in useState()/initial state
    const [formData, setFormData] = useState({
      email:'',
      password:'',
    });
    
    const {email, password} = formData;
    
    //update for every field
    const onChange = e => setFormData({...formData, [e.target.name]: e.target.value});
    
    const onSubmit = e => {
      e.preventDefault();
      console.log(formData);
    
    };
    
    return (
    <Fragment>
      <h1 className="large text-primary">Sign In</h1>
      <p className="lead"><i className="fas fa-user"></i> Sign Into Your Account</p>
      <form className="form" onSubmit= {e=>onSubmit(e)}>
    
        <div className="form-group">
          <input 
            type="email" 
            placeholder="Email Address" 
            name="email" 
            value={email} 
            onChange = {e=> onChange(e)} 
            required />
          <small className="form-text"
            >This site uses Gravatar so if you want a profile image, use a
            Gravatar email</small
          >
        </div>
        <div className="form-group"> 
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange = {e=> onChange(e)} 
            minLength="6"
          />
        </div>

        <input type="submit" className="btn btn-primary" value="Login" />
      </form>
      <p className="my-1">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </Fragment>
  )
  
}

export default Login