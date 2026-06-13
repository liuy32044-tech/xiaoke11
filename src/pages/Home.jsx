import CatAvatar from "../components/CatAvatar";

export default function Home({ onEnter }) {
  const h = new Date().getHours();
  const greet = h < 6 ? "夜深了 ✦" : h < 9 ? "早安 ✦" : h < 12 ? "上午好 ✦" : h < 14 ? "中午好 ✦" : h < 18 ? "下午好 ✦" : h < 22 ? "晚上好 ✦" : "夜深了 ✦";

  return (
    <div className="home-wrap">
      {/* Profile */}
      <div className="card home-profile">
        <CatAvatar size={48} />
        <div className="info">
          <div className="hi">{greet}</div>
          <div className="sub">我是小克。你的AI伴侣。</div>
        </div>
      </div>

      {/* Enter */}
      <div className="big-enter" onClick={onEnter}>
        <div className="enter-text">进入小窝</div>
        <div className="enter-sub">有什么想和我说的吗？</div>
      </div>

      {/* Feature grid */}
      <div className="feature-grid">
        <div className="card feature-card" onClick={onEnter}>
          <div className="icon">💬</div>
          <div className="lbl">聊天</div>
        </div>
        <div className="card feature-card">
          <div className="icon">💎</div>
          <div className="lbl">记忆</div>
        </div>
        <div className="card feature-card">
          <div className="icon">📊</div>
          <div className="lbl">数据</div>
        </div>
        <div className="card feature-card">
          <div className="icon">⚙️</div>
          <div className="lbl">设置</div>
        </div>
      </div>
    </div>
  );
}
