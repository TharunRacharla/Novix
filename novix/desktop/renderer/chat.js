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

  try {
    const reply = await sendToBackend(v);
    add(reply, "bot");
  } catch (err) {
    add(err.message || "Something went wrong", "bot");
  }
};

t.onkeydown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    document.getElementById("send").click();
  }
};