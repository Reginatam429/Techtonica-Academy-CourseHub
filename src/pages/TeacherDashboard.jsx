import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import {
    listCourses,
    rosterForCourse,
    assignGrade,
    searchStudents,
    bulkEnroll,
    createCourse,
    deleteCourse,
    updateCourse,
} from "../lib/api";
import NavBar from "../components/NavBar";

const LETTERS = ["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","D-","F"];

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const myCourses = useMemo(
        () => allCourses.filter(c => c.teacher_id === user?.id),
        [allCourses, user?.id]
    );

    async function refreshCourses() {
        try {
        setLoading(true); setErr("");
        const courses = await listCourses("");
        setAllCourses(courses);
        } catch (e) {
        setErr(e.message || "Failed to load courses");
        } finally {
        setLoading(false);
        }
    }

    useEffect(() => { refreshCourses(); }, []);

    return (
        <>
        <NavBar />
        <div className="page p-lg">
            <header className="mb-md">
            <h1>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
            <p className="muted">Manage your courses, rosters, and grades.</p>
            </header>

            {err && <div className="alert error">{err}</div>}

            {loading ? <p>Loading…</p> : (
            <>
                <AddCourseForm onCreated={refreshCourses} />

                <CourseTable
                courses={myCourses}
                onDeleted={refreshCourses}
                />

                <StudentBulkEnrollPanel
                courses={myCourses}
                onEnrolled={refreshCourses}
                />
            </>
            )}
        </div>
        </>
    );
}

