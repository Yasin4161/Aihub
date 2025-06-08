/* -------------------------------------------
   Açık Zeka Hub • AI Chat
   Model: HuggingFaceH4/zephyr-7b-beta
--------------------------------------------*/

/* 🔧 Model API adresi */
const MODEL_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";

/* ========== Token Yöneticisi ========== */
async function getToken() {
  let token = localStorage.getItem("hf_token");
  if (!token) {
    token = prompt("Hugging Face API tokenini gir (sadece bir kez kaydedilecek):");
    if (token) {
      localStorage.setItem("hf_token", token.trim());
    } else {
      throw new Error("Token girilmedi.");
    }
  }
  return token;
}

/* ========== Sohbet Gönderimi ========== */
async function sendMessage() {
  const inputEl = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");
  const promptText = inputEl.value.trim();
  if (!promptText) return;

  // Kullanıcı mesajını göster
  chatBox.innerHTML += `<div class="message user">${escapeHtml(promptText)}</div>`;
  scrollBottom(chatBox);
  inputEl.value = "";

  // Geçici "yazıyor" balonu
  const waitId = `wait${Date.now()}`;
  chatBox.innerHTML += `<div id="${waitId}" class="message bot">⏳ Yazıyor...</div>`;
  scrollBottom(chatBox);

  try {
    const HF_TOKEN = await getToken();

    // Prompt'u chat formatında oluştur
    const formattedPrompt = `### User:\n${promptText}\n\n### Assistant:`;

    const res = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_TOKEN}`
      },
      body: JSON.stringify({
        inputs: formattedPrompt,
        max_new_tokens: 128,
        temperature: 0.7,
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const generated = (data[0]?.generated_text || "")
      .split("### Assistant:")[1]
      ?.trim() || "Üzgünüm, yanıt veremedim.";

    document.getElementById(waitId).innerHTML = escapeHtml(generated);
  } catch (err) {
    document.getElementById(waitId).innerHTML = `⚠️ Hata: ${escapeHtml(err.message)}`;
  }

  scrollBottom(chatBox);
}

/* ===== Yardımcılar ===== */
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
