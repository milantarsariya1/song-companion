"use client";

import React, { useState } from "react";
import SearchBar, { LyricsRecord } from "@/components/SearchBar";
import LyricsDisplay from "@/components/LyricsDisplay";
import AIChatBox, { Message } from "@/components/AIChatBox";

export default function Home() {
  const [selectedTrack, setSelectedTrack] = useState<LyricsRecord | null>(null);
  const [translatedLyrics, setTranslatedLyrics] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleSelectTrack = (track: LyricsRecord) => {
    setSelectedTrack(track);
    setTranslatedLyrics(null);
    setChatMessages([]);
    setTranslationError(null);
    setChatError(null);
  };

  const handleTranslate = async (targetLanguage: string) => {
    if (!selectedTrack) return;
    setIsTranslating(true);
    setTranslationError(null);

    const plainLyrics = selectedTrack.plainLyrics || selectedTrack.syncedLyrics?.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, "") || "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      setChatError(err?.message || "Something went wrong. Please check your connection.");
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="layout-root">
      {/* Top Navbar */}
      <header className="navbar glass">
        <div className="nav-container">
          <div className="logo-section" onClick={() => { if (typeof window !== "undefined") window.location.href = "/"; }}>
            <div className="logo-ring">
              <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <span className="logo-text text-gradient">Song Companion</span>
          </div>
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
                Search lyrics instantly, translate them into multiple languages, and chat with Song Companion AI to unlock hidden metaphors and details about the author.
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
                <p>Translate verses into any target language while maintaining the song&apos;s emotional tone.</p>
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
              <button className="back-home-btn" onClick={() => setSelectedTrack(null)}>
                <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
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
              <div className="grid-col chat-col">
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

      {/* Premium Footer */}
      <footer className="footer glass">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="footer-logo text-gradient" onClick={() => { if (typeof window !== "undefined") window.location.href = "/"; }}>Song Companion</span>
            <p className="footer-desc">Premium AI lyrics finding, on-the-fly translation, and context-aware chat companion.</p>
          </div>
          <div className="footer-meta">
            <p className="made-by">
              Made with <span className="heart">❤️</span> by <span className="milan text-gradient">Milan Tarsariya</span>
            </p>
            <div className="footer-links">
              <a href="mailto:milantarsariya1@gmail.com" className="footer-link">✉️ Contact</a>
              <a href="https://github.com/milantarsariya1" target="_blank" rel="noopener noreferrer" className="footer-link">🔗 GitHub</a>
            </div>
          </div>
        </div>
      </footer>

    
    </div>
  );
}
