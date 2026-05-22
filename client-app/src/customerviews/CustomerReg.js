import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CustomerReg.css";

function CustomerReg() {
  const [cuserid, setCUserId] = useState("");
  const [cuserpass, setCUserPass] = useState("");
  const [customername, setCustomerName] = useState("");
  const [stid, setStId] = useState("");
  const [ctid, setCtId] = useState("");
  const [caddress, setCAddress] = useState("");
  const [ccontact, setCContact] = useState("");
  const [cemail, setCEmail] = useState("");
  const [cid, setCId] = useState("");
  const [image, setImage] = useState({ preview: "", data: null });

  const [slist, setSList] = useState([]);
  const [ctlist, setCtList] = useState([]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  // ================= INIT =================
  useEffect(() => {
    axios
      .get("http://localhost:9292/customer/getcustomercount")
      .then((res) => setCId(res.data.count + 1))
      .catch(() => setCId(1));

    axios
      .get("http://localhost:9292/state/show")
      .then((res) => setSList(res.data))
      .catch(() => alert("State load error"));
  }, []);

  // ================= STATE CHANGE =================
  const handleStIdSelect = (evt) => {
    setStId(evt.target.value);

    axios
      .get(
        "http://localhost:9292/city/showcitybystate/" +
          evt.target.value
      )
      .then((res) => setCtList(res.data))
      .catch(() => alert("City load error"));
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    let temp = {};
    let valid = true;

    if (!cuserpass || cuserpass.length < 6) {
      temp.cuserpass = "Password min 6 char";
      valid = false;
    }

    if (!customername.match(/^[A-Za-z ]+$/)) {
      temp.customername = "Only letters allowed";
      valid = false;
    }

    if (!stid) {
      temp.stid = "Select state";
      valid = false;
    }

    if (!ctid) {
      temp.ctid = "Select city";
      valid = false;
    }

    if (!caddress) {
      temp.caddress = "Address required";
      valid = false;
    }

    if (!/^\d{10}$/.test(ccontact)) {
      temp.ccontact = "Invalid contact";
      valid = false;
    }

    if (!/\S+@\S+\.\S+/.test(cemail)) {
      temp.cemail = "Invalid email";
      valid = false;
    }

    if (!image.data) {
      temp.cpicname = "Upload image";
      valid = false;
    }

    setErrors(temp);
    return valid;
  };

  // ================= REGISTER =================
  const handleRegisterButton = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    let formData = new FormData();

    formData.append("CUserId", cuserid);
    formData.append("CUserPass", cuserpass);
    formData.append("CustomerName", customername);
    formData.append("StId", stid);
    formData.append("CtId", ctid);
    formData.append("CAddress", caddress);
    formData.append("CContact", ccontact);
    formData.append("CEmail", cemail);
    formData.append("Cid", cid);
    formData.append("Status", "active");

    // 🔥 IMAGE
    formData.append("file", image.data);

    try {
      const res = await axios.post(
        "http://localhost:9292/customer/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setStatus("✅ Registration Successful");
      alert(res.data.message);

    } catch (err) {
      console.log(err);
      setStatus("❌ Registration Failed");
      alert("Registration failed");
    }
  };

  // ================= IMAGE =================
  const handleFileChange = (evt) => {
    const file = evt.target.files[0];

    if (file) {
      setImage({
        preview: URL.createObjectURL(file),
        data: file,
      });
    }
  };

  return (
    <div className="cr-container">
      <div className="cr-form">
        <h2>Customer Registration</h2>

        <p>{status}</p>

        <form onSubmit={handleRegisterButton}>

          <p>ID: {cid}</p>

          <input
            type="text"
            placeholder="User ID"
            onChange={(e) => setCUserId(e.target.value)}
          />
          <span>{errors.cuserid}</span>

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setCUserPass(e.target.value)}
          />
          <span>{errors.cuserpass}</span>

          <input
            type="text"
            placeholder="Customer Name"
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <span>{errors.customername}</span>

          <select onChange={handleStIdSelect}>
            <option value="">Select State</option>
            {slist.map((s) => (
              <option key={s.stid} value={s.stid}>
                {s.stname}
              </option>
            ))}
          </select>

          <select onChange={(e) => setCtId(e.target.value)}>
            <option value="">Select City</option>
            {ctlist.map((c) => (
              <option key={c.ctid} value={c.ctid}>
                {c.ctname}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Address"
            onChange={(e) => setCAddress(e.target.value)}
          />

          <input
            type="text"
            placeholder="Contact"
            onChange={(e) => setCContact(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setCEmail(e.target.value)}
          />

          <input type="file" onChange={handleFileChange} />

          {image.preview && (
            <img
              src={image.preview}
              alt="preview"
              width="100"
            />
          )}

          <button type="submit">Register</button>

        </form>
      </div>
    </div>
  );
}

export default CustomerReg;