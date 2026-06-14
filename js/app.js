<!---- 小克的陪伴 ---->
const API="https://xiaoke22.onrender.com";let currentSession=1;

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
const TITLES={home:"小克",chat:"聊天",reader:"回忆",dashboard:"设置"};

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
let lastLoadedSession=null;

function loadChat(force){
  // 流式进行中，绝不覆盖
  if(isStreaming)return;
  // session 没变且页面已有消息且没强制，不覆盖
  if(!force && currentSession===lastLoadedSession && document.getElementById("chat-msgs").children.length>2)return;
  lastLoadedSession=currentSession;
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
  let content=m.content||"";
  let stickerHtml="";
  // Extract [STICKER:url] markers before escaping
  content=content.replace(/\[STICKER:(.*?)\]/g,(_,url)=>{stickerHtml+=`<img src="${url}" class="sticker-in-msg" onerror="this.remove()">`;return""});
  if(m.role==="user"||m.author==="user")return`<div class="msg-row user"><div class="msg-bubble">${esc(content)}${stickerHtml}</div><div class="msg-time">${ts}</div></div>`;
  return`<div class="msg-row assistant"><div class="msg-assistant-row">${CAT34}<div class="msg-bubble">${esc(content)}${stickerHtml}</div></div><div class="msg-time">${ts}</div></div>`;
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
  aw.innerHTML=`<div class="msg-assistant-row">${CAT34}<div class="msg-bubble">...</div></div>`;msgs.appendChild(aw);
  const b=aw.querySelector(".msg-bubble");
  // 先试流式
  let gotResponse=false;
  fetch(API+"/api/chat/stream",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:currentSession,message:text})}).then(r=>{
    if(!r.ok||!r.body){throw new Error("no stream")}
    const rd=r.body.getReader(),dc=new TextDecoder();let ft="";
    function read(){rd.read().then(({done,v})=>{if(done){finish(ft);return}
      for(const l of dc.decode(v,{stream:!0}).split("\n")){if(!l.startsWith("data: "))continue;try{const dt=JSON.parse(l.slice(6));
        if(dt.type==="text"){ft+=dt.text;b.textContent=ft||"...";msgs.scrollTop=msgs.scrollHeight}
        else if(dt.type==="done"){finish(ft)}
        else if(dt.type==="error"){b.textContent="出错了: "+dt.text;finish("")}
      }catch{}}
    read()})}read()
  }).catch(()=>{finish("")});
  function finish(streamText){
    ty.style.display="none";isStreaming=!1;sb.className="send-btn off";loadSidebarSessions();
    // 等后端存好 → 从库刷完整消息列表
    setTimeout(()=>{lastLoadedSession=null;loadChat(true)},1000);
  }
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
function createSession(){fetch(API+"/api/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"新对话"})}).then(r=>r.json()).then(d=>{currentSession=d.id;lastLoadedSession=null;loadSidebarSessions();switchPage("chat")})}

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
  loadManageStickers();
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

/* ═══ Stickers ═══ */
let _allStickers=[];

function loadManageStickers(){
  fetch(API+"/api/stickers").then(r=>r.json()).then(d=>{
    _allStickers=d.stickers||[];
    renderManageGrid();
  }).catch(()=>{});
}

function renderManageGrid(){
  const el=document.getElementById("sticker-manage-grid");
  if(!el)return;
  if(!_allStickers.length){el.innerHTML=`<div style="font-size:12px;color:var(--textFaint);text-align:center;padding:12px 0;grid-column:1/-1">还没有贴纸 🐾</div>`;return}
  el.innerHTML=_allStickers.map(s=>`<div class="sticker-item">
    <button class="sticker-del" onclick="event.stopPropagation();deleteSticker(${s.id})">×</button>
    <img src="${s.url}" loading="lazy" onerror="this.remove()">
    <div class="tag">${esc(s.tag||"日常")}</div>
  </div>`).join("");
}

function previewStickerFile(){
  const f=document.getElementById("sticker-file-input").files[0];
  const preview=document.getElementById("sticker-preview"),img=document.getElementById("sticker-preview-img");
  if(!f){preview.style.display="none";return}
  const reader=new FileReader();
  reader.onload=function(e){img.src=e.target.result;preview.style.display="block"}
  reader.readAsDataURL(f);
}

function uploadSticker(){
  const fileInput=document.getElementById("sticker-file-input");
  const f=fileInput.files[0];
  if(!f){alert("请先选择图片");return}
  const tag=document.getElementById("sticker-tag").value;
  const description=document.getElementById("sticker-desc").value.trim();
  const reader=new FileReader();
  reader.onload=function(e){
    fetch(API+"/api/stickers/upload",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file:e.target.result,tag,description})}).then(r=>r.json()).then(d=>{
      if(d.error){alert("上传失败: "+d.error);return}
      fileInput.value="";document.getElementById("sticker-preview").style.display="none";
      document.getElementById("sticker-desc").value="";
      loadManageStickers();
    }).catch(err=>{alert("上传出错: "+err.message)});
  };
  reader.readAsDataURL(f);
}

