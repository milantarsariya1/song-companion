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

  );
}

