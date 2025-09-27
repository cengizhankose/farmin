<div class="btn-wrap">
  <button class="btn">
    <svg class="sparkle" viewBox="0 0 24 24" width="24" height="24" fill="#FFFFFF">
      <path clip-rule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" fill-rule="evenodd"></path>
      <path clip-rule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" fill-rule="evenodd"></path>
    </svg>
    <span class="text">Connect Wallet</span>
  </button>

  <!-- Bubbles (renkler SVG adına göre) -->
  <div class="btn-bubbles">
    <div class="bubble bubble--pera">
      <!-- pera.svg -->
      <img src="/public/logos/pera.svg" alt="pera" />
    </div>
    <div class="bubble bubble--komodo">
      <!-- komodo.svg -->
      <img src="/public/logos/komodo.svg" alt="komodo" />
    </div>
    <div class="bubble bubble--exodus">
      <!-- Exodus.svg -->
      <img src="/public/logos/Exodus.svg" alt="exodus" />
    </div>
    <div class="bubble bubble--defly">
      <!-- defly.svg -->
      <img src="/public/logos/defly.svg" alt="defly" />
    </div>
  </div>
</div>

/_ Mevcut stilin _/
.btn {
border: none;
width: 15em;
height: 5em;
border-radius: 3em;
display: flex;
justify-content: center;
align-items: center;
gap: 12px;
background: #1c1a1c;
cursor: pointer;
transition: all 450ms ease-in-out;
}
.sparkle { fill: #aaaaaa; transition: all 800ms ease; }
.text { font-weight: 600; color: #aaaaaa; font-size: medium; }

.btn:hover {
background: linear-gradient(0deg, #1c1a1c, white);
box-shadow:
inset 0px 1px 0px 0px rgba(255, 255, 255, 0.4),
inset 0px -4px 0px 0px rgba(0, 0, 0, 0.2),
0px 0px 0px 4px rgba(255, 255, 255, 0.2),
0px 0px 180px 0px #9917ff;
transform: translateY(-2px);
}
.btn:hover .text { color: white; }
.btn:hover .sparkle { fill: white; transform: scale(1.2); }

/_ Renk ve konum kapsayıcı _/
.btn-wrap { position: relative; display: inline-block; }

/_ Mevcut buton stillerin _/
.btn{
border:none; width:15em; height:5em; border-radius:3em;
display:flex; justify-content:center; align-items:center; gap:12px;
background:#1c1a1c; cursor:pointer; transition:all 450ms ease-in-out;
}
.sparkle{ fill:#aaa; transition:all 800ms ease; }
.text{ font-weight:600; color:#aaa; font-size:medium; }

.btn:hover{
background:linear-gradient(0deg,#1c1a1c,white);
box-shadow:
inset 0 1px 0 rgba(255,255,255,.4),
inset 0 -4px 0 rgba(0,0,0,.2),
0 0 0 4px rgba(255,255,255,.2),
0 0 180px 0 #9917ff;
transform:translateY(-2px);
}
.btn:hover .text{ color:#fff; }
.btn:hover .sparkle{ fill:#fff; transform:scale(1.2); }

/_ Bubbles konteyner _/
.btn-bubbles{
pointer-events:none; position:absolute; left:50%; transform:translateX(-50%);
top:calc(100% + 6px); width:220px;
display:grid; grid-template-columns:repeat(4,1fr); gap:10px;
opacity:0; transition:opacity .2s ease;
}
.btn-wrap:hover .btn-bubbles{ opacity:1; }

/_ Her baloncuk _/
.bubble{
--size:38px;
width:var(--size); height:var(--size); border-radius:999px;
display:grid; place-items:center;
filter:drop-shadow(0 6px 16px rgba(0,0,0,.35));
transform:translateY(-8px) scale(.9); opacity:0;
animation:floatDown 1200ms cubic-bezier(.22,.61,.36,1) forwards;
}
.bubble img, .bubble svg{ width:60%; height:60%; display:block; }

/_ Renk eşlemeleri (SVG ismine göre) _/
.bubble--pera{ background:#FFEE55; animation-delay: 40ms; }
.bubble--komodo{ background:#000000; animation-delay:120ms; }
.bubble--exodus{ background:#ffffff; animation-delay:200ms; }
.bubble--defly{ background:#8C45FF; animation-delay:280ms; }

/_ Arka plan açık/kapalıya göre ikon görünürlüğü _/
.bubble--komodo img{ filter: invert(1); } /_ siyah zeminde beyaz ikon istersen kaldır _/
.bubble--exodus img{ filter: none; } /_ beyaz zeminde siyah ikon istiyorsan: filter: invert(1); _/

/_ Aşağı süzülme animasyonu _/
@keyframes floatDown{
0%{ transform:translateY(-8px) scale(.9); opacity:0; }
35%{ opacity:1; }
100%{ transform:translateY(22px) scale(1); opacity:.95; }
}

/_ hover bittiğinde gizle _/
.btn-wrap:not(:hover) .bubble{
animation:none; opacity:0; transform:translateY(-8px) scale(.9);
}

Notlar
• img yerine inline <svg> kullanıyorsan ikonların içini fill="currentColor" yapıp .bubble … { color:#fff; } gibi yönetebilirsin.
• Exodus ikonunun koyu/siyah gelmesi durumunda filter: invert(1) ile tersleyebilirsin (zemin beyaz olduğu için).
• Yayılma genişliğini btn-bubbles { width: 220px }, düşüş mesafesini @keyframes floatDown ile ayarlayabilirsin.
