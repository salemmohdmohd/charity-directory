import React, { useState } from 'react'
import { useNavigate,Link } from 'react-router-dom'

export const Login=()=> {
  const [formState,setFormState]=useState({email:"", password:""})
  const navigate = useNavigate();

const handleChange = (e)=>{
  const {name,value} = e.target;
  setFormState({...formState,[name]:value})
}

const handleSubmit = async (e)=>{
  e.preventDefault();
  console.log(formState,'formstate valuess')
  console.log(JSON.stringify(formState, 'formstate stringify...'))
  try{
    const response = await fetch('http://localhost:3001/login',{
      method:"POST",
      headers:{
        'Content-Type':"application/json"
      },
      body:JSON.stringify(formState),
    })
    if(!response.ok){
      throw new Error(`Error: ${response.status}`)
    }
    const data = await response.json();
    navigate("/home")
  }catch(error){
    console.log("error from handle Submit ")
  }
}

  return (
 <div className="mx-auto mt-5 border text-center p-4" style={{width:"400px", color:'white',backgroundColor:"#005555", borderRadius:".975rem"}}>
         <div>
    {/* <h1 className="mt-4">UNSEEN</h1> */}
    <h2 className="mt-4">Welcome Back</h2>
    {/* <p className="m-4">Sign Up to see the Unseen!</p> */}
  </div>
    <form className="row g-3 m-3 needs-validation" noValidate onSubmit={handleSubmit}>
  <div className="">
    <label htmlFor="validationCustom01" className="form-label"></label>
    <input type="email" className="form-control" id="validationCustom01" value={formState.email} 
    name="email"
    placeholder='your email' required onChange={handleChange} />
    <div className="valid-feedback">
      Looks good!
    </div>
  </div>
  <div className="">
    <label htmlFor="validationCustomUsername" className="form-label"></label>
    <div className="input-group has-validation">
      {/* <span className="input-group-text" id="inputGroupPrepend">@</span> */}
      <input type="password" className="form-control" id="validationCustomPassword" aria-describedby="inputGroupPrepend" 
      name="password"
      placeholder='Password' 
      onChange={handleChange}
      value={formState.password} required />
      <div className="invalid-feedback">
        Please provide password.
      </div>
    </div>
  </div>
  <div className="col-12">
    <button className="btn btn-light" type="submit">Sign-In</button>
  </div>
</form>
Don't have an account ? 
<Link to='/signup' style={{color:"white"}}>sing up? </Link>
    </div>
  )
}
