import os
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.face_utils import (
    calculate_cosine_similarity,
    decode_base64_image,
    generate_face_embedding,
)

router = APIRouter()
MATCH_THRESHOLD = float(os.getenv("FACE_MATCH_THRESHOLD", "0.55"))


class ImagePayload(BaseModel):
    image_base64: str


class VerifyPayload(BaseModel):
    live_image_base64: str
    stored_embedding: List[float]


@router.post("/generate-embedding")
async def create_embedding(payload: ImagePayload):
    try:
        img_array = decode_base64_image(payload.image_base64)
        vector = generate_face_embedding(img_array)
        return {"embedding": vector}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal AI Server Error")


@router.post("/verify-face")
async def verify_face(payload: VerifyPayload):
    try:
        live_img_array = decode_base64_image(payload.live_image_base64)
        live_vector = generate_face_embedding(live_img_array)

        similarity = calculate_cosine_similarity(live_vector, payload.stored_embedding)
        is_match = similarity >= MATCH_THRESHOLD

        return {
            "match": is_match,
            "similarity_score": round(similarity, 4),
            "threshold": MATCH_THRESHOLD,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal AI Server Error")