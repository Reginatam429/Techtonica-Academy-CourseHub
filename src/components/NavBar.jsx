// src/components/NavBar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function NavBar() {
    const { user, logout } = useAuth();
    const nav = useNavigate();

    const handleLogout = () => {
        logout();
        nav("/");
    };

    return (
        <header className="navbar">
        <div className="navbar__inner">
            <Link to="/" className="navbar__brand">Techtonica CourseHub</Link>

            <nav className="navbar__nav">
            {user ? (
                <>
                <span className="navbar__user">
                    {user.name} {user.role ? `• ${user.role}` : ""}
                </span>
                <Link to="/dashboard" className="btn btn--ghost">Dashboard</Link>
                <button onClick={handleLogout} className="btn btn--primary">Logout</button>
                </>
            ) : (
                <>
                <Link to="/login" className="btn btn--ghost">Login</Link>
                <Link to="/register" className="btn btn--primary">Register</Link>
                </>
            )}
            </nav>
        </div>
        </header>
    );
}
