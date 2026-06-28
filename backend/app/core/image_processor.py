from __future__ import annotations

import base64
import binascii

import numpy as np

try:
    import cv2
except Exception:  # pragma: no cover - runtime guard for lean dev environments
    cv2 = None  # type: ignore[assignment]

from PIL import Image

try:
    import torch
except Exception as exc:  # pragma: no cover - import guard for environments without torch
    torch = None  # type: ignore[assignment]
    _torch_import_error = exc
else:
    _torch_import_error = None


def resize_and_pad(image: np.ndarray, target_size: tuple[int, int] = (768, 1024)) -> np.ndarray:
    """Resize an image while preserving aspect ratio and pad with white."""

    target_width, target_height = target_size
    height, width = image.shape[:2]
    scale = min(target_width / width, target_height / height)
    resized_width = max(1, int(round(width * scale)))
    resized_height = max(1, int(round(height * scale)))
    if cv2 is not None:
        resized = cv2.resize(image, (resized_width, resized_height), interpolation=cv2.INTER_AREA)
    else:
        resized = np.array(Image.fromarray(image[:, :, ::-1]).resize((resized_width, resized_height), Image.Resampling.LANCZOS))[:, :, ::-1]

    canvas = np.full((target_height, target_width, 3), 255, dtype=np.uint8)
    x_offset = (target_width - resized_width) // 2
    y_offset = (target_height - resized_height) // 2
    canvas[y_offset : y_offset + resized_height, x_offset : x_offset + resized_width] = resized
    return canvas


def remove_background(image: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Remove the background using GrabCut and return the masked image plus binary mask."""

    if cv2 is None:
        mask = np.ones(image.shape[:2], dtype='uint8')
        return image.copy(), mask

    mask = np.zeros(image.shape[:2], np.uint8)
    height, width = image.shape[:2]
    rect = (max(1, width // 10), max(1, height // 10), max(1, width * 8 // 10), max(1, height * 8 // 10))
    bg_model = np.zeros((1, 65), np.float64)
    fg_model = np.zeros((1, 65), np.float64)

    try:
        cv2.grabCut(image, mask, rect, bg_model, fg_model, 5, cv2.GC_INIT_WITH_RECT)
        binary_mask = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 1, 0).astype('uint8')
    except cv2.error:
        binary_mask = np.ones_like(mask, dtype='uint8')

    image_no_bg = cv2.bitwise_and(image, image, mask=binary_mask)
    return image_no_bg, binary_mask


def normalize_for_viton(image: np.ndarray) -> 'torch.Tensor':
    """Convert a BGR image to a normalized batch tensor for VITON-style models."""

    if torch is None:
        raise RuntimeError('torch is required for normalize_for_viton') from _torch_import_error

    if cv2 is not None:
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    else:
        rgb = image[:, :, ::-1].astype(np.float32) / 255.0
    tensor = torch.from_numpy(rgb).permute(2, 0, 1)
    mean = torch.tensor([0.5, 0.5, 0.5], dtype=torch.float32).view(3, 1, 1)
    std = torch.tensor([0.5, 0.5, 0.5], dtype=torch.float32).view(3, 1, 1)
    normalized = (tensor - mean) / std
    return normalized.unsqueeze(0)


def tensor_to_image(tensor: 'torch.Tensor') -> np.ndarray:
    """Convert a normalized tensor back into a BGR image."""

    if torch is None:
        raise RuntimeError('torch is required for tensor_to_image') from _torch_import_error

    image_tensor = tensor.detach().cpu()
    if image_tensor.dim() == 4:
        image_tensor = image_tensor.squeeze(0)
    mean = torch.tensor([0.5, 0.5, 0.5], dtype=image_tensor.dtype).view(3, 1, 1)
    std = torch.tensor([0.5, 0.5, 0.5], dtype=image_tensor.dtype).view(3, 1, 1)
    denormalized = image_tensor * std + mean
    denormalized = denormalized.clamp(0.0, 1.0)
    rgb = (denormalized.permute(1, 2, 0).numpy() * 255.0).astype(np.uint8)
    return rgb[:, :, ::-1] if cv2 is None else cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def image_to_base64(image: np.ndarray, quality: int = 85) -> str:
    """Encode a BGR image as a JPEG data URI string."""

    if cv2 is not None:
        encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), int(quality)]
        success, buffer = cv2.imencode('.jpg', image, encode_params)
        if not success:
            raise ValueError('Failed to encode image as JPEG')
        encoded = base64.b64encode(buffer.tobytes()).decode('utf-8')
    else:
        from io import BytesIO

        pil_image = Image.fromarray(image[:, :, ::-1])
        buffer = BytesIO()
        pil_image.save(buffer, format='JPEG', quality=quality)
        encoded = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return f'data:image/jpeg;base64,{encoded}'


def base64_to_image(b64: str) -> np.ndarray:
    """Decode a base64 string or data URI into a BGR image."""

    payload = b64.split(',', 1)[1] if ',' in b64 else b64
    try:
        image_bytes = base64.b64decode(payload)
    except binascii.Error as exc:
        raise ValueError('Invalid base64 image payload') from exc

    if cv2 is not None:
        np_buffer = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError('Decoded bytes are not a valid image')
        return image

    from io import BytesIO

    pil_image = Image.open(BytesIO(image_bytes)).convert('RGB')
    return np.array(pil_image)[:, :, ::-1]


def validate_image(file_bytes: bytes, max_mb: float = 10.0) -> bool:
    """Return True if the payload is a valid JPEG or PNG image under the size limit."""

    if len(file_bytes) > int(max_mb * 1024 * 1024):
        return False

    if cv2 is not None:
        np_buffer = np.frombuffer(file_bytes, dtype=np.uint8)
        image = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)
        if image is None:
            return False
    else:
        from io import BytesIO

        try:
            Image.open(BytesIO(file_bytes)).verify()
        except Exception:
            return False

    header = file_bytes[:8]
    jpeg_signature = header.startswith(b'\xff\xd8')
    png_signature = header.startswith(b'\x89PNG\r\n\x1a\n')
    return jpeg_signature or png_signature
