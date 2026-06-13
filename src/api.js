const API_BASE = "https://xiaoke22.vercel.app";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function listSessions() {
  return request("/api/sessions");
}

export async function createSession(name) {
  return request("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function renameSession(id, name) {
  return request(`/api/sessions/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export async function deleteSession(id) {
  return request(`/api/sessions/${id}`, { method: "DELETE" });
}

export async function getMessages(sessionId) {
  return request(`/api/messages/${sessionId}`);
}

export async function getSettings() {
  return request("/api/settings");
}

export async function updateSettings(settings) {
  return request("/api/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

export async function getMemories() {
  return request("/api/memories");
}

export async function deleteMemory(id) {
  return request(`/api/memories/${id}`, { method: "DELETE" });
}

// SSE streaming chat — returns a ReadableStream reader
export function streamChat({ session_id, message, model }) {
  const base = API_BASE;
  return fetch(`${base}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id, message, model }),
  });
}
