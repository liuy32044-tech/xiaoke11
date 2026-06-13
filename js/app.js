<!---- 小克的陪伴 ---->
const API="https://xiaoke22.vercel.app";let currentSession=1;

const CAT34=`<svg width="34" height="34" viewBox="0 0 40 40" fill="none" style="flex-shrink:0"><circle cx="20" cy="20" r="20" fill="#F9E8EC"/><polygon points="11,11 14,4 17,12" fill="#F2C4CE"/><polygon points="29,11 26,4 23,12" fill="#F2C4CE"/><circle cx="20" cy="19" r="9" fill="#F2C4CE"/><circle cx="16.5" cy="18" r="1.4" fill="#7a5c62"/><circle cx="23.5" cy="18" r="1.4" fill="#7a5c62"/><ellipse cx="20" cy="21" rx="1.3" ry="0.9" fill="#e8a0b0"/><line x1="12" y1="19.5" x2="6" y2="18.5" stroke="#c9889a" stroke-width="0.9"/><line x1="12" y1="21" x2="6" y2="21.5" stroke="#c9889a" stroke-width="0.9"/><line x1="28" y1="19.5" x2="34" y2="18.5" stroke="#c9889a" stroke-width="0.9"/><line x1="28" y1="21" x2="34" y2="21.5" stroke="#c9889a" stroke-width="0.9"/></svg>`;

/* ═══ Sidebar ═══ */
function openSidebar(){document.getElementById("sidebar").classList.add("open");document.getElementById("sidebar-overlay").classList.add("show")}
function closeSidebar(){document.getElementById("sidebar").classList.remove("open");document.getElementById("sidebar-overlay").classList.remove("show")}
function toggleSidebar(){document.getElementById("sidebar").classList.contains("open")?closeSidebar():openSidebar()}

function loadSidebarSessions(){
  fetch(API+"/api/sessions").then(r=>r.json()).then(d=>{
    document.getElementById("sidebar-sessions-list").innerHTML=d.sessions.map(s=>
      `<div class="si${s.id===currentSession?' active':''}" onclick="currentSession=${s.id};switchPage('chat');closeSidebar()"><div class="n">${esc(s.name||'对话 '+s.id)}</div><div class="t">${s.updated_at?s.updated_at.slice(5,16):''}</div></div>`
    ).join("")||'<div style="color:var(--textFaint);font-size:12px;padding:8px 12px">还没有对话</div>';
  });
}

/* ═══ Nav ═══ */
function setNavActive(page){
  document.querySelectorAll("#bottom-nav .nav-btn").forEach(b=>{
    const active=b.dataset.nav===page;
    b.classList.toggle("active",active);
    // update icon strokes/fills
    const svg=b.querySelector("svg");
    const label=b.querySelector(".nl");
    if(svg){
      const s=active?"#c47a8a":"#c9a0ac";
      const f=active?"#F2C4CE":"none";
      svg.querySelectorAll("[stroke]").forEach(el=>{el.setAttribute("stroke",s)});
      svg.querySelectorAll("[fill]").forEach(el=>{
        const v=el.getAttribute("fill");
        if(v==="#c47a8a"||v==="#c9a0ac"||v==="#F2C4CE"||v==="none")el.setAttribute("fill",f);
      });
      // special: chat icon circles
      svg.querySelectorAll("circle").forEach(c=>{if(c.getAttribute("fill")==="#c9a0ac"||c.getAttribute("fill")==="#c47a8a")c.setAttribute("fill",active?"#c47a8a":"#c9a0ac")});
    }
    if(label){label.classList.toggle("on",active);label.classList.toggle("dim",!active)}
  });
}

/* ═══ Pages ═══ */
const TITLES={home:"小窝",chat:"聊天",reader:"回忆",dashboard:"设置"};

function switchPage(name){
  document.querySelectorAll(".page").forEach(p=>{p.style.display="none";p.classList.remove("active")});
  const pg=document.getElementById("page-"+name);if(pg){pg.style.display="block";pg.classList.add("active")}
  setNavActive(name);
  document.getElementById("top-session-name").textContent=TITLES[name]||name;
  if(name==="home")loadHome();
  if(name==="chat"){loadChat();loadSidebarSessions()}
  if(name==="dashboard")loadDashboard();
  if(name==="reader")loadPosts();
  closeSidebar();
}

