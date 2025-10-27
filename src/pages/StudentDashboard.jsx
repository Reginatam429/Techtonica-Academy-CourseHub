import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import {
    myEnrollments,
    listCourses,
    enrollInCourse,
    unenrollByEnrollmentId,
    myGrades,
    myGPA,
} from "../lib/api";
import NavBar from "../components/NavBar";
import GradesPanel from "../components/GradesPanel";
import CourseCard from "../components/CourseCard";
import SearchBar from "../components/SearchBar";

export default function StudentDashboard() {
    const { user } = useAuth();
    const firstName = (user?.name || "Student").split(" ")[0];

    const [loading, setLoading] = useState(true);
    const [enrollments, setEnrollments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [currentGrades, setCurrentGrades] = useState([]);
    const [gpa, setGPA] = useState(null);
    const [err, setErr] = useState("");

    async function hydrate(query = "") {
        setLoading(true);
        setErr("");
        try {
        const [enrs, crs, latest, gpaRes] = await Promise.all([
            myEnrollments(),
            listCourses(query),
            myGrades(),
            myGPA(),
        ]);
        setEnrollments(enrs || []);
        setCourses(crs || []);
        setCurrentGrades(latest || []);
        setGPA(gpaRes || null);
        } catch (e) {
        setErr(e.message || "Failed to load dashboard");
        } finally {
        setLoading(false);
        }
    }

    useEffect(() => {
        hydrate();
    }, []);

    // Which course IDs am I enrolled in?
    const enrolledCourseIds = useMemo(() => {
        const ids = (enrollments || [])
        .map((e) => e?.course?.id ?? e?.course_id)
        .filter(Boolean);
        return new Set(ids);
    }, [enrollments]);

    // Quick lookups for catalog courses by id
    const courseById = useMemo(() => {
        const m = new Map();
        (courses || []).forEach((c) => m.set(c.id, c));
        return m;
    }, [courses]);

    // ----- Latest grade per course -----
    const latestGradeByCourseId = useMemo(() => {
        const m = new Map();
        (currentGrades || []).forEach((g) => m.set(g.course_id, g));
        return m;
    }, [currentGrades]);

    // Array for GradesPanel so it shows one (latest) per course
    // const latestGradesArray = useMemo(
    //     () => Array.from(latestGradeByCourseId.values()),
    //     [latestGradeByCourseId]
    // );

    async function handleEnroll(courseId) {
        try {
        await enrollInCourse(courseId);
        await hydrate();
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
        <>
            <NavBar />
            <div className="container">
                {/* Welcome ribbon */}
                <section className="welcome">
                <div className="welcome__text">
                    <h1 className="welcome__title">Welcome back, {firstName} 👋</h1>
                    <p className="welcome__subtitle">
                    Stay on top of your progress—check GPA, review grades, and enroll in new courses.
                    </p>
                </div>
                </section>
        
                {err && <div className="error">{err}</div>}
        
                {/* Row 1: My Grades */}
                <div className="grid two">
                {/* Pass only “current” grades */}
                <GradesPanel gpa={gpa} grades={currentGrades} />
                <div className="card hero">
                    <div className="card-title">Quick tip</div>
                    <p className="muted">Use the search to quickly find courses below.</p>
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
                    {enrollments.map((enr) => {
                        const course =
                        courseById.get(enr.course_id ?? enr?.course?.id) ||
                        enr.course || {
                            id: enr.course_id,
                            code: "(code)",
                            name: "(name)",
                            credits: 0,
                            available_seats: 0,
                        };
        
                        const latest = latestGradeByCourseId.get(course.id);
                        const gradeValue = latest?.grade ?? null; // string like "A" / "B_PLUS"
        
                        return (
                        <CourseCard
                            key={enr.id}
                            course={course}
                            grade={gradeValue} // only shows if truthy
                            footer={
                            <button className="btn danger" onClick={() => handleUnenroll(enr.id)}>
                                Unenroll
                            </button>
                            }
                        />
                        );
                    })}
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
                            // NOTE: we do NOT pass a grade for catalog cards (prevents “not yet graded” showing)
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
        </>
    );
}
