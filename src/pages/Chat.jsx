import { useState, useEffect, useRef } from "react";
import CatAvatar from "../components/CatAvatar";
import { getMessages, streamChat, createSession } from "../api";

export default function Chat({ session, model, onSessionChange }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize session if none selected
  useEffect(() => {
    if (!session) {
      createSession("新对话")
        .then((s) => onSessionChange(s))
        .catch(() => {});
    }
  }, []);

  // Load messages when session changes
  useEffect(() => {
    if (!session?.id) return;
    setMessages([]);
    setError(null);
    getMessages(session.id)
      .then((d) => setMessages(d.messages || []))
      .catch(() => {});
  }, [session?.id]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Focus input when session changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [session?.id]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming || !session?.id) return;

    setInput("");
    setError(null);

    // Add user message locally
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);

    // Add placeholder for AI reply
    const aiPlaceholder = {
      id: Date.now() + 1,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      _streaming: true,
    };
    setMessages((prev) => [...prev, aiPlaceholder]);

    try {
      const resp = await streamChat({
        session_id: session.id,
        message: text,
        model,
      });

      if (!resp.ok) {
        throw new Error(`API error: ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "text") {
              fullText += data.text;
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last._streaming) {
                  last.content = fullText;
                }
                return [...updated];
              });
            } else if (data.type === "error") {
              setError(data.text);
            }
          } catch {}
        }
      }

      // Mark streaming complete
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last._streaming) {
          delete last._streaming;
        }
        return [...updated];
      });
    } catch (e) {
      setError(e.message);
      setMessages((prev) => prev.filter((m) => m.id !== aiPlaceholder.id));
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const fmtTime = (t) => {
    if (!t) return "";
    const d = new Date(t);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="chat-wrap">
      <div className="chat-scroll" ref={scrollRef}>
        <div className="date-divider"><span>今天</span></div>

        {messages.length === 0 && !streaming && (
          <div style={{ textAlign: "center", color: "var(--textFaint)", marginTop: 36, fontSize: 13 }}>
            我是小克。有什么想和我说的吗？
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`msg-row ${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="msg-assistant-row">
                <CatAvatar size={34} />
                <div className="msg-bubble">
                  {msg.content || (
                    <span style={{ color: "var(--textFaint)", fontStyle: "italic" }}>
                      正在思考…
                    </span>
                  )}
                </div>
              </div>
            )}
            {msg.role === "user" && (
              <div className="msg-bubble">{msg.content}</div>
            )}
            <div className="msg-time">{fmtTime(msg.created_at)}</div>
          </div>
        ))}

        {/* Typing indicator */}
        {streaming && (
          <div className="typing-indicator">
            <CatAvatar size={34} />
            <div className="typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", color: "var(--accentLight)", fontSize: 12, padding: 12 }}>
            出错了：{error}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-row">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="说点什么…"
            rows={1}
          />
          <button
            className={`send-btn ${input.trim() && !streaming ? "on" : "off"}`}
            onClick={send}
            disabled={streaming}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8L14 2L8 14L7 9L2 8Z" />
            </svg>
          </button>
        </div>
        <div className="hint">🐾 按 Enter 发送</div>
      </div>
    </div>
  );
}
