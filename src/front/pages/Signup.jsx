import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
export const Signup=()=>{
    const [userState,setUserState]=useState({
        firstName:'',
        lastName:'',
        email:'',
        city:'',
        state:'',
        zip:'',
    })
    const navigate = useNavigate();


    const handleSubmit= async (e)=>{
      e.preventDefault();
      try{
    const response = await fetch('http://localhost:3001/signup',{
      method:"POST",
      headers:{
        'Content-Type':"application/json"
      },
      body:JSON.stringify(userState),
    })
    if(!response.ok){
      throw new Error(`Error: ${response.status}`)
    }
    const data = await response.json();
    navigate("/login")
  }catch(error){
    console.log("error from handle Submit signup ")
  }
}


    const handleChange = (e) =>{
      const {name, value} = e.target 

      setUserState({...userState,[name]:value})
    }


  return (
    <div className="mx-auto mt-5 border text-center" style={{width:"400px", color:'white',backgroundColor:"#005555", borderRadius:".975rem"}}>
         <div>
    {/* <h1 className="mt-4">UNSEEN</h1> */}
    <h2 className="mt-4">Welcome</h2>
    <p className="m-4">Sign Up to see the Unseen!</p>
  </div>
    <form className="row g-3 m-3 needs-validation" noValidate onSubmit={handleSubmit}>
  <div className="">
    <label htmlFor="validationCustom01" className="form-label"></label>
    <input type="text" className="form-control" id="validationCustom01" value={userState.firstName} 
    name="firstName"
    placeholder='First name' required onChange={handleChange} />
    <div className="valid-feedback">
      Looks good!
    </div>
  </div>
  <div className="">
    <label htmlFor="validationCustom02" className="form-label"></label>
    <input type="text" className="form-control" id="validationCustom02" value={userState.lastName}
    name="lastName"
    placeholder="Last name" required onChange={handleChange} />
    <div className="valid-feedback">
      Looks good!
    </div>
  </div>
  <div className="">
    <label htmlFor="validationCustomUsername" className="form-label"></label>
    <div className="input-group has-validation">
      {/* <span className="input-group-text" id="inputGroupPrepend">@</span> */}
      <input type="email" className="form-control" id="validationCustomUsername" aria-describedby="inputGroupPrepend" 
      name="email"
      placeholder='Email' 
      onChange={handleChange}
      value={userState.email} required />
      <div className="invalid-feedback">
        Please provide email.
      </div>
    </div>
  </div>
  
  <div className="col-md-4">
    <label htmlFor="validationCustom03" className="form-label"> </label>
    <input type="text" className="form-control" id="validationCustom03"value={userState.city}
    name="city"
    placeholder='City' 
    onChange={handleChange}
    required />
    <div className="invalid-feedback">
      Please provide a valid city.
    </div>
  </div>
  <div className="col-md-4">
    <label htmlFor="validationCustom04" className="form-label"> </label>
    <select className="form-select" id="validationCustom04" placeholder='State' 
     value={userState.state} name='state' 
     onChange={handleChange}
     required>
      <option selected disabled>Choose...</option>
    <option value="AL">Alabama</option>
  <option value="AK">Alaska</option>
  <option value="AZ">Arizona</option>
  <option value="AR">Arkansas</option>
  <option value="CA">California</option>
  <option value="CO">Colorado</option>
  <option value="CT">Connecticut</option>
  <option value="DE">Delaware</option>
  <option value="DC">District Of Columbia</option>
  <option value="FL">Florida</option>
  <option value="GA">Georgia</option>
  <option value="HI">Hawaii</option>
  <option value="ID">Idaho</option>
  <option value="IL">Illinois</option>
  <option value="IN">Indiana</option>
  <option value="IA">Iowa</option>
  <option value="KS">Kansas</option>
  <option value="KY">Kentucky</option>
  <option value="LA">Louisiana</option>
  <option value="ME">Maine</option>
  <option value="MD">Maryland</option>
  <option value="MA">Massachusetts</option>
  <option value="MI">Michigan</option>
  <option value="MN">Minnesota</option>
  <option value="MS">Mississippi</option>
  <option value="MO">Missouri</option>
  <option value="MT">Montana</option>
  <option value="NE">Nebraska</option>
  <option value="NV">Nevada</option>
  <option value="NH">New Hampshire</option>
  <option value="NJ">New Jersey</option>
  <option value="NM">New Mexico</option>
  <option value="NY">New York</option>
  <option value="NC">North Carolina</option>
  <option value="ND">North Dakota</option>
  <option value="OH">Ohio</option>
  <option value="OK">Oklahoma</option>
  <option value="OR">Oregon</option>
  <option value="PA">Pennsylvania</option>
  <option value="RI">Rhode Island</option>
  <option value="SC">South Carolina</option>
  <option value="SD">South Dakota</option>
  <option value="TN">Tennessee</option>
  <option value="TX">Texas</option>
  <option value="UT">Utah</option>
  <option value="VT">Vermont</option>
  <option value="VA">Virginia</option>
  <option value="WA">Washington</option>
  <option value="WV">West Virginia</option>
  <option value="WI">Wisconsin</option>
  <option value="WY">Wyoming</option>
    </select>
    <div className="invalid-feedback">
      Please select a valid state.
    </div>
  </div>
  <div className="col-4">
    <label htmlFor="validationCustom05" className="form-label"> </label>
    <input type="text" className="form-control" id="validationCustom05" placeholder='Zip' 
    onChange={handleChange}
    name="zip"
    value={userState.zip} required/>
    <div className="invalid-feedback">
      Please provide a valid zip.
    </div>
  </div>
  <div className="col-12">
    <div className="form-check">
      <label className="form-check-label" htmlFor="invalidCheck">
      <input className="form-check-input" type="checkbox" value="" id="invalidCheck" 
      required/>
        Agree to terms & conditions
      </label>
      <div className="invalid-feedback">
        You must agree before submitting.
      </div>
    </div>
  </div>
  <div className="col-12">
    <button className="btn btn-light" type="submit">Sign Up</button>
  </div>
</form>
    </div>
  )
}

