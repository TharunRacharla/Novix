#handles the swapping of the AI model currently in use

import logging
import os
from django.conf import settings
from django.db import transaction
from synola.models import InstalledModel
from .inference_engine import engine

logger = logging.getLogger(__name__)

MODEL_DIR = settings.DATA_DIR / "models"
ACTIVE_PATH = MODEL_DIR / "active_model.gguf"
STAGING_PATH = MODEL_DIR / "active_model.gguf.new"
BACKUP_PATH = MODEL_DIR / "active_model.gguf.backup"

def swap_model(staged_path, metadata: dict):
    """Replace the active model and restore it if the candidate cannot start."""
    staged_path = os.fspath(staged_path)
    if not os.path.isfile(staged_path) or os.path.getsize(staged_path) == 0:
        raise RuntimeError("Staged model is missing or empty")

    required_metadata = {"display_name", "source_url", "size_bytes"}
    missing_metadata = required_metadata - metadata.keys()
    if missing_metadata:
        raise ValueError(f"Missing model metadata: {', '.join(sorted(missing_metadata))}")

    logger.info("Starting model swap from %s", staged_path)
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    had_active_model = ACTIVE_PATH.exists()
    if BACKUP_PATH.exists():
        BACKUP_PATH.unlink()

    engine.stop()
    try:
        if had_active_model:
            os.replace(ACTIVE_PATH, BACKUP_PATH)
        os.replace(staged_path, ACTIVE_PATH)
        engine.start(ACTIVE_PATH)
        with transaction.atomic():
            InstalledModel.objects.all().delete()
            InstalledModel.objects.create(**metadata)
        if BACKUP_PATH.exists():
            try:
                BACKUP_PATH.unlink()
            except OSError:
                logger.warning("Could not remove old model backup at %s", BACKUP_PATH)
    except Exception:
        logger.exception("Model swap failed; restoring previous model")
        engine.stop()
        if ACTIVE_PATH.exists():
            ACTIVE_PATH.unlink()
        if had_active_model and BACKUP_PATH.exists():
            os.replace(BACKUP_PATH, ACTIVE_PATH)
        if had_active_model:
            engine.start(ACTIVE_PATH)
        raise

    logger.info("Model swap completed; active model is %s", ACTIVE_PATH)