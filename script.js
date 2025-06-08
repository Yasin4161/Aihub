const MODEL_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";

/* ========== TOKEN AL ========== */
async function getToken() {
  let token = localStorage.getItem("hf_token");
  if (!token) {
    token = prompt("Hugging Face tokenini gir:");
    if (token) localStorage.setItem("hf_token", token.trim());
    else throw new Error("Token girilmedi.");
  }
  return token;
}

/* ========== MESAJ GÖNDER ========== */
async function sendMessage() {
  const input = document.getElementById("userInput").value.trim();
  const chatBox = document.getElementById("chatBox");
  if (!input) return;

  chatBox.innerHTML += `<div class="message user">${escapeHtml(input)}</div>`;
  scrollBottom(chatBox);
  document.getElementById("userInput").value = "";

  const waitId = `wait${Date.now()}`;
  chatBox.innerHTML += `<div id="${waitId}" class="message bot">⏳ Yazıyor...</div>`;
  scrollBottom(chatBox);

  try {
    const token = await getToken();

    // Zephyr formatı: <|system|>\n...\n<|user|>\n...\n<|assistant|>\n
    const fullPrompt = `<|system|>\nSen akıllı, yardımsever ve Türkçe konuşan bir asistansın.\n<|user|>\n${input}\n<|assistant|>\n`;

    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        max_new_tokens: 128,
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const rawText = data[0]?.generated_text || "";

    // Cevabı sadece <|assistant|> sonrası al
    const answer = rawText.split("<|assistant|>")[1]?.trim() || "Anlayamadım.";

    document.getElementById(waitId).innerHTML = escapeHtml(answer);
  } catch (err) {
    document.getElementById(waitId).innerHTML = `⚠️ Hata: ${err.message}`;
  }

  scrollBottom(chatBox);
}

/* ========== Yardımcılar ========== */
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
