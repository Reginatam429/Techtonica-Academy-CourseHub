const API_BASE = import.meta.env.VITE_API_URL;

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
