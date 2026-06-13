import { useState, useEffect } from "react";
import Chat from "./pages/Chat";
import Home from "./pages/Home";
import Memories from "./pages/Memories";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import PawPrints from "./components/PawPrints";
import "./App.css";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:10000";

export { API_BASE };

export default function App() {
  const [page, setPage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [model, setModel] = useState(
    () => localStorage.getItem("bunny-model") || "deepseek-chat"
  );

  useEffect(() => {
    localStorage.setItem("bunny-model", model);
  }, [model]);

  const PAGES = {
    home: { label: "首页" },
    chat: { label: "聊天" },
    memories: { label: "回忆" },
    settings: { label: "设置" },
  };

  const switchPage = (p) => {
    setPage(p);
    setSidebarOpen(false);
  };

  return (
    <div className="app">
      <PawPrints />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSession={activeSession}
        onSessionSelect={(s) => {
          setActiveSession(s);
          switchPage("chat");
        }}
        model={model}
        onModelChange={setModel}
        onHome={() => switchPage("home")}
      />

      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="main">
        {/* Top bar */}
        <div className="top-bar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <div className="session-title">{PAGES[page]?.label}</div>
          <div className="top-paws">
            <PawPrints sm />
          </div>
        </div>

        {/* Pages */}
        <div className="page-content">
          {page === "home" && <Home onEnter={() => switchPage("chat")} />}
          {page === "chat" && (
            <Chat
              session={activeSession}
              model={model}
              onSessionChange={setActiveSession}
            />
          )}
          {page === "memories" && <Memories />}
          {page === "settings" && <Settings />}
        </div>

        {/* Bottom nav */}
        <div className="bottom-nav">
          {Object.entries(PAGES).map(([key, { label }]) => (
            <button
              key={key}
              className={`nav-btn ${page === key ? "active" : ""}`}
              onClick={() => switchPage(key)}
            >
              <span className="nav-icon">
                {key === "home" ? "🏠" : key === "chat" ? "💬" : key === "memories" ? "💎" : "⚙️"}
              </span>
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
