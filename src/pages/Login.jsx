import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import NavBar from "../components/NavBar";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const { login, loading } = useAuth();
    const nav = useNavigate();

    async function onSubmit(e) {
        e.preventDefault();
        setErr("");
        try {
        await login(email, password);
        nav("/dashboard");
        } catch (e) {
        setErr(e.message || "Login failed");
        }
    }

    return (
        <>
        <NavBar />
        <AuthLayout
            title="Login"
            className="auth-page"
            footer={
            <p className="muted">
                New student? <Link to="/register">Register</Link>
            </p>
            }
        >
            {err && <p className="error" style={{ color: "crimson", marginBottom: 8 }}>{err}</p>}
            <form onSubmit={onSubmit} className="auth-form">
            <input
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
            </button>
            </form>
        </AuthLayout>
        </>
    );
}
