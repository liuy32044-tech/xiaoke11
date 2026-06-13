import { useState, useEffect } from "react";
import { getMemories, deleteMemory } from "../api";

export default function Memories() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const d = await getMemories();
      setMemories(d.memories || []);
    } catch (e) {
      console.warn("[memories]", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="memories-wrap">
      <div className="card">
        <div style={{ fontSize: 15, color: "var(--textMid)", fontStyle: "italic", marginBottom: 4 }}>
          记忆存档
        </div>
        <div style={{ fontSize: 11, color: "var(--textFaint)" }}>
          对话中自动生成的记忆摘要
        </div>
      </div>

      {loading && (
        <div className="memory-empty">加载中…</div>
      )}

      {!loading && memories.length === 0 && (
        <div className="card memory-empty">
          记忆会在对话中慢慢积累 🐾
        </div>
      )}

      {memories.map((m) => (
        <div className="card" key={m.id}>
          <div className="memory-item">
            <div className="summary">{m.summary}</div>
            <div className="date">
              {m.created_at ? new Date(m.created_at).toLocaleString("zh-CN") : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
