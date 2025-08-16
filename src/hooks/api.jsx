import React, { useState, useRef, useEffect } from "react";

/**
 * DictionaryLookup
 * - Type a word and click Search (or press Enter).
 * - Shows loading, results, and friendly errors.
 * - Uses AbortController to cancel previous fetch if user searches again quickly.
 * - Debounce input optional: currently triggers on Search button / Enter to simplify.
 */
export default function DictionaryLookup() {
  const [query, setQuery] = useState(""); // the text in the input
  const [data, setData] = useState(null); // the API response parsed
  const [loading, setLoading] = useState(false); // loading indicator
  const [error, setError] = useState(null); // error message
  const abortControllerRef = useRef(null); // stores AbortController to cancel fetches

  // Helper: clear previous result + error (nice UX)
  const resetState = () => {
    setData(null);
    setError(null);
  };

  // Main fetch function
  const fetchWord = async (word) => {
    // sanity guard
    const trimmed = word.trim();
    if (!trimmed) {
      setError("Please enter a word to search.");
      setData(null);
      return;
    }

    // cancel previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Always encode user input into URL
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
        trimmed
      )}`;

      const response = await fetch(url, { signal: controller.signal });

      // dictionaryapi.dev returns 404 for unknown words — handle that
      if (response.status === 404) {
        setError(`No definition found for "${trimmed}".`);
        return;
      }

      if (!response.ok) {
        // generic network/server error
        throw new Error(`Server error: ${response.status}`);
      }

      const json = await response.json();
      // The API returns an array of entries; we'll save the whole array.
      setData(json);
    } catch (err) {
      // If fetch was aborted, do nothing (user requested a new search)
      if (err.name === "AbortError") return;
      setError(err.message || "Failed to fetch definition.");
    } finally {
      setLoading(false);
      // clear controller reference once finished
      abortControllerRef.current = null;
    }
  };

  // Optional: search when user presses Enter
  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchWord(query);
    }
  };

  // Utility to collect definitions and synonyms safely
  const renderResults = (entries) => {
    if (!Array.isArray(entries) || entries.length === 0) return null;

    // We'll show the first entry prominently and also list other entries if present.
    return (
      <div className="dict-results">
        {entries.map((entry, entryIndex) => {
          // entry fields commonly: word, phonetics (array), meanings (array)
          const word = entry.word;
          const phonetics = entry.phonetics || [];
          const meanings = entry.meanings || [];

          // collect synonyms across meanings/definitions
          const synonymSet = new Set();
          meanings.forEach((m) => {
            (m.synonyms || []).forEach((s) => synonymSet.add(s));
            (m.definitions || []).forEach((d) =>
              (d.synonyms || []).forEach((s) => synonymSet.add(s))
            );
          });
          const synonyms = Array.from(synonymSet);

          return (
            <section key={entryIndex} style={{ marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>
                {word}{" "}
                {phonetics[0] && phonetics[0].text && (
                  <small style={{ color: "#666" }}>{phonetics[0].text}</small>
                )}
              </h2>

              {/* audio example (if available) */}
              {phonetics.map(
                (p, i) =>
                  p.audio && (
                    <div key={i}>
                      <audio controls src={p.audio}>
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )
              )}

              {/* Meanings */}
              {meanings.map((m, i) => (
                <div key={i} style={{ marginTop: 10 }}>
                  <strong>{m.partOfSpeech}</strong>
                  <ol>
                    {(m.definitions || []).map((d, idx) => (
                      <li key={idx} style={{ marginBottom: 6 }}>
                        {/* main definition text */}
                        <div>{d.definition}</div>

                        {/* optional example */}
                        {d.example && (
                          <div style={{ color: "#555", fontStyle: "italic" }}>
                            Example: {d.example}
                          </div>
                        )}

                        {/* optional synonyms per definition */}
                        {d.synonyms && d.synonyms.length > 0 && (
                          <div style={{ color: "#444" }}>
                            Synonyms: {d.synonyms.join(", ")}
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}

              {/* aggregated synonyms */}
              {synonyms.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>All Synonyms:</strong> {synonyms.join(", ")}
                </div>
              )}
            </section>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1>Dictionary Lookup</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a word (e.g. example) and press Enter or click Search"
          aria-label="Search word"
          style={{ flex: 1, padding: "8px 10px", fontSize: 16 }}
        />
        <button
          onClick={() => fetchWord(query)}
          style={{ padding: "8px 12px", fontSize: 16 }}
        >
          Search
        </button>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      {data && renderResults(data)}
    </div>
  );
}
