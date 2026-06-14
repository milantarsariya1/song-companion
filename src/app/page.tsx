"use client";

import React, { useState } from "react";
import SearchBar, { LyricsRecord } from "@/components/SearchBar";
import LyricsDisplay from "@/components/LyricsDisplay";
import AIChatBox, { Message } from "@/components/AIChatBox";
import SettingsModal from "@/components/SettingsModal";

export default function Home() {
  const [selectedTrack, setSelectedTrack] = useState<LyricsRecord | null>(null);
  const [translatedLyrics, setTranslatedLyrics] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleSelectTrack = (track: LyricsRecord) => {
    setSelectedTrack(track);
    setTranslatedLyrics(null);
    setChatMessages([]);
    setTranslationError(null);
    setChatError(null);
  };

  const getApiKey = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lyrind_groq_key") || "";
    }
    return "";
  };

  const handleTranslate = async (targetLanguage: string) => {
    if (!selectedTrack) return;
    setIsTranslating(true);
    setTranslationError(null);

    const plainLyrics = selectedTrack.plainLyrics || selectedTrack.syncedLyrics?.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, "") || "";

    try {
      const apiKey = getApiKey();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-groq-key": apiKey,
        },
        body: JSON.stringify({
          lyrics: plainLyrics,
          trackName: selectedTrack.trackName,
          artistName: selectedTrack.artistName,
          albumName: selectedTrack.albumName || "Unknown Album",
          messages: [],
          mode: "translate",
          targetLanguage,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || "Translation request failed");
      }

      const data = await res.json();
      setTranslatedLyrics(data.content);
    } catch (err: any) {
      console.error(err);
      setTranslationError(err?.message || "Failed to translate lyrics. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClearTranslation = () => {
    setTranslatedLyrics(null);
    setTranslationError(null);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedTrack) return;
    
    setChatError(null);
    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content,
    };

    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setIsChatLoading(true);

    const plainLyrics = selectedTrack.plainLyrics || selectedTrack.syncedLyrics?.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, "") || "";

    try {
      const apiKey = getApiKey();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-groq-key": apiKey,
        },
        body: JSON.stringify({
          lyrics: plainLyrics,
          trackName: selectedTrack.trackName,
          artistName: selectedTrack.artistName,
          albumName: selectedTrack.albumName || "Unknown Album",
          messages: updatedHistory,
          mode: "chat",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || "AI chat request failed");
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: data.content,
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setChatError(err?.message || "Something went wrong. Please check your connection or API key.");
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="layout-root">
      {/* Top Navbar */}
      <header className="navbar glass">
        <div className="nav-container">
          <div className="logo-section" onClick={() => setSelectedTrack(null)}>
            <div className="logo-ring">
              <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <span className="logo-text text-gradient">Lyrind</span>
          </div>

          <button className="settings-btn" onClick={() => setIsSettingsOpen(true)} aria-label="Open settings">
            <svg className="settings-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Config</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container main-layout">
        {!selectedTrack ? (
          // Landing View
          <div className="landing-view animated-fade">
            <div className="hero-text-block">
              <h1 className="hero-title">
                Explore The Soul of <span className="text-gradient">Music</span>
              </h1>
              <p className="hero-subtitle">
                Search lyrics instantly, translate them into multiple languages, and chat with Lyrind AI to unlock hidden metaphors and details about the author.
              </p>
            </div>

            <SearchBar onSelectTrack={handleSelectTrack} />

            {/* Feature Highlights */}
            <div className="features-grid">
              <div className="feature-card glass glass-interactive">
                <div className="feature-icon">🔍</div>
                <h4>Instant Lyrics Find</h4>
                <p>Lookup timed LRC or plain text lyrics across an expansive open-source database.</p>
              </div>
              <div className="feature-card glass glass-interactive">
                <div className="feature-icon">🌐</div>
                <h4>AI Translation</h4>
                <p>Translate verses into any target language while maintaining the song's emotional tone.</p>
              </div>
              <div className="feature-card glass glass-interactive">
                <div className="feature-icon">💬</div>
                <h4>Lyrical Dialogue</h4>
                <p>Chat with Llama-3.1 to understand songwriting context, metaphors, and artist history.</p>
              </div>
            </div>
          </div>
        ) : (
          // Song Details/AI Workspace View
          <div className="workspace-view animated-fade">
            {/* Streamlined Search Header */}
            <div className="workspace-header">
              <button className="back-home-btn glass" onClick={() => setSelectedTrack(null)}>
                ← Back
              </button>
              <div className="workspace-search">
                <SearchBar onSelectTrack={handleSelectTrack} />
              </div>
            </div>

            {/* Error notifications */}
            {(translationError || chatError) && (
              <div className="error-alert-banner glass">
                <span className="error-title">⚠️ Application Error</span>
                <p>{translationError || chatError}</p>
                <button
                  onClick={() => {
                    setTranslationError(null);
                    setChatError(null);
                  }}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Workspace Columns */}
            <div className="workspace-grid">
              <div className="grid-col">
                <LyricsDisplay
                  track={selectedTrack}
                  translatedLyrics={translatedLyrics}
                  isTranslating={isTranslating}
                  onTranslate={handleTranslate}
                  onClearTranslation={handleClearTranslation}
                />
              </div>
              <div className="grid-col">
                <AIChatBox
                  track={selectedTrack}
                  messages={chatMessages}
                  isLoading={isChatLoading}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Config Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <style jsx>{`
        .layout-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .navbar {
          position: sticky;
          top: 0;
          z-index: 500;
          border-radius: 0;
          border-bottom: 1px solid var(--border-glass);
          background: rgba(11, 15, 25, 0.7);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0.9rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .logo-ring {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid var(--border-active);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
          transition: all var(--transition-normal);
        }

        .logo-section:hover .logo-ring {
          transform: rotate(15deg) scale(1.05);
          box-shadow: var(--shadow-glow);
        }

        .logo-svg {
          width: 18px;
          height: 18px;
          color: var(--accent-primary);
        }

        .logo-text {
          font-family: var(--font-family-display);
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .settings-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.85rem;
        }

        .settings-btn:hover {
          background: rgba(255, 255, 255, 0.07);
          color: var(--text-primary);
          border-color: var(--text-muted);
        }

        .settings-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.4s ease;
        }

        .settings-btn:hover .settings-icon {
          transform: rotate(60deg);
        }

        .main-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* Landing View Styles */
        .landing-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3.5rem;
          padding: 4rem 1rem;
          margin: auto 0;
          width: 100%;
        }

        .hero-text-block {
          text-align: center;
          max-width: 780px;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          width: 100%;
          max-width: 1000px;
        }

        .feature-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-radius: var(--border-radius-md);
        }

        .feature-icon {
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
        }

        .feature-card h4 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .feature-card p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Workspace View Styles */
        .workspace-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          width: 100%;
        }

        .workspace-header {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .back-home-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          border-radius: 100px;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .back-home-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(-2px);
        }

        .workspace-search {
          flex: 1;
        }

        .workspace-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        .grid-col {
          min-width: 0;
          height: 100%;
        }

        .error-alert-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--border-radius-md);
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .error-title {
          font-weight: 600;
          color: #fca5a5;
        }

        .error-alert-banner p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          flex: 1;
        }

        .error-alert-banner button {
          background: transparent;
          color: var(--text-muted);
          border: none;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .error-alert-banner button:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .animated-fade {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 992px) {
          .workspace-grid {
            grid-template-columns: 1fr;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }

          .hero-title {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
}
