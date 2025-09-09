import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ForgotPassword } from "../pages/ForgotPassword";

// Mock forgotPassword API
jest.mock("../data/userAuth", () => ({
  forgotPassword: jest.fn(),
}));
import { forgotPassword } from "../data/userAuth";

// Mock useGlobalReducer
jest.mock("../hooks/useGlobalReducer", () => () => ({
  dispatch: jest.fn(),
}));

// Mock Input + Button components (to simplify testing)
jest.mock("../components/forms/Input", () => (props) => (
  <input
    data-testid="email-input"
    value={props.value}
    onChange={props.onChange}
    placeholder={props.placeholder}
  />
));
jest.mock("../components/forms/Button", () => (props) => (
  <button {...props}>{props.children}</button>
));

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form correctly", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    expect(screen.getByText(/Reset Your Password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send Reset Instructions/i })
    ).toBeInTheDocument();
  });

  it("shows error when email is empty", async () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Send Reset Instructions/i }));

    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
  });

  it("shows error when email is invalid", async () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "invalidEmail" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Instructions/i }));

    expect(
      await screen.findByText(/Please enter a valid email address/i)
    ).toBeInTheDocument();
  });

  it("submits successfully and shows success screen", async () => {
    forgotPassword.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Instructions/i }));

    await waitFor(() =>
      expect(screen.getByText(/Check Your Email/i)).toBeInTheDocument()
    );
    expect(
      screen.getByText(/We've sent password reset instructions/i)
    ).toBeInTheDocument();
    expect(forgotPassword).toHaveBeenCalledWith("test@example.com");
  });

  it("shows error when API fails", async () => {
    forgotPassword.mockRejectedValueOnce(new Error("Server error"));

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Instructions/i }));

    expect(
      await screen.findByText(/Server error/i)
    ).toBeInTheDocument();
  });

  it("resets form when 'Try Different Email' is clicked", async () => {
    forgotPassword.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Instructions/i }));

    await screen.findByText(/Check Your Email/i);

    fireEvent.click(screen.getByRole("button", { name: /Try Different Email/i }));

    expect(await screen.findByText(/Reset Your Password/i)).toBeInTheDocument();
  });
});
