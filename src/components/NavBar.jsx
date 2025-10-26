import { Link } from "react-router-dom";

export default function NavBar() {
    return (
        <header className="nav">
        <div className="nav-inner">
            <Link to="/" className="brand">Techtonica CourseHub</Link>
            <nav className="nav-links">
            <Link to="/login">Login</Link>
            <Link to="/register" className="primary">Register</Link>
            </nav>
        </div>
        </header>
    );
}
