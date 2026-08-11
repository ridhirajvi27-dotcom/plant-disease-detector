import React from 'react';
import { Leaf, Activity } from 'lucide-react';

export default function Header({ isConnected }) {
  return (
    <header className="header-container">
      <div className="logo-group">
        <div className="logo-icon">
          <Leaf size={24} />
        </div>
        <div className="logo-title">PlantCare AI</div>
      </div>

      <div className="status-badge">
        <span className={`status-indicator ${isConnected ? 'status-connected' : 'status-disconnected'}`} />
        <span>{isConnected ? 'API Backend Live' : 'Connecting to Backend...'}</span>
      </div>
    </header>
  );
}
