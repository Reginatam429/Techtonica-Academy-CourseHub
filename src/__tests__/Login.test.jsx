import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";
import { describe, it, expect, vi } from "vitest";

vi.mock("../context/useAuth", () => ({
    useAuth: () => ({
        user: null,
        logout: vi.fn(),
    }),
}));

describe("Login Page", () => {
    it("renders email and password inputs", () => {
        render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
        );
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    });
});
