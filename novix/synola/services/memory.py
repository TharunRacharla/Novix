from django.utils import timezone

from synola.models import Conversation, Message


def new_conversation(name="New Conversation"):
    return Conversation.objects.create(name=name)


def get_latest_conversation():
    conversation = Conversation.objects.order_by("-created_at").first()
    if conversation is None:
        conversation = new_conversation()
    return conversation


def add_content(role, content, conversation=None):
    if conversation is None:
        conversation = get_latest_conversation()
    return Message.objects.create(conversation=conversation, role=role, content=content)


def get_conversation():
    conversation = get_latest_conversation()
    return [
        {"role": message.role, "content": message.content}
        for message in conversation.messages.order_by("timestamp")
    ]