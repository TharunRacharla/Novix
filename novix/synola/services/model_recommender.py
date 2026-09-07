# synola/services/model_recommender.py
import json
import re
import logging
from pathlib import Path
from synola.services.model_downloader import download_model
from synola.services.model_manager import STAGING_PATH, swap_model

logger = logging.getLogger(__name__)
CATALOG_PATH = Path(__file__).resolve().parent / "models.json"


def install_recommended_model(suggestion: dict):
    m = suggestion["model"]
    if not m.get("download_url") or not m.get("size_bytes"):
        raise RuntimeError("The recommended model has no verified download metadata")
    download_model(m["download_url"], STAGING_PATH, expected_sha_256=m.get("sha_256") or None,
                    expected_size=m["size_bytes"], max_retries=3)
    swap_model(STAGING_PATH, {
        "display_name": m["model"],
        "source_url": m["download_url"],
        "sha_256": m.get("sha_256", ""),
        "size_bytes": m["size_bytes"],
        "context_length": int(re.findall(r"\d+", m["context_length"])[0]) if m.get("context_length") else 4096,
    })

def _load_catalog():
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _parse_gb(value: str) -> float:
    numbers = re.findall(r"[\d.]+", value or "")
    return float(numbers[-1]) if numbers else 0.0


def _classify_device(profile: dict, device_classes: list) -> dict:
    desktop_classes = [
        dc for dc in device_classes
        if any(k in dc["device_class"].lower() for k in ("laptop", "desktop", "workstation"))
    ]
    if not desktop_classes:
        raise RuntimeError("No desktop device classes are configured")
    best = desktop_classes[0]
    for dc in desktop_classes:
        if profile["ram_gb"] >= dc["ram_gb"]:
            best = dc
    return best

def recommend_model(profile: dict) -> dict:
    catalog = _load_catalog()
    device_class = _classify_device(profile, catalog["device_classes"])

    candidates = device_class["recommended_models"]
    fitting = [m for m in candidates if _parse_gb(m.get("ram_footprint")) <= profile["ram_gb"] * 0.7]

    if not fitting:
        logger.warning("No installable model fit profile %s", profile)
        all_candidates = [
            m for dc in catalog["device_classes"] for m in dc["recommended_models"]
        ]
        fitting = sorted(all_candidates, key=lambda m: _parse_gb(m.get("ram_footprint")))[:1]

    if not fitting:
        raise RuntimeError("No models available in catalog")

    chosen = max(fitting, key=lambda m: _parse_gb(m["ram_footprint"]))
    return {
        "device_class": device_class["device_class"],
        "model": chosen,
        "installable": _is_installable(chosen),
        "reason": f"Fits within {profile['ram_gb']}GB RAM"
                  + (f", {profile['vram_gb']}GB VRAM ({profile['gpu_name']})" if profile["vram_gb"] else " (CPU-only)"),
    }


def _is_installable(model: dict) -> bool:
    return bool(model.get("download_url") and model.get("size_bytes"))