import React, { useState, useRef, useEffect } from "react";
import submitImg from "../assets/images/icon-search.svg";
import "../styles/SearchBar.css";
import { CircleLoader } from "react-spinners";
import playIcon from "../assets/images/icon-play.svg";
import EmptyState from "../components/EmptyState";

const starterSuggestions = [
  "hello",
  "example",
  "computer",
  "translate",
  "apple",
];

const PauseIconInline = () => (
  <svg width="35" height="35" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="4" width="4" height="16" />
    <rect x="15" y="4" width="4" height="16" />
  </svg>
);

const SearchBar = () => {
  const [word, setWord] = useState(() => localStorage.getItem("word") || "");
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem("result");
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setPlaying] = useState(false);

  const abortRef = useRef(null);
  const inputRef = useRef(null);
  const audioRef = useRef(null);

  // cleanup only on unmount (do not abort when word/result changes)
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // persist word/result to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("word", word);
      if (result) localStorage.setItem("result", JSON.stringify(result));
    } catch (e) {
      console.warn("localStorage write failed", e);
    }
  }, [word, result]);

  // Definitive search function
  const searchWord = async (entry) => {
    const q = entry?.toString().trim();
    console.log("searchWord called with entry:", entry, "normalized q:", q);

    // Validate early — IMPORTANT
    if (!q) {
      setError("please enter a word to search");
      return;
    }

    // cancel previous request if any
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const api = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`;
      console.log("fetching:", api);
      const response = await fetch(api, { signal: controller.signal });

      if (response.status === 404) {
        setError(`No definition found for "${q}".`);
        return;
      }

      if (!response.ok) {
        let msg = `Request failed (${response.status})`;
        try {
          const errData = await response.json();
          msg = errData.message || errData.title || msg;
        } catch (_) {}
        throw new Error(msg);
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0)
        throw new Error("No entry found.");

      setResult(data);
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("search aborted:", q);
        return;
      }
      console.error("searchWord error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  // handle example pick -> fill input and search immediately
  const handlePick = (pickedWord) => {
    if (loading) return;
    setWord(pickedWord);
    searchWord(pickedWord);
    inputRef.current?.focus?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchWord(word);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchWord(word);
  };

  // audio event handlers to keep isPlaying in sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [result]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.paused) await audio.play();
      else audio.pause();
      setPlaying(!audio.paused);
    } catch (err) {
      console.error("Audio play failed:", err);
    }
  };

  return (
    <div className="search-bar-root">
      <div className="search-input-form">
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="search"
            id="searchInput"
            className="search-input"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            disabled={loading}
            onKeyDown={handleKeyDown}
            placeholder="Enter a word"
            aria-label="Word to look up"
          />

          <button
            type="submit"
            disabled={loading}
            className="submit-input"
            aria-label="Search"
          >
            <img src={submitImg} alt="search" />
          </button>
        </form>
      </div>

      {loading && (
        <div aria-live="polite" className="search-state">
          <CircleLoader color="var(--toggle-color)" size={100} />
        </div>
      )}

      {error && <p className="error">error: {error}</p>}

      {!loading && !error && !result && (
        <EmptyState
          suggestions={starterSuggestions}
          onPick={handlePick}
          disabled={loading}
        />
      )}

      {result && (
        <div className="result">
          {(() => {
            const entry = result[0];
            if (!entry) return null;

            const phonetics = entry.phonetics ?? [];
            const phoneticsWithText = phonetics.find((p) => !!p.text);
            const phoneticsWithAudio = phonetics.find(
              (p) => !!p.audio && p.audio.trim() !== ""
            );
            const audioUrl = phoneticsWithAudio?.audio ?? null;

            return (
              <article>
                <header className="word-header">
                  <div>
                    <h1 className="word">{entry.word}</h1>
                    {phoneticsWithText?.text && (
                      <p className="phonetics">{phoneticsWithText.text}</p>
                    )}
                  </div>

                  {audioUrl && (
                    <>
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        onClick={togglePlay}
                        aria-pressed={isPlaying}
                        aria-label={
                          isPlaying
                            ? "Pause pronunciation"
                            : "Play pronunciation"
                        }
                        className="play-button"
                      >
                        {!isPlaying ? (
                          <img
                            src={playIcon}
                            alt="Play pronunciation"
                            className="play-icon"
                          />
                        ) : (
                          <PauseIconInline />
                        )}
                      </button>
                    </>
                  )}
                </header>

                {entry.meanings?.map((meaning, mi) => (
                  <section
                    key={`${meaning.partOfSpeech ?? "pos"}-${mi}`}
                    className="meaning-block"
                  >
                    <h2 className="part-of-speech">{meaning.partOfSpeech}</h2>
                    <h3 className="meaning">Meaning</h3>
                    <ul className="definitions">
                      {meaning.definitions?.map((d, i) => (
                        <li key={`${d.definition ?? i}`} className="definition">
                          <p>{d.definition}</p>
                          {d?.example && (
                            <p className="example">
                              <i>“{d.example}”</i>
                            </p>
                          )}
                          {d?.synonyms?.length > 0 && (
                            <p className="synonyms">
                              <i>Synonyms</i>:{" "}
                              <span>{d.synonyms.join(", ")}</span>
                            </p>
                          )}
                          {d?.antonyms?.length > 0 && (
                            <p className="antonyms">
                              <i>Antonyms</i>:{" "}
                              <span>{d.antonyms.join(", ")}</span>
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}

                {entry.sourceUrls?.length > 0 && (
                  <footer className="footer">
                    <h4 className="source">Source</h4>
                    <ul>
                      {entry.sourceUrls.map((url, i) => (
                        <li key={url ?? i}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </footer>
                )}
              </article>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
