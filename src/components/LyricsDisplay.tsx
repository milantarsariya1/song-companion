"use client";

import React, { useState, useEffect } from "react";
import { LyricsRecord } from "./SearchBar";

interface LyricsDisplayProps {
  track: LyricsRecord;
  translatedLyrics: string | null;
  isTranslating: boolean;
  onTranslate: (targetLanguage: string) => void;
  onClearTranslation: () => void;
}

export default function LyricsDisplay({
  track,
  translatedLyrics,
  isTranslating,
  onTranslate,
  onClearTranslation,
}: LyricsDisplayProps) {
  const [activeTab, setActiveTab] = useState<"plain" | "synced">("plain");
  const [selectedLanguage, setSelectedLanguage] = useState("Spanish");
  const [copied, setCopied] = useState(false);

  // Default tabs on track change
  useEffect(() => {
    if (track.plainLyrics) {
      setActiveTab("plain");
    } else if (track.syncedLyrics) {
      setActiveTab("synced");
    }
  }, [track]);

  const hasPlain = !!track.plainLyrics;
  const hasSynced = !!track.syncedLyrics;

  const handleCopy = () => {
    const textToCopy =
      activeTab === "plain"
        ? track.plainLyrics || ""
        : track.syncedLyrics || "";
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Parse LRC lyrics to render line by line with timestamps
  const parseLRC = (lrcString: string) => {
    const lines = lrcString.split("\n");
    const result: { time: string; text: string }[] = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2})\]/;

    lines.forEach((line) => {
      const match = timeRegex.exec(line);
      if (match) {
        const min = match[1];
        const sec = match[2];
        const text = line.replace(timeRegex, "").trim();
        if (text) {
          result.push({ time: `${min}:${sec}`, text });
        }
      } else {
        const text = line.trim();
        if (text) {
          result.push({ time: "", text });
        }
      }
    });

    return result;
  };

  const syncedLines = track.syncedLyrics ? parseLRC(track.syncedLyrics) : [];

  const languages = [
    "Spanish",
    "French",
    "German",
    "Italian",
    "Japanese",
    "Korean",
    "Hindi",
    "Mandarin",
    "Portuguese",
    "Russian",
  ];

  return (
    <div className="lyrics-display-wrapper glass">
      {/* Track Header */}
      <div className="track-header">
        <div className="header-info">
          <h2>{track.trackName}</h2>
          <p className="artist">by <span className="text-gradient font-bold">{track.artistName}</span></p>
          <div className="metadata-row">
            {track.albumName && <span className="album">{track.albumName}</span>}
            {track.duration > 0 && (
              <span className="duration">
                ⏱ {formatDuration(track.duration)}
              </span>
            )}
            {track.instrumental && <span className="badge instrumental">Instrumental</span>}
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar-actions">
          {/* Copy Button */}
          <button className="icon-btn" onClick={handleCopy} title="Copy Lyrics">
            {copied ? (
              <span className="success-txt">Copied!</span>
            ) : (
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>

          {/* Sync / Plain Toggle */}
          {hasPlain && hasSynced && (
            <div className="tab-toggle">
              <button
                className={activeTab === "plain" ? "active" : ""}
                onClick={() => setActiveTab("plain")}
              >
                Plain
              </button>
              <button
                className={activeTab === "synced" ? "active" : ""}
                onClick={() => setActiveTab("synced")}
              >
                Synced
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area: Supports side-by-side columns if translation exists */}
      <div className={`lyrics-body-container ${translatedLyrics ? "split-view" : ""}`}>
        {/* Original Lyrics Column */}
        <div className="lyrics-column original-lyrics">
          <h4 className="column-title">Original</h4>
          
          <div className="lyrics-scroller">
            {track.instrumental ? (
              <div className="instrumental-msg">
                🎵 This song is an instrumental. No lyrics are available.
              </div>
            ) : activeTab === "synced" && syncedLines.length > 0 ? (
              <div className="synced-lyrics-list">
                {syncedLines.map((line, idx) => (
                  <div key={idx} className="synced-line">
                    {line.time && <span className="line-time">{line.time}</span>}
                    <span className="line-text">{line.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="plain-lyrics-text">
                {track.plainLyrics || track.syncedLyrics?.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, "") || "No lyrics content found."}
              </div>
            )}
          </div>
        </div>

        {/* Translation Column (If results exist) */}
        {translatedLyrics && (
          <div className="lyrics-column translated-lyrics animated-fade">
            <div className="column-header-row">
              <h4 className="column-title text-gradient">{selectedLanguage} Translation</h4>
              <button className="clear-translation-btn" onClick={onClearTranslation}>
                Clear
              </button>
            </div>
            
            <div className="lyrics-scroller translated-text">
              {translatedLyrics}
            </div>
          </div>
        )}
      </div>

      {/* Translation Toolbar Trigger */}
      {!track.instrumental && (
        <div className="translation-trigger-panel">
          <div className="select-wrapper">
            <label htmlFor="language-select">Translate Lyrics</label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <button
            className="translate-action-btn btn-primary"
            onClick={() => onTranslate(selectedLanguage)}
            disabled={isTranslating}
          >
            {isTranslating ? (
              <div className="btn-loader-content">
                <div className="tiny-spinner" />
                Translating...
              </div>
            ) : (
              "Translate Now"
            )}
          </button>
        </div>
      )}

      <style jsx>{`
        .lyrics-display-wrapper {
          display: flex;
          flex-direction: column;
          padding: 2rem;
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border-glass);
          background: rgba(18, 24, 38, 0.45);
          height: 100%;
          min-height: 550px;
        }

        .track-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 1.5rem;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }

        .header-info h2 {
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
        }

        .artist {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .metadata-row {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .album {
          background: var(--bg-tertiary);
          padding: 0.15rem 0.6rem;
          border-radius: 4px;
        }

        .duration {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .badge {
          padding: 0.15rem 0.6rem;
          border-radius: 4px;
          font-weight: 500;
        }

        .badge.instrumental {
          background: rgba(245, 158, 11, 0.15);
          color: var(--accent-warning);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .icon-btn {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          width: 40px;
          height: 40px;
          border-radius: var(--border-radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .icon-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--text-muted);
          transform: translateY(-1px);
        }

        .icon {
          width: 20px;
          height: 20px;
        }

        .success-txt {
          color: var(--accent-success);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .tab-toggle {
          background: var(--bg-primary);
          border: 1px solid var(--border-glass);
          border-radius: var(--border-radius-sm);
          padding: 2px;
          display: flex;
        }

        .tab-toggle button {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.85rem;
          padding: 0.4rem 0.8rem;
          cursor: pointer;
          border-radius: 6px;
        }

        .tab-toggle button.active {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-weight: 500;
        }

        .tab-toggle button:hover {
          transform: none;
        }

        .lyrics-body-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          flex: 1;
          margin-bottom: 1.5rem;
        }

        .lyrics-body-container.split-view {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .lyrics-column {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-width: 0;
        }

        .column-title {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 0.5rem;
        }

        .column-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 0.5rem;
        }

        .column-header-row .column-title {
          border: none;
          padding: 0;
        }

        .clear-translation-btn {
          background: transparent;
          color: var(--text-muted);
          border: none;
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .clear-translation-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
          transform: none;
        }

        .lyrics-scroller {
          flex: 1;
          overflow-y: auto;
          max-height: 400px;
          padding-right: 0.5rem;
          font-size: 1.05rem;
          line-height: 1.8;
          white-space: pre-wrap;
          color: var(--text-primary);
        }

        .plain-lyrics-text {
          font-family: var(--font-family-sans);
          letter-spacing: 0.01em;
        }

        .translated-text {
          color: var(--text-secondary);
          font-style: italic;
        }

        .synced-lyrics-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .synced-line {
          display: flex;
          gap: 1rem;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          transition: background var(--transition-fast);
        }

        .synced-line:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .line-time {
          font-family: monospace;
          font-size: 0.8rem;
          color: var(--accent-primary);
          opacity: 0.7;
          flex-shrink: 0;
          margin-top: 0.2rem;
        }

        .line-text {
          flex: 1;
        }

        .instrumental-msg {
          text-align: center;
          color: var(--text-muted);
          padding: 4rem 1rem;
          font-style: italic;
        }

        .translation-trigger-panel {
          border-top: 1px solid var(--border-glass);
          padding-top: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1.5rem;
        }

        .select-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }

        .select-wrapper label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        select {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-glass);
          cursor: pointer;
          font-weight: 500;
        }

        .translate-action-btn {
          flex-shrink: 0;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 2rem;
        }

        .translate-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
        }

        .btn-primary:hover:not(:disabled) {
          box-shadow: var(--shadow-glow);
          background: linear-gradient(135deg, var(--accent-primary-hover) 0%, var(--accent-secondary-hover) 100%);
        }

        .btn-loader-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tiny-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--text-primary);
          animation: spin 0.8s linear infinite;
        }

        .animated-fade {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .lyrics-body-container.split-view {
            grid-template-columns: 1fr;
          }
          
          .translation-trigger-panel {
            flex-direction: column;
            align-items: stretch;
          }
          
          .translate-action-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
