/* --------------------------------------------------
   Açık Zeka Hub • Admin ayarlı chat
-------------------------------------------------- */
const MODEL_URL =
  "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";

/* ——— Ayarları LocalStorage’tan oku ——— */
function getSetting(key, def) {
  const v = localStorage.getItem(key);
  return v !== null ? (key === "maxTok" ? parseInt(v) : parseFloat(v)) : def;
}
function saveSetting(key, val) {
  localStorage.setItem(key, val);
}

/* —— Varsayılanlar —— */
let cfg = {
  maxTok: getSetting("maxTok", 64),
  temp  : getSetting("temp" , 0.3),
  topP  : getSetting("topP" , 0.9),
  rep   : getSetting("rep"  , 1.2)
};

/* —— Token yöneticisi —— */
async function getToken() {
  let t = localStorage.getItem("hf_token");
  if (!t) {
    t = prompt("Hugging Face tokenini gir:");
    if (t) localStorage.setItem("hf_token", t.trim());
    else throw new Error("Token yok");
  }
  return t;
}

/* —— Ayar paneli —— */
function toggleSettings(){
  const p=document.getElementById("settingsPanel");
  /* alanları güncel değerle doldur */
  document.getElementById("maxTokInp").value = cfg.maxTok;
  document.getElementById("tempInp").value   = cfg.temp;
  document.getElementById("topPInp").value   = cfg.topP;
  document.getElementById("repInp").value    = cfg.rep;
  p.style.display = p.style.display==="block" ? "none" : "block";
}
function saveSettings(){
  cfg.maxTok = parseInt(document.getElementById("maxTokInp").value);
  cfg.temp   = parseFloat(document.getElementById("tempInp").value);
  cfg.topP   = parseFloat(document.getElementById("topPInp").value);
  cfg.rep    = parseFloat(document.getElementById("repInp").value);
  /* kalıcı sakla */
  saveSetting("maxTok",cfg.maxTok);
  saveSetting("temp" ,cfg.temp);
  saveSetting("topP" ,cfg.topP);
  saveSetting("rep"  ,cfg.rep);
  alert("Ayarlar kaydedildi!");
  toggleSettings();
}

/* —— Sohbet gönderimi —— */
async function sendMessage() {
  const inp   = document.getElementById("userInput");
  const chat  = document.getElementById("chatBox");
  const text  = inp.value.trim();
  if (!text) return;

  chat.innerHTML += `<div class="message user">${escapeHtml(text)}</div>`;
  scroll(chat);
  inp.value = "";

  const id = `wait${Date.now()}`;
  chat.innerHTML += `<div id="${id}" class="message bot">⏳ Yazıyor...</div>`;
  scroll(chat);

  try {
    const token = await getToken();

    const prompt =
      `<|system|>\nSen kısa ve net Türkçe cevaplar veren bir asistansın.\n` +
      `<|user|>\n${text}\n<|assistant|>\n`;

    const res = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        inputs: prompt,
        max_new_tokens: cfg.maxTok,
        temperature: cfg.temp,
        top_p: cfg.topP,
        repetition_penalty: cfg.rep,
        stop: ["<|user|>"]
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data   = await res.json();
    let reply    = data[0]?.generated_text.split("<|assistant|>")[1] || "";
    reply        = reply.split("<|user|>")[0]?.trim() || "Anlayamadım.";

    document.getElementById(id).innerHTML = escapeHtml(reply);
  } catch (e) {
    document.getElementById(id).innerHTML = `⚠️ Hata: ${escapeHtml(e.message)}`;
  }

  scroll(chat);
}

/* —— Yardımcılar —— */
function scroll(el){ el.scrollTop = el.scrollHeight; }
function escapeHtml(s){ return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
