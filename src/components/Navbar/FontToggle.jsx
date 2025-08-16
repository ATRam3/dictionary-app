import React, {
  useEffect,
  useState,
} from 'react';
import dropDownImg from '../../assets/images/icon-arrow-down.svg';

import '../../styles/FontToggle.css';

//Here, I've simply added the font families as an object.

const FONT_MAP = {
  Serif:
    "Georgia, 'Times New Roman', serif",
  'Sans Serif':
    "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  Mono: "ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
};

const FontToggle = () => {
  // Initialize the state with the 'serif' font.
  const [font, setFont] =
    useState('Serif');

  // Retrieve the saved font family from local storage and update the state.

  useEffect(() => {
    const saveFontFamily =
      localStorage.getItem('font');

    if (saveFontFamily) {
      setFont(saveFontFamily);
    }
  }, []);

  //I've set the font family to a default, but it can be changed by the user.

  useEffect(() => {
    const cssFont =
      FONT_MAP[font] ||
      FONT_MAP['Sarif'];

    document.body.style.fontFamily =
      cssFont;
    localStorage.setItem('font', font);
  }, [font]);

  return (
    <div className='dropdown-wrapper'>
      <select
        name='font toggle'
        id='fontToggle'
        value={font}
        onChange={(e) =>
          setFont(e.target.value)
        }
      >
        <option value='Serif'>
          Serif
        </option>
        <option value='Sans Serif'>
          Sans Serif
        </option>
        <option value='Mono'>
          Mono
        </option>
      </select>

      <span className='custom-wrapper'>
        <img src={dropDownImg} alt='' />
      </span>
    </div>
  );
};

export default FontToggle;
