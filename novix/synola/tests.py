from django.test import TestCase
from unittest.mock import Mock, patch

from synola.models import Conversation, ConversationSummary, Message
from synola.services import ai
from synola.services.context_manager import build_context
from synola.services.inference_engine import InferenceEngine


class BuildContextTests(TestCase):
    def test_build_context_includes_summary_without_calling_relation(self):
        conversation = Conversation.objects.create(title="Test chat")
        Message.objects.create(conversation=conversation, role="user", content="hello")
        Message.objects.create(conversation=conversation, role="assistant", content="hi there")
        ConversationSummary.objects.create(
            conversation=conversation,
            content="Remember the user likes cats.",
        )

        context = build_context(conversation)

        self.assertEqual(context[0]["role"], "system")
        self.assertIn("Remember the user likes cats.", context[0]["content"])
        self.assertEqual(context[1]["role"], "user")
        self.assertEqual(context[2]["role"], "assistant")


class ChatCompletionTests(TestCase):
    @patch("synola.services.ai.requests.post")
    def test_generate_uses_chat_completions_endpoint(self, post):
        response = Mock()
        response.ok = True
        response.json.return_value = {
            "choices": [{"message": {"content": "A coherent reply."}}]
        }
        post.return_value = response

        reply = ai.generate([{"role": "user", "content": "Hello"}])

        self.assertEqual(reply, "A coherent reply.")
        post.assert_called_once()
        endpoint, kwargs = post.call_args
        self.assertEqual(endpoint[0], "http://127.0.0.1:8090/v1/chat/completions")
        self.assertFalse(kwargs["json"]["stream"])
        self.assertEqual(kwargs["json"]["messages"][-1], {"role": "user", "content": "Hello"})
        self.assertEqual(kwargs["timeout"], 120)


class InferenceEngineTests(TestCase):
    @patch("synola.services.inference_engine.requests.get")
    @patch("synola.services.inference_engine.subprocess.Popen")
    @patch("synola.services.inference_engine.pick_runtime_config")
    @patch("synola.services.inference_engine.ACTIVE_PATH")
    def test_start_waits_for_health_and_stop_terminates_process(
        self, active_path, runtime_config, popen, get
    ):
        process = Mock()
        process.poll.return_value = None
        popen.return_value = process
        runtime_config.return_value = {"threads": 2, "ctx_size": 2048}
        active_path.exists.return_value = True
        get.return_value.status_code = 200
        engine = InferenceEngine()

        engine.start()
        engine.stop()

        popen.assert_called_once()
        get.assert_called_once_with("http://127.0.0.1:8090/health", timeout=1)
        process.terminate.assert_called_once_with()
        process.wait.assert_called_once_with(timeout=10)
