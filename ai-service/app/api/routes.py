from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.core.face_utils import decode_base64_image, generate_face_embedding, calculate_cosine_similarity

router = APIRouter()

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
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal AI Server Error")

@router.post("/verify-face")
async def verify_face(payload: VerifyPayload):
    try:
        live_img_array = decode_base64_image(payload.live_image_base64)
        live_vector = generate_face_embedding(live_img_array)
        
        similarity = calculate_cosine_similarity(live_vector, payload.stored_embedding)
        
        is_match = similarity >= 0.70 
        
        return {
            "match": is_match,
            "similarity_score": round(similarity, 4)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))