from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
# Create your views here.
from django.http import HttpResponse, JsonResponse
import json

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
        body = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    message = body.get("message", "").strip()
    if not message:
        return JsonResponse({"error": "Message is required"}, status=400)

    reply = f"Hello! You said: {message}"

    response = JsonResponse({"reply": reply})
    response["Access-Control-Allow-Origin"] = "*"
    return response