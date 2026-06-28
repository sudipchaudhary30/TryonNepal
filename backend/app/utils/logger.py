from __future__ import annotations

import logging
import sys
from logging import Logger


def get_logger(name: str = 'dressmesh') -> Logger:
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(name)s | %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False
    return logger


logger = get_logger()
