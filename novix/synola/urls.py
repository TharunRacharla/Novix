from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path("chat/", views.chat, name='chat'),
    path("conversations/", views.conversations, name="conversations"),
    path("conversations/<int:conversation_id>/rename/", views.rename_conversation, name="rename_conversation"),
    path("conversations/<int:conversation_id>/", views.conversation_detail, name="conversation_detail"),
]