import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { AuthContext } from "../context/AuthContext";
import { vi, describe, it, expect, beforeEach } from "vitest";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLoginPage(authOverrides = {}) {
  const authValue = {
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    token: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    ...authOverrides,
  };

  return {
    ...render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    ),
    authValue,
  };
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password inputs and submit button", () => {
    renderLoginPage();

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("calls login and navigates to '/' on successful submission", async () => {
    const loginMock = vi.fn().mockResolvedValueOnce(undefined);
    renderLoginPage({ login: loginMock });

    await userEvent.type(screen.getByLabelText(/email address/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(loginMock).toHaveBeenCalledWith("user@example.com", "password123");
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("displays error banner when login fails", async () => {
    const loginMock = vi.fn().mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });
    renderLoginPage({ login: loginMock });

    await userEvent.type(screen.getByLabelText(/email address/i), "wrong@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpassword");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(loginMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId("login-error")).toHaveTextContent("Invalid credentials");
    });
  });
});
