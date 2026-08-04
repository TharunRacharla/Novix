const messages = document.getElementById("messages"), //all messages
  text = document.getElementById("msg"); //input message

const API_URL = "http://127.0.0.1:8000/chat/";

function add(txt, c) { //will take input string and username
  let d = document.createElement("div");
  d.className = "bubble " + c;
  d.textContent = txt;
  messages.appendChild(d);
  messages.scrollTop = messages.scrollHeight;
}

// loading animation js start
function showTyping() {
  const div = document.createElement("div");
  div.className = "bubble bot";
  div.id = "typing";

  div.innerHTML = `
      <div class="typing">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}
// loading animation end

async function sendToBackend(message) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Request failed");
  }

  const data = await response.json();
  return data.reply;
}

document.getElementById("send").onclick = async () => {
  let v = text.value.trim();//trims the input string
  if (!v) return;

  add(v, "user");
  text.value = "";

  // Show loading
  showTyping();
  try {
    const reply = await sendToBackend(v);

    // Remove loading
    hideTyping();

    add(reply, "bot");
  } catch (err) {
    // Remove loading
    hideTyping();
    add(err.message || "Something went wrong", "bot");
  }
};

text.onkeydown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    document.getElementById("send").click();
  }
};

// sidebar btn
const menuBtn = document.getElementById("menuBtn");
const card = document.getElementById("card");

menuBtn.addEventListener("click", () => {
  card.classList.toggle("open");
});


// close btn 
document.getElementById("closeBtn").addEventListener("click", () => {
  window.electronAPI.closeWindow();
});