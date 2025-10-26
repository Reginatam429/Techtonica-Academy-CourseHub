import { useAuth } from "../context/useAuth";

export default function Dashboard() {
    const { user, logout } = useAuth();
    return (
        <div style={{ maxWidth: 640, margin: "3rem auto" }}>
        <h1>Dashboard</h1>
        <p>Welcome{user ? `, ${user.name}` : ""}!</p>
        <pre style={{ background: "#f6f6f6", padding: 12 }}>
            {JSON.stringify(user, null, 2)}
        </pre>
        <button onClick={logout}>Logout</button>
        </div>
    );
}
