import React, { useState } from "react";
import submitImg from "../assets/images/icon-search.svg";

const SearchBar = () => {
  const [word, setWord] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchWord = async () => {
    const api = "https://api.dictionaryapi.dev/api/v2/entries/en/<word>";

    try {
      setError(null);
      setResult(null);

      setLoading(true);
      const response = await fetch(api);

      if (!response.ok) {
        setError("Field to fetch the data. ", error);
      }

      const data = await response.json();
      setResult(data[0]);
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

  return (
    <>
      <div className="search-input-form">
        <form>
          <input
            type="search"
            id="searchInput"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a word"
          />

          <button type="submit" onClick={searchWord}>
            <img src={submitImg} alt="" />
          </button>
        </form>
      </div>

      <div className="result">
        {loading && <p>⏳ Loading...</p>}
        {error && <p>error: {error}</p>}
        {result && (
          <div>
            <h1>{result.word}</h1>
            <p>{result.definitions[0].definition[0]}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBar;
