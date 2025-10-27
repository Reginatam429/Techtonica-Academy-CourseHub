const RAW_BASE =
    import.meta.env.DEV ? "/api" : (import.meta.env.VITE_API_URL || "");
const API_BASE = RAW_BASE.replace(/\/$/, "");

// ----- headers -----
function makeHeaders(extra = {}) {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    };
}

function authHeaders() {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// ----- generic fetch wrapper -----
export async function api(path, { method = "GET", body, headers } = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: makeHeaders(headers),
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
    });
    let data = null;
    try { data = await res.json(); } catch { /* empty body ok */ }
    if (!res.ok) throw new Error(data?.error || data?.message || `Request failed: ${res.status}`);
    return data;
}

// ----- feature helpers (students) -----
export const listCourses = (query = "") => {
    const q = query ? `?query=${encodeURIComponent(query)}` : "";
    const suffix = q ? "&" : "?";
    return api(`/courses${q}${suffix}t=${Date.now()}`);
};

export const myEnrollments = () => api("/enrollments/me");
export const enrollInCourse = (courseId) => api("/enrollments", { method: "POST", body: { courseId } });
export const unenrollByEnrollmentId = (enrollmentId) =>
    api(`/enrollments/${enrollmentId}`, { method: "DELETE" }).then(() => true);
export const myGrades = () => api("/grades/me");
export const myGPA = () => api("/grades/me/gpa");


// ----- teacher helpers -----
export async function rosterForCourse(courseId) {
    const res = await fetch(`${API_BASE}/enrollments/course/${courseId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load roster");
    return res.json(); // [{ id, student_id, name, email, student_code, created_at }]
}

export async function assignGrade({ studentId, courseId, value }) {
    const res = await fetch(`${API_BASE}/grades`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ studentId, courseId, value }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to assign grade");
    return res.json();
}

// teacher/admin: search students (role-aware by backend)
export async function searchStudents(query = "") {
    const url = new URL(`${API_BASE}/users`);
    if (query) url.searchParams.set("query", query);
    const res = await fetch(url, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to search users");
    return res.json(); // TEACHER: returns only STUDENT users
}

// teacher/admin: create & delete courses
export function createCourse({ code, name, credits, enrollment_limit }) {
    return api("/courses", {
        method: "POST",
        body: { code, name, credits, enrollment_limit },
    });
}

export function deleteCourse(courseId) {
    return api(`/courses/${courseId}`, { method: "DELETE" });
}

// Update Course
export function updateCourse(courseId, { code, name, credits, enrollment_limit }) {
    return api(`/courses/${courseId}`, {
        method: "PUT",
        body: { code, name, credits, enrollment_limit },
    });
}

// Bulk Enroll
export async function bulkEnroll(courseId, studentIds = []) {
    if (!courseId || !Array.isArray(studentIds) || studentIds.length === 0) {
        throw new Error("courseId and a non-empty studentIds[] are required");
    }
    const res = await fetch(`${API_BASE}/enrollments/bulk`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ courseId, studentIds }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
        const msg = data?.error || "Bulk enroll failed";
        throw new Error(msg);
    }
    return data; // { results: [{studentId, ok, reason?}, ...], seatsLeft }
}