function deleteSticker(id){
  if(!confirm("确定删除这个贴纸吗？"))return;
  fetch(API+"/api/stickers/"+id,{method:"DELETE"}).then(r=>r.json()).then(()=>{loadManageStickers()}).catch(()=>{});
}

/* ═══ Sticker Picker (chat) ═══ */
function openStickerPicker(){
  const overlay=document.getElementById("sticker-picker-overlay");
  const panel=document.getElementById("sticker-picker");
  if(!overlay||!panel)return;
  overlay.classList.add("show");
  panel.classList.add("open");
  // Always refresh sticker list
  fetch(API+"/api/stickers").then(r=>r.json()).then(d=>{
    _allStickers=d.stickers||[];
    renderPickerTabs();
  }).catch(()=>{renderPickerTabs()});
}

function closeStickerPicker(){
  const overlay=document.getElementById("sticker-picker-overlay");
  const panel=document.getElementById("sticker-picker");
  if(overlay)overlay.classList.remove("show");
  if(panel)panel.classList.remove("open");
}

function renderPickerTabs(){
  const tabs=["全部","开心","难过","撒娇","日常","生气","惊讶"];
  const el=document.getElementById("sticker-picker-tabs");
  if(!el)return;
  el.innerHTML=tabs.map(t=>`<div class="sticker-picker-tab${t==="全部"?" active":""}" onclick="pickTab('${t}')">${t==="全部"?"🌟 "+t:t}</div>`).join("");
  renderPickerGrid("全部");
}

function pickTab(tag){
  document.querySelectorAll(".sticker-picker-tab").forEach(t=>t.classList.toggle("active",t.textContent.includes(tag)));
  renderPickerGrid(tag==="全部"?null:tag);
}

function renderPickerGrid(tag){
  const el=document.getElementById("sticker-picker-grid");
  if(!el)return;
  let pool=_allStickers;
  if(tag)pool=pool.filter(s=>s.tag===tag);
  if(!pool.length){el.innerHTML=`<div class="sticker-picker-empty">还没有贴纸，去设置页上传吧～</div>`;return}
  el.innerHTML=pool.map(s=>`<div class="sticker-picker-item" onclick="sendSticker('${s.url.replace(/'/g,"\\'")}')"><img src="${s.url}" loading="lazy" onerror="this.remove()"></div>`).join("");
}

function sendSticker(url){
  closeStickerPicker();
  if(isStreaming)return;
  const msgs=document.getElementById("chat-msgs"),now=new Date(),time=`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;
  msgs.innerHTML+=`<div class="msg-row user"><div class="msg-bubble"><img src="${url}" class="sticker-in-msg"></div><div class="msg-time">${time}</div></div>`;
  msgs.scrollTop=msgs.scrollHeight;
  // Trigger AI response with sticker as user message
  const ty=document.getElementById("typing");ty.style.display="flex";msgs.scrollTop=msgs.scrollHeight;
  isStreaming=!0;
  const aw=document.createElement("div");aw.className="msg-row assistant";
  aw.innerHTML=`<div class="msg-assistant-row">${CAT34}<div class="msg-bubble">...</div></div>`;msgs.appendChild(aw);
  const b=aw.querySelector(".msg-bubble");
  fetch(API+"/api/chat/stream",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:currentSession,message:"[STICKER:"+url+"]"})}).then(r=>{
    if(!r.ok||!r.body){throw new Error("no stream")}
    const rd=r.body.getReader(),dc=new TextDecoder();let ft="";
    function read(){rd.read().then(({done,v})=>{if(done){finishStickerStream(ft);return}
      for(const l of dc.decode(v,{stream:!0}).split("\n")){if(!l.startsWith("data: "))continue;try{const dt=JSON.parse(l.slice(6));
        if(dt.type==="text"){ft+=dt.text;b.innerHTML=esc(ft)||"...";msgs.scrollTop=msgs.scrollHeight}
        else if(dt.type==="done"){finishStickerStream(ft)}
        else if(dt.type==="error"){b.textContent="出错了: "+dt.text;finishStickerStream("")}
      }catch{}}
    read()})}read()
  }).catch(()=>{finishStickerStream("")});
  function finishStickerStream(ft){
    ty.style.display="none";isStreaming=!1;loadSidebarSessions();
    setTimeout(()=>{lastLoadedSession=null;loadChat(true)},1000);
  }
}

/* ═══ Utils ═══ */
function esc(s){const d=document.createElement("div");d.textContent=s;return d.innerHTML}
function fmtK(n){return n>=1000?(n/1000).toFixed(1)+"K":n}

if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js");
