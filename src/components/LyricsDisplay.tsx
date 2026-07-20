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
    "English",
    "Spanish",
    "French",
    "German",
    "Gujarati",
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
    </div>
  );
}
