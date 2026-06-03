import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, ToastProvider, useAuth } from "./lib/auth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Objectives from "./pages/Objectives";
import Skills from "./pages/Skills";
import Contact from "./pages/Contact";
import Experience from "./pages/Experience";
import Projects from "./pages/Projects";
import Education from "./pages/Education";
import Testimonials from "./pages/Testimonials";
import Posts from "./pages/Posts";
import Analytics from "./pages/Analytics";

function Protected({ children }) {
  const { isAuthed, checking } = useAuth();
  if (checking) return <div className="loading" style={{ padding: 48 }}>Checking session…</div>;
  if (!isAuthed) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function LoginRoute() {
  const { isAuthed, checking } = useAuth();
  if (checking) return <div className="loading" style={{ padding: 48 }}>Checking session…</div>;
  if (isAuthed) return <Navigate to="/" replace />;
  return <Login />;
}

const page = (el) => <Protected>{el}</Protected>;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/" element={page(<Dashboard />)} />
            <Route path="/profile" element={page(<Profile />)} />
            <Route path="/objectives" element={page(<Objectives />)} />
            <Route path="/skills" element={page(<Skills />)} />
            <Route path="/contact" element={page(<Contact />)} />
            <Route path="/experience" element={page(<Experience />)} />
            <Route path="/projects" element={page(<Projects />)} />
            <Route path="/education" element={page(<Education />)} />
            <Route path="/testimonials" element={page(<Testimonials />)} />
            <Route path="/posts" element={page(<Posts />)} />
            <Route path="/analytics" element={page(<Analytics />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
