#it handles the checking, and running of llama related stuff.

import logging
import subprocess, time, requests
from django.conf import settings
from .hardware import pick_runtime_config

logger = logging.getLogger(__name__)

ACTIVE_PATH = settings.DATA_DIR / "models" / "active_model.gguf"
BINARY = settings.BASE_DIR / "resources" / "llama" / "cpu" / "llama-b10818-bin-win-cpu-x64" / "llama-server.exe"
PORT = 8090

class InferenceEngine:
    def __init__(self):
        self.process = None

    def start(self, model_path=None):
        model_path = model_path or ACTIVE_PATH
        logger.info("Starting inference engine with model %s", model_path)
        if self.process and self.process.poll() is None:
            logger.info("Inference engine is already running")
            return
        if not model_path.exists():
            logger.error("Model was not found at %s", model_path)
            raise RuntimeError("No model installed, run first-time setup")
        if not BINARY.exists():
            logger.error("llama-server executable was not found at %s", BINARY)
            raise RuntimeError("llama.cpp runtime is missing")
        cfg = pick_runtime_config()
        self.process = subprocess.Popen([str(BINARY), "-m", str(model_path), "--host", "127.0.0.1", "--port", str(PORT), "-t", str(cfg["threads"]), "-c", str(cfg["ctx_size"]), "--chat-template", "llama3"])
        logger.info("llama-server process started with PID %s", self.process.pid)
        try:
            self._wait_healthy()
        except Exception:
            self.stop()
            raise

    def stop(self):
        if self.process:
            logger.info("Stopping llama-server process")
            self.process.terminate()
            self.process.wait(timeout=10)
            self.process = None
            logger.info("Inference engine stopped")

    def _wait_healthy(self, timeout=30):
        deadline = time.time() + timeout
        while time.time() < deadline:
            try:
                if requests.get(f"http://127.0.0.1:{PORT}/health", timeout=1).status_code == 200:
                    logger.info("Inference engine is healthy")
                    return
            except requests.ConnectionError:
                time.sleep(0.5)

        logger.error("Inference engine did not become healthy within %s seconds", timeout)
        raise RuntimeError("llama server did not go healthy in time")



engine = InferenceEngine()