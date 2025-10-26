export default function CourseCard({ course, footer }) {
    return (
        <div className="card course-card">
            <div className="course-head">
            <div className="code">{course.code}</div>
            <div className="name">{course.name}</div>
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