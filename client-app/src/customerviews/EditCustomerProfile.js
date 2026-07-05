import React, { useEffect, useState } from "react";

import axios from "axios";

import "./EditCustomerProfile.css";

function EditCustomerProfile({
  user,
  onClose,
  onUpdate,
}) {

  const [formData, setFormData] = useState(null);

  const [stlist, setStList] = useState([]);

  const [ctlist, setCtList] = useState([]);

  const [newImage, setNewImage] = useState(null);

  const [preview, setPreview] = useState(null);

  const [errors, setErrors] = useState({});

  // ================= CUSTOMER ID =================

  const cid = Number(
    user?.Cid ||
    user?.cid ||
    user?._id
  );

  // ================= LOAD CUSTOMER =================

  useEffect(() => {

    if (!cid) {
      console.log("CID NOT FOUND");
      return;
    }

    axios
      .get(
        `https://project-backend-nka5.vercel.app/customer/getcustomerdetails/${cid}`
      )
      .then((res) => {

        console.log("CUSTOMER:", res.data);

        setFormData(res.data);

      })
      .catch((err) => {

        console.log("ERROR:", err);

        setFormData({});
      });

  }, [cid]);

  // ================= LOAD STATES =================

  useEffect(() => {

    axios
      .get("https://project-backend-nka5.vercel.app/state/show")
      .then((res) => {
        setStList(res.data);
      })
      .catch(() => {
        setStList([]);
      });

  }, []);

  // ================= LOAD CITY =================

  useEffect(() => {

    if (!formData?.StId) return;

    axios
      .get(
        `https://project-backend-nka5.vercel.app/city/showcitybystate/${formData.StId}`
      )
      .then((res) => {
        setCtList(res.data);
      })
      .catch(() => {
        setCtList([]);
      });

  }, [formData?.StId]);

  // ================= LOADING =================

  if (!formData) {
    return <div>Loading...</div>;
  }

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= STATE CHANGE =================

  const handleStateChange = (e) => {

    const stid = e.target.value;

    setFormData({
      ...formData,
      StId: stid,
      CtId: "",
    });

    axios
      .get(
        `https://project-backend-nka5.vercel.app/city/showcitybystate/${stid}`
      )
      .then((res) => {
        setCtList(res.data);
      })
      .catch(() => {
        setCtList([]);
      });
  };

  // ================= IMAGE CHANGE =================

  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setNewImage(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

  // ================= VALIDATION =================

  const validate = () => {

    const errs = {};

    if (!formData.CustomerName?.trim()) {
      errs.CustomerName = "Name required";
    }

    if (!formData.StId) {
      errs.StId = "Select state";
    }

    if (!formData.CtId) {
      errs.CtId = "Select city";
    }

    if (!formData.CAddress?.trim()) {
      errs.CAddress = "Address required";
    }

    if (
      !/^\d{10}$/.test(formData.CContact)
    ) {
      errs.CContact = "Invalid contact";
    }

    if (
      !formData.CEmail?.match(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      )
    ) {
      errs.CEmail = "Invalid email";
    }

    setErrors(errs);

    return (
      Object.keys(errs).length === 0
    );
  };

  // ================= UPDATE =================
// ================= UPDATE =================
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
      `https://project-backend-nka5.vercel.app/customer/update/${cid}`,
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert(res.data.message);

    const updatedUser = res.data.customer;
    

console.log("UPDATED USER FULL:");
console.log(updatedUser);



    // ✅ FIX 1: ONLY ONE STORAGE (REMOVE sessionStorage)
    localStorage.setItem(
      "userSession",
      JSON.stringify(updatedUser)
    );

    // ❌ REMOVE THIS (causes confusion/re-render issues)
    // sessionStorage.setItem("userSession", JSON.stringify(updatedUser));

    // ✅ FIX 2: SAFE PARENT UPDATE (IMPORTANT)
    onUpdate({
      ...updatedUser,
      _safeUpdate: true,
    });

    onClose();

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Update Error");
  }
};

  return (
    <div className="edit-profile-container">

      <h4>Edit Profile</h4>

      {/* ================= NAME ================= */}

      <input
        name="CustomerName"
        value={
          formData.CustomerName || ""
        }
        onChange={handleChange}
        placeholder="Name"
      />

      {errors.CustomerName && (
        <p>{errors.CustomerName}</p>
      )}

      {/* ================= STATE ================= */}

      <select
        name="StId"
        value={formData.StId || ""}
        onChange={handleStateChange}
      >

        <option value="">
          Select State
        </option>

        {stlist.map((s) => (

          <option
            key={s.stid}
            value={s.stid}
          >
            {s.stname}
          </option>

        ))}

      </select>

      {errors.StId && (
        <p>{errors.StId}</p>
      )}

      {/* ================= CITY ================= */}

      <select
        name="CtId"
        value={formData.CtId || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            CtId: e.target.value,
          })
        }
      >

        <option value="">
          Select City
        </option>

        {ctlist.map((c) => (

          <option
            key={c.ctid}
            value={c.ctid}
          >
            {c.ctname}
          </option>

        ))}

      </select>

      {errors.CtId && (
        <p>{errors.CtId}</p>
      )}

      {/* ================= ADDRESS ================= */}

      <input
        name="CAddress"
        value={
          formData.CAddress || ""
        }
        onChange={handleChange}
        placeholder="Address"
      />

      {errors.CAddress && (
        <p>{errors.CAddress}</p>
      )}

      {/* ================= CONTACT ================= */}

      <input
        name="CContact"
        value={
          formData.CContact || ""
        }
        onChange={handleChange}
        placeholder="Contact"
      />

      {errors.CContact && (
        <p>{errors.CContact}</p>
      )}

      {/* ================= EMAIL ================= */}

      <input
        name="CEmail"
        value={
          formData.CEmail || ""
        }
        onChange={handleChange}
        placeholder="Email"
      />

      {errors.CEmail && (
        <p>{errors.CEmail}</p>
      )}

      {/* ================= IMAGE ================= */}

      <div
        style={{
          marginTop: "10px",
          marginBottom: "10px",
        }}
      >

        <img
          src={
            preview
              ? preview
              : formData?.CPicName
              ? formData.CPicName
              : "https://via.placeholder.com/120"
          }
          width="120"
          height="120"
          alt="profile"
          style={{
            borderRadius: "10px",
            objectFit: "cover",
          }}
        />

      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* ================= BUTTONS ================= */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "15px",
        }}
      >

        <button onClick={handleSubmit}>
          Save
        </button>

        <button onClick={onClose}>
          Cancel
        </button>

      </div>

    </div>
  );
}

export default EditCustomerProfile;