/* ---------- Courses table (roster + delete) ---------- */
function CourseTable({ courses, onDeleted }) {
    const [openCourseId, setOpenCourseId] = useState(null);
    const [editCourse, setEditCourse] = useState(null);

    if (!courses.length) return <p className="muted">You don’t own any courses yet.</p>;

    async function handleDelete(id) {
        if (!confirm("Delete this course? This cannot be undone.")) return;
        try {
            await deleteCourse(id);
            await onDeleted?.();
        } catch (e) {
            alert(e.message || "Delete failed");
        }
    }

    return (
        <div className="card mb-lg">
            <div className="card-title">Your Courses</div>
            <table className="table">
            <thead>
                <tr>
                <th>Code</th><th>Name</th><th>Credits</th><th>Seats left</th><th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {courses.map((c) => (
                <tr key={c.id}>
                    <td>{c.code}</td>
                    <td>{c.name}</td>
                    <td>{c.credits}</td>
                    <td>{Math.max(c.available_seats ?? 0, 0)}</td>
                    <td className="row gap-sm">
                    <button className="btn" onClick={() => setOpenCourseId(c.id)}>View roster</button>
                    <button className="btn" onClick={() => setEditCourse(c)}>Edit</button>
                    <button className="btn danger" onClick={() => handleDelete(c.id)}>Delete</button>
    
                    {openCourseId === c.id && (
                        <RosterDialog course={c} onClose={() => setOpenCourseId(null)} />
                    )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
    
            {editCourse && (
            <EditCourseDialog
                course={editCourse}
                onClose={() => setEditCourse(null)}
                onSaved={async () => {
                setEditCourse(null);
                await onDeleted?.(); // reuse to refresh the list
                }}
            />
            )}
        </div>
    );
}

/* ---------- Roster modal with grading ---------- */
function RosterDialog({ course, onClose }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        let on = true;
        (async () => {
        try {
            setLoading(true); setErr("");
            const r = await rosterForCourse(course.id);
            if (on) setRows(r);
        } catch (e) {
            setErr(e.message || "Failed to load roster");
        } finally {
            if (on) setLoading(false);
        }
        })();
        return () => { on = false; };
    }, [course.id]);

    async function handleGrade(studentId, value) {
        try {
        setSavingId(studentId);
        await assignGrade({ studentId, courseId: course.id, value });
        setRows(prev => prev.map(r => r.student_id === studentId ? { ...r, latest_grade: value } : r));
        } catch (e) {
        alert(e.message || "Failed to assign grade");
        } finally {
        setSavingId(null);
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
        <div className="modal card" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
            <h2>{course.code} • {course.name}</h2>
            <button className="btn ghost" onClick={onClose}>Close</button>
            </header>

            {err && <div className="alert error">{err}</div>}
            {loading ? <p>Loading roster…</p> : (
            <table className="table compact">
                <thead>
                <tr><th>Student</th><th>Email</th><th>ID</th><th>Latest grade</th><th>Assign</th></tr>
                </thead>
                <tbody>
                {rows.map(s => (
                    <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.student_code || s.student_id}</td>
                    <td>{s.latest_grade ?? "—"}</td>
                    <td>
                        <select
                        disabled={savingId === s.student_id}
                        defaultValue={s.latest_grade || ""}
                        onChange={e => e.target.value && handleGrade(s.student_id, e.target.value)}
                        >
                        <option value="" disabled>Grade…</option>
                        {LETTERS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>
        </div>
    );
}

function EditCourseDialog({ course, onClose, onSaved }) {
    const [code, setCode] = useState(course.code);
    const [name, setName] = useState(course.name);
    const [credits, setCredits] = useState(course.credits);
    const [limit, setLimit] = useState(course.enrollment_limit ?? 0);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        setErr("");
        try {
            setSaving(true);
            await updateCourse(course.id, {
            code,
            name,
            credits: Number(credits),
            enrollment_limit: Number(limit),
            });
            await onSaved?.();
        } catch (e) {
            setErr(e.message || "Update failed");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
                <h2>Edit {course.code}</h2>
                <button className="btn ghost" onClick={onClose}>Close</button>
            </header>
    
            {err && <div className="alert error">{err}</div>}
    
            <form className="stack gap-sm" onSubmit={onSubmit}>
                <label className="stack">
                <span className="muted">Code</span>
                <input value={code} onChange={(e) => setCode(e.target.value)} />
                </label>
                <label className="stack">
                <span className="muted">Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="stack">
                <span className="muted">Credits</span>
                <input
                    type="number"
                    min="0"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                />
                </label>
                <label className="stack">
                <span className="muted">Enrollment limit</span>
                <input
                    type="number"
                    min="0"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                />
                </label>
    
                <div className="row gap-sm">
                <button className="btn" type="submit" disabled={saving}>Save</button>
                <button className="btn ghost" type="button" onClick={onClose}>Cancel</button>
                </div>
            </form>
            </div>
        </div>
    );
}

/* ---------- Add Course form ---------- */
function AddCourseForm({ onCreated }) {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [credits, setCredits] = useState(3);
    const [limit, setLimit] = useState(25);
    const [saving, setSaving] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        try {
            setSaving(true);
            await createCourse({
            code,
            name,
            credits: Number(credits),
            enrollment_limit: Number(limit),
        });
        setCode(""); setName(""); setCredits(3); setLimit(25);
        await onCreated?.();
        } catch (e) {
            alert(e.message || "Create course failed");
        } finally {
            setSaving(false);
        }
    }
    
    return (
        <div className="card mb-lg">
            <div className="card-title">Add Course</div>
            <form className="row gap-sm wrap" onSubmit={onSubmit}>
                <label className="stack">
                <span className="muted">Code</span>
                <input
                    placeholder="e.g., CS301"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                />
                </label>
        
                <label className="stack">
                <span className="muted">Name</span>
                <input
                    placeholder="Course title"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                </label>
        
                <label className="stack">
                <span className="muted">Credits</span>
                <input
                    type="number"
                    min="0"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                />
                </label>
        
                <label className="stack">
                <span className="muted">Enrollment limit</span>
                <input
                    type="number"
                    min="0"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                />
                </label>
        
                <button className="btn" disabled={saving} type="submit">Create</button>
            </form>
        </div>
    );
}

/* ---------- Student lists & Bulk Enroll ---------- */
function StudentBulkEnrollPanel({ courses, onEnrolled }) {
    const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || null);
    const [query, setQuery] = useState("");
    const [allStudents, setAllStudents] = useState([]);
    const [enrolled, setEnrolled] = useState([]);
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(new Set());

    // Refresh enrolled list for the selected course
    useEffect(() => {
        let on = true;
        (async () => {
        if (!selectedCourseId) return;
        try {
            const roster = await rosterForCourse(selectedCourseId);
            if (on) setEnrolled(roster);
        } catch {
            if (on) setEnrolled([]);
        }
        })();
        return () => { on = false; };
    }, [selectedCourseId]);

    // Search students
    async function doSearch(e) {
        e?.preventDefault?.();
        try {
        setLoading(true);
        const rows = await searchStudents(query.trim());
        setAllStudents(rows);
        // reset checks
        setChecked(new Set());
        } catch (e) {
        alert(e.message || "Search failed");
        } finally {
        setLoading(false);
        }
    }

    function toggleCheck(id) {
        setChecked(prev => {
        const n = new Set(prev);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
        });
    }

    async function doBulkEnroll() {
        if (!selectedCourseId || checked.size === 0) return;
        try {
        const studentIds = Array.from(checked);
        const { added, skipped } = await bulkEnroll(selectedCourseId, studentIds);
        // refresh roster + notify parent
        const roster = await rosterForCourse(selectedCourseId);
        setEnrolled(roster);
        setChecked(new Set());
        await onEnrolled?.();
        alert(`Bulk enroll complete: added ${added}, skipped ${skipped}.`);
        } catch (e) {
        alert(e.message || "Bulk enroll failed");
        }
    }

    // For quick filtering: students not already enrolled in selected course
    const enrolledSet = useMemo(() => new Set(enrolled.map(r => r.student_id)), [enrolled]);
    const available = useMemo(
        () => allStudents.filter(s => !enrolledSet.has(s.id)),
        [allStudents, enrolledSet]
    );

    return (
        <div className="card">
        <div className="card-title">Student Lists & Bulk Enroll</div>

        <div className="row gap-sm wrap mb-sm">
            <select value={selectedCourseId || ""} onChange={e=>setSelectedCourseId(Number(e.target.value) || null)}>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} • {c.name}</option>)}
            </select>

            <form className="row gap-sm" onSubmit={doSearch}>
            <input
                placeholder="Search students (name, email, ID, major)"
                value={query}
                onChange={e=>setQuery(e.target.value)}
            />
            <button className="btn" type="submit" disabled={loading}>Search</button>
            </form>

            <button className="btn" disabled={!selectedCourseId || checked.size === 0} onClick={doBulkEnroll}>
            Bulk Enroll {checked.size ? `(${checked.size})` : ""}
            </button>
        </div>

        <div className="grid two">
            <div>
            <h3 className="mb-xs">Available students</h3>
            <table className="table compact">
                <thead>
                <tr><th></th><th>Name</th><th>Email</th><th>ID</th><th>Major</th></tr>
                </thead>
                <tbody>
                {available.map(s => (
                    <tr key={s.id}>
                    <td>
                        <input
                        type="checkbox"
                        checked={checked.has(s.id)}
                        onChange={() => toggleCheck(s.id)}
                        />
                    </td>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.studentId || s.student_id || "—"}</td>
                    <td>{s.major || "—"}</td>
                    </tr>
                ))}
                {available.length === 0 && (
                    <tr><td colSpan={5} className="muted">No results (or all already enrolled).</td></tr>
                )}
                </tbody>
            </table>
            </div>

            <div>
            <h3 className="mb-xs">Currently enrolled</h3>
            <table className="table compact">
                <thead>
                <tr><th>Name</th><th>Email</th><th>ID</th><th>Latest grade</th></tr>
                </thead>
                <tbody>
                {enrolled.map(s => (
                    <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.student_code || s.student_id}</td>
                    <td>{s.latest_grade ?? "—"}</td>
                    </tr>
                ))}
                {enrolled.length === 0 && (
                    <tr><td colSpan={4} className="muted">No students enrolled yet.</td></tr>
                )}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    );
}