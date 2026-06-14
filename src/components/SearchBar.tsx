"use client";

import React, { useState, useEffect, useRef } from "react";

export interface LyricsRecord {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

interface SearchBarProps {
  onSelectTrack: (track: LyricsRecord) => void;
}

export default function SearchBar({ onSelectTrack }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LyricsRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with a debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setError(null);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) {
          throw new Error("Failed to fetch suggestions");
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setSuggestions(data.slice(0, 10)); // limit to 10 for suggestions list
          setIsOpen(true);
        } else {
          setSuggestions([]);
        }
      } catch (err: any) {
        console.error(err);
        setError("Error fetching suggestions");
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const handleSelect = (track: LyricsRecord) => {
    onSelectTrack(track);
    setQuery(`${track.trackName} - ${track.artistName}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="search-container" ref={containerRef}>
      <div className="search-input-wrapper glass">
        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by song name, artist, or album..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
        />
        {loading && <div className="spinner-loader" />}
        {query && !loading && (
          <button className="clear-search" onClick={handleClear} aria-label="Clear search">
            &times;
          </button>
        )}
      </div>

      {isOpen && (suggestions.length > 0 || error) && (
        <div className="suggestions-dropdown glass">
          {error && <div className="dropdown-status error">{error}</div>}
          
          {suggestions.map((track) => (
            <div
              key={track.id}
              className="suggestion-item"
              onClick={() => handleSelect(track)}
            >
              <div className="track-meta">
                <span className="track-name">{track.trackName}</span>
                <span className="artist-name">{track.artistName}</span>
              </div>
              {track.albumName && (
                <span className="album-name" title={track.albumName}>
                  {track.albumName}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && !loading && query.trim().length >= 2 && suggestions.length === 0 && !error && (
        <div className="suggestions-dropdown glass">
          <div className="dropdown-status">No results found. Try another search.</div>
        </div>
      )}

      <style jsx>{`
        .search-container {
          position: relative;
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          z-index: 100;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          padding: 0.25rem 1.25rem;
          border-radius: 100px; /* pill shape for search bar */
          border: 1px solid var(--border-glass);
          background: rgba(18, 24, 38, 0.4);
          transition: all var(--transition-normal);
        }

        .search-input-wrapper:focus-within {
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-glow);
          background: rgba(18, 24, 38, 0.7);
        }

        .search-icon {
          width: 20px;
          height: 20px;
          color: var(--text-muted);
          margin-right: 0.75rem;
          flex-shrink: 0;
        }

        input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 1.1rem;
          padding: 0.75rem 0;
          outline: none;
        }

        input:focus {
          box-shadow: none;
          background: transparent;
        }

        .clear-search {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          transition: all var(--transition-fast);
        }

        .clear-search:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
          transform: scale(1.1);
        }

        .spinner-loader {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--accent-primary);
          animation: spin 0.8s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .suggestions-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          max-height: 380px;
          overflow-y: auto;
          border-radius: var(--border-radius-md);
          background: rgba(10, 15, 26, 0.92);
          border: 1px solid var(--border-glass);
          box-shadow: var(--shadow-lg);
          padding: 0.5rem 0;
          animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .suggestion-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 1.25rem;
          cursor: pointer;
          border-left: 2px solid transparent;
          transition: all var(--transition-fast);
        }

        .suggestion-item:hover {
          background: rgba(99, 102, 241, 0.08);
          border-left-color: var(--accent-primary);
        }

        .track-meta {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          max-width: 60%;
        }

        .track-name {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .artist-name {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .album-name {
          font-size: 0.8rem;
          color: var(--text-muted);
          max-width: 35%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: right;
        }

        .dropdown-status {
          padding: 1rem 1.25rem;
          font-size: 0.9rem;
          color: var(--text-muted);
          text-align: center;
        }

        .dropdown-status.error {
          color: var(--accent-warning);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
