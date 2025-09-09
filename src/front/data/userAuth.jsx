// Enhanced userAuth using axios with automatic token refresh
import { authService } from '../Services/axios'

// Re-export all auth service methods for compatibility
export const login = authService.login
export const signup = authService.signup
export const getCurrentUserData = async () => {
  const userData = await authService.getCurrentUser()
  return { user: userData } // Maintain compatibility with existing components
}
export const logout = authService.logout
export const isAuthenticated = authService.isAuthenticated
export const forgotPassword = authService.forgotPassword
export const resetPassword = authService.resetPassword
export const changePassword = authService.changePassword
export const updateProfile = authService.updateProfile
export const linkGoogleAccount = authService.linkGoogleAccount
export const unlinkGoogleAccount = authService.unlinkGoogleAccount
export const debugToken = authService.debugToken

// Token management (maintained for backward compatibility)
export const getToken = () => localStorage.getItem('access_token')
export const saveToken = (token) => localStorage.setItem('access_token', token)
export const removeToken = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// Enhanced token management for refresh tokens
export const getRefreshToken = () => localStorage.getItem('refresh_token')
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken)
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken)
  }
}

// Get current user from token (enhanced)
export const getCurrentUser = () => {
  const token = getToken()
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      is_verified: payload.is_verified
    }
  } catch (error) {
    console.error('Token validation error:', error)
    removeToken()
    return null
  }
}

// OAuth handling (enhanced for refresh tokens)
export const handleOAuthCallback = (urlParams) => {
  const token = urlParams.get('token')
  const refreshToken = urlParams.get('refresh_token')
  const userId = urlParams.get('user_id')

  if (token) {
    saveTokens(token, refreshToken)
    return { token, refreshToken, userId }
  }

  throw new Error('No authentication tokens received')
}

// Google OAuth initiation
export const initiateGoogleOAuth = () => {
  authService.initiateGoogleOAuth()
}
