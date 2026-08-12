const messages = document.getElementById("messages"); // all messages
const text = document.getElementById("msg"); // input message

const API_URL = "http://127.0.0.1:8000/chat/";
const CONVERSATION_URL = "http://127.0.0.1:8000/conversations/";
let currentConversation = null;

async function createConversation() {
    const response = await fetch(CONVERSATION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    const response = await fetch(`${CONVERSATION_URL}${id}/`);
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

function add(txt, c) {
    // will take input string and username
    const d = document.createElement("div");
    d.className = `bubble ${c}`;
    d.textContent = txt;
    messages.appendChild(d);
    messages.scrollTop = messages.scrollHeight;
}

// loading animation
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

async function sendToBackend(message) {
    if (!currentConversation) {
        throw new Error("No conversation selected");
    }

    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: currentConversation, message }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
    }

    const data = await response.json();
    return data.reply;
}

async function submitMessage() {
    const v = text.value.trim(); // trim the input string
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

function renderConversations(conversations) {
    const list = document.getElementById("conversation-list");
    list.innerHTML = "";

    conversations.forEach((c) => {

        // Conversation row
        const div = document.createElement("div");
        div.className = "conversation";

        // Title
        const title = document.createElement("span");
        title.className = "conversation-title";
        title.innerText = c.title;

        // Three-dot button
        const menuBtn = document.createElement("button");
        menuBtn.className = "conversation-menu-btn";
        menuBtn.innerText = "⋮";
        menuBtn.title = "More";

        // Dropdown menu
        const menu = document.createElement("div");
        menu.className = "conversation-menu";

        // =========================
        // Rename button
        // =========================
        const renameBtn = document.createElement("button");
        renameBtn.innerText = "✏️ Rename";

        renameBtn.onclick = (e) => {
            e.stopPropagation();

            // Close dropdown
            menu.classList.remove("show");

            // Open custom rename modal
            openRenameModal(c, conversations);
        };

        // =========================
        // Delete button
        // =========================
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "🗑️ Delete";

        deleteBtn.onclick = (e) => {
            e.stopPropagation();

            // Close dropdown
            menu.classList.remove("show");

            // Open custom delete modal
            openDeleteModal(c, conversations);
        };

        // Add buttons to menu
        menu.appendChild(renameBtn);
        menu.appendChild(deleteBtn);

        // Toggle menu
        menuBtn.onclick = (e) => {
            e.stopPropagation();

            // Close other open menus
            document.querySelectorAll(".conversation-menu").forEach((m) => {
                if (m !== menu) {
                    m.classList.remove("show");
                }
            });

            menu.classList.toggle("show");
        };

        // Prevent conversation selection when clicking menu
        menu.onclick = (e) => {
            e.stopPropagation();
        };

        // Select conversation
        div.onclick = () => {
            selectConversation(c.id);
        };

        // Active conversation
        if (c.id === currentConversation) {
            div.classList.add("active");
        }

        // Build row
        div.appendChild(title);
        div.appendChild(menuBtn);
        div.appendChild(menu);

        list.appendChild(div);
    });
}


// =====================================================
// RENAME MODAL
// =====================================================

function openRenameModal(conversation, conversations) {

    const modal = document.getElementById("rename-modal");
    const input = document.getElementById("rename-input");
    const cancelBtn = document.getElementById("rename-cancel-btn");
    const confirmBtn = document.getElementById("rename-confirm-btn");

    // Set current conversation name
    input.value = conversation.title;

    // Show modal
    modal.classList.add("show");

    // Focus input
    setTimeout(() => {
        input.focus();
        input.select();
    }, 100);

    // Remove previous event handlers
    const newCancelBtn = cancelBtn.cloneNode(true);
    const newConfirmBtn = confirmBtn.cloneNode(true);

    cancelBtn.replaceWith(newCancelBtn);
    confirmBtn.replaceWith(newConfirmBtn);

    // Cancel
    newCancelBtn.onclick = () => {
        closeRenameModal();
    };

    // Rename
    newConfirmBtn.onclick = async () => {
        const newName = input.value.trim();

        if (!newName) {
            input.focus();
            input.classList.add("input-error");

            setTimeout(() => {
                input.classList.remove("input-error");
            }, 500);

            return;
        }

        try {
            await renameConversation(conversation.id, newName);
            conversation.title = newName;
            closeRenameModal();
            renderConversations(conversations);
        } catch (err) {
            add(err.message || "Failed to rename conversation", "bot");
        }
    };

    // Rename using Enter key
    input.onkeydown = (e) => {
        if (e.key === "Enter") {
            newConfirmBtn.click();
        }

        if (e.key === "Escape") {
            closeRenameModal();
        }
    };
}


function closeRenameModal() {
    const modal = document.getElementById("rename-modal");
    modal.classList.remove("show");
}

async function renameConversation(id, newName) {
    const url = `${CONVERSATION_URL}${id}/rename/`;

    const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: newName }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to rename conversation");
    }

    return await response.json();
}

