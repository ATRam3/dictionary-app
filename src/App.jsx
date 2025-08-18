import { useState } from "react";
import "./App.css";
import SearchBar from "./components/SearchBar";
import Navbar from "./components/Navbar/Navbar";

function App() {
  return (
    <div className="container">
      <Navbar />
      <SearchBar />
    </div>
  );
}

export default App;
