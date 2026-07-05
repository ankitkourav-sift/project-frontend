import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaShoppingCart,
  FaUserEdit,
  FaTruck,
  FaKey,
  FaSignOutAlt,
  FaBoxOpen,
} from "react-icons/fa";

import ProductCatalog from "../productviews/ProductCatalog";
import ViewOrder from "./ViewOrder";
import OrderTracking from "./OrderTracking";
import Customer_Change_Pass from "./Customer_Change_Pass";
import EditCustomerProfile from "./EditCustomerProfile";

import "./CustomerHome.css";

function CustomerHome() {

  const [user, setUser] = useState(null);

  const [activeTab, setActiveTab] = useState("shop");

  const [showEdit, setShowEdit] = useState(false);

  const navigate = useNavigate();

  // ================= LOAD SESSION =================

  useEffect(() => {

    const raw =
      localStorage.getItem("userSession") ||
      sessionStorage.getItem("userSession");

    if (!raw) {
      navigate("/customermain/customerlogin");
      return;
    }

    setUser(JSON.parse(raw));

  }, [navigate]);

  // ================= CUSTOMER ID =================

 const customerId = useMemo(() => {
  if (!user) return null;

  return String(user.Cid);
}, [user]);



  // ================= LOGOUT =================

  const logout = () => {

    localStorage.clear();

    sessionStorage.clear();

    navigate("/clogin");
  };

  // ================= LOADING =================

  if (!user) {
    return <h3 className="loading">Loading...</h3>;
  }

  return (
    <div className="home-container">

      {/* ================= SIDEBAR ================= */}

      <div className="sidebar">

        <h2>KouravKart</h2>

        <button onClick={() => setShowEdit(true)}>
          <FaUserEdit /> Profile
        </button>

        <button onClick={() => setActiveTab("shop")}>
          <FaShoppingCart /> Shop
        </button>

        <button onClick={() => setActiveTab("orders")}>
          <FaBoxOpen /> Orders
        </button>

        <button onClick={() => setActiveTab("track")}>
          <FaTruck /> Track
        </button>

        <button onClick={() => setActiveTab("pass")}>
          <FaKey /> Password
        </button>

        <button
          className="logout"
          onClick={logout}
        >
          <FaSignOutAlt /> Logout
        </button>

      </div>

      {/* ================= MAIN ================= */}

      <div className="main-content">

        {/* ================= TOPBAR ================= */}

        <div className="topbar">

   <img
  src={
    user?.CPicName?.startsWith("http")
      ? user.CPicName
      : `https://project-backend-nka5.vercel.app/customer_images/${user?.CPicName}`
  }
  alt="profile"
/>
          <h3>
            {user?.cfname || user?.CustomerName}
          </h3>

        </div>

        {/* ================= CONTENT ================= */}

        <div className="content">

          {activeTab === "shop" && (
            <ProductCatalog
              mode="main"
              cid={customerId}
            />
          )}

          {activeTab === "orders" && (
            <ViewOrder
              CUserId={customerId}
            />
          )}

          {activeTab === "track" && (
            <OrderTracking
              CUserId={customerId}
            />
          )}

          {activeTab === "pass" && (
            <Customer_Change_Pass
              Customer={user}
            />
          )}

        </div>

      </div>

      {/* ================= EDIT PROFILE MODAL ================= */}

      {showEdit && (

        <div className="modal-overlay">

          <div className="modal-box">

            <EditCustomerProfile

              user={user}

              onClose={() => setShowEdit(false)}

              onUpdate={(updatedUser) => {

                setUser(updatedUser);

                localStorage.setItem(
                  "userSession",
                  JSON.stringify(updatedUser)
                );

                sessionStorage.setItem(
                  "userSession",
                  JSON.stringify(updatedUser)
                );

                setShowEdit(false);

              }}
            />

          </div>

        </div>
      )}

    </div>
  );
}

export default CustomerHome;