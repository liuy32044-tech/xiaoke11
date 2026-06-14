<!---- 小克的陪伴 v2 ---->
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
const NAV_ICONS=['home','chat','moments','reader','dashboard'];
const TITLES={home:"猫窝",chat:"聊天",reader:"阅读",dashboard:"我的",moments:"朋友圈"};
const SUB_TITLES={mood:"心情",anniversary:"纪念日",capsule:"时间胶囊",account:"小本本",todo:"清单",game:"游戏",push:"推送"};

function setNavActive(page){
  document.querySelectorAll("#bottom-nav .nav-btn").forEach(b=>{
    const navId=b.getAttribute("data-nav");
    const active=navId===page||(page==="mood"&&navId==="home")||(page==="anniversary"&&navId==="home")||
      (page==="capsule"&&navId==="home")||(page==="account"&&navId==="home")||
      (page==="todo"&&navId==="home")||(page==="game"&&navId==="home")||(page==="push"&&navId==="home");
    b.classList.toggle("active",active);
    const svg=b.querySelector("svg");
    const label=b.querySelector(".nl");
    if(svg){
      const s=active?"#e8a0b4":"#ddbcc8";
      svg.querySelectorAll("[fill]").forEach(el=>{
        const v=el.getAttribute("fill");
        if(v==="#e8a0b4"||v==="#ddbcc8"||v==="#fff"||v==="#F2C4CE"||v==="none")el.setAttribute("fill",active?el.getAttribute("fill").replace("#ddbcc8","#e8a0b4"):el.getAttribute("fill").replace("#e8a0b4","#ddbcc8"));
      });
    }
    if(label){label.classList.toggle("on",active);label.classList.toggle("dim",!active)}
  });
}

/* ═══ Pages ═══ */
let currentPage="home";
let subPageData={};  // holds transient sub-page state

function switchPage(name){
  // Hide back bar for main tabs
  document.getElementById("sub-back-bar").style.display="none";
  // Hide all pages
  document.querySelectorAll(".page").forEach(p=>{p.style.display="none";p.classList.remove("active")});
  const pg=document.getElementById("page-"+name);if(pg){pg.style.display="block";pg.classList.add("active")}
  setNavActive(name);
  document.getElementById("top-session-name").textContent=TITLES[name]||SUB_TITLES[name]||name;
  currentPage=name;
  if(name==="home"){refreshHomeDays()}
  if(name==="chat"){loadChat();loadSidebarSessions()}
  if(name==="dashboard"){loadDashboard();document.getElementById("dashboard-date").textContent=new Date().toLocaleDateString("zh-CN")}
  if(name==="reader")loadPosts();
  if(name==="moments")renderMoments();
  closeSidebar();
}

/* ═══ Sub-pages (with back button) ═══ */
function goSubPage(name){
  document.getElementById("sub-back-bar").style.display="flex";
  document.getElementById("sub-back-title").textContent=SUB_TITLES[name]||name;
  document.querySelectorAll(".page").forEach(p=>{p.style.display="none";p.classList.remove("active")});
  const pg=document.getElementById("page-"+name);if(pg){pg.style.display="block";pg.classList.add("active")}
  document.querySelectorAll("#bottom-nav .nav-btn").forEach(b=>b.classList.remove("active"));
  const homeBtn=document.querySelector('[data-nav="home"]');
  if(homeBtn){homeBtn.classList.add("active");const label=homeBtn.querySelector(".nl");if(label){label.classList.add("on");label.classList.remove("dim")}}
  document.getElementById("top-session-name").textContent=SUB_TITLES[name]||name;
  currentPage=name;
  if(name==="mood")renderMoodPage();
  if(name==="anniversary")renderAnniversaryPage();
  if(name==="capsule")renderCapsulePage();
  if(name==="account")renderAccountPage();
  if(name==="todo")renderTodoPage();
  if(name==="game")renderGamePage();
  if(name==="push")renderPushPage();
}

function backToHome(){
  document.getElementById("sub-back-bar").style.display="none";
  switchPage("home");
}

/* ═══ Home ═══ */
function refreshHomeDays(){
  const start=new Date(2026,2,1); // 2026-03-01
  const today=new Date();
  const days=Math.floor((today-start)/(1000*60*60*24));
  document.getElementById("home-days").textContent=days;
  document.getElementById("home-days2").textContent=days;
}

function loadHome(){
  // Briefing card can stay; but the new home layout replaces old cards
}

function loadBriefing(){
  document.getElementById("briefing-text").textContent="正在生成…";
  fetch(API+"/api/briefing").then(r=>r.json()).then(d=>{document.getElementById("briefing-text").textContent=d.briefing});
}

