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
          <h3>Lyrind AI Assistant</h3>
          <p>Ask anything about this track</p>
        </div>
      </div>

      {/* Message List */}
      <div className="message-list">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p className="welcome-text">
              Welcome to the Lyrind analysis engine. I have parsed the lyrics of **"{track.trackName}"** by **{track.artistName}**.
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
            placeholder="Ask Lyrind AI about the meaning, author, theme..."
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

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border-glass);
          background: rgba(18, 24, 38, 0.45);
          height: 100%;
          min-height: 550px;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border-glass);
          background: rgba(10, 15, 26, 0.2);
        }

        .avatar-glow {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid var(--border-active);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
        }

        .bot-icon {
          width: 22px;
          height: 22px;
          color: var(--accent-primary);
        }

        .header-meta h3 {
          font-size: 1.15rem;
          margin-bottom: 0.1rem;
        }

        .header-meta p {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .message-list {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-height: 380px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          text-align: center;
          margin: auto 0;
          gap: 1rem;
        }

        .welcome-text {
          font-size: 1rem;
          color: var(--text-primary);
          line-height: 1.6;
          max-width: 90%;
        }

        .sub-welcome {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          max-width: 80%;
        }

        .suggestions-grid {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          width: 100%;
          max-width: 480px;
        }

        .suggestion-pill {
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          border-radius: 100px;
          padding: 0.65rem 1.25rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
        }

        .suggestion-pill:hover {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.05);
          color: var(--text-primary);
          transform: translateX(3px);
        }

        .messages-scroller {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
        }

        .message-bubble-wrapper {
          display: flex;
          width: 100%;
        }

        .message-bubble-wrapper.user {
          justify-content: flex-end;
        }

        .message-bubble-wrapper.assistant {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 85%;
          padding: 0.85rem 1.25rem;
          border-radius: var(--border-radius-md);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .message-bubble.user-gradient {
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          border-bottom-right-radius: 2px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .message-bubble.glass {
          border-bottom-left-radius: 2px;
          background: rgba(18, 24, 38, 0.6);
        }

        .bubble-text p {
          margin-bottom: 0.75rem;
        }

        .bubble-text p:last-child {
          margin-bottom: 0;
        }

        .bubble-heading {
          font-size: 1rem;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 0.25rem;
        }

        blockquote {
          border-left: 3px solid var(--accent-primary);
          padding-left: 0.75rem;
          margin: 0.75rem 0;
          color: var(--text-secondary);
          font-style: italic;
        }

        /* Typing Loader */
        .typing-loader-bubble {
          display: flex;
          gap: 0.35rem;
          align-items: center;
          padding: 0.75rem 1.25rem;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-muted);
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .input-form {
          border-top: 1px solid var(--border-glass);
          padding: 1.25rem 2rem;
          background: rgba(10, 15, 26, 0.2);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mini-suggestions {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .mini-pill {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          font-size: 0.75rem;
          padding: 0.35rem 0.75rem;
          border-radius: 100px;
          white-space: nowrap;
          cursor: pointer;
        }

        .mini-pill:hover {
          color: var(--text-primary);
          border-color: var(--text-muted);
          transform: translateY(-1px);
        }

        .input-row {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .input-row input {
          flex: 1;
          background: var(--bg-primary);
          border-radius: 100px;
          padding: 0.8rem 1.5rem;
        }

        .send-btn {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: var(--accent-primary);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.15);
        }

        .send-btn:hover:not(:disabled) {
          background: var(--accent-primary-hover);
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .send-btn:disabled {
          background: var(--bg-tertiary);
          color: var(--text-muted);
          cursor: not-allowed;
          opacity: 0.7;
        }

        .send-icon {
          width: 18px;
          height: 18px;
          transform: rotate(45deg) translate(-1px, 1px);
        }
      `}</style>
    </div>
  );
}
