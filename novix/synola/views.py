from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
# Create your views here.
from django.http import HttpResponse, JsonResponse
import json
from synola.services.ai import generate
# from synola.services.memory import get_conversation, add_content
from synola.models import Conversation, Message

def home(request):
    return render(request, "index.html")

@csrf_exempt
def conversations(request):

    if request.method == "GET":

        data = Conversation.objects.order_by("-updated_at")

        return JsonResponse({
            "conversations": [
                {
                    "id": c.id,
                    "title": c.title,
                    "created_at": c.created_at,
                    "updated_at": c.updated_at,
                }
                for c in data
            ]
        })

    elif request.method == "POST":

        conversation = Conversation.objects.create()

        return JsonResponse({
            "id": conversation.id,
            "title": conversation.title
        })

    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def conversation_detail(request, conversation_id):

    try:
        conversation = Conversation.objects.get(id=conversation_id)

    except Conversation.DoesNotExist:
        return JsonResponse(
            {"error": "Conversation not found"},
            status=404
        )

    if request.method == "GET":

        messages = conversation.messages.order_by("timestamp")

        return JsonResponse({
            "id": conversation.id,
            "title": conversation.title,
            "messages": [
                {
                    "role": m.role,
                    "content": m.content,
                    "timestamp": m.timestamp,
                }
                for m in messages
            ]
        })

    elif request.method == "DELETE":

        conversation.delete()

        return JsonResponse({"status": "deleted"})

    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def rename_conversation(request, conversation_id):

    if request.method != "PUT":
        return JsonResponse({"error": "Use PUT"}, status=405)

    try:
        conversation = Conversation.objects.get(id=conversation_id)

    except Conversation.DoesNotExist:
        return JsonResponse(
            {"error": "Conversation not found"},
            status=404
        )

    body = json.loads(request.body)

    conversation.title = body.get("title", conversation.title)
    conversation.save()

    return JsonResponse({
        "id": conversation.id,
        "title": conversation.title
    })

@csrf_exempt
def chat(request):
    if request.method == "OPTIONS":
        response = JsonResponse({"ok": True})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    if request.method != "POST":
        return JsonResponse({"error": "Use POST request"}, status=405)

    try:
        body = json.loads(request.body.decode("utf-8")) #input message comes here as json
        print(body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    conversation_id = body.get("conversation_id")
    message = body.get("message", "").strip()

    if not conversation_id:
        return JsonResponse({"error": "conversation_id is required"}, status=400)

    if not message:
        return JsonResponse({"error": "Message is required"}, status=400)

    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return JsonResponse({"error": "Conversation not found"}, status=404)

    Message.objects.create(
        conversation=conversation,
        role="user",
        content=message
    )

    messages = [
        {"role": m.role, "content": m.content}
        for m in conversation.messages.order_by("timestamp")
    ]

    reply = generate(messages)

    Message.objects.create(
        conversation=conversation,
        role="assistant",
        content=reply
    )

    response = JsonResponse({"reply": reply})
    response["Access-Control-Allow-Origin"] = "*"
    return response