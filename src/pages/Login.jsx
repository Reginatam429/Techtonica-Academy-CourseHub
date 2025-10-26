import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import NavBar from "../components/NavBar";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [setErr] = useState("");
    const { login } = useAuth();
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
                footer={<p className="muted">New student? <Link to="/register">Register</Link></p>}
                >
                <form onSubmit={onSubmit} className="auth-form">
                    <input type="email" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
                    <input type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
                    <button type="submit">Sign in</button>
                </form>
            </AuthLayout>
        </>
    );
}
