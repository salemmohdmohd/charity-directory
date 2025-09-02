import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import Button from '../components/forms/Button';
import Input from '../components/forms/Input';

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
try{

       const response = await fetch("/login",{
        method: "POST",
        headers:{
          "Content-Type": "application/json"
        },
        body:JSON.stringify(formData)
      });
      const data = await response.json();
      console.log(data,'data from login')
      if(response.ok){
        dispatch({type:"SET_USER", payload: data.user});
        dispatch({type:"SET_NOTIFICATION", payload:"Welcome!"});
        navigate("/");
      }else{
        setErrors({type: data.message || "Invalid email or password"})
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Login failed. Please try again.' });
    }
    
  };

  const handleGoogleLogin = () => {
    dispatch({ type: 'SET_NOTIFICATION', payload: 'Google OAuth integration coming soon!' });
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="h3 mb-3">Welcome Back</h2>
                <p className="text-muted">Login to discover and support charities</p>
              </div>

              <form onSubmit={handleSubmit}>
                <Input
                  name="email"
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="your@email.com"
                  required
                />

                <Input
                  name="password"
                  type="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter your password"
                  required
                />

                <div className="d-grid gap-2 mb-3">
                  <Button type="submit" variant="primary" size="lg">
                    Login
                  </Button>
                </div>

                <div className="text-center mb-3">
                  <span className="text-muted">or</span>
                </div>

                <div className="d-grid gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline-danger"
                    onClick={handleGoogleLogin}
                  >
                    <i className="fab fa-google me-2"></i>
                    Continue with Google
                  </Button>
                </div>

                <div className="text-center">
                  <small className="text-muted">
                    Don't have an account? <Link to="/signup" className="text-decoration-none">Sign up here</Link>
                  </small>
                </div>

                <div className="text-center mt-3">
                  <Link to="/forgot-password" className="text-decoration-none small">
                    Forgot your password?
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Organization Portal Link */}
          <div className="card mt-4 bg-primary text-white">
            <div className="card-body text-center p-4">
              <h6 className="card-title mb-2">
                <i className="fas fa-building me-2"></i>
                Are you a charity organization?
              </h6>
              <p className="card-text small mb-3">
                List your organization to connect with supporters
              </p>
              <Link to="/organization-login" className="btn btn-light btn-sm">
                Organization Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
