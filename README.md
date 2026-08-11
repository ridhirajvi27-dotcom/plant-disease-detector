# 🌿 PlantCare AI — Plant Disease Detection & RAG Agronomist

**PlantCare AI** is an end-to-end intelligent agricultural platform combining computer vision for instant leaf disease classification with a **Retrieval-Augmented Generation (RAG) AI Agronomist Assistant**.

Upload a potato leaf photo to diagnose **Early Blight**, **Late Blight**, or **Healthy** status, and chat in real-time with an AI agronomist for grounded organic treatments, fungicide dosages, and field prevention strategies.

---


https://github.com/user-attachments/assets/a1d13fcb-ae88-4565-b312-80d62929f351


---

## Key Features

###  1. AI Leaf Disease Detection (Computer Vision)
- **Instant Diagnosis**: Classifies potato leaf images into **Early Blight**, **Late Blight**, or **Healthy**.
- **High-Accuracy CNN**: Powered by a custom **Keras 3 CNN model** trained on the PlantVillage dataset.


### 2. Hybrid RAG AI Agronomist Chatbot
- **Grounded Agronomic Data**: Utilizes a Retrieval-Augmented Generation (RAG) engine grounded in verified agricultural manuals (`api/knowledge_base/potato_diseases.json`).
- **Context-Aware Recommendations**: Automatically injects the active leaf diagnosis into the prompt context to prevent AI hallucinations.
- **Dual-Tier Hybrid Architecture**:
  - **Tier 1 (LLM Generation)**: Connects to **Groq (Llama 3.1 8B)** when API keys are configured.
  - **Tier 2 (Zero-Cost Offline Fallback)**: Built-in intelligent rule & knowledge retrieval engine for immediate, reliable answers without external API dependency.
- **Suggested Follow-up Questions**: Dynamically generated prompts tailored to the plant's health status.


---

##  Project Structure

```
Plant-Disease-Detection/
├── api/                            # FastAPI backend
│   ├── main.py                     # Server endpoints (/predict, /chat, /ping)
│   ├── rag_engine.py               # Hybrid RAG & Knowledge Retrieval engine
│   ├── knowledge_base/
│   │   └── potato_diseases.json    # Grounded agricultural knowledge base
│   ├── requirements.txt            # Python dependencies
│   └── Dockerfile                  # Containerization setup
├── frontend/                       # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css               # Design system & glassmorphism styles
│   │   └── components/
│   │       ├── Header.jsx          # Header with active context indicator
│   │       ├── ImageUploader.jsx   # Drag & drop leaf uploader
│   │       ├── PredictionResult.jsx# Diagnosis status & severity card
│   │       └── Chatbot.jsx         # RAG AI Agronomist chatbot UI
│   ├── index.html
│   └── package.json
├── models/                         # Trained model directory
│   └── 1.keras                     # Keras 3 CNN model file (~178 MB)
├── training/                       # Jupyter notebooks for CNN model training
└── README.md                       # Project documentation
```

---

## Local Setup & Run

### Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/ridhirajvi27-dotcom/plant-disease-detector.git
cd plant-disease-detector
```

---

### 2. Model File Setup

Ensure the trained model file `1.keras` is placed inside the `models/` directory:

```
Plant-Disease-Detection/
└── models/
    └── 1.keras
```

> **Note:** If you don't have the pre-trained model file, you can train a new one using the Jupyter notebook provided in the `training/` folder:
> ```bash
> jupyter notebook training/plant_disease.ipynb
> ```
> Save the exported model to `models/1.keras`.

---

### 3. Start the Backend (FastAPI)

1. Open a terminal and navigate to the `api/` directory:
   ```bash
   cd api
   ```

2. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. *(Optional)* Configure external LLM API key for Tier-1 RAG generation:
   ```bash
   export GROQ_API_KEY="your_groq_api_key_here"
   # OR
   export OPENAI_API_KEY="your_openai_api_key_here"
   ```

4. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```

5. The API server will be available at **`http://localhost:8000`**.
   - Health check endpoint: [http://localhost:8000/ping](http://localhost:8000/ping)
   - Interactive Swagger API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 4. Start the Frontend (React + Vite)

1. Open a **new terminal window** and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install Node modules:
   ```bash
   npm install
   ```

3. Ensure backend target URL is set to local in `frontend/src/App.jsx`:
   ```javascript
   const API_BASE_URL = 'http://localhost:8000';
   ```

4. Launch the frontend development server:
   ```bash
   npm run dev
   ```

5. Access the user interface in your web browser (typically at **`http://localhost:5173`**).

---

##  API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/ping` | Health check — returns `{ status: "alive", model_loaded: true/false }` |
| `POST` | `/predict` | Upload leaf image form-data (`file`) → returns predicted `{ class, confidence }` |
| `POST` | `/chat` | Send question + context (`{ disease, message }`) → returns grounded RAG response |
| `GET` | `/docs` | Interactive Swagger UI documentation |

---

## Model Details

- **Architecture**: Convolutional Neural Network (CNN)
- **Framework**: Keras 3 (Torch / TensorFlow backend)
- **Input**: 256×256 RGB images, normalized pixel values `[0.0, 1.0]`
- **Classes**:
  1. `Potato___Early_blight`
  2. `Potato___Late_blight`
  3. `Potato___healthy`
- **Dataset**: [PlantVillage Dataset](https://www.kaggle.com/datasets/arjuntejaswi/plant-village)

---

## 📜 License

MIT
