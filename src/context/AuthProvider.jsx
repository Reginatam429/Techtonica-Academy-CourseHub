import { useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { api } from "../lib/api";

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token") || "");
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem("user")) || null; }
        catch { return null; }
    });
    const [loading, setLoading] = useState(false);

    function saveSession(nextToken, nextUser) {
        setToken(nextToken);
        setUser(nextUser);
        localStorage.setItem("token", nextToken);
        localStorage.setItem("user", JSON.stringify(nextUser));
    }

    function logout() {
        setToken("");
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }

    async function login(email, password) {
        setLoading(true);
        try {
        const { token: t, user: u } = await api("/auth/login", {
            method: "POST",
            body: { email, password },
        });
        saveSession(t, u);
        return u;
        } finally { setLoading(false); }
    }

    async function registerStudent({ firstName, lastName, password, major }) {
        setLoading(true);
        try {
        const res = await api("/auth/register", {
            method: "POST",
            body: { firstName, lastName, password, major },
        });
        saveSession(res.token, res.user);
        return res.user;
        } finally { setLoading(false); }
    }

    const value = useMemo(
        () => ({ token, user, loading, login, registerStudent, logout }),
        [token, user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
