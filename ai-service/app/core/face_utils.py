import base64
import json
import os
from typing import List, Sequence

import cv2
import numpy as np
import requests

YUNET_MODEL_PATH = "face_detection_yunet.onnx"
SFACE_MODEL_PATH = "face_recognition_sface.onnx"


def download_model_if_missing(filename: str, url: str):
    """Downloads the lightweight ONNX models automatically if you don't have them."""
    if not os.path.exists(filename):
        print(f"Downloading lightweight model {filename} (~3MB)...")
        response = requests.get(url, stream=True)
        with open(filename, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print("Download complete!")


download_model_if_missing(
    YUNET_MODEL_PATH,
    "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx",
)
download_model_if_missing(
    SFACE_MODEL_PATH,
    "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx",
)

detector = cv2.FaceDetectorYN.create(YUNET_MODEL_PATH, "", (320, 320))
recognizer = cv2.FaceRecognizerSF.create(SFACE_MODEL_PATH, "")


def _normalize_vector(vector: np.ndarray) -> np.ndarray:
    values = np.asarray(vector, dtype=np.float32).reshape(-1)
    norm = np.linalg.norm(values)
    if norm < 1e-12:
        return np.zeros(values.shape, dtype=np.float32)
    return values / norm


def _coerce_embedding(embedding: Sequence[float]) -> np.ndarray:
    if isinstance(embedding, (str, bytes)):
        embedding = json.loads(embedding)

    values = []
    for value in embedding:
        values.append(float(value))
    return np.asarray(values, dtype=np.float32).reshape(-1)


def decode_base64_image(base64_string: str) -> np.ndarray:
    if not base64_string:
        raise ValueError("No image data provided.")

    if "," in base64_string:
        base64_string = base64_string.split(",")[1]

    img_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Unable to decode image data.")
    return img


def generate_face_embedding(image_array: np.ndarray) -> List[float]:
    """Uses OpenCV SFace to extract a normalized 128-dimensional feature vector."""
    if image_array is None or image_array.size == 0:
        raise ValueError("No valid image provided.")
    if len(image_array.shape) != 3:
        raise ValueError("Expected a color image.")

    height, width, _ = image_array.shape
    detector.setInputSize((width, height))

    _, faces = detector.detect(image_array)
    if faces is None or len(faces) == 0:
        raise ValueError("No face detected in the provided image.")

    face = faces[0]
    if len(faces) > 1:
        face = max(faces, key=lambda rect: (rect[2] - rect[0]) * (rect[3] - rect[1]))

    face_align = recognizer.alignCrop(image_array, face)
    face_feature = recognizer.feature(face_align)
    if face_feature is None or len(face_feature) == 0:
        raise ValueError("Unable to extract a face embedding.")

    embedding = _normalize_vector(face_feature[0])
    return embedding.tolist()


def calculate_cosine_similarity(vec1: Sequence[float], vec2: Sequence[float]) -> float:
    a = _coerce_embedding(vec1)
    b = _coerce_embedding(vec2)

    if a.size != b.size:
        raise ValueError("Embedding dimensions do not match.")

    normalized_a = _normalize_vector(a)
    normalized_b = _normalize_vector(b)
    similarity = float(np.dot(normalized_a, normalized_b))
    return float(np.clip(similarity, -1.0, 1.0))