export default function CourseCard({ course, footer, grade }) {
    return (
        <div className="card course-card">
            <div className="course-head">
            <div>
                <div className="code">{course.code}</div>
                <div className="name">{course.name}</div>
            </div>
    
            {grade ? (
                <span className={`grade-chip`} title="Latest grade">
                {grade}
                </span>
            ) : (
                <span className="grade-chip muted" title="No grade yet">Not yet graded</span>
            )}
            </div>
    
            <div className="meta">
            <span>{course.credits} credits</span>
            {" · "}
            <span>{Math.max(course.available_seats ?? 0, 0)} seats left</span>
            </div>
    
            {footer ? <div className="card-footer">{footer}</div> : null}
        </div>
    );
}