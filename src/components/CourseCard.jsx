export default function CourseCard({ course, grade, footer }) {
    const { code, name, credits, available_seats } = course;

    return (
        <div className="card">
            <div className="card-title">{code || "(code)"}</div>
            <div className="muted">{name || "(name)"}</div>
    
            {/* grade chip – only when a grade value exists */}
            {grade ? (
            <div className="chip grade" title="Latest grade">
                {grade.replace("_PLUS", "+").replace("_MINUS", "−")}
            </div>
            ) : null}
    
            <div className="muted" style={{ marginTop: 8 }}>
            {credits ?? 0} credits · {(available_seats ?? 0)} seats left
            </div>
    
            <div style={{ marginTop: 12 }}>{footer}</div>
        </div>
    );
}
