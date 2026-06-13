import { useState, useEffect } from "react";
import { getSettings, updateSettings } from "../api";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getSettings()
      .then((d) => setSettings(d.settings))
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      await updateSettings(settings);
      setMsg("已保存 ✓");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg("保存失败: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="settings-wrap"><div className="memory-empty">加载中…</div></div>;

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="settings-wrap">
      <div className="card">
        <div style={{ fontSize: 15, color: "var(--textMid)", fontStyle: "italic", marginBottom: 14 }}>
          系统设置
        </div>

        <div className="form-group">
          <label>系统提示词</label>
          <textarea
            value={settings.system_prompt || ""}
            onChange={(e) => update("system_prompt", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Temperature ({settings.temperature})</label>
          <input
            type="range" min="0" max="2" step="0.1"
            value={settings.temperature || 0.7}
            onChange={(e) => update("temperature", parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div className="form-group">
          <label>最大上下文轮数</label>
          <input
            type="number" min="5" max="100"
            value={settings.max_context_rounds || 30}
            onChange={(e) => update("max_context_rounds", parseInt(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>压缩触发阈值 (tokens)</label>
          <input
            type="number" min="1000" max="50000" step="500"
            value={settings.compress_threshold || 6000}
            onChange={(e) => update("compress_threshold", parseInt(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>压缩后保留轮数</label>
          <input
            type="number" min="2" max="30"
            value={settings.compress_keep_rounds || 10}
            onChange={(e) => update("compress_keep_rounds", parseInt(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>最大回复 Token</label>
          <input
            type="number" min="256" max="32768" step="256"
            value={settings.max_reply_tokens || 4096}
            onChange={(e) => update("max_reply_tokens", parseInt(e.target.value))}
          />
        </div>

        {msg && (
          <div style={{
            textAlign: "center", fontSize: 13, color: msg.includes("失败") ? "var(--accentLight)" : "var(--accent)",
            marginBottom: 12
          }}>
            {msg}
          </div>
        )}

        <button className="btn-save" onClick={save} disabled={saving}>
          {saving ? "保存中…" : "保存设置"}
        </button>
      </div>
    </div>
  );
}
