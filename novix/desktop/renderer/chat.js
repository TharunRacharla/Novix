const messages = document.getElementById("messages"), //all messages
  text = document.getElementById("msg"); //input message

const API_URL = "http://127.0.0.1:8000/chat/";
const CONVERSATION_URL = "http://127.0.0.1:8000/conversations/";
let currentConversation = null;

async function createConversation() {
    const response = await fetch(CONVERSATION_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create conversation");
    }

    return await response.json();
}

async function getConversations() {
    const response = await fetch(CONVERSATION_URL);
    return await response.json();
}

async function loadConversation(id) {
    const response = await fetch(CONVERSATION_URL + id + "/");
    if (!response.ok) {
        throw new Error("Failed to load conversation");
    }
    return await response.json();
}

async function loadConversations() {
    const data = await getConversations();
    renderConversations(data.conversations);
}

async function initConversations() {
    let data = await getConversations();

    if (!data.conversations.length) {
        const conversation = await createConversation();
        currentConversation = conversation.id;
        data = await getConversations();
    } else {
        currentConversation = data.conversations[0].id;
    }

    renderConversations(data.conversations);
    await loadMessages(currentConversation);
}

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
  if (!currentConversation) {
    throw new Error("No conversation selected");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({conversation_id: currentConversation, message: message }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Request failed");
  }

  const data = await response.json();
  return data.reply;
}

async function submitMessage() {
  let v = text.value.trim(); // trim the input string
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
    await loadMessages(currentConversation);
  } catch (err) {
    // Remove loading
    hideTyping();
    add(err.message || "Something went wrong", "bot");
  }
}

document.getElementById("send").onclick = submitMessage;

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

const newChatBtn = document.getElementById("new-chat");
newChatBtn?.addEventListener("click", async () => {
    const conversation = await createConversation();
    currentConversation = conversation.id;
    await loadConversations();
    await loadMessages(currentConversation);
});

function renderConversations(conversations){
    const list =
        document.getElementById(
            "conversation-list"
        );
    list.innerHTML = "";
    conversations.forEach(c=>{
        const div =
            document.createElement("div");
        div.className =
            "conversation";
        div.innerText =
            c.title;
        div.onclick=()=>{
            selectConversation(
                c.id
            );
        };
        if(
            c.id===currentConversation
        ){
            div.classList.add("active");
        }
        list.appendChild(div);
    });
}

async function selectConversation(id){
    if (currentConversation === id) return;
    currentConversation = id;
    await loadMessages(id);
    await loadConversations();
}

async function loadMessages(id){
    const response = await fetch(CONVERSATION_URL + id + "/");
    if (!response.ok) {
        messages.innerHTML = "";
        add("Unable to load conversation.", "bot");
        return;
    }

    const data = await response.json();
    messages.innerHTML = "";
    data.messages.forEach(m => {
        add(m.content, m.role === "user" ? "user" : "bot");
    });
}

// close btn 
document.getElementById("closeBtn").addEventListener("click", () => {
  window.electronAPI.closeWindow();
});

initConversations();