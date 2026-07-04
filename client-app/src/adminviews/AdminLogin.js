import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const [uid, setUid] = useState("");
  const [upass, setUpass] = useState("");
  const navigate = useNavigate();

  // Permanent Admin Credentials
  const ADMIN_USERNAME = "ankit";
  const ADMIN_PASSWORD = "Ankit@1506";

  const handleLoginButton = () => {
    if (uid === ADMIN_USERNAME && upass === ADMIN_PASSWORD) {
      localStorage.setItem("adminAuth", "true");
      localStorage.setItem("admintoken", "12345");
      navigate("/adminmain/adminhome");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="adminlogin-container">
      <div className="adminlogin-form">
        <h4>Administrator Login</h4>

        <input
          type="text"
          placeholder="Admin Name"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={upass}
          onChange={(e) => setUpass(e.target.value)}
        />

        <button className="adminLogin-button" onClick={handleLoginButton}>
          Login
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;