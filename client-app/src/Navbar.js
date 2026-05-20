import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
  const [mode, setMode] = useState("light");

  const toggleMode = () => {
    setMode((prev) =>
      prev === "light" ? "dark" : prev === "dark" ? "accent" : "light"
    );
  };

  return (
    <div className={`navbar ${mode}`}>

      {/* LOGO */}
      <div className="nav-left">
        <div className="logo-box">
          <div className="logo-circle">KK</div>
          <h2>KouravKart</h2>
        </div>
      </div>

      {/* LINKS (ONLY MAIN ROUTES) */}
      <div className="nav-links">
         <Link to="/">Home</Link>
<Link to="/adminmain">Admin</Link>
<Link to="/customermain">Customer</Link>
<Link to="/vendermain">Vendor</Link>

      </div>

      {/* THEME BUTTON */}
      <button className="theme-btn" onClick={toggleMode}>
        {mode === "light" ? <FaMoon /> : <FaSun />}
      </button>

    </div>
  );
}

export default Navbar;