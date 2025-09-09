import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SearchHistory from "../components/SearchHistory";

// Mock useGlobalReducer
jest.mock("../hooks/useGlobalReducer", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("SearchHistory Component", () => {
  let mockDispatch;

  beforeEach(() => {
    mockDispatch = jest.fn();
    jest.clearAllMocks();

    // Default mock: user logged in
    require("../hooks/useGlobalReducer").default.mockReturnValue({
      store: { user: { id: 1, email: "test@example.com" } },
      dispatch: mockDispatch,
    });
  });

  test("redirects to login if no user", () => {
    require("../hooks/useGlobalReducer").default.mockReturnValue({
      store: { user: null },
      dispatch: mockDispatch,
    });

    render(
      <MemoryRouter>
        <SearchHistory />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("renders initial search history", async () => {
    render(
      <MemoryRouter>
        <SearchHistory />
      </MemoryRouter>
    );

    // Wait for mock history to load
    expect(await screen.findByText(/children education/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Searches/i)).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument(); // total
  });

  test("filters by search term", async () => {
    render(
      <MemoryRouter>
        <SearchHistory />
      </MemoryRouter>
    );

    const searchInput = await screen.findByPlaceholderText(/search your history/i);

    fireEvent.change(searchInput, { target: { value: "ocean" } });

    expect(await screen.findByText(/ocean conservation/i)).toBeInTheDocument();
    expect(screen.queryByText(/children education/i)).not.toBeInTheDocument();
  });

  test("filters by type", async () => {
    render(
      <MemoryRouter>
        <SearchHistory />
      </MemoryRouter>
    );

    const select = await screen.findByDisplayValue(/All Search Types/i);
    fireEvent.change(select, { target: { value: "category_search" } });

    expect(await screen.findByText(/health/i)).toBeInTheDocument();
    expect(screen.queryByText(/children education/i)).not.toBeInTheDocument();
  });

  test("deletes a search item", async () => {
    render(
      <MemoryRouter>
        <SearchHistory />
      </MemoryRouter>
    );

    const deleteButtons = await screen.findAllByTitle(/Remove from history/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "SET_NOTIFICATION",
        payload: "Search item removed",
      })
    );
  });

  test("repeats a search", async () => {
    render(
      <MemoryRouter>
        <SearchHistory />
      </MemoryRouter>
    );

    const repeatButtons = await screen.findAllByTitle(/Repeat this search/i);
    fireEvent.click(repeatButtons[0]);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SET_NOTIFICATION",
      })
    );
  });

  test("clears history when confirmed", async () => {
    // Mock window.confirm to auto-return true
    window.confirm = jest.fn(() => true);

    render(
      <MemoryRouter>
        <SearchHistory />
      </MemoryRouter>
    );

    const clearBtn = await screen.findByText(/Clear All/i);
    fireEvent.click(clearBtn);

    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "SET_NOTIFICATION",
        payload: "Search history cleared successfully",
      })
    );
  });
});
