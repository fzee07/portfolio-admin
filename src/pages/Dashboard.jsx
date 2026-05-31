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

const MB = 1024 * 1024;
const toMB = (bytes) => (bytes / MB).toFixed(bytes < 10 * MB ? 1 : 0);

export default function Dashboard() {
  const nav = useNavigate();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storage, setStorage] = useState(null);
  const [storageErr, setStorageErr] = useState(null);

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

  useEffect(() => {
    let alive = true;
    api.stats()
      .then((s) => { if (alive) setStorage(s); })
      .catch((e) => { if (alive) setStorageErr(e.message); });
    return () => { alive = false; };
  }, []);

  // Storage usage — MongoDB Atlas M0 free tier = 512MB on-disk (data + indexes).
  const used = storage?.used ?? 0;
  const limit = storage?.limit ?? 512 * MB;
  const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
  const barColor = pct < 75 ? "#16a34a" : pct < 90 ? "#d97706" : "#dc2626";

  return (
    <div>
      <div className="page-intro">
        <span className="eyebrow">overview</span>
        <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>Welcome back</h2>
        <p>Edit any section below. Changes save straight to the database and go live on your site immediately — no commits, no redeploys.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Database storage — live MongoDB usage against the 512MB free tier */}
      <div className="panel storage-panel">
        <div className="panel-head">
          <h3>Database storage</h3>
          <span className="eyebrow">MongoDB · free tier</span>
        </div>
        <div className="panel-body">
          {storageErr ? (
            <div className="storage-err">Couldn’t read storage stats — {storageErr}</div>
          ) : (
            <>
              <div className="storage-row">
                <div className="storage-amount">
                  <span className="num">{storage ? toMB(used) : "—"}</span>
                  <span className="unit">MB</span>
                  <span className="of">of {toMB(limit)} MB used</span>
                </div>
                <div className="storage-pct" style={{ color: barColor }}>
                  {storage ? `${pct.toFixed(1)}%` : ""}
                </div>
              </div>
              <div className="storage-bar">
                <div
                  className="storage-fill"
                  style={{ width: `${storage ? Math.max(pct, 1.5) : 0}%`, background: barColor }}
                />
              </div>
              <div className="storage-foot">
                <span>
                  {storage ? `${(storage.objects || 0).toLocaleString()} documents · ${storage.collections || 0} collections` : "Reading…"}
                </span>
                <span>{storage ? `${toMB(Math.max(limit - used, 0))} MB free` : ""}</span>
              </div>
            </>
          )}
        </div>
      </div>

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
