import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
  const [mode, setMode] = useState("light");
const [menuOpen, setMenuOpen] = useState(false);
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
<div className={`nav-links ${menuOpen ? "active" : ""}`}>

<Link to="/" onClick={() => setMenuOpen(false)}>
Home
</Link>

<Link to="/adminmain" onClick={() => setMenuOpen(false)}>
Admin
</Link>

<Link to="/customermain" onClick={() => setMenuOpen(false)}>
Shop
</Link>

<Link to="/vendermain" onClick={() => setMenuOpen(false)}>
Vendor
</Link>

</div>


<button
className="menu-btn"
onClick={() => setMenuOpen(!menuOpen)}
>
{
menuOpen ? <FaTimes/> : <FaBars/>
}
</button>

    </div>
  );
}

export default Navbar;