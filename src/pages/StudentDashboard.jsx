import { useEffect, useMemo, useState } from "react";
import { myEnrollments, listCourses, enrollInCourse, unenrollByEnrollmentId, myGrades, myGPA } from "../lib/api";
import GradesPanel from "../components/GradesPanel";
import CourseCard from "../components/CourseCard";
import SearchBar from "../components/SearchBar";

export default function StudentDashboard() {
    const [loading, setLoading] = useState(true);
    const [enrollments, setEnrollments] = useState([]);   // [{ id, course: {...} }]
    const [courses, setCourses] = useState([]);           // all / filtered
    const [grades, setGrades] = useState([]);
    const [gpa, setGPA] = useState(null);
    const [err, setErr] = useState("");

    async function hydrate(query = "") {
        setLoading(true);
        setErr("");
        try {
        const [enrs, crs, grs, gpaRes] = await Promise.all([
            myEnrollments(),
            listCourses(query),
            myGrades(),
            myGPA(),
        ]);
        setEnrollments(enrs);
        setCourses(crs);
        setGrades(grs);
        setGPA(gpaRes);
        } catch (e) {
        setErr(e.message || "Failed to load dashboard");
        } finally {
        setLoading(false);
        }
    }

    useEffect(() => { hydrate(); }, []);

    const enrolledCourseIds = useMemo(
        () => new Set(enrollments.map((e) => e.course.id)),
        [enrollments]
    );

    async function handleEnroll(courseId) {
        try {
        await enrollInCourse(courseId);
        await hydrate(); // refresh everything (seats, lists, etc.)
        } catch (e) {
        alert(e.message || "Enroll failed");
        }
    }

    async function handleUnenroll(enrollmentId) {
        if (!confirm("Unenroll from this course?")) return;
        try {
        await unenrollByEnrollmentId(enrollmentId);
        await hydrate();
        } catch (e) {
        alert(e.message || "Unenroll failed");
        }
    }

    return (
        <div className="container">
        <h1 className="page-title">Student Dashboard</h1>
        {err && <div className="error">{err}</div>}

        {/* Row 1: My Grades */}
        <div className="grid two">
            <GradesPanel gpa={gpa} grades={grades} />
            <div className="card hero">
            <div className="card-title">Welcome back 👋</div>
            <p className="muted">
                Track your progress, review grades, and discover new courses.
            </p>
            </div>
        </div>

        {/* Row 2: My Courses */}
        <div className="section">
            <div className="section-head">
            <h2>My Courses</h2>
            </div>
            {enrollments.length === 0 ? (
            <div className="muted">You do not have any courses yet. Enroll below!</div>
            ) : (
            <div className="grid three">
                {enrollments.map((enr) => (
                <CourseCard
                    key={enr.id}
                    course={enr.course}
                    footer={
                    <button className="btn danger" onClick={() => handleUnenroll(enr.id)}>
                        Unenroll
                    </button>
                    }
                />
                ))}
            </div>
            )}
        </div>

        {/* Row 3: Enroll in a Course */}
        <div className="section">
            <div className="section-head row between center">
            <h2>Enroll in a Course</h2>
            <SearchBar onSearch={(q) => hydrate(q)} />
            </div>

            {loading ? (
            <div className="muted">Loading…</div>
            ) : (
            <div className="grid three">
                {courses.map((c) => {
                const isEnrolled = enrolledCourseIds.has(c.id);
                return (
                    <CourseCard
                    key={c.id}
                    course={c}
                    footer={
                        <button
                        className="btn"
                        disabled={isEnrolled || (c.available_seats ?? 0) <= 0}
                        onClick={() => handleEnroll(c.id)}
                        title={
                            isEnrolled
                            ? "Already enrolled"
                            : (c.available_seats ?? 0) <= 0
                            ? "No seats available"
                            : "Enroll"
                        }
                        >
                        {isEnrolled ? "Enrolled" : "Enroll"}
                        </button>
                    }
                    />
                );
                })}
            </div>
            )}
        </div>
        </div>
    );
}