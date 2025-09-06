import axios from 'axios'

const baseURL = 'https://organic-fortnight-pjv5pg5jgj5crprp-3001.app.github.dev/'

export const api = axios.create({
  baseURL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
})


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('AUTH_TOKEN')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
