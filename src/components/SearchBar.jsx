import React, { useState } from "react";
import submitImg from "../assets/images/icon-search.svg";

const SearchBar = () => {
  const [word, setWord] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchWord = async () => {
    if (!word.trim()) {
      setError("please enter a word to search");
      return;
    }

    try {
      setError(null);
      setResult(null);

      setLoading(true);

      const api = `https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim()}`;
      const response = await fetch(api);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Word not found");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchWord();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchWord();
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
            onKeyDown={handleKeyDown}
            placeholder="Enter a word"
          />

          <button type="submit">
            <img src={submitImg} alt="" />
          </button>
        </form>
      </div>

      {loading && <p>⏳ Loading...</p>}
      {error && <p>error: {error}</p>}
      {result && (
        <div className="result">
          <div className="word-sound">
            <div className="word">
              <h1>{result[0].word}</h1>
              {result[0].phonetics.find((p) => p.text).text && (
                <p>{result[0].phonetics.find((p) => p.text).text}</p>
              )}

              {result[0].phonetics?.find((p) => p.audio) && (
                <audio controls>
                  <source
                    src={result[0].phonetics.find((p) => p.audio).audio}
                    type="audio/mpeg"
                  />
                </audio>
              )}
            </div>

            {result[0].meanings.map((meaning, index) => (
              <div key={index}>
                <h2>{meaning.partOfSpeech}</h2>
                <h3>Meaning</h3>

                {meaning.definitions.map((d, i) => (
                  <div>
                    <ul>
                      <li key={i}>
                        {d.definition}
                        {d?.example && <h4>{d.example}</h4>}
                      </li>
                    </ul>

                    <span>{d.synonyms && <p>{d.synonyms}</p>}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;
