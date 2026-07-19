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
   <div className="navbar-logo">

  <div className="logo-circle">
        S
    </div>


  <div className="logo-text">
    <h1>ShopNexa</h1>
    <span>Smart Shopping Experience</span>
  </div>
</div>

      {/* LINKS (ONLY MAIN ROUTES) */}
      <div className="nav-links">
         <Link to="/">Home</Link>
<Link to="/adminmain">Admin</Link>
<Link to="/customermain">Shop</Link>
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