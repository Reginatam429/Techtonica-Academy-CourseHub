import { useMemo } from "react";

function gradeColor(g) {
    if (!g) return "";
    if (g.startsWith("A")) return "green";
    if (g.startsWith("B")) return "olive";
    if (g.startsWith("C")) return "gold";
    if (g.startsWith("D")) return "orange";
    return "red";
}

export default function GradesPanel({ gpa, grades = [] }) {
    const latestOnly = useMemo(() => {
        const map = new Map(); // course_id -> latest grade record
        for (const g of grades) {
            const prev = map.get(g.course_id);
            const curT  = g?.assigned_at ? new Date(g.assigned_at).getTime() : -Infinity;
            const prevT = prev?.assigned_at ? new Date(prev.assigned_at).getTime() : -Infinity;
            if (!prev || curT >= prevT) map.set(g.course_id, g);
    }

    return Array.from(map.values()).sort((a, b) => {
        const at = a?.assigned_at ? new Date(a.assigned_at).getTime() : 0;
        const bt = b?.assigned_at ? new Date(b.assigned_at).getTime() : 0;
        return bt - at;
    });
    }, [grades]);

    return (
        <div className="card">
            <div className="card-title">My Grades</div>
        
            <div className="kpi">
                <div className="muted">GPA</div>
                <div className="kpi-value">{gpa?.gpa != null ? gpa.gpa.toFixed(2) : "—"}</div>
            </div>
            <br></br>
            {/* Scroll area so the card never grows too tall */}
            <div className="grade-list grade-scroll">
                {(latestOnly.length === 0) && (
                <div className="muted">No graded courses yet.</div>
                )}
        
                {latestOnly.map((g) => {
                const label =
                    g.grade?.replace("_PLUS", "+").replace("_MINUS", "−") ?? "—";
                const date =
                    g.assigned_at ? new Date(g.assigned_at).toLocaleDateString() : "—";
                return (
                    <div key={g.course_id} className="grade-row">
                    <div className="grade-course">
                        <strong>{g.code}</strong>&nbsp;{g.name}
                    </div>
                    <div className="grade-value" style={{ color: gradeColor(g.grade) }}>
                        {label}
                    </div>
                    <div className="grade-date">graded on {date}</div>
                    </div>
                );
                })}
            </div>
        </div>
    );
}
