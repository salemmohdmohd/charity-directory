// authService.js
import { api } from './api'


export const login = async (email, password) => {
  const response = await api.post('/login', { email, password })

  if (response.data.token) {
    localStorage.setItem('AUTH_TOKEN', response.data.token)
  }
  return response.data
}

export const signup = async (userData) => {
  const response = await api.post('/register', userData)
  return response.data
}


export const getProfile = async () => {
  const response = await api.get('/profile')
  return response.data
}
