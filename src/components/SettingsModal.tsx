"use client";

import React, { useState, useEffect } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "cleared">("idle");

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem("lyrind_groq_key") || "";
      setApiKey(savedKey);
      setStatus("idle");
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("lyrind_groq_key", apiKey.trim());
    setStatus("saved");
    setTimeout(() => {
      onClose();
      setStatus("idle");
    }, 800);
  };

  const handleClear = () => {
    localStorage.removeItem("lyrind_groq_key");
    setApiKey("");
    setStatus("cleared");
    setTimeout(() => {
      onClose();
      setStatus("idle");
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass">
        <div className="modal-header">
          <h3>Lyrind Configurations</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p className="description">
            To query Lyrind AI in real-time, configure your personal **Groq API Key**.
            The key is stored securely in your local browser storage and is only transmitted to the server route via request headers.
          </p>

          <div className="input-group-container">
            <label htmlFor="groq-key-input">Groq API Key</label>
            <div className="input-with-action">
              <input
                id="groq-key-input"
                type={showKey ? "text" : "password"}
                placeholder="gsk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <span className="help-text">
              Don't have a key? Get one for free at{" "}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gradient font-bold"
              >
                console.groq.com
              </a>
            </span>
          </div>

          {status === "saved" && <p className="status-msg success">✓ Settings Saved successfully!</p>}
          {status === "cleared" && <p className="status-msg error">✓ Key Cleared!</p>}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClear}>
            Clear Key
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save Configuration
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(5, 7, 12, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .modal-content {
          width: 90%;
          max-width: 500px;
          padding: 2rem;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          box-shadow: var(--shadow-lg), var(--shadow-glow);
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 1.75rem;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          transition: all var(--transition-fast);
        }

        .close-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
          transform: none;
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .description {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .input-group-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group-container label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-with-action {
          display: flex;
          gap: 0.5rem;
        }

        .input-with-action input {
          flex: 1;
        }

        .toggle-visibility {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-glass);
          padding: 0 1rem;
          font-size: 0.85rem;
        }

        .toggle-visibility:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--text-muted);
          transform: none;
        }

        .help-text {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .help-text a {
          text-decoration: underline;
        }

        .status-msg {
          font-size: 0.85rem;
          font-weight: 500;
          margin-top: 0.5rem;
        }

        .status-msg.success {
          color: var(--accent-success);
        }

        .status-msg.error {
          color: var(--accent-warning);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 100%);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, var(--accent-secondary-hover) 0%, var(--accent-primary-hover) 100%);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
