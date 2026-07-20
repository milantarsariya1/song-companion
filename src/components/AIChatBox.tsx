"use client";

import React, { useState, useRef, useEffect } from "react";
import { LyricsRecord } from "./SearchBar";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface AIChatBoxProps {
  track: LyricsRecord;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
}

export default function AIChatBox({
  track,
  messages,
  isLoading,
  onSendMessage,
}: AIChatBoxProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleSuggestionClick = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  const suggestions = [
    `What is the core meaning of "${track.trackName}"?`,
    `Tell me about the author, ${track.artistName}.`,
    `Explain the metaphors in these lyrics.`,
    `What emotional tone does this song convey?`,
  ];

  return (
    <div className="chat-container glass">
      {/* Header */}
      <div className="chat-header">
        <div className="avatar-glow">
          <svg className="bot-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div className="header-meta">
          <h3>Song Companion AI</h3>
          <p>Ask anything about this track</p>
        </div>
      </div>

      {/* Message List */}
      <div className="message-list">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p className="welcome-text">
              Welcome to the Song Companion analysis engine. I have parsed the lyrics of **&quot;{track.trackName}&quot;** by **{track.artistName}**.
            </p>
            <p className="sub-welcome">Click on a quick question below or type your own to explore details about the song and its author.</p>
            
            {/* Quick Suggestions */}
            <div className="suggestions-grid">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  className="suggestion-pill"
                  onClick={() => handleSuggestionClick(s)}
                  disabled={isLoading}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-scroller">
            {messages.map((m) => (
              <div key={m.id} className={`message-bubble-wrapper ${m.role}`}>
                <div className={`message-bubble ${m.role === "user" ? "user-gradient" : "glass"}`}>
                  {/* Format simple Markdown blocks for display */}
                  <div className="bubble-text">
                    {m.content.split("\n").map((line, lineIdx) => {
                      // Blockquote
                      if (line.startsWith("> ")) {
                        return <blockquote key={lineIdx}>{line.replace("> ", "")}</blockquote>;
                      }
                      // H3 or bold bullet points
                      if (line.startsWith("### ")) {
                        return <h4 key={lineIdx} className="bubble-heading">{line.replace("### ", "")}</h4>;
                      }
                      
                      // Handle inline markdown triggers (bold words, lists)
                      let formatted = line;
                      // Replace bullet points
                      if (formatted.startsWith("- ")) {
                        formatted = formatted.replace("- ", "• ");
                      }

                      // Convert bold text **text** to HTML
                      const boldRegex = /\*\*(.*?)\*\*/g;
                      const hasBold = boldRegex.test(formatted);
                      
                      // Convert italic text *text* to HTML
                      const italicRegex = /_(.*?)_/g;

                      if (hasBold || italicRegex.test(formatted)) {
                        return (
                          <p
                            key={lineIdx}
                            dangerouslySetInnerHTML={{
                              __html: formatted
                                .replace(boldRegex, "<strong>$1</strong>")
                                .replace(italicRegex, "<em>$1</em>"),
                            }}
                          />
                        );
                      }

                      return <p key={lineIdx}>{formatted}</p>;
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Loader */}
            {isLoading && (
              <div className="message-bubble-wrapper assistant">
                <div className="message-bubble glass typing-loader-bubble">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="input-form">
        {messages.length > 0 && (
          <div className="mini-suggestions">
            <button
              type="button"
              className="mini-pill"
              onClick={() => handleSuggestionClick(`Analyze the tone of "${track.trackName}"`)}
              disabled={isLoading}
            >
              Analyze Tone
            </button>
            <button
              type="button"
              className="mini-pill"
              onClick={() => handleSuggestionClick(`Who wrote this song and when?`)}
              disabled={isLoading}
            >
              Who wrote it?
            </button>
          </div>
        )}
        <div className="input-row">
          <input
            type="text"
            placeholder="Ask Song Companion AI about the meaning, author, theme..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
            <svg className="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>

  );
}

