import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import NavBar from "../components/NavBar";
import {
    adminListUsers,
    adminCreateUser,
    adminUpdateUser,
    adminDeleteUser,
} from "../lib/api";

const ROLES = ["ADMIN", "TEACHER", "STUDENT"];

function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
            <strong>{title}</strong>
            <button className="btn ghost" onClick={onClose}>Close</button>
            </div>
            <div className="modal-body">{children}</div>
        </div>
        </div>
    );
}

function field(v) {
    return v ?? "—";
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const firstName = (user?.name || "Admin").split(" ")[0];

    // Listing/search
    const [users, setUsers] = useState([]);
    const [q, setQ] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // Edit modal
    const [editOpen, setEditOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [saving, setSaving] = useState(false);

    // create modal
    const [setCreateOpen] = useState(false);
    const [createRole, setCreateRole] = useState("STUDENT");
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        studentId: "",
        major: "",
    });

    async function load() {
        setLoading(true);
        setErr("");
        try {
        const list = await adminListUsers(q.trim());
        setUsers(list);
        } catch (e) {
        setErr(e.message || "Failed to load users");
        } finally {
        setLoading(false);
        }
    }

    useEffect(() => { load(); }, []); // initial

    // simple search debounce
    useEffect(() => {
        const t = setTimeout(load, 350);
        return () => clearTimeout(t);
    }, [q]);

    const filtered = useMemo(() => {
        if (roleFilter === "ALL") return users;
        return users.filter(u => u.role === roleFilter);
    }, [users, roleFilter]);

    function onEdit(u) {
        setEditUser({
        id: u.id,
        role: u.role,
        name: u.name,
        email: u.email,
        studentId: u.studentId || "",
        major: u.major || "",
        password: "", // optional
        });
        setEditOpen(true);
    }

    async function saveEdit() {
        setSaving(true);
        try {
        const payload = {
            role: editUser.role,
            name: editUser.name,
            email: editUser.email,
        };
        if (editUser.role === "STUDENT") {
            payload.studentId = editUser.studentId || null;
            payload.major = editUser.major || null;
        }
        if (editUser.password) payload.password = editUser.password;

        await adminUpdateUser(editUser.id, payload);
        setEditOpen(false);
        await load();
        } catch (e) {
        alert(e.message || "Update failed");
        } finally {
        setSaving(false);
        }
    }

    async function removeUser(id) {
        if (!confirm("Delete this user? This cannot be undone.")) return;
        try {
        await adminDeleteUser(id);
        await load();
        } catch (e) {
        alert(e.message || "Delete failed");
        }
    }

    function resetCreate() {
        setCreateRole("STUDENT");
        setForm({ name: "", email: "", password: "", studentId: "", major: "" });
    }

    async function submitCreate(e) {
        e.preventDefault();
        try {
        const payload = {
            role: createRole,
            name: form.name,
            email: form.email,
            password: form.password,
        };
        if (createRole === "STUDENT") {
            payload.studentId = form.studentId || null;
            payload.major = form.major || null;
        }
        await adminCreateUser(payload);
        resetCreate();
        setCreateOpen(false);
        await load();
        } catch (e) {
        alert(e.message || "Create failed");
        }
    }

    return (
        <>
        <NavBar />
        <div className="container">
            {/* Welcome */}
            <section className="welcome">
            <div className="welcome__text">
                <h1 className="welcome__title">Welcome back, {firstName} 👋</h1>
                <p className="welcome__subtitle">
                Manage users (admins, teachers, students). Search, edit, or delete; create new accounts below.
                </p>
            </div>
            </section>

            {err && <div className="error">{err}</div>}

            {/* Users table */}
            <div className="card">
            <div className="row between center" style={{ marginBottom: 12 }}>
                <div className="row gap">
                <select value={roleFilter} onChange={(e)=>setRoleFilter(e.target.value)}>
                    <option value="ALL">All roles</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <input
                    placeholder="Search name, email, studentId, major…"
                    value={q}
                    onChange={(e)=>setQ(e.target.value)}
                    style={{ width: 320 }}
                />
                </div>
                <div className="row gap">
                </div>
            </div>

            <div className="table-wrap" style={{ maxHeight: 420, overflow: "auto" }}>
                <table className="table">
                <thead>
                    <tr>
                    <th>ID</th>
                    <th>Role</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Student ID</th>
                    <th>Major</th>
                    <th>Created</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                    <tr><td colSpan={8} className="muted">Loading…</td></tr>
                    )}
                    {!loading && filtered.length === 0 && (
                    <tr><td colSpan={8} className="muted">No users</td></tr>
                    )}
                    {!loading && filtered.map(u => (
                    <tr key={u.id}>
                        <td>{u.id}</td>
                        <td><strong>{u.role}</strong></td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{field(u.studentId)}</td>
                        <td>{field(u.major)}</td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="row gap">
                        <button className="btn ghost" onClick={()=>onEdit(u)}>Edit</button>
                        <button className="btn danger" onClick={()=>removeUser(u.id)}>Delete</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>

            {/* Create new user */}
            <div className="card" style={{ marginTop: 20 }}>
            <div className="card-title">Create a new user</div>
            <br></br>
            <form className="col gap" onSubmit={submitCreate}>
            <div className="row wrap gap">
                <select value={createRole} onChange={(e)=>setCreateRole(e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <input placeholder="Full name" value={form.name} onChange={e=>setForm(f=>({ ...f, name: e.target.value }))} />
                <input placeholder="Email" type="email" value={form.email} onChange={e=>setForm(f=>({ ...f, email: e.target.value }))} />
                <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm(f=>({ ...f, password: e.target.value }))} />
                {createRole === "STUDENT" && (
                <>
                    <input placeholder="Student ID (optional)" value={form.studentId} onChange={e=>setForm(f=>({ ...f, studentId: e.target.value }))} />
                    <input placeholder="Major (optional)" value={form.major} onChange={e=>setForm(f=>({ ...f, major: e.target.value }))} />
                </>
                )}
            </div>
            <br></br>

    <div className="row right gap">
        <button type="button" className="btn ghost" onClick={resetCreate}>
        Clear
        </button>
        <button className="btn" type="submit">
        Create
        </button>
    </div>
    </form>
            </div>

            {/* Edit modal */}
            <Modal open={editOpen} onClose={()=>setEditOpen(false)} title={`Edit user #${editUser?.id ?? ""}`}>
            {editUser && (
                <div className="col gap">
                <label>Role</label>
                <select
                    value={editUser.role}
                    onChange={(e)=>setEditUser(u=>({ ...u, role: e.target.value }))}
                >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <label>Name</label>
                <input value={editUser.name} onChange={(e)=>setEditUser(u=>({ ...u, name: e.target.value }))} />

                <label>Email</label>
                <input type="email" value={editUser.email} onChange={(e)=>setEditUser(u=>({ ...u, email: e.target.value }))} />

                {editUser.role === "STUDENT" && (
                    <>
                    <label>Student ID</label>
                    <input value={editUser.studentId} onChange={(e)=>setEditUser(u=>({ ...u, studentId: e.target.value }))} />

                    <label>Major</label>
                    <input value={editUser.major} onChange={(e)=>setEditUser(u=>({ ...u, major: e.target.value }))} />
                    </>
                )}

                <label>New Password (optional)</label>
                <input type="password" placeholder="Leave blank to keep current password"
                        value={editUser.password} onChange={(e)=>setEditUser(u=>({ ...u, password: e.target.value }))} />

                <div className="row right gap" style={{ marginTop: 8 }}>
                    <button className="btn ghost" onClick={()=>setEditOpen(false)}>Cancel</button>
                    <button className="btn" disabled={saving} onClick={saveEdit}>
                    {saving ? "Saving…" : "Save changes"}
                    </button>
                </div>
                </div>
            )}
            </Modal>
        </div>
        </>
    );
}
