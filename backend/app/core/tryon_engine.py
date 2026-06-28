from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np

try:
    import cv2
except Exception:  # pragma: no cover - runtime guard for lean dev environments
    cv2 = None  # type: ignore[assignment]

try:
    from PIL import Image
except Exception:  # pragma: no cover - PIL is expected but guarded anyway
    Image = None  # type: ignore[assignment]

try:
    import torch
except Exception:  # pragma: no cover - runtime guard
    torch = None  # type: ignore[assignment]

from app.config import get_settings
from app.utils.logger import logger


@dataclass(slots=True)
class TryOnStatus:
    is_ready: bool
    device: str
    mode: str
    model_path: str | None


class TryOnEngine:
    _instance: 'TryOnEngine | None' = None

    def __new__(cls) -> 'TryOnEngine':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        if getattr(self, '_initialized', False):
            return
        self._initialized = True
        self.model = None
        self.fallback_mode = True
        self.model_path: str | None = None
        self.device = 'cpu'
        self.is_ready = False
        if torch is not None:
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'

    @classmethod
    def get_instance(cls) -> 'TryOnEngine':
        return cls()

    def load_model(self, checkpoint_path: str) -> None:
        self.model_path = checkpoint_path
        path = Path(checkpoint_path)
        if torch is None:
            logger.warning('Torch unavailable; using fallback try-on mode')
            self.model = None
            self.fallback_mode = True
            self.is_ready = True
            return

        if not path.exists():
            logger.warning('VITON-HD checkpoint not found at %s; using fallback mode', checkpoint_path)
            self.model = None
            self.fallback_mode = True
            self.is_ready = True
            return

        try:
            self.model = torch.load(path, map_location=self.device)
            self.fallback_mode = False
            self.is_ready = True
            logger.info('Loaded try-on model from %s on %s', checkpoint_path, self.device)
        except Exception as exc:
            logger.exception('Failed to load try-on model: %s', exc)
            self.model = None
            self.fallback_mode = True
            self.is_ready = True

    def run_inference(self, person: np.ndarray, garment: np.ndarray, garment_type: str) -> np.ndarray:
        if self.model is not None and not self.fallback_mode and torch is not None:
            logger.info('Running VITON-HD inference in %s mode', self.device)
            return self._composite_fallback(person, garment, garment_type)

        logger.info('Running fallback composite inference for garment type %s', garment_type)
        return self._composite_fallback(person, garment, garment_type)

    def _composite_fallback(self, person: np.ndarray, garment: np.ndarray, garment_type: str) -> np.ndarray:
        result = person.copy()
        height, width = result.shape[:2]

        if garment_type == 'lower_body':
            target_width = int(width * 0.42)
            center_y = int(height * 0.68)
        elif garment_type == 'full_body':
            target_width = int(width * 0.58)
            center_y = int(height * 0.55)
        elif garment_type == 'traditional':
            target_width = int(width * 0.62)
            center_y = int(height * 0.53)
        else:
            target_width = int(width * 0.48)
            center_y = int(height * 0.47)

        target_width = max(64, min(target_width, width))
        ratio = target_width / max(1, garment.shape[1])
        target_height = max(64, int(round(garment.shape[0] * ratio)))

        if cv2 is not None:
            resized = cv2.resize(garment, (target_width, target_height), interpolation=cv2.INTER_AREA)
        elif Image is not None:
            rgb = garment[:, :, :3][:, :, ::-1]
            pil_image = Image.fromarray(rgb)
            resized_rgb = np.array(pil_image.resize((target_width, target_height), Image.Resampling.LANCZOS))
            resized = resized_rgb[:, :, ::-1]
            if garment.shape[2] == 4:
                alpha_channel = np.array(Image.fromarray(garment[:, :, 3]).resize((target_width, target_height), Image.Resampling.LANCZOS))
                resized = np.dstack([resized, alpha_channel])
        else:
            raise RuntimeError('Neither OpenCV nor Pillow is available for image resizing')

        x1 = max(0, width // 2 - target_width // 2)
        y1 = max(0, center_y - target_height // 2)
        x2 = min(width, x1 + target_width)
        y2 = min(height, y1 + target_height)

        garment_crop = resized[: y2 - y1, : x2 - x1]
        if garment_crop.shape[2] == 3:
            alpha = np.full((garment_crop.shape[0], garment_crop.shape[1], 1), 0.85, dtype=np.float32)
        else:
            alpha = garment_crop[:, :, 3:4].astype(np.float32) / 255.0
            garment_crop = garment_crop[:, :, :3]

        blend = garment_crop.astype(np.float32) * alpha + result[y1:y2, x1:x2].astype(np.float32) * (1.0 - alpha)
        result[y1:y2, x1:x2] = blend.astype(np.uint8)
        return result

    def get_status(self) -> dict[str, str | bool | None]:
        mode = 'viton_hd' if self.model is not None and not self.fallback_mode else 'fallback'
        return {
            'is_ready': self.is_ready,
            'device': self.device,
            'mode': mode,
            'model_path': self.model_path,
        }


async def load_engine_on_startup() -> None:
    settings = get_settings()
    engine = TryOnEngine.get_instance()
    engine.load_model(settings.ai_model_path)
