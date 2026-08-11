# 🌿 PlantCare AI — Plant Disease Detection

AI-powered potato leaf disease detection using a **Keras CNN model**, served via a **FastAPI** backend and a modern **React + Vite** frontend.

Upload a photo of a potato plant leaf and get instant diagnosis: **Early Blight**, **Late Blight**, or **Healthy** — with confidence scores and treatment recommendations.

---

## 📁 Project Structure

```
Plant-Disease-Detection/
├── api/                    # FastAPI backend
│   ├── main.py             # API server (predict & ping endpoints)
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Docker config for Hugging Face Spaces
│   └── README.md           # HF Spaces metadata
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── ImageUploader.jsx
│   │       └── PredictionResult.jsx
│   ├── index.html
│   └── package.json
├── models/                 # Keras model (not tracked in git)
│   └── 1.keras
├── training/               # Jupyter notebooks used for training
├── plan.md                 # Future enhancement roadmap
└── README.md
```

---

## 🚀 Local Setup & Run

### Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/ridhirajvi27-dotcom/plant-disease-detector.git
cd plant-disease-detector
```

### 2. Download the Trained Model

The `1.keras` model file (~178 MB) is hosted on Hugging Face and is **not included in the git repo**.

Download it and place it in the `models/` folder:

```bash
mkdir models
# Option A: Using huggingface-cli
huggingface-cli download Rir25/plant-disease-api models/1.keras --repo-type space --local-dir .

# Option B: Using Python
python -c "from huggingface_hub import hf_hub_download; hf_hub_download(repo_id='Rir25/plant-disease-api', filename='models/1.keras', repo_type='space', local_dir='.')"
```

### 3. Set Up the Backend (FastAPI)

```bash
# Install Python dependencies
cd api
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```

The API will be running at **http://localhost:8000**

Verify it works:
- Health check: [http://localhost:8000/ping](http://localhost:8000/ping)
- Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. Set Up the Frontend (React + Vite)

Open a **new terminal** window:

```bash
# Install Node dependencies
cd frontend
npm install

# Start the development server
npm run dev
```

The frontend will open at **http://localhost:3000**

> **Note:** For local development, update `API_BASE_URL` in `frontend/src/App.jsx` to:
> ```javascript
> const API_BASE_URL = 'http://localhost:8000';
> ```

---

## 🌐 Live Deployment

| Component | Platform | URL |
| :--- | :--- | :--- |
| **Backend API** | Hugging Face Spaces | `https://rir25-plant-disease-api.hf.space` |
| **Frontend** | Vercel / Netlify | *(deploy frontend/dist)* |

---

## 🛠️ API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/ping` | Health check — returns `{ status, model_loaded }` |
| `POST` | `/predict` | Upload an image file → returns `{ class, confidence }` |
| `GET` | `/docs` | Interactive Swagger UI documentation |

---

## 🧠 Model Details

- **Architecture**: CNN (Convolutional Neural Network)
- **Framework**: Keras 3 with PyTorch backend
- **Input**: 256×256 RGB leaf images, normalized to [0.0, 1.0]
- **Classes**: `Potato___Early_blight`, `Potato___Late_blight`, `Potato___healthy`
- **Dataset**: [PlantVillage](https://www.kaggle.com/datasets/arjuntejaswi/plant-village)

---

## 📜 License

MIT
