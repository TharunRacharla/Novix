#detecting the underlying hardware

import logging
import subprocess
import psutil

logger = logging.getLogger(__name__)

def pick_runtime_config():
    physical_cores = psutil.cpu_count(logical=False) or 4
    total_ram_gb = psutil.virtual_memory().total / (1024 ** 3)

    threads = max(physical_cores-1, 1) #leave one core for os/ui
    ctx_size = 4096 if total_ram_gb >= 8 else 2048

    config = {"threads":threads, "ctx_size":ctx_size}
    logger.info("Selected inference configuration: %s threads, %s context tokens", threads, ctx_size)
    return config

def get_hardware_profile() -> dict:
    cpu_cores = psutil.cpu_count(logical=False) or psutil.cpu_count() or 4
    ram_gb = round(psutil.virtual_memory().total / (1024**3), 1)
    vram_gb, gpu_name = _detect_gpu_vram()
    return {"cpu_cores":cpu_cores, "ram_gb":ram_gb, "vram_gb":vram_gb, "gpu_name":gpu_name}

def _detect_gpu_vram():
    try:
        result = subprocess.run(["nvidia-smi", "--query-gpu=name,memory.total", "--format=csv,noheader,nounits"], capture_output=True, text=True, timeout=3)
        if result.returncode == 0 and result.stdout.strip():
            name, mem_mb = result.stdout.strip().split(",")
            return round(int(mem_mb.strip())/1024, 1), name.strip()
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    return 0, None
