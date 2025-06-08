/* -------------------------------------------
   Açık Zeka Hub  •  AI Chat
   Token tarayıcıya bir kez girilir, LocalStorage’da saklanır
--------------------------------------------*/

const MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";/* 🔧 Hugging Face model endpoint’i */

/* ========== Token yöneticisi ========== */
async function getToken() {
  let token = localStorage.getItem("hf_token");
  if (!token) {
    token = prompt(
      "Hugging Face erişim tokenini bir kez gir (tarayıcına kaydedilecek):"
    );
    if (token) {
      localStorage.setItem("hf_token", token.trim());
    } else {
      throw new Error("Token girilmedi");
    }
  }
  return token;
}

/* ========== Sohbet gönderimi ========== */
async function sendMessage() {
  const inputEl  = document.getElementById("userInput");
  const chatBox  = document.getElementById("chatBox");
  const prompt   = inputEl.value.trim();
  if (!prompt) return;

  /* Kullanıcı mesajını ekle */
  chatBox.innerHTML += `<div class="message user">${escapeHtml(prompt)}</div>`;
  scrollBottom(chatBox);
  inputEl.value = "";

  /* Geçici “yazıyor” balonu */
  const waitId = `wait${Date.now()}`;
  chatBox.innerHTML += `<div id="${waitId}" class="message bot">⏳ Yazıyor...</div>`;
  scrollBottom(chatBox);

  try {
    /* Token’i güvenli biçimde al */
    const HF_TOKEN = await getToken();

    /* Hugging Face Inference API çağrısı */
    const res = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_TOKEN}`
      },
      body: JSON.stringify({
        inputs: prompt,
        max_new_tokens: 128
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data      = await res.json();
    const generated = (data[0]?.generated_text || "")
                        .replace(prompt, "")
                        .trim();

    document.getElementById(waitId).innerHTML =
      escapeHtml(generated || "Üzgünüm, şu an yanıt veremiyorum.");
  } catch (err) {
    document.getElementById(waitId).innerHTML =
      `⚠️ Hata: ${escapeHtml(err.message)}`;
  }

  scrollBottom(chatBox);
}

/* ===== Yardımcılar ===== */
function scrollBottom(el) {
  el.scrollTop = el.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m])
  );
}
