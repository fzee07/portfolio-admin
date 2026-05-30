import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

const NAV = [
  {
    group: "Content",
    items: [
      { to: "/", label: "Overview", end: true },
      { to: "/profile", label: "Profile" },
      { to: "/objectives", label: "Objectives" },
      { to: "/skills", label: "Skills" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    group: "Collections",
    items: [
      { to: "/experience", label: "Experience" },
      { to: "/projects", label: "Projects" },
      { to: "/education", label: "Education" },
      { to: "/testimonials", label: "Testimonials" },
    ],
  },
];

const TITLES = {
  "/": "Overview",
  "/profile": "Profile",
  "/objectives": "Objectives",
  "/skills": "Skills",
  "/contact": "Contact",
  "/experience": "Experience",
  "/projects": "Projects",
  "/education": "Education",
  "/testimonials": "Testimonials",
};

export default function Layout({ children }) {
  const { username, logout } = useAuth();
  const { pathname } = useLocation();
  const title = TITLES[pathname] || "Admin";

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="dot" />
          <b>Portfolio</b>
          <div className="eyebrow" style={{ marginTop: 4 }}>Control Panel</div>
        </div>
        <nav className="nav">
          {NAV.map((g) => (
            <div key={g.group}>
              <div className="nav-group-label">{g.group}</div>
              {g.items.map((it) => (
                <NavLink key={it.to} to={it.to} end={it.end}
                  className={({ isActive }) => (isActive ? "active" : "")}>
                  <span>{it.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span className="who">{username}</span>
          <button className="btn ghost sm" onClick={logout}>Sign out</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <h2>{title}</h2>
          <span className="eyebrow">v3 · MongoDB</span>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
