import React, { useEffect, useState } from "react";
import lightTheme from "../../assets/images/icon-moon.svg";
import darkTheme from "../../assets/images/icon-moon-purple.svg";
import "../../styles/ThemeToggle.css";

const ThemeToggle = () => {
  const [theme, setTheme] = useState("dark");

  //This code retrieves the saved theme from local storage
  // and sets the data-theme attribute on the <html> tag to either
  // 'dark' or 'light' based on the saved value.

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") === "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute(
        "data-theme",
        savedTheme ? "dark" : "light"
      );
    }
  }, []);

  //When the button is clicked, it calls the toggleTheme function.
  // This function sets a new theme, updates the state with it, and saves it to local storage.

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <>
      <button onClick={toggleTheme} className="toggle-theme">
        {theme === "light" ? (
          <>
            <div className="toggle-on"></div>
            <img src={lightTheme} />
          </>
        ) : (
          <>
            <div className="toggle-off"></div>
            <img src={darkTheme} />
          </>
        )}
      </button>
    </>
  );
};

export default ThemeToggle;
