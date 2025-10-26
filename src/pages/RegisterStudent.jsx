import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import NavBar from "../components/NavBar";
import AuthLayout from "../components/AuthLayout";

export default function RegisterStudent() {
    const [firstName, setFirstName] = useState("");
    const [lastName,  setLastName]  = useState("");
    const [password,  setPassword]  = useState("");
    const [major,     setMajor]     = useState("");
    const [err, setErr] = useState("");

    const { registerStudent, loading } = useAuth();
    const nav = useNavigate();

    async function onSubmit(e) {
        e.preventDefault();
        setErr("");

        const f = firstName.trim();
        const l = lastName.trim();
        const p = password.trim();

        if (!f || !l || !p) {
        setErr("First name, last name, and password are required.");
        return;
        }
        if (p.length < 6) {
        setErr("Password must be at least 6 characters.");
        return;
        }

        try {
        await registerStudent({ firstName: f, lastName: l, password: p, major: major.trim() || undefined });
        nav("/dashboard");
        } catch (e) {
        // handle string or fetch Error objects
        const msg =
            (typeof e === "string" && e) ||
            e?.message ||
            e?.response?.data?.error ||
            "Registration failed";
        setErr(msg);
        }
    }

    return (
        <>
            <NavBar />
            <AuthLayout
            title="Create your student account"
            footer={
                <p className="muted">
                Already have an account? <Link to="/login">Login</Link>
                </p>
            }
            >
            {err ? <p style={{ color: "crimson", marginTop: 0 }}>{err}</p> : null}

            <form onSubmit={onSubmit} className="auth-form" noValidate>
                <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
                />
                <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
                />
                <input
                type="text"
                placeholder="Major (optional)"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                autoComplete="organization-title"
                />
                <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                />
                <button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create account"}
                </button>
            </form>
            </AuthLayout>
        </>
    );
}
