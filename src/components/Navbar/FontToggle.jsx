import React, { useEffect, useState } from "react";
import dropDownImg from "../../assets/images/icon-arrow-down.svg";
import "../../styles/FontToggle.css";

// Font family map
const FONT_MAP = {
  Serif: "Georgia, 'Times New Roman', serif",
  "Sans Serif":
    "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  Mono: "ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
};

const FontToggle = () => {
  // Default to Serif
  const [font, setFont] = useState("Serif");

  // Load saved font from localStorage on first render
  useEffect(() => {
    const savedFont = localStorage.getItem("font");
    if (savedFont && FONT_MAP[savedFont]) {
      setFont(savedFont);
    }
  }, []);

  // Apply font + save to localStorage whenever font changes
  useEffect(() => {
    const cssFont = FONT_MAP[font] || FONT_MAP["Serif"];
    document.body.style.fontFamily = cssFont;
    localStorage.setItem("font", font);
  }, [font]);

  return (
    <div className="dropdown-wrapper">
      <select
        name="font-toggle"
        id="fontToggle"
        value={font}
        onChange={(e) => setFont(e.target.value)}
      >
        <option value="Serif">Serif</option>
        <option value="Sans Serif">Sans Serif</option>
        <option value="Mono">Mono</option>
      </select>

      <span className="custom-wrapper">
        <img src={dropDownImg} alt="Dropdown arrow" />
      </span>
    </div>
  );
};

export default FontToggle;
