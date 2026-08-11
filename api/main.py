import os
import io
import numpy as np
from PIL import Image

# Set Keras backend to torch to support running without full TensorFlow
os.environ["KERAS_BACKEND"] = "torch"
import keras

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="Plant Disease Detection API",
    description="API for predicting potato leaf diseases using a trained Keras CNN model.",
    version="1.0.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Class names corresponding to model output indices
CLASS_NAMES = [
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy"
]

# Model path resolution (flexible for local and Docker container environments)
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
        print("[WARN] Model file not found in any expected location.")

def read_file_as_image(data: bytes) -> np.ndarray:
    """Reads image bytes, converts to RGB, resizes to (256, 256), and normalizes pixels to [0.0, 1.0]."""
    try:
        image = Image.open(io.BytesIO(data)).convert("RGB")
        image = image.resize((256, 256))
        # Convert to float32 and normalize [0, 255] -> [0.0, 1.0] as expected by trained CNN
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

    # Validate image file type
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    bytes_data = await file.read()
    image_np = read_file_as_image(bytes_data)

    # Expand dimension to match batch format: (1, 256, 256, 3)
    img_batch = np.expand_dims(image_np, axis=0)

    # Execute model prediction
    predictions = MODEL.predict(img_batch)
    
    # Extract prediction array
    pred_scores = predictions[0]
    predicted_class = CLASS_NAMES[np.argmax(pred_scores)]
    confidence = float(np.max(pred_scores))

    return {
        "class": predicted_class,
        "confidence": round(confidence, 4)
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)