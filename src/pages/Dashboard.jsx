import { useAuth } from "../context/useAuth";
import NavBar from "../components/NavBar";

const roleColors = {
  ADMIN:   "#7c3aed", // purple
  TEACHER: "#059669", // green
  STUDENT: "#2563eb", // blue
};

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <>
            <NavBar />
            <div className="container">
            <div className="card" style={{ marginTop: "2rem" }}>
                <h1 style={{ marginBottom: ".5rem" }}>
                Welcome{user?.name ? `, ${user.name}` : ""}!
                </h1>
                {user?.role && (
                <span
                    style={{
                    display: "inline-block",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "9999px",
                    fontSize: ".85rem",
                    fontWeight: 600,
                    color: "white",
                    background: roleColors[user.role] || "#111",
                    }}
                >
                    {user.role}
                </span>
                )}

                <p style={{ marginTop: "1rem", color: "#555" }}>
                You’re signed in with <strong>{user?.email}</strong>.
                </p>

                {user?.role === "STUDENT" && (
                <p style={{ marginTop: "0.5rem" }}>
                    Check your enrolled courses and grades on your student pages.
                </p>
                )}
                {user?.role === "TEACHER" && (
                <p style={{ marginTop: "0.5rem" }}>
                    You can manage your courses, rosters, and assign grades.
                </p>
                )}
                {user?.role === "ADMIN" && (
                <p style={{ marginTop: "0.5rem" }}>
                    You can manage users, all courses, and global settings.
                </p>
                )}
            </div>
            </div>
        </>
    );
}