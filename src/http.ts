const CLIENT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bun WebSocket Chat</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;height:100vh;display:flex;flex-direction:column}
#header{padding:12px 16px;background:#1e293b;border-bottom:1px solid #334155;display:flex;align-items:center;gap:12px}
#header h1{font-size:16px;color:#38bdf8}
#header input,#header button{padding:6px 10px;border-radius:6px;border:1px solid #475569;background:#0f172a;color:#e2e8f0;font-size:13px}
#header button{background:#2563eb;border-color:#2563eb;cursor:pointer}
#messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:6px}
.msg{max-width:70%;padding:8px 12px;border-radius:12px;font-size:14px;line-height:1.4}
.msg.self{align-self:flex-end;background:#2563eb}
.msg.other{align-self:flex-start;background:#334155}
.msg.system{align-self:center;color:#94a3b8;font-size:12px;font-style:italic}
.msg .author{font-size:11px;color:#94a3b8;margin-bottom:2px}
#input-bar{padding:12px 16px;background:#1e293b;border-top:1px solid #334155;display:flex;gap:8px}
#input-bar input{flex:1;padding:10px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#e2e8f0;font-size:14px}
#input-bar button{padding:10px 20px;border-radius:8px;border:none;background:#2563eb;color:#fff;cursor:pointer;font-size:14px}
#users{font-size:12px;color:#94a3b8}
</style>
</head>
<body>
<div id="header">
  <h1>💬 Bun WS Chat</h1>
  <input id="username" placeholder="Username" value="">
  <input id="room" placeholder="Room" value="general">
  <button onclick="connect()">Connect</button>
  <span id="users"></span>
</div>
<div id="messages"></div>
<div id="input-bar">
  <input id="msg" placeholder="Type a message..." onkeydown="if(event.key==='Enter')send()" disabled>
  <button onclick="send()" id="sendBtn" disabled>Send</button>
</div>
<script>
let ws;
const $=id=>document.getElementById(id);
function addMsg(text,cls){const d=document.createElement('div');d.className='msg '+cls;d.innerHTML=text;$('messages').appendChild(d);$('messages').scrollTop=$('messages').scrollHeight}
function connect(){
  if(ws)ws.close();
  const u=$('username').value||'anon-'+Math.random().toString(36).slice(2,7);
  const r=$('room').value||'general';
  $('username').value=u;
  ws=new WebSocket(location.origin.replace('http','ws')+'/ws?username='+encodeURIComponent(u)+'&room='+encodeURIComponent(r));
  ws.onopen=()=>{$('msg').disabled=false;$('sendBtn').disabled=false;addMsg('Connected to #'+r,'system')};
  ws.onclose=()=>{$('msg').disabled=true;$('sendBtn').disabled=true;addMsg('Disconnected','system')};
  ws.onmessage=e=>{
    const d=JSON.parse(e.data);
    if(d.type==='system')addMsg(d.message,'system');
    else if(d.type==='join')addMsg(d.username+' joined','system');
    else if(d.type==='leave')addMsg(d.username+' left','system');
    else if(d.type==='message'){
      if(d.self)addMsg(d.message,'self');
      else addMsg('<div class="author">'+d.username+'</div>'+d.message,'other');
    }
    if(d.users)$('users').textContent='Online: '+d.users.join(', ');
  };
}
function send(){const m=$('msg').value.trim();if(!m||!ws)return;ws.send(JSON.stringify({message:m}));$('msg').value=''}
$('username').value='user-'+Math.random().toString(36).slice(2,6);
</script>
</body></html>`;

export function handleHTTP(req: Request, url: URL): Response {
  if (url.pathname === "/" || url.pathname === "/index.html") {
    return new Response(CLIENT_HTML, { headers: { "Content-Type": "text/html" } });
  }

  if (url.pathname === "/health") {
    return Response.json({ status: "ok", uptime: process.uptime() });
  }

  return new Response("Not Found", { status: 404 });
}
