# from django.utils import timezone

# from synola.services.conversations import get_conversation

# def add_content(role, content, conversation=None):
#     if conversation is None:
#         conversation = get_latest_conversation()
#     return Message.objects.create(conversation=conversation, role=role, content=content)


# def get_conversation():
#     conversation = get_latest_conversation()
#     return [
#         {"role": message.role, "content": message.content}
#         for message in conversation.messages.order_by("timestamp")
#     ]