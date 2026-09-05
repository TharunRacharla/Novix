#detecting the underlying hardware

import logging

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
