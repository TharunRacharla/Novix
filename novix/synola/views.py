from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse, JsonResponse
import json

def home(request):
    return render(request, "index.html")

def chat(request):

    body = json.loads(request.body)

    msg = body["message"]

    # AI model here
    reply = "Hello! You said: " + msg

    return JsonResponse({
        "reply": reply
    })