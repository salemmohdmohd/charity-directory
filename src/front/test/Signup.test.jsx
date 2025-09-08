import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Signup } from "./Signup";

// Mock useAuth hook
jest.mock("../hooks/useAuth", () => {
  return jest.fn(() => ({
    signup: jest.fn(),
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

describe("Signup Component", () => {
  let mockSignup, mockGoogle, mockClear, useAuth;

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth = require("../hooks/useAuth");
    mockSignup = jest.fn();
    mockGoogle = jest.fn();
    mockClear = jest.fn();

    useAuth.mockReturnValue({
      signup: mockSignup,
      initiateGoogleOAuth: mockGoogle,
      error: null,
      clearError: mockClear,
      isAuthenticated: false,
    });
  });

  test("renders all required inputs", () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByText(/I agree to the/i)).toBeInTheDocument();
  });

  test("shows validation errors for empty form", async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    expect(await screen.findByText(/Name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Please confirm your password/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/You must agree to the terms/i)
    ).toBeInTheDocument();
  });

  test("shows password mismatch error", async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "Password1!" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "Different1!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    expect(
      await screen.findByText(/Passwords do not match/i)
    ).toBeInTheDocument();
  });

  test("calls signup with valid form", async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: "Password1!" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "Password1!" },
    });
    fireEvent.click(screen.getByLabelText(/I agree to the/i));

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(
        "Jane Doe",
        "jane@example.com",
        "Password1!"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("navigates to dashboard if already authenticated", () => {
    useAuth.mockReturnValue({
      signup: jest.fn(),
      initiateGoogleOAuth: jest.fn(),
      error: null,
      clearError: jest.fn(),
      isAuthenticated: true,
    });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("handles Google signup button", () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Sign up with Google/i }));
    expect(mockGoogle).toHaveBeenCalled();
  });

  test("displays global error message from useAuth", () => {
    useAuth.mockReturnValue({
      signup: jest.fn(),
      initiateGoogleOAuth: jest.fn(),
      error: "Email already in use",
      clearError: jest.fn(),
      isAuthenticated: false,
    });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Email already in use");
  });
});
