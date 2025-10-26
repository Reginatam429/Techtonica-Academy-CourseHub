function gradeColor(g) {
    if (!g) return "";
    if (g.startsWith("A")) return "green";
    if (g.startsWith("B")) return "olive";
    if (g.startsWith("C")) return "gold";
    if (g.startsWith("D")) return "orange";
    return "red";
}

export default function GradesPanel({ gpa, grades = [] }) {
    return (
        <div className="card">
            <div className="card-title">My Grades</div>
            <div className="gpa-row">
            <div className="gpa-label">GPA</div>
            <div className="gpa-value">{gpa?.gpa?.toFixed?.(2) ?? "—"}</div>
            </div>
            <div className="grades-list">
            {grades.length === 0 && <div className="muted">No grades yet.</div>}
            {grades.map((g) => (
                <div className="grade-item" key={g.id}>
                <div className="left">
                    <div className="course">{g.course_code} — {g.course_name}</div>
                    <div className="date muted">{new Date(g.assigned_at).toLocaleDateString()}</div>
                </div>
                <div className={`badge ${gradeColor(g.value)}`}>{g.value}</div>
                </div>
            ))}
            </div>
        </div>
    );
}