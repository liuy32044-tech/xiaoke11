import { useState, useEffect } from "react";
import CatAvatar from "./CatAvatar";
import { listSessions, createSession } from "../api";

export default function Sidebar({
  open, onClose, activeSession, onSessionSelect,
  model, onModelChange, onHome,
}) {
  const [sessions, setSessions] = useState([]);

  const load = async () => {
    try {
      const data = await listSessions();
      setSessions(data.sessions || []);
    } catch (e) {
      console.warn("[sidebar]", e.message);
    }
  };

  useEffect(() => { load(); }, [open]);

  const handleCreate = async () => {
    try {
      const s = await createSession("新对话");
      setSessions((prev) => [s, ...prev]);
      onSessionSelect(s);
    } catch (e) {
      console.warn("[sidebar]", e.message);
    }
  };

  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-header" onClick={onHome} style={{ cursor: "pointer" }}>
        <CatAvatar />
        <div>
          <div className="t">小窝</div>
          <div className="s">· 在线 ·</div>
        </div>
      </div>

      <div className="sidebar-body">
        <div className="sidebar-label">对话</div>
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`si ${activeSession?.id === s.id ? "active" : ""}`}
            onClick={() => onSessionSelect(s)}
          >
            <div className="n">{s.name || "新对话"}</div>
            <div className="t">
              {s.updated_at ? new Date(s.updated_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : ""}
            </div>
          </div>
        ))}
        <div className="sidebar-new" onClick={handleCreate}>
          + 新对话
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-label">模型</div>
        <select value={model} onChange={(e) => onModelChange(e.target.value)}>
          <option value="deepseek-chat">DeepSeek Chat</option>
          <option value="deepseek-reasoner">DeepSeek Reasoner</option>
        </select>
      </div>
    </div>
  );
}
