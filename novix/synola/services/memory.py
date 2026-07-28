chat_memory = []

def add_content(role, content):
    chat_memory.append({
        "role":role,
        "content":content
    })

def get_conversation():
    return chat_memory