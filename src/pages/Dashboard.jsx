import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const SECTIONS = [
  { name: "profile", label: "Profile", to: "/profile", kind: "singleton", hint: "Identity, bio, hero stats" },
  { name: "objectives", label: "Objectives", to: "/objectives", kind: "singleton", hint: "Career goals & values" },
  { name: "skills", label: "Skills", to: "/skills", kind: "singleton", hint: "Categories & competencies" },
  { name: "contact", label: "Contact", to: "/contact", kind: "singleton", hint: "Reach & availability" },
  { name: "experience", label: "Experience", to: "/experience", kind: "collection", hint: "Roles" },
  { name: "projects", label: "Projects", to: "/projects", kind: "collection", hint: "Portfolio work" },
  { name: "education", label: "Education", to: "/education", kind: "collection", hint: "Degrees" },
  { name: "testimonials", label: "Testimonials", to: "/testimonials", kind: "collection", hint: "Quotes" },
];

export default function Dashboard() {
  const nav = useNavigate();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const collections = SECTIONS.filter((s) => s.kind === "collection");
        const results = await Promise.all(
          collections.map((s) =>
            api.collection(s.name).list().then((items) => [s.name, Array.isArray(items) ? items.length : 0]).catch(() => [s.name, null])
          )
        );
        if (alive) setCounts(Object.fromEntries(results));
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div>
      <div className="page-intro">
        <span className="eyebrow">overview</span>
        <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>Welcome back</h2>
        <p>Edit any section below. Changes save straight to the database and go live on your site immediately — no commits, no redeploys.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stat-grid" style={{ marginBottom: 26 }}>
        {SECTIONS.filter((s) => s.kind === "collection").map((s) => (
          <button key={s.name} className="stat-card" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => nav(s.to)}>
            <div className="v">{loading ? "·" : counts[s.name] ?? "—"}</div>
            <div className="l">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head"><h3>All sections</h3><span className="eyebrow">{SECTIONS.length} total</span></div>
        <div className="col-list">
          {SECTIONS.map((s) => (
            <div key={s.name} className="col-item" onClick={() => nav(s.to)}>
              <div>
                <div className="ci-title">{s.label}</div>
                <div className="ci-sub">{s.hint}</div>
              </div>
              <span className="ci-tag">{s.kind === "collection" ? `${counts[s.name] ?? "—"} items` : "single"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
