import { useEffect, useState } from "react";
import { api } from "../lib/api";

const fmtMs = (ms) => {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
};

export default function Analytics() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    api.collection("posts").list()
      .then((rows) => { if (alive) setPosts(Array.isArray(rows) ? rows : []); })
      .catch((e) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const withA = posts.map((p) => {
    const a = p.analytics || {};
    return {
      ...p,
      _views: a.views || 0,
      _clicks: a.clicks || 0,
      _avg: a.readSessions ? a.readMsTotal / a.readSessions : 0,
      _max: a.maxReadMs || 0,
      _sessions: a.readSessions || 0,
    };
  });

  const totalViews = withA.reduce((s, p) => s + p._views, 0);
  const totalClicks = withA.reduce((s, p) => s + p._clicks, 0);
  const totalReads = withA.reduce((s, p) => s + p._sessions, 0);

  const mostViewed = [...withA].sort((a, b) => b._views - a._views).slice(0, 8);
  const longestRead = [...withA].filter((p) => p._avg > 0).sort((a, b) => b._avg - a._avg).slice(0, 8);
  const mostClicked = [...withA].filter((p) => p.kind === "external").sort((a, b) => b._clicks - a._clicks).slice(0, 8);

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
