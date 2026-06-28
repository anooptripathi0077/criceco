import base64
import cv2
import numpy as np
import os
import requests
from typing import List

YUNET_MODEL_PATH = "face_detection_yunet.onnx"
SFACE_MODEL_PATH = "face_recognition_sface.onnx"

def download_model_if_missing(filename: str, url: str):
    """Downloads the lightweight ONNX models automatically if you don't have them."""
    if not os.path.exists(filename):
        print(f"Downloading lightweight model {filename} (~3MB)...")
        response = requests.get(url, stream=True)
        with open(filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print("Download complete!")

download_model_if_missing(YUNET_MODEL_PATH, "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx")
download_model_if_missing(SFACE_MODEL_PATH, "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx")

detector = cv2.FaceDetectorYN.create(YUNET_MODEL_PATH, "", (320, 320))
recognizer = cv2.FaceRecognizerSF.create(SFACE_MODEL_PATH, "")

def decode_base64_image(base64_string: str) -> np.ndarray:
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    img_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def generate_face_embedding(image_array: np.ndarray) -> List[float]:
    """Uses OpenCV SFace to extract a lightweight 128-dimensional vector."""
    height, width, _ = image_array.shape
    detector.setInputSize((width, height))
    
    _, faces = detector.detect(image_array)
    if faces is None:
         raise ValueError("No face detected in the provided image.")
            
    face_align = recognizer.alignCrop(image_array, faces[0])
    face_feature = recognizer.feature(face_align)

    return face_feature[0].tolist()

def calculate_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    a = np.array(vec1)
    b = np.array(vec2)
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0: return 0.0
    return float(dot_product / (norm_a * norm_b))