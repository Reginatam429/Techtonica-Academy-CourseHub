const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function api(path, { method = "GET", body, token } = {}) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
        const msg = data?.error || `HTTP ${res.status}`;
        throw new Error(msg);
    }
    return data;
}