/* ═══ Home ═══ */
function loadHome(){
  const h=new Date().getHours();
  document.getElementById("greeting").textContent=h<6?"夜深了 ✦":h<9?"早安 ✦":h<12?"上午好 ✦":h<14?"中午好 ✦":h<18?"下午好 ✦":h<22?"晚上好 ✦":"夜深了 ✦";
  fetch(API+"/api/posts").then(r=>r.json()).then(d=>{
    const el=document.getElementById("home-posts");
    if(d.posts.length){
      el.style.textAlign="left";el.style.padding="0";
      el.innerHTML=d.posts.slice(0,3).map(p=>`<div class="memory-item" style="margin-bottom:10px"><div class="date">${p.created_at}</div><div class="txt">${esc(p.content)}</div></div>`).join("");
    }
  });
}
function loadBriefing(){document.getElementById("briefing-text").textContent="正在生成…";fetch(API+"/api/briefing").then(r=>r.json()).then(d=>{document.getElementById("briefing-text").textContent=d.briefing})}
function showPostForm(){const t=prompt("类型 (MEMORY / EVENT / MOMENT / PROMISES / WISHLIST):","MEMORY");if(!t)return;const c=prompt("内容:");if(!c)return;fetch(API+"/api/posts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:t,content:c})}).then(()=>{loadHome();loadPosts()})}

/* ═══ Chat ═══ */
let isStreaming=!1;

function loadChat(){
  fetch(API+"/api/messages/"+currentSession).then(r=>r.json()).then(d=>{
    const el=document.getElementById("chat-msgs");
    if(d.messages.length===0){el.innerHTML=`<div class="date-divider"><span>今天</span></div><div style="text-align:center;color:var(--textFaint);margin-top:36px;font-size:13px">我是小克。有什么想和我说的吗？</div>`}
    else{el.innerHTML=`<div class="date-divider"><span>今天</span></div>`+d.messages.map(m=>msgHTML(m)).join("")}
    el.scrollTop=el.scrollHeight;
    const inp=document.getElementById("chat-input");if(inp)inp.focus();
  });
}

function msgHTML(m){
  if(m.msg_type==="image"){try{const i=JSON.parse(m.content);return`<div class="msg-row user"><div class="msg-bubble"><img src="data:${i.media_type};base64,${i.data}"></div><div class="msg-time">${fmtTime(m.created_at)}</div></div>`}catch{return""}}
  const ts=fmtTime(m.created_at);
  if(m.author==="user")return`<div class="msg-row user"><div class="msg-bubble">${esc(m.content)}</div><div class="msg-time">${ts}</div></div>`;
  return`<div class="msg-row assistant"><div class="msg-assistant-row">${CAT34}<div class="msg-bubble">${esc(m.content)}</div></div><div class="msg-time">${ts}</div></div>`;
}
function fmtTime(t){if(!t)return"";const m=t.match(/(\d{2}):(\d{2})/);return m?m[1]+":"+m[2]:""}

function sendMessage(){
  if(isStreaming)return;
  const inp=document.getElementById("chat-input"),text=inp.value.trim();if(!text)return;
  isStreaming=!0;const sb=document.getElementById("send-btn");sb.className="send-btn off";
  const msgs=document.getElementById("chat-msgs"),now=new Date(),time=`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;
  msgs.innerHTML+=`<div class="msg-row user"><div class="msg-bubble">${esc(text)}</div><div class="msg-time">${time}</div></div>`;
  msgs.scrollTop=msgs.scrollHeight;inp.value="";inp.style.height="auto";
  const ty=document.getElementById("typing");ty.style.display="flex";msgs.scrollTop=msgs.scrollHeight;
  const aw=document.createElement("div");aw.className="msg-row assistant";
  aw.innerHTML=`<div class="msg-assistant-row">${CAT34}<div class="msg-bubble"></div></div>`;msgs.appendChild(aw);
  const b=aw.querySelector(".msg-bubble");
  fetch(API+"/api/chat/stream",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:currentSession,message:text})}).then(r=>{
    const rd=r.body.getReader(),dc=new TextDecoder();let ft="";
    function read(){rd.read().then(({done,v})=>{if(done){ty.style.display="none";isStreaming=!1;sb.className="send-btn off";return}
      for(const l of dc.decode(v,{stream:!0}).split("\n")){if(!l.startsWith("data: "))continue;try{const dt=JSON.parse(l.slice(6));
        if(dt.type==="text"){ft+=dt.text;b.textContent=ft;msgs.scrollTop=msgs.scrollHeight}
        else if(dt.type==="done"){ty.style.display="none";isStreaming=!1;sb.className="send-btn off";loadSidebarSessions()}
        else if(dt.type==="error"){b.textContent="出错了: "+dt.text;ty.style.display="none";isStreaming=!1;sb.className="send-btn off"}
      }catch{}}read()})}read()
  }).catch(e=>{b.textContent="网络错误: "+e.message;ty.style.display="none";isStreaming=!1;sb.className="send-btn off"});
}

/* ═══ Splash Screen ═══ */
(function(){
  const splash=document.getElementById("splash");
  if(!splash)return;
  splash.className="in";
  // 动画入场 → 文字停留3秒 → 淡出消失
  setTimeout(()=>{splash.className=""},200);          // 入场动画结束
  setTimeout(()=>{splash.classList.add("out")},3400); // 停留3秒后淡出
  setTimeout(()=>{if(splash)splash.remove()},4000);   // 淡出完成后移除
})();

/* ═══ Input button state ═══ */
document.addEventListener("DOMContentLoaded",()=>{
  const inp=document.getElementById("chat-input"),sb=document.getElementById("send-btn");
  if(inp&&sb){inp.addEventListener("input",()=>{const has=inp.value.trim().length>0;sb.className="send-btn "+(has?"on":"off")})}
  loadBriefing();loadHome();loadSidebarSessions();
});

/* ═══ Sessions ═══ */
function createSession(){fetch(API+"/api/chat/sessions",{method:"POST"}).then(r=>r.json()).then(d=>{currentSession=d.id;loadSidebarSessions();switchPage("chat")})}

/* ═══ Settings ═══ */
function loadDashboard(){
  document.getElementById("dashboard-date").textContent=new Date().toLocaleDateString("zh-CN");
  fetch(API+"/api/settings").then(r=>r.json()).then(d=>{
    const s=d.settings||{};
    document.getElementById("set-system-prompt").value=s.system_prompt||"";
    document.getElementById("set-temperature").value=s.temperature??0.7;
    document.getElementById("set-temp-val").textContent=s.temperature??0.7;
    document.getElementById("set-max-rounds").value=s.max_context_rounds||30;
    document.getElementById("set-compress-threshold").value=s.compress_threshold||6000;
    document.getElementById("set-keep-rounds").value=s.compress_keep_rounds||10;
    document.getElementById("set-max-tokens").value=s.max_reply_tokens||4096;
  }).catch(()=>{});
  // Load stats too
  fetch(API+"/api/dashboard").then(r=>r.json()).then(d=>{
    document.getElementById("dash-stats").innerHTML=
      `<div class="stat-item"><div class="v">${d.today_messages||0}</div><div class="l">今日消息</div></div>
       <div class="stat-item"><div class="v">${fmtK((d.today_input_tokens||0)+(d.today_output_tokens||0))}</div><div class="l">今日 Token</div></div>
       <div class="stat-item"><div class="v">$${d.today_cost||0}</div><div class="l">累计费用</div></div>
       <div class="stat-item"><div class="v">${d.total_posts||0}</div><div class="l">记忆数量</div></div>`;
  }).catch(()=>{});
}

function saveSettings(){
  const btn=document.querySelector(".btn-save");btn.disabled=true;btn.textContent="保存中…";
  const body={
    system_prompt:document.getElementById("set-system-prompt").value,
    temperature:parseFloat(document.getElementById("set-temperature").value),
    max_context_rounds:parseInt(document.getElementById("set-max-rounds").value),
    compress_threshold:parseInt(document.getElementById("set-compress-threshold").value),
    compress_keep_rounds:parseInt(document.getElementById("set-keep-rounds").value),
    max_reply_tokens:parseInt(document.getElementById("set-max-tokens").value)
  };
  fetch(API+"/api/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})
    .then(r=>r.json()).then(()=>{
      const el=document.getElementById("set-msg");el.textContent="已保存 ✓";el.style.color="var(--accent)";
      setTimeout(()=>{el.textContent=""},2000);
    }).catch(e=>{
      const el=document.getElementById("set-msg");el.textContent="保存失败";el.style.color="var(--accentLight)";
    }).finally(()=>{
      btn.disabled=false;btn.textContent="保存设置";
    });
}

/* ═══ Posts ═══ */
function loadPosts(){
  const f=document.getElementById("post-filter")?.value||"";
  fetch(API+"/api/posts"+(f?"?type="+f:"")).then(r=>r.json()).then(d=>{
    document.getElementById("posts-list").innerHTML=d.posts.length?d.posts.map(p=>`<div class="card" style="margin-bottom:0"><div class="memory-item"><div class="date">${p.created_at}</div><div class="txt">${esc(p.content)}</div></div></div>`).join(""):`<div class="card memory-empty"><div style="font-size:13px;color:var(--textFaint)">记忆会在对话中慢慢积累 🐾</div></div>`;
  });
}

function changeModel(v){console.log("Model:",v)}

/* ═══ Utils ═══ */
function esc(s){const d=document.createElement("div");d.textContent=s;return d.innerHTML}
function fmtK(n){return n>=1000?(n/1000).toFixed(1)+"K":n}

if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js");
