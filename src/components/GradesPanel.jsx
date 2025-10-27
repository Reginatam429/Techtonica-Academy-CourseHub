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
        
            <div className="kpi">
                <div className="muted">GPA</div>
                <div className="kpi-value">{gpa?.gpa != null ? gpa.gpa.toFixed(2) : "—"}</div>
            </div>
        
            <div className="grade-list">
                {(!grades || grades.length === 0) && (
                <div className="muted">No graded courses yet.</div>
                )}
                {grades?.map((g) => (
                <div key={g.course_id} className="grade-row">
                    <div className="grade-course">
                    <strong>{g.code}</strong> &nbsp; {g.name}
                    </div>
                    <div className="grade-value" 
                        style={{ color: gradeColor(g.grade) }}
                    >
                    {g.grade?.replace("_PLUS", "+").replace("_MINUS", "−") ?? "—"}
                    </div>
                    <div className="grade-date">
                    {g.assigned_at ? new Date(g.assigned_at).toLocaleDateString() : "—"}
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
}