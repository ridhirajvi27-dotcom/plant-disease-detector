import os
import io
import numpy as np
from PIL import Image

os.environ["KERAS_BACKEND"] = "torch"
import keras

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

from rag_engine import generate_agronomist_response

class ChatRequest(BaseModel):
    disease: Optional[str] = "Potato___healthy"
    message: str

app = FastAPI(
    title="Plant Disease Detection API",
    description="API for predicting potato leaf diseases using a trained Keras CNN model.",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


CLASS_NAMES = [
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy"
]


POSSIBLE_PATHS = [
    os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "models", "1.keras")),
    os.path.normpath(os.path.join(os.path.dirname(__file__), "models", "1.keras")),
    os.path.normpath(os.path.join(os.path.dirname(__file__), "1.keras")),
    "models/1.keras",
    "1.keras"
]

MODEL = None
MODEL_PATH = None

@app.on_event("startup")
def load_model():
    global MODEL, MODEL_PATH
    for path in POSSIBLE_PATHS:
        if os.path.exists(path):
            MODEL_PATH = path
            break

    if MODEL_PATH and os.path.exists(MODEL_PATH):
        try:
            MODEL = keras.models.load_model(MODEL_PATH)
            print(f"[OK] Model successfully loaded from: {MODEL_PATH}")
        except Exception as e:
            print(f"[ERROR] Error loading model from {MODEL_PATH}: {e}")
    else:
        print("[WARN] Model file not found locally. Downloading from Hugging Face...")
        import requests
        
        # Ensure models directory exists
        os.makedirs("models", exist_ok=True)
        # Direct download link to the uploaded model in the HF Space
        model_url = "https://huggingface.co/spaces/Rir25/plant-disease-api/resolve/main/models/1.keras"
        
        try:
            print("Downloading model (this may take a minute)...")
            response = requests.get(model_url, stream=True)
            response.raise_for_status()
            with open("models/1.keras", "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            MODEL_PATH = "models/1.keras"
            MODEL = keras.models.load_model(MODEL_PATH)
            print("[OK] Model successfully downloaded and loaded.")
        except Exception as e:
            print(f"[ERROR] Failed to download or load model: {e}")

def read_file_as_image(data: bytes) -> np.ndarray:
    """Reads image bytes, converts to RGB, resizes to (256, 256), and normalizes pixels to [0.0, 1.0]."""
    try:
        image = Image.open(io.BytesIO(data)).convert("RGB")
        image = image.resize((256, 256))
        
        image_np = np.array(image, dtype=np.float32) / 255.0
        return image_np
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")

@app.get("/ping")
async def ping():
    return {
        "status": "alive",
        "model_loaded": MODEL is not None
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if MODEL is None:
        raise HTTPException(status_code=500, detail="Model is not loaded on the server.")

   
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    bytes_data = await file.read()
    image_np = read_file_as_image(bytes_data)

   
    img_batch = np.expand_dims(image_np, axis=0)


    predictions = MODEL.predict(img_batch)
    
 
    pred_scores = predictions[0]
    predicted_class = CLASS_NAMES[np.argmax(pred_scores)]
    confidence = float(np.max(pred_scores))

    return {
        "class": predicted_class,
        "confidence": round(confidence, 4)
    }

@app.post("/chat")
async def chat_agronomist(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Chat message cannot be empty.")
    
    response_data = generate_agronomist_response(req.disease, req.message)
    return response_data

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)