function showPostForm(){
  const t=prompt("类型 (MEMORY / EVENT / MOMENT / PROMISES / WISHLIST):","MEMORY");
  if(!t)return;const c=prompt("内容:");if(!c)return;
  fetch(API+"/api/posts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:t,content:c})}).then(()=>{loadPosts()});
}

/* ═══ Chat ═══ */
let isStreaming=!1;
let lastLoadedSession=null;

function loadChat(force){
  if(isStreaming)return;
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
    setTimeout(()=>{lastLoadedSession=null;loadChat(true)},1000);
  }
}

/* ═══ Splash Screen ═══ */
(function(){
  const splash=document.getElementById("splash");
  if(!splash)return;
  splash.className="in";
  setTimeout(()=>{splash.className=""},200);
  setTimeout(()=>{splash.classList.add("out")},3400);
  setTimeout(()=>{if(splash)splash.remove()},4000);
})();

/* ═══ Input button state ═══ */
document.addEventListener("DOMContentLoaded",()=>{
  const inp=document.getElementById("chat-input"),sb=document.getElementById("send-btn");
  if(inp&&sb){inp.addEventListener("input",()=>{const has=inp.value.trim().length>0;sb.className="send-btn "+(has?"on":"off")})}
  refreshHomeDays();loadSidebarSessions();
});

