import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { OrganizationLogin } from '../pages/OrganizationLogin'
import useGlobalReducer from '../hooks/useGlobalReducer'

// Mock useGlobalReducer
jest.mock('../hooks/useGlobalReducer')
const mockDispatch = jest.fn()

beforeEach(() => {
  useGlobalReducer.mockReturnValue({ dispatch: mockDispatch })
  jest.useFakeTimers()
})

afterEach(() => {
  jest.clearAllMocks()
  jest.useRealTimers()
})

describe('OrganizationLogin', () => {
  test('renders form fields', () => {
    render(
      <MemoryRouter>
        <OrganizationLogin />
      </MemoryRouter>
    )

    expect(screen.getByLabelText(/Organization Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Access Organization Dashboard/i })).toBeInTheDocument()
  })

  test('shows validation errors when submitting empty form', async () => {
    render(
      <MemoryRouter>
        <OrganizationLogin />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /Access Organization Dashboard/i }))

    expect(await screen.findByText(/Organization email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Password is required/i)).toBeInTheDocument()
  })

  test('dispatches SET_USER and navigates on valid login', async () => {
    render(
      <MemoryRouter>
        <OrganizationLogin />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/Organization Email/i), { target: { value: 'org@test.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })

    fireEvent.click(screen.getByRole('button', { name: /Access Organization Dashboard/i }))

    // Advance timers to simulate setTimeout
    await waitFor(() => {
      jest.runAllTimers()
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_USER',
          payload: expect.objectContaining({
            email: 'org@test.com',
            role: 'organization',
          }),
        })
      )
    })
  })

  test('dispatches notification when clicking Google login', () => {
    render(
      <MemoryRouter>
        <OrganizationLogin />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /Continue with Google/i }))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_NOTIFICATION',
      payload: 'Google OAuth for organizations coming soon!',
    })
  })
})
