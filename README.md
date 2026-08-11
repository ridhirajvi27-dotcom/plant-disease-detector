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
│   └── Dockerfile          # Docker configuration
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
├── models/                 # Model files directory
│   └── 1.keras             # Trained Keras CNN model (~178 MB)
├── training/               # Jupyter notebooks for model training
├── plan.md                 # Project roadmap
└── README.md
```

---

## 🚀 Local Setup & Run

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

3. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```

4. The API server will be available at **`http://localhost:8000`**.
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

5. Access the user interface in your web browser (typically at **`http://localhost:5173`** or **`http://localhost:3000`**).

---

## 🛠️ API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/ping` | Health check — returns `{ status: "alive", model_loaded: true/false }` |
| `POST` | `/predict` | Upload leaf image form-data (`file`) → returns predicted `{ class, confidence }` |
| `GET` | `/docs` | Interactive Swagger UI documentation |

---

## 🧠 Model Details

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