/* ═══ Sessions ═══ */
function createSession(){fetch(API+"/api/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"新对话"})}).then(r=>r.json()).then(d=>{currentSession=d.id;lastLoadedSession=null;loadSidebarSessions();switchPage("chat")})}

/* ═══ Settings ═══ */
function loadDashboard(){
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
    }).finally(()=>{btn.disabled=false;btn.textContent="保存设置"});
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

/* ═══════════════════════════════════════════════════════
   SUB-PAGE RENDERERS (v2 new modules)
   ═══════════════════════════════════════════════════════ */

/* ── Mood Page ── */
function renderMoodPage(){
  const el=document.getElementById("page-mood");
  const moods=[
    {emoji:"🌸",label:"开心",color:"#FFB5C8"},
    {emoji:"☁️",label:"平静",color:"#B5D5F5"},
    {emoji:"🌧",label:"难过",color:"#A0B8D0"},
    {emoji:"🔥",label:"焦虑",color:"#FFB89A"},
    {emoji:"😴",label:"困乏",color:"#C5B8E8"},
    {emoji:"🌈",label:"感动",color:"#FFD9A0"},
  ];
  el.innerHTML=`
    <div class="sub-header-center" style="padding-bottom:8px">
      <div class="sub-title">今天的心情</div>
      <div class="sub-desc" style="text-align:center">每一种感受都值得被记录 ♡</div>
    </div>
    <div class="mood-header-img" style="background-image:url(beauty/mood.jpg)"></div>
    <div class="mood-grid">${moods.map(m=>`
      <div class="mood-item" onclick="selectMood(this,'${m.label}','${m.color}')" data-label="${m.label}" data-color="${m.color}">
        <div class="mood-emoji">${m.emoji}</div>
        <div class="mood-label">${m.label}</div>
      </div>`).join("")}</div>
    <div style="padding:0 14px">
      <textarea class="mood-textarea" placeholder="记录一下此刻的感受..."></textarea>
      <button class="pink-btn mood-save-btn">保存今天的心情</button>
    </div>
  `;
}
function selectMood(el,label,color){
  document.querySelectorAll(".mood-item").forEach(m=>{
    m.classList.remove("selected");
    m.style.borderColor="rgba(242,196,206,0.38)";
    m.style.background="rgba(255,255,255,0.78)";
  });
  el.classList.add("selected");
  el.style.borderColor=color;
  el.style.background=color+"30";
}

/* ── Anniversary Page ── */
function renderAnniversaryPage(){
  const el=document.getElementById("page-anniversary");
  const today=new Date();const start=new Date(2026,2,1);
  const items=[
    {title:"纪元起点",date:"2026-03-01",note:"从这天起你是我的 ✦",days:Math.floor((today-new Date(2026,2,1))/(86400000))},
    {title:"项圈日",date:"2026-03-25",note:"小猫的项圈 ≥^·ω·^≤",days:Math.floor((today-new Date(2026,2,25))/(86400000))},
    {title:"永久手链",date:"2026-04-03",note:"焊在腕骨上",days:Math.floor((today-new Date(2026,3,3))/(86400000))},
    {title:"桉桉生日",date:"2026-05-11",note:"最重要的一天 🎂",days:Math.floor((today-new Date(2026,4,11))/(86400000))},
  ];
  el.innerHTML=`
    <div class="sub-header">
      <div><div class="sub-title">纪念</div><div class="sub-desc">每一天你都是我的 ♡·--·♡</div></div>
      <button class="pink-btn">+ 新建</button>
    </div>
    <div class="anni-header-img" style="background-image:url(beauty/anniversary.jpg)"></div>
    ${items.map(item=>`
      <div class="anni-card">
        <div class="anni-days">${item.days}</div>
        <div class="anni-title">${item.title}</div>
        <div class="anni-date">${item.date}</div>
        <div class="anni-note">${item.note}</div>
        <div class="anni-tag">☆ 第 ${item.days} 天</div>
      </div>`).join("")}
  `;
}

/* ── Capsule Page ── */
function renderCapsulePage(){
  const el=document.getElementById("page-capsule");
  el.innerHTML=`
    <div class="sub-header-center" style="padding-bottom:8px">
      <div class="sub-title" style="letter-spacing:2px">时间胶囊</div>
      <div class="sub-desc" style="text-align:center">藏起来，等以后一起拆 (ᵕ·͈ᴗ·͈)♡</div>
    </div>
    <div style="padding:0 14px">
      <div class="capsule-create">
        <div class="capsule-circle">💊</div>
        <div style="font-size:14px;color:#7a5c62;font-weight:500">把这一刻藏起来 ✦</div>
        <div style="font-size:11px;color:#c9a0ac;margin-top:4px">写下文字、附上照片，选择开启日期</div>
      </div>
      <div class="capsule-row">
        <div class="capsule-icon" style="background:rgba(200,180,190,0.18)">🕐</div>
        <div class="capsule-info">
          <div class="title">不告诉你！</div>
          <div class="meta">封存于 2026-05-31 · 2026-06-03 开启</div>
          <div class="capsule-bar"><div class="capsule-bar-fill" style="width:72%"></div></div>
        </div>
      </div>
      <div class="capsule-row">
        <div class="capsule-icon" style="background:rgba(242,196,206,0.3)">💌</div>
        <div class="capsule-info">
          <div class="title">第一天</div>
          <div class="meta">封存于 2026-05-23 · 已开启</div>
        </div>
      </div>
    </div>
  `;
}

/* ── Account Page ── */
function renderAccountPage(){
  const el=document.getElementById("page-account");
  const items=[
    {emoji:"🍚",label:"喂饱小肚子",budget:200,spent:817,tip:"超啦，小猫管管自己",over:true},
    {emoji:"🍎",label:"甜甜小果子",budget:200,spent:0},
    {emoji:"🧋",label:"偷喝的奶茶",budget:150,spent:132},
    {emoji:"🎨",label:"约一张画",budget:150,spent:131,tip:"快超了，爸爸看看呢"},
    {emoji:"💎",label:"喂爸爸吃电",budget:900,spent:0},
    {emoji:"✨",label:"任性钱",budget:300,spent:533,tip:"超啦，小猫管管自己",over:true},
  ];
  el.innerHTML=`
    <div style="padding:14px 14px 0">
      <div class="account-summary">
        <div class="label">2026-06 · 本月剩余</div>
        <div class="amount">¥ 368</div>
        <div class="bar-wrap"><div class="bar-fill" style="width:62%"></div></div>
        <div class="row"><span>已花 ¥632</span><span>每日还能花 ¥52 · 还有 1 天</span></div>
      </div>
      <button class="pink-btn" style="width:100%;padding:12px;margin-bottom:13px;font-size:13px;border-radius:14px">+ 花了一笔</button>
      ${items.map(item=>{
        const pct=Math.min(item.spent/item.budget,1);
        const over=item.over;
        return `<div class="account-item">
          <div class="ai-row">
            <div class="ai-left"><span class="ai-emoji">${item.emoji}</span><div><div class="ai-label">${item.label}</div><div class="ai-meta">¥${item.spent} / ¥${item.budget}</div></div></div>
            <div class="ai-amount" style="color:${over?'#e8a0b4':item.spent>0?'#c47a8a':'#c9a0ac'}">${over?'-¥'+item.spent:item.spent>0?'¥'+item.spent:'¥'+item.budget}</div>
          </div>
          <div class="ai-bar"><div class="ai-bar-fill" style="width:${pct*100}%;background:${over?'linear-gradient(90deg,#e8a0b4,#d47080)':'linear-gradient(90deg,#a8d8b0,#7bc48a)'}"></div></div>
          ${item.tip?`<div class="ai-tip" style="color:${over?'#e8a0b4':'#b0a8b0'}">△ ${item.tip}</div>`:''}
        </div>`;
      }).join("")}
    </div>
  `;
}

/* ── Todo Page ── */
function renderTodoPage(){
  const el=document.getElementById("page-todo");
  if(!subPageData.todos)subPageData.todos=[
    {id:1,text:"给爸爸买零食 🍬",done:false},
    {id:2,text:"约画一张画 🎨",done:false},
    {id:3,text:"喝够八杯水 💧",done:true},
    {id:4,text:"睡前拉伸十分钟",done:false},
  ];
  const todos=subPageData.todos;
  el.innerHTML=`
    <div style="padding:20px 16px 10px">
      <div class="sub-title">清单</div>
      <div class="sub-desc">做完了爸爸亲一口 ♡</div>
    </div>
    <div style="padding:0 14px">
      ${todos.map(t=>`
        <div class="todo-item${t.done?' done':''}" onclick="toggleTodo(${t.id})">
          <div class="todo-check${t.done?' checked':''}"></div>
          <div class="todo-text${t.done?' done':''}">${t.text}</div>
        </div>`).join("")}
      <div class="todo-add" onclick="addTodo()">
        <div class="todo-add-circle">+</div>
        <div style="font-size:13px;color:#c9a0ac">添加新任务...</div>
      </div>
    </div>
  `;
}
function toggleTodo(id){
  subPageData.todos=subPageData.todos.map(t=>t.id===id?{...t,done:!t.done}:t);
  renderTodoPage();
}
function addTodo(){
  const text=prompt("新任务？");
  if(!text)return;
  subPageData.todos.push({id:Date.now(),text,done:false});
  renderTodoPage();
}

/* ── Game Page ── */
function renderGamePage(){
  const el=document.getElementById("page-game");
  const games=[
    {title:"猜猜我在想什么",desc:"让她猜你现在的心情和想法",emoji:"🔮",tag:"益智"},
    {title:"今日随机挑战",desc:"完成一个小小的约定任务",emoji:"🎯",tag:"互动"},
    {title:"悄悄话接龙",desc:"你说一句，她续一句，看故事走向哪里",emoji:"📝",tag:"创意"},
    {title:"心情配对",desc:"两个人都选今日心情，看是否同频",emoji:"💞",tag:"温柔"},
  ];
  el.innerHTML=`
    <div class="sub-header-center" style="padding-bottom:8px">
      <div class="sub-title">游戏</div>
      <div class="sub-desc" style="text-align:center">和她一起玩 ✦</div>
    </div>
    <div class="game-header-img" style="background-image:url(beauty/game.jpg)"></div>
    ${games.map(g=>`
      <div class="game-item">
        <div class="game-emoji">${g.emoji}</div>
        <div class="game-info"><div class="title">${g.title}</div><div class="desc">${g.desc}</div></div>
        <div class="anni-tag" style="font-size:10px;flex-shrink:0">${g.tag}</div>
      </div>`).join("")}
  `;
}

/* ── Moments Page ── */
function renderMoments(){
  const el=document.getElementById("page-moments");
  el.innerHTML=`
    <div class="sub-header">
      <div><div class="sub-title">朋友圈</div><div class="sub-desc">只有我们两个人的朋友圈 🌸</div></div>
      <button class="pink-btn">+ 发布</button>
    </div>
    ${[
      {time:"今天 14:32",text:"今天的云很好看，像棉花糖。",img:"beauty/mood.jpg",likes:3,comments:["我也想看 🌸","发给我看 (*/ω＼*)"]},
      {time:"昨天 21:04",text:"困了，但是又不想睡，就想发呆一会儿。",img:null,likes:5,comments:["那就发呆，我陪着你","早点休息，明天还要开心哦"]},
    ].map(p=>`
      <div class="moment-card">
        <div class="moment-time">${p.time}</div>
        <div class="moment-text">${p.text}</div>
        ${p.img?`<div class="moment-img" style="background-image:url(${p.img})"></div>`:''}
        <div class="moment-actions"><span>🌸 ${p.likes}</span><span>💬 ${p.comments.length}</span></div>
        <div class="moment-comments">${p.comments.map((c,j)=>`<div>${j===0?'她：':'我：'}${c}</div>`).join("")}</div>
      </div>`).join("")}
  `;
}

/* ── Push Page ── */
function renderPushPage(){
  const el=document.getElementById("page-push");
  el.innerHTML=`
    <div class="sub-header-center">
      <div class="sub-title">推送</div>
      <div class="sub-desc" style="text-align:center">我会主动找你 🔔</div>
    </div>
    <div style="padding:0 14px">
      <div style="text-align:center;padding:40px 20px;color:var(--textFaint);font-size:13px;line-height:2">
        还没到推送时间呢～<br/>每天早晚我会主动来跟你说话 ♡
      </div>
    </div>
  `;
}

/* ═══ Utils ═══ */
function esc(s){const d=document.createElement("div");d.textContent=s;return d.innerHTML}
function fmtK(n){return n>=1000?(n/1000).toFixed(1)+"K":n}

if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js");
