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
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    params.set("role", "STUDENT");

    const qs = params.toString();
    const url = `${API_BASE}/users${qs ? `?${qs}` : ""}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to search users");
    const rows = await res.json();

    return Array.isArray(rows) ? rows.filter(r => (r.role || "STUDENT") === "STUDENT") : [];
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

// --- Admin: Users CRUD ---
export async function adminListUsers(query = "") {
    const url = new URL(`${API_BASE}/users`, window.location.origin);
    if (query) url.searchParams.set("query", query);
    const res = await fetch(url.toString().replace(window.location.origin, ""), {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load users");
    return res.json();
}

export async function adminReadUser(id) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load user");
    return res.json();
}

export async function adminCreateUser(payload) {
    const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.errors?.[0] || data?.error || "Create failed");
    return data;
}

export async function adminUpdateUser(id, payload) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.errors?.[0] || data?.error || "Update failed");
    return data;
}

export async function adminDeleteUser(id) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Delete failed");
    }
    return true;
}