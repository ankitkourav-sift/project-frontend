import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EditCustomerProfile.css";

function EditCustomerProfile({ user, onClose, onUpdate }) {

  const [formData, setFormData] = useState(null);
  const [stlist, setStList] = useState([]);
  const [ctlist, setCtList] = useState([]);
  const [newImage, setnewImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const cid = Number(user?.Cid || user?.cid || user?._id);   // 🔥 IMPORTANT FIX

  // ================= LOAD CUSTOMER =================
  useEffect(() => {

  if (!cid) {
    console.log("CID NOT FOUND");
    return;
  }

  axios.get(`http://localhost:9292/customer/getcustomerdetails/${cid}`)
    .then((res) => {
      console.log("DATA:", res.data);
      setFormData(res.data);
    })
    .catch((err) => {
      console.log("ERROR:", err);
      setFormData({}); // 🔥 stop infinite loading
    });

}, [cid]);

  // ================= LOAD STATES =================
  useEffect(() => {
    axios.get("http://localhost:9292/state/show/")
      .then((res) => setStList(res.data))
      .catch(() => setStList([]));
  }, []);

  if (!formData) return <div>Loading...</div>;

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ================= STATE CHANGE =================
  const handleStateChange = (e) => {
    const stid = e.target.value;

    setFormData({
      ...formData,
      StId: stid,
      CtId: ""
    });

    axios.get(`http://localhost:9292/city/showcitybystate/${stid}`)
      .then((res) => setCtList(res.data))
      .catch(() => setCtList([]));
  };

  // ================= IMAGE =================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setnewImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  // ================= VALIDATION =================
  const validate = () => {
    const errs = {};

    if (!formData.CustomerName?.trim()) errs.CustomerName = "Required";
    if (!formData.StId) errs.StId = "Required";
    if (!formData.CtId) errs.CtId = "Required";
    if (!formData.CAddress?.trim()) errs.CAddress = "Required";
    if (!formData.CEmail?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      errs.CEmail = "Invalid email";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const form = new FormData();

      form.append("CustomerName", formData.CustomerName);
      form.append("CUserId", formData.CUserId);
      form.append("StId", formData.StId);
      form.append("CtId", formData.CtId);
      form.append("CAddress", formData.CAddress);
      form.append("CContact", formData.CContact);
      form.append("CEmail", formData.CEmail);

      if (newImage) {
        form.append("file", newImage);
      }

      const res = await axios.put(
        `http://localhost:9292/customer/update/${cid}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(res.data.message);

      const updatedUser = res.data.customer;

      const store = localStorage.getItem("userSession")
        ? localStorage
        : sessionStorage;

      store.setItem("userSession", JSON.stringify(updatedUser));

      onUpdate(updatedUser);
      onClose();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Update Error");
    }
  };

  return (
    <div className="edit-profile-container">

      <h4>Edit Profile</h4>

      <input
        name="CustomerName"
        value={formData.CustomerName || ""}
        onChange={handleChange}
        placeholder="Name"
      />
      {errors.CustomerName && <p>{errors.CustomerName}</p>}

      <select name="StId" value={formData.StId || ""} onChange={handleStateChange}>
        <option value="">State</option>
        {stlist.map((s) => (
          <option key={s.stid} value={s.stid}>{s.stname}</option>
        ))}
      </select>
      {errors.StId && <p>{errors.StId}</p>}

      <select
        name="CtId"
        value={formData.CtId || ""}
        onChange={(e) => setFormData({ ...formData, CtId: e.target.value })}
      >
        <option value="">City</option>
        {ctlist.map((c) => (
          <option key={c.ctid} value={c.ctid}>{c.ctname}</option>
        ))}
      </select>
      {errors.CtId && <p>{errors.CtId}</p>}

      <input
        name="CAddress"
        value={formData.CAddress || ""}
        onChange={handleChange}
        placeholder="Address"
      />

      <input
        name="CContact"
        value={formData.CContact || ""}
        onChange={handleChange}
        placeholder="Contact"
      />

      <input
        name="CEmail"
        value={formData.CEmail || ""}
        onChange={handleChange}
        placeholder="Email"
      />

     <img
  src={
    preview
      ? preview
      : formData?.CPicName && formData.CPicName.startsWith("http")
        ? formData.CPicName
        : formData?.CPicName
          ? `http://localhost:9292/customer/getimage/${formData.CPicName}`
          : "https://via.placeholder.com/100"
  }
  width="100"
  alt="profile"
/>

      <input type="file" onChange={handleFileChange} />

      <button onClick={handleSubmit}>Save</button>
      <button onClick={onClose}>Cancel</button>

    </div>
  );
}

export default EditCustomerProfile;