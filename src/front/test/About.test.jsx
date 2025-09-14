import React from "react";
import { render, screen } from "@testing-library/react";
import AboutUs from "./AboutUs";
import { MemoryRouter } from "react-router-dom";

describe("AboutUs Component", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <AboutUs />
      </MemoryRouter>
    );
  });

  it("renders the hero section heading", () => {
    expect(screen.getByRole("heading", { name: /about Causebook/i })).toBeInTheDocument();
  });

  it("renders mission statement", () => {
    expect(screen.getByRole("heading", { name: /our mission/i })).toBeInTheDocument();
    expect(
      screen.getByText(/every charity, regardless of size or budget/i)
    ).toBeInTheDocument();
  });

  it("renders challenge statistics", () => {
    expect(screen.getByText("73%")).toBeInTheDocument();
    expect(screen.getByText("68%")).toBeInTheDocument();
    expect(screen.getByText("91%")).toBeInTheDocument();
  });

  it("renders solution cards", () => {
    expect(screen.getByText(/SEO Optimization/i)).toBeInTheDocument();
    expect(screen.getByText(/Social Media Mastery/i)).toBeInTheDocument();
    expect(screen.getByText(/Influencer Network/i)).toBeInTheDocument();
  });

  it("renders call to action buttons", () => {
    expect(screen.getByRole("link", { name: /list your charity/i })).toHaveAttribute(
      "href",
      "/list-your-charity"
    );
    expect(screen.getByRole("link", { name: /explore charities/i })).toHaveAttribute(
      "href",
      "/categories"
    );
  });

  it("renders upcoming events section", () => {
    expect(
      screen.getByRole("heading", { name: /coming soon: charity excellence awards/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/first event: spring 2025/i)).toBeInTheDocument();
  });
});
