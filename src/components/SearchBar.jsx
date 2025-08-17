import React, { useState, useRef, useEffect } from "react";
import submitImg from "../assets/images/icon-search.svg";

const SearchBar = () => {
  const [word, setWord] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

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

  return (
    <>
      <div className="search-input-form">
        <form onSubmit={handleSubmit}>
          <input
            type="search"
            id="searchInput"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            disabled={loading}
            onKeyDown={handleKeyDown}
            placeholder="Enter a word"
          />

          <button type="submit" disabled={loading}>
            <img src={submitImg} alt="search" />
          </button>
        </form>
      </div>

      <div aria-live="polite">
        {loading && <p>⏳ Loading...</p>}
        {error && <p>error: {error}</p>}
      </div>

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
                  <h1>{entry.word}</h1>

                  {phoneticsWithText?.text && <p>{phoneticsWithText.text}</p>}
                  {phoneticsWithAudio?.audio && (
                    <audio controls>
                      <source src={phoneticsWithAudio.audio} />
                    </audio>
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
    </>
  );
};

export default SearchBar;
