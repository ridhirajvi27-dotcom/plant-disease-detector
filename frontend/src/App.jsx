import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PredictionResult from './components/PredictionResult';
import Chatbot from './components/Chatbot';
import { Sprout, Leaf, Shield, Zap } from 'lucide-react';

const API_BASE_URL = 'https://localhost:8000';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ping`);
        if (res.ok) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch (err) {
        setIsConnected(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPredictionResult(null);
    setError(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPredictionResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to analyze image from backend server.');
      }

      const data = await response.json();
      setPredictionResult(data);
    } catch (err) {
      console.error('Prediction Error:', err);
      setError(err.message || 'Could not connect to FastAPI server. Please check if uvicorn is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-root">
      {/* Background Image Layer */}
      <div className="bg-image-layer">
        <img src="/images/download (15).jpg" alt="" className="bg-image" />
        <div className="bg-overlay" />
      </div>

      {/* Floating decorative leaf accent */}
      <div className="floating-accent-left">
        <img src="/images/download (14).jpg" alt="" className="accent-image" />
      </div>

      <Header isConnected={isConnected} />

      <main className="main-wrapper">
        <section className="hero-section">
          <div className="hero-badge">
            <Sprout size={16} />
            AI-Powered Plant Diagnostics
          </div>
          <h1 className="hero-title">Plant Disease Detector</h1>
          <p className="hero-subtitle">
            Upload a leaf photo to detect Early Blight, Late Blight, or verify plant health in seconds.
          </p>
        </section>

        {/* Centered Card Layout */}
        <div className="center-card-container">
          <div className="center-glass-card">
            <div className="card-inner-grid">
              <div className="card-left-section">
                <ImageUploader
                  selectedFile={selectedFile}
                  previewUrl={previewUrl}
                  onFileSelect={handleFileSelect}
                  onRemoveFile={handleRemoveFile}
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                  isConnected={isConnected}
                />
              </div>

              <div className="card-divider" />

              <div className="card-right-section">
                <PredictionResult
                  result={predictionResult}
                  error={error}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="features-row">
          <div className="feature-chip">
            <div className="feature-chip-icon"><Zap size={18} /></div>
            <div>
              <div className="feature-chip-title">Instant Analysis</div>
              <div className="feature-chip-desc">Results in under 2 seconds</div>
            </div>
          </div>
          <div className="feature-chip">
            <div className="feature-chip-icon"><Shield size={18} /></div>
            <div>
              <div className="feature-chip-title">RAG-Powered Advice</div>
              <div className="feature-chip-desc">Grounded agricultural data</div>
            </div>
          </div>
          <div className="feature-chip">
            <div className="feature-chip-icon"><Leaf size={18} /></div>
            <div>
              <div className="feature-chip-title">Expert Agronomist</div>
              <div className="feature-chip-desc">Organic & chemical treatments</div>
            </div>
          </div>
        </div>
      </main>

      <Chatbot
        apiBaseUrl={API_BASE_URL}
        predictionResult={predictionResult}
      />
    </div>
  );
}
