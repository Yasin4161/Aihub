<!-- script.js içine ekle  -->
async function getToken() {
  let t = localStorage.getItem("hf_token");
  if (!t) {
    t = prompt("HuggingFace tokenini gir (sadece bir kez tutulur):");
    if (t) localStorage.setItem("hf_token", t.trim());
  }
  return t;
}

async function sendMessage() {
  const HF_TOKEN = await getToken();          // 🔑 burada geldi
  if (!HF_TOKEN) { alert("Token gerekli!"); return; }

  /* …fetch kısmında… */
  const res = await fetch(MODEL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HF_TOKEN}`
    },
    body: JSON.stringify({ inputs: prompt, max_new_tokens: 128 })
  });
  /* kalan kod aynı */
}
