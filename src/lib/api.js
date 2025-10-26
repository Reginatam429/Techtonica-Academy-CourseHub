const API_BASE = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export async function api(path, { method = "GET", body, token } = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    // parse JSON
    let data;
    try { data = await res.json(); } catch { data = null; }

    if (!res.ok) {
        const msg = data?.error || data?.message || `Request failed: ${res.status}`;
        throw new Error(msg);
    }
    return data;
}

export async function listCourses(query = "") {
    const url = new URL(`${API_BASE}/courses`);
    if (query) url.searchParams.set("query", query);
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load courses");
    return res.json();
}

export async function myEnrollments() {
    const res = await fetch(`${API_BASE}/enrollments/me`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load enrollments");
    return res.json();
}

export async function enrollInCourse(courseId) {
    const res = await fetch(`${API_BASE}/enrollments`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ courseId }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Enroll failed");
    return res.json();
}

export async function unenrollByEnrollmentId(enrollmentId) {
    const res = await fetch(`${API_BASE}/enrollments/${enrollmentId}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Unenroll failed");
    return true;
}

export async function myGrades() {
    const res = await fetch(`${API_BASE}/grades/me`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load grades");
    return res.json();
}

export async function myGPA() {
    const res = await fetch(`${API_BASE}/grades/me/gpa`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load GPA");
    return res.json(); // { gpa: number }
}
