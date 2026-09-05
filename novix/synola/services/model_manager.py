#handles the swapping of the AI model currently in use

import logging
import os
from django.conf import settings
from synola.models import InstalledModel
from inference_engine import engine

logger = logging.getLogger(__name__)

MODEL_DIR = settings.DATA_DIR / "models"
ACTIVE_PATH = MODEL_DIR / "active_model.gguf"
STAGING_PATH = MODEL_DIR / "active_model.gguf.new"

def swap_model(staged_path, metadata: dict):
    """call only after the stage path is downloaded and verified"""
    logger.info("Starting model swap from %s", staged_path)
    engine.stop()
    os.replace(staged_path, ACTIVE_PATH)
    InstalledModel.objects.all().delete()
    InstalledModel.objects.create(filename="active_model.gguf", **metadata)
    engine.start()
    logger.info("Model swap completed; active model is %s", ACTIVE_PATH)