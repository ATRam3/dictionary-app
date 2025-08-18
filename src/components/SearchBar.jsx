import React, { useState, useRef, useEffect } from "react";
import submitImg from "../assets/images/icon-search.svg";
import "../styles/SearchBar.css";
import { CircleLoader } from "react-spinners";
import playIcon from "../assets/images/icon-play.svg";
const PauseIconInline = () => (
  // small inline SVG for pause (no extra asset needed)
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="4" width="4" height="16" />
    <rect x="15" y="4" width="4" height="16" />
  </svg>
);

const SearchBar = () => {
  const [word, setWord] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setPlaying] = useState(false);
  const abortRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const searchWord = async (entry) => {
    if (abortRef.current) abortRef.current.abort();

    const controller = new AbortController();

    abortRef.current = controller;

    if (!word.trim()) {
      setError("please enter a word to search");
      return;
    }

    try {
      setError(null);
      setResult(null);

      setLoading(true);

      const api = `https://api.dictionaryapi.dev/api/v2/entries/en/${entry.trim()}`;
      const response = await fetch(api, { signal: controller.signal });

      if (response.status === 404) {
        setError(`No definition found for "${entry}".`);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Word not found");
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw Error("No entry found.");
      }
      setResult(data);
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("previous request is cancelled");
        return;
      }
      setError(err.message || "An unexpected error occured.");
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchWord(word);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchWord(word);
  };

  // 1) Hook to set audio src when result changes
  useEffect(() => {
    if (!result) return;
    const entry = result[0];
    const audioUrl = entry?.phonetics?.find(
      (p) => p.audio && p.audio.trim()
    )?.audio;
    const audio = audioRef.current;
    if (audio && audioUrl) {
      audio.src = audioUrl;
      audio.load();
    }
  }, [result]);

  // 2) Event listeners to keep isPlaying in sync
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

  // 3) togglePlay (correct)
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
      // event listeners will update setPlaying; still okay to set a fallback:
      setPlaying(!audio.paused);
    } catch (err) {
      console.error("Audio play failed:", err);
    }
  };

  return (
    <div className="container">
      <div className="search-input-form">
        <form onSubmit={handleSubmit}>
          <input
            type="search"
            id="searchInput"
            className="search-input"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            disabled={loading}
            onKeyDown={handleKeyDown}
            placeholder="Enter a word"
          />

          <button type="submit" disabled={loading} className="submit-input">
            <img src={submitImg} alt="search" />
          </button>
        </form>
      </div>

      {loading && (
        <div aria-live="polite" className="search-state">
          <CircleLoader color="var(--toggle-color)" size={100} />
        </div>
      )}
      {error && <p>error: {error}</p>}
      {result && (
        <div className="result">
          {/* save access for the first entry*/}

          {(() => {
            const entry = result[0];

            if (!entry) return null;

            const phonetics = entry.phonetics ?? [];
            const phoneticsWithText = phonetics.find((p) => !!p.text);
            const phoneticsWithAudio = phonetics.find((p) => !!p.audio);

            return (
              <article>
                <header>
                  {/*word and pronounciation*/}
                  <div>
                    <h1>{entry.word}</h1>
                    {phoneticsWithText?.text && <p>{phoneticsWithText.text}</p>}
                  </div>

                  {phoneticsWithAudio?.audio && (
                    <>
                      <audio ref={audioRef} style={{ display: "none" }}>
                        <source
                          src={phoneticsWithAudio.audio}
                          type="audio/mpeg"
                        />
                        Your browser does not support the audio element.
                      </audio>

                      {/*custom play and pause btn */}

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
                        {/* show play icon when NOT playing, pause icon when playing */}
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

                {/*Definition*/}

                {entry.meanings.map((meaning, mi) => (
                  <section key={`${meaning.partOfSpeach ?? "pos"} - ${mi}`}>
                    <h2>{meaning.partOfSpeach}</h2>
                    <h3>Meaning</h3>
                    <ul>
                      {meaning.definitions.map((d, i) => (
                        <li key={`${d.definition ?? i}`}>
                          <p>{d.definition}</p>
                          {d?.example && <blockquote>{d.example}</blockquote>}
                          {d?.synonyms?.length > 0 && (
                            <p>
                              Synonyms <span>{d.synonyms.join(", ")}</span>
                            </p>
                          )}
                          {d?.antonyms?.length > 0 && (
                            <p>
                              Antonyms <span>{d.antonyms.join(", ")}</span>
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}

                {/*source*/}

                {entry.sourceUrls?.length > 0 && (
                  <footer>
                    <h4>Source</h4>
                    <ul>
                      {entry.sourceUrls.map((url, i) => (
                        <li key={url ?? i}>
                          <a href="url" target="_blank">
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
