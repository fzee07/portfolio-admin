import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { longDate } from "../lib/format";

const fmtMs = (ms) => {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
};

const isFuture = (pa) => {
  if (!pa) return false;
  const m = String(pa).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(pa);
  return !isNaN(d.getTime()) && d.getTime() > Date.now();
};
const statusOf = (p) =>
  p.status !== "published" ? "draft" : isFuture(p.publishedAt) ? "scheduled" : "live";

/* Per-post table columns. `num` → right-aligned mono + numeric sort; `fmt`
   formats the displayed value (raw value still drives the sort). */
const COLUMNS = [
  { key: "title", label: "Title", get: (p) => p.title || "Untitled" },
  { key: "kind", label: "Kind", get: (p) => (p.kind === "article" ? "Article" : "Link") },
  { key: "_status", label: "Status", get: (p) => p._status },
  { key: "_views", label: "Views", num: true, get: (p) => p._views },
  { key: "_clicks", label: "Clicks", num: true, get: (p) => p._clicks },
  { key: "_avg", label: "Avg read", num: true, get: (p) => p._avg, fmt: fmtMs },
  { key: "_max", label: "Longest read", num: true, get: (p) => p._max, fmt: fmtMs },
  { key: "_sessions", label: "Read sessions", num: true, get: (p) => p._sessions },
  { key: "_last", label: "Last activity", get: (p) => p._last, fmt: longDate },
];

export default function Analytics() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState({ key: "_views", dir: "desc" });

  useEffect(() => {
    let alive = true;
    api.collection("posts").list()
      .then((rows) => { if (alive) setPosts(Array.isArray(rows) ? rows : []); })
      .catch((e) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const withA = useMemo(() => posts.map((p) => {
    const a = p.analytics || {};
    return {
      ...p,
      _status: statusOf(p),
      _views: a.views || 0,
      _clicks: a.clicks || 0,
      _avg: a.readSessions ? a.readMsTotal / a.readSessions : 0,
      _max: a.maxReadMs || 0,
      _sessions: a.readSessions || 0,
      _last: a.lastEventAt || "",
    };
  }), [posts]);

  const totalViews = withA.reduce((s, p) => s + p._views, 0);
  const totalClicks = withA.reduce((s, p) => s + p._clicks, 0);
  const totalReads = withA.reduce((s, p) => s + p._sessions, 0);

  const mostViewed = [...withA].sort((a, b) => b._views - a._views).slice(0, 8);
  const longestRead = [...withA].filter((p) => p._avg > 0).sort((a, b) => b._avg - a._avg).slice(0, 8);
  const mostClicked = [...withA].filter((p) => p.kind === "external").sort((a, b) => b._clicks - a._clicks).slice(0, 8);

  const sorted = useMemo(() => {
    const col = COLUMNS.find((c) => c.key === sort.key) || COLUMNS[3];
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...withA].sort((a, b) => {
      const av = col.get(a), bv = col.get(b);
      if (col.num) return (av - bv) * dir;
      const as = String(av).toLowerCase(), bs = String(bv).toLowerCase();
      return as < bs ? -dir : as > bs ? dir : 0;
    });
  }, [withA, sort]);

  const toggleSort = (key) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: COLUMNS.find((c) => c.key === key)?.num ? "desc" : "asc" }
    );

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div>
      <div className="page-intro">
        <span className="eyebrow">analytics</span>
        <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>Read engagement</h2>
        <p>How your Read content performs — views, link clicks, and how long people actually spend reading.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stat-grid" style={{ marginBottom: 22 }}>
        <div className="stat-card"><div className="v">{posts.length}</div><div className="l">Posts</div></div>
        <div className="stat-card"><div className="v">{totalViews}</div><div className="l">Total views</div></div>
        <div className="stat-card"><div className="v">{totalClicks}</div><div className="l">Link clicks</div></div>
        <div className="stat-card"><div className="v">{totalReads}</div><div className="l">Read sessions</div></div>
      </div>

      <Board title="Most viewed" rows={mostViewed} metric={(p) => `${p._views} views`} empty="No views yet." />
      <Board title="Longest average read" rows={longestRead} metric={(p) => `${fmtMs(p._avg)} avg · ${fmtMs(p._max)} max`} empty="No read sessions yet." />
      <Board title="Most clicked links" rows={mostClicked} metric={(p) => `${p._clicks} clicks`} empty="No external-link clicks yet." />

      <div className="panel">
        <div className="panel-head"><h3>All posts</h3><span className="eyebrow">{withA.length} total · click a header to sort</span></div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    className={`${c.num ? "ta-r" : ""}${sort.key === c.key ? " sorted" : ""}`}
                    onClick={() => toggleSort(c.key)}
                  >
                    {c.label}
                    <span className="th-arrow">{sort.key === c.key ? (sort.dir === "asc" ? "▲" : "▼") : ""}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={COLUMNS.length} className="empty" style={{ padding: "26px 0" }}>No posts yet.</td></tr>
              )}
              {sorted.map((p) => (
                <tr key={p.id}>
                  {COLUMNS.map((c) => {
                    const raw = c.get(p);
                    const shown = c.fmt ? c.fmt(raw) : raw;
                    return (
                      <td key={c.key} className={`${c.num ? "ta-r mono" : ""}${c.key === "title" ? " td-title" : ""}`}>
                        {shown === "" || shown == null ? "—" : shown}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Board({ title, rows, metric, empty }) {
  return (
    <div className="panel">
      <div className="panel-head"><h3>{title}</h3></div>
      <div className="col-list">
        {rows.length === 0 && <div className="empty">{empty}</div>}
        {rows.map((p) => (
          <div className="col-item" key={p.id} style={{ cursor: "default" }}>
            <div style={{ minWidth: 0 }}>
              <div className="ci-title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.title || "Untitled"}
              </div>
              <div className="ci-sub">{p.kind === "article" ? "Article" : "Link"} · {p.status}</div>
            </div>
            <span className="ci-tag">{metric(p)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
