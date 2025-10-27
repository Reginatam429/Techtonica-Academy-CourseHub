const RAW_BASE =
    import.meta.env.DEV ? "/api" : (import.meta.env.VITE_API_URL || "");
const API_BASE = RAW_BASE.replace(/\/$/, "");

function makeHeaders(extra = {}) {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    };
}

export async function api(path, { method = "GET", body, headers } = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: makeHeaders(headers),
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
    });

    let data = null;
    try { data = await res.json(); } catch { /* no body */ }

    if (!res.ok) {
        const msg = data?.error || data?.message || `Request failed: ${res.status}`;
        throw new Error(msg);
    }
    return data;
}

// Feature helpers 
export const listCourses = (query = "") => {
    const q = query ? `?query=${encodeURIComponent(query)}` : "";
    const suffix = q ? "&" : "?";
    return api(`/courses${q}${suffix}t=${Date.now()}`);
};

export const myEnrollments = () => api("/enrollments/me");

export const enrollInCourse = (courseId) =>
    api("/enrollments", { method: "POST", body: { courseId } });

export const unenrollByEnrollmentId = (enrollmentId) =>
    api(`/enrollments/${enrollmentId}`, { method: "DELETE" }).then(() => true);

export const myGrades = () => api("/grades/me");

export const myGPA = () => api("/grades/me/gpa");