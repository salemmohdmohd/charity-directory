import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { OrganizationSignup } from '../pages/OrganizationSignup'
import useAuth from '../hooks/useAuth'

// Mock useAuth
jest.mock('../hooks/useAuth')
const mockSignup = jest.fn()
const mockClearError = jest.fn()

beforeEach(() => {
  useAuth.mockReturnValue({
    organizationSignup: mockSignup,
    error: null,
    clearError: mockClearError,
    isAuthenticated: false,
  })

  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: async () => ({ categories: [{ id: 1, name: 'Health' }] })
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('OrganizationSignup', () => {
  test('renders form fields correctly', async () => {
    render(
      <MemoryRouter>
        <OrganizationSignup />
      </MemoryRouter>
    )

    expect(await screen.findByLabelText(/Organization Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Admin Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
  })

  test('shows validation errors when submitting empty form', async () => {
    render(
      <MemoryRouter>
        <OrganizationSignup />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /Submit Organization Registration/i }))

    expect(await screen.findByText(/Organization name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Admin email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Password is required/i)).toBeInTheDocument()
  })

  test('calls organizationSignup with valid form data', async () => {
    render(
      <MemoryRouter>
        <OrganizationSignup />
      </MemoryRouter>
    )

    // Fill mini valid inputs
    fireEvent.change(screen.getByLabelText(/Organization Name/i), { target: { value: 'Test Org' } })
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/Mission Statement/i), { target: { value: 'a'.repeat(60) } })
    fireEvent.change(screen.getByLabelText(/Admin Full Name/i), { target: { value: 'Jane Doe' } })
    fireEvent.change(screen.getByLabelText(/Admin Email Address/i), { target: { value: 'admin@test.com' } })
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Dallas' } })
    fireEvent.change(screen.getByLabelText(/Country/i), { target: { value: 'USA' } })
    fireEvent.click(screen.getByLabelText(/I verify that all information/i))
    fireEvent.click(screen.getByLabelText(/I agree to the Terms/i))

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Submit Organization Registration/i }))

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(
        expect.objectContaining({
          organization_name: 'Test Org',
          category_id: 1,
          mission: expect.any(String),
          admin_email: 'admin@test.com',
        })
      )
    })
  })
})
