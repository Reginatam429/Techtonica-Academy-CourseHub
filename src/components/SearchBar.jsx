import { useState } from "react";

export default function SearchBar({ onSearch, placeholder = "Search courses..." }) {
    const [q, setQ] = useState("");
    return (
        <div className="row gap-sm">
        <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
        />
        <button className="btn" onClick={() => onSearch(q)}>Search</button>
        <button className="btn ghost" onClick={() => { setQ(""); onSearch(""); }}>All</button>
        </div>
    );
}