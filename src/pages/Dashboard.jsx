import { useAuth } from "../context/useAuth";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
// import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
    const { user } = useAuth();
    if (!user) return null;

    if (user.role === "STUDENT") return <StudentDashboard />;
    if (user.role === "TEACHER") return <TeacherDashboard />;
    // if (user.role === "ADMIN") return <AdminDashboard />;
    return <div className="container"><h1>Dashboard</h1><p>Unknown role.</p></div>;
}
