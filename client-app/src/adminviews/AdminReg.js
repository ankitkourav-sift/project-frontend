import React from "react";
//import "./AdminReg.css";

function AdminReg() {
  const [aname, setAname] = React.useState("");
  const [aemail, setAemail] = React.useState("");
  const [apass, setApass] = React.useState("");

  const handleRegisterButton = () => {
    localStorage.setItem("adminId", aname);
    localStorage.setItem("adminPass", apass);

    alert(`Admin Registered:\nName: ${aname}\nEmail: ${aemail}`);
  };

  return (
    <div className="adminreg-container">
      <div className="adminreg-form">
        <h4>Admin Registration</h4>

        <input
          type="text"
          placeholder="Admin Name"
          value={aname}
          onChange={(e) => setAname(e.target.value)}
        />

        <input
          type="email"
          placeholder="Admin Email"
          value={aemail}
          onChange={(e) => setAemail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={apass}
          onChange={(e) => setApass(e.target.value)}
        />

        <button
          className="adminReg-button"
          onClick={handleRegisterButton}
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default AdminReg;