// =====================================================
// DELETE MODAL
// =====================================================

function openDeleteModal(conversation, conversations) {

    const modal = document.getElementById("delete-modal");
    const cancelBtn = document.getElementById("delete-cancel-btn");
    const confirmBtn = document.getElementById("delete-confirm-btn");

    // Show conversation name
    const nameElement = document.getElementById("delete-conversation-name");

    if (nameElement) {
        nameElement.innerText = conversation.title;
    }

    // Show modal
    modal.classList.add("show");

    // Remove previous event handlers
    const newCancelBtn = cancelBtn.cloneNode(true);
    const newConfirmBtn = confirmBtn.cloneNode(true);

    cancelBtn.replaceWith(newCancelBtn);
    confirmBtn.replaceWith(newConfirmBtn);

    // Cancel
    newCancelBtn.onclick = () => {
        closeDeleteModal();
    };

    // Delete
    newConfirmBtn.onclick = async () => {
        try {
            await deleteConversation(conversation.id);

            const index = conversations.findIndex(
                (item) => item.id === conversation.id
            );

            if (index !== -1) {
                conversations.splice(index, 1);
            }

            closeDeleteModal();
            renderConversations(conversations);
        } catch (err) {
            add(err.message || "Failed to delete conversation", "bot");
        }
    };

    // Escape key
    document.onkeydown = (e) => {
        if (e.key === "Escape") {
            closeDeleteModal();
        }
    };
}


function closeDeleteModal() {
    const modal = document.getElementById("delete-modal");
    modal.classList.remove("show");
}

async function deleteConversation(id) {
    const url = `${CONVERSATION_URL}${id}/`;

    const response = await fetch(url, {
        method: "DELETE",
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete conversation");
    }

    return await response.json();
}


// =====================================================
// CLOSE MODALS WHEN CLICKING BACKDROP
// =====================================================

document.addEventListener("click", (e) => {

    const renameModal = document.getElementById("rename-modal");
    const deleteModal = document.getElementById("delete-modal");

    if (e.target === renameModal) {
        closeRenameModal();
    }

    if (e.target === deleteModal) {
        closeDeleteModal();
    }
});

async function selectConversation(id) {
    if (currentConversation === id) return;
    currentConversation = id;
    await loadMessages(id);
    await loadConversations();
}

async function loadMessages(id) {
    const response = await fetch(`${CONVERSATION_URL}${id}/`);
    if (!response.ok) {
        messages.innerHTML = "";
        add("Unable to load conversation.", "bot");
        return;
    }

    const data = await response.json();
    messages.innerHTML = "";
    data.messages.forEach((m) => {
        add(m.content, m.role === "user" ? "user" : "bot");
    });
}

// close btn
document.getElementById("closeBtn").addEventListener("click", () => {
    window.electronAPI.closeWindow();
});

initConversations();
