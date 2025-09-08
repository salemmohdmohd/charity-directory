import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Login } from "./Login";

// Mock useAuth hook
jest.mock("../hooks/useAuth", () => {
  return jest.fn(() => ({
    login: jest.fn(),
    initiateGoogleOAuth: jest.fn(),
    error: null,
    clearError: jest.fn(),
    isAuthenticated: false,
  }));
});

// Mock navigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Login Component", () => {
  let mockLogin, mockGoogle, mockClear, useAuth;

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth = require("../hooks/useAuth");
    mockLogin = jest.fn();
    mockGoogle = jest.fn();
    mockClear = jest.fn();

    useAuth.mockReturnValue({
      login: mockLogin,
      initiateGoogleOAuth: mockGoogle,
      error: null,
      clearError: mockClear,
      isAuthenticated: false,
    });
  });

  test("renders email and password inputs", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  test("shows validation errors for empty fields", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
  });

  test("calls login with valid input", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "123456");
    });
  });

  test("navigates to dashboard if already authenticated", () => {
    useAuth.mockReturnValue({
      login: jest.fn(),
      initiateGoogleOAuth: jest.fn(),
      error: null,
      clearError: jest.fn(),
      isAuthenticated: true,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("handles Google login button", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Continue with Google/i }));
    expect(mockGoogle).toHaveBeenCalled();
  });

  test("displays global error message from useAuth", () => {
    useAuth.mockReturnValue({
      login: jest.fn(),
      initiateGoogleOAuth: jest.fn(),
      error: "Invalid credentials",
      clearError: jest.fn(),
      isAuthenticated: false,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");
  });
});
