import React, { useRef, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function ImageUploader({ selectedFile, previewUrl, onFileSelect, onRemoveFile, onAnalyze, isLoading, isConnected }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem' }}>
      <h3 style={{ marginBottom: '1.25rem', fontSize: '1.25rem' }}>Upload Potato Leaf Image</h3>

      {!previewUrl ? (
        <div
          className={`dropzone-container ${isDragOver ? 'is-dragover' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <div className="dropzone-icon">
            <UploadCloud size={32} />
          </div>

          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>
            Click or drag & drop leaf image here
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Supports JPG, PNG, WEBP (Max 10MB)
          </p>
        </div>
      ) : (
        <div className="preview-wrapper">
          <img src={previewUrl} alt="Potato leaf preview" className="preview-image" />
          <button className="remove-btn" onClick={onRemoveFile} title="Remove image">
            <X size={18} />
          </button>
        </div>
      )}

      <button
        className="action-btn"
        disabled={!selectedFile || isLoading || !isConnected}
        onClick={onAnalyze}
      >
        {isLoading ? (
          <>
            <div className="spinner" />
            Analyzing Leaf...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Analyze Disease
          </>
        )}
      </button>
    </div>
  );
}
