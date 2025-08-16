import React, { useState } from 'react';
import submitImg from '../assets/images/icon-search.svg';

const SearchBar = () => {
  const [word, setWord] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    setWord('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type='search'
          id='searchInput'
          value={word}
          onChange={(e) =>
            setWord(e.target.value)
          }
          placeholder='Enter a word'
        />

        <button type='submit'>
          <img src={submitImg} alt='' />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
