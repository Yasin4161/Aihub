/* --------------------------------------------------
   Açık Zeka Hub • AI Chat
   Model  : HuggingFaceH4/zephyr-7b-beta
   Amaç   : Kısa ve düzgün Türkçe cevap
-------------------------------------------------- */

/* 🔗 Model API adresi */
const MODEL_URL =
  "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";

/* 📜 Sistem mesajı */
const SYSTEM =
  "Sen Türkçe konuşan, kısa ve net cevaplar veren kibar bir yapay zekâ " +
  "asistansın. Gereksiz ayrıntılardan kaçın, imla hatası yapma ve cevabın " +
  "iki-üç cümleyi geçmesin.";

/* ========== TOKEN YÖNETİMİ ========== */
async function getToken() {
  let token = localStorage.getItem("hf_token");
  if (!token) {
    token = prompt("Hugging Face API tokenini gir (tarayıcında saklanacak):");
    if (token) localStorage.setItem("hf_token", token.trim());
    else throw new Error("Token girilmedi.");
  }
  return token;
}

/* ========== MESAJ GÖNDER ========== */
async function sendMessage() {
  const inputEl  = document.getElementById("userInput");
  const chatBox  = document.getElementById("chatBox");
  const userText = inputEl.value.trim();
  if (!userText) return;

  /* Kullanıcı mesajını ekranda göster */
  chatBox.innerHTML += `<div class="message user">${escapeHtml(userText)}</div>`;
  scrollBottom(chatBox);
  inputEl.value = "";

  /* Geçici “yazıyor” balonu */
  const waitId = `wait${Date.now()}`;
  chatBox.innerHTML += `<div id="${waitId}" class="message bot">⏳ Yazıyor...</div>`;
  scrollBottom(chatBox);

  try {
    const token = await getToken();

    /* Zephyr prompt formatı */
    const prompt =
      `<|system|>\n${SYSTEM}\n<|user|>\n${userText}\n<|assistant|>\n`;

    const res = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        inputs: prompt,
        max_new_tokens: 64,
        temperature: 0.3,
        top_p: 0.9,
        repetition_penalty: 1.2,
        stop: ["<|user|>"]
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data     = await res.json();
    const rawText  = data[0]?.generated_text || "";

    /* Yanıtı <|assistant|> … <|user|> arasında al */
    let answer = rawText.split("<|assistant|>")[1] || "";
    answer     = answer.split("<|user|>")[0]?.trim() || "Üzgünüm, yanıt veremedim.";

    document.getElementById(waitId).innerHTML = escapeHtml(answer);
  } catch (err) {
    document.getElementById(waitId).innerHTML =
      `⚠️ Hata: ${escapeHtml(err.message)}`;
  }

  scrollBottom(chatBox);
}

/* ========== YARDIMCILAR ========== */
function scrollBottom(el) {
  el.scrollTop = el.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m])
  );
      }
