function normalizeGrade(g) {
    if (!g) return null;
    return g.replace("_PLUS", "+").replace("_MINUS", "−");
}

function gradeColor(g) {
    if (!g) return "";
    if (g.startsWith("A")) return "green";
    if (g.startsWith("B")) return "olive";
    if (g.startsWith("C")) return "gold";
    if (g.startsWith("D")) return "orange";
    return "red";
}

export default function CourseCard({ course, grade, footer }) {
    const { code, name, credits, available_seats } = course;
    const pretty = normalizeGrade(grade);

    return (
        <div className="card">
            <div className="card-title">{code || "(code)"}</div>
            <div className="muted">{name || "(name)"}</div>
        
            {/* 👇 Update only this section */}
            {pretty && (
                <div
                className={`chip grade ${gradeColor(pretty)}`}
                title={`Latest grade: ${pretty}`}
                >
                {pretty}
                </div>
            )}
        
            <div className="muted" style={{ marginTop: 8 }}>
                {credits ?? 0} credits · {(available_seats ?? 0)} seats left
            </div>
        
            <div style={{ marginTop: 12 }}>{footer}</div>
        </div>
    );
}