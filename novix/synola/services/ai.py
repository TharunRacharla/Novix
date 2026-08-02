"""
We will manage llm interfce here

Ollama provides several HTTP endpoints. The most common are:
Endpoint	Purpose
/api/generate	Generate text from a prompt
/api/chat	Chat with message history (recommended for chat apps)
/api/tags	List installed models
/api/show	Show model information
"""

import requests

OLLAMA_URL = "http://localhost:11434/api/chat" #REST API endpoint exposed by the Ollama server
MODEL = "llama3.2:1b-instruct-q4_0"


def generate(messages):
    messages = [
        {
            "role": "system",
            "content": (
                "You are Synola.\n"
                "Always reply in English.\n"
                "Never make up names or facts.\n"
                "Only use information present in the conversation.\n"
                "If the answer is unknown, say you don't know."
            )
        }
    ] + messages
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "messages": messages,
            "stream": False,
        },
        timeout=120,
    )
    if not response.ok:
        print(response.text)

    response.raise_for_status()
    return response.json()["message"]["content"].strip()
