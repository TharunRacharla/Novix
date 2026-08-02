from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
# Create your views here.
from django.http import HttpResponse, JsonResponse
import json
from synola.services.ai import generate
from synola.services.memory import get_conversation, add_content
def home(request):
    return render(request, "index.html")

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

    message = body.get("message", "").strip()  #user's message
    print(message)
    add_content(role='user', content=message) #goes as user's request to current conversation
    if not message:
        return JsonResponse({"error": "Message is required"}, status=400)

    reply = generate(get_conversation())
    add_content(role='assistant', content=reply) #goes as assistant's response to current conversation
    print(get_conversation())
    response = JsonResponse({"reply": reply})
    response["Access-Control-Allow-Origin"] = "*"
    return response