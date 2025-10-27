import { render, screen } from "@testing-library/react";
import NavBar from "../components/NavBar";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";

vi.mock("../context/useAuth", () => ({
    useAuth: () => ({
        user: null,
        logout: vi.fn(),
    }),
}));

describe("NavBar", () => {
    it("renders a login or dashboard link", () => {
        render(
        <MemoryRouter>
            <NavBar />
        </MemoryRouter>
        );

        const links = screen.getAllByRole("link");
        expect(links.length).toBeGreaterThan(0);
        expect(screen.getByText(/login/i) || screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
});
