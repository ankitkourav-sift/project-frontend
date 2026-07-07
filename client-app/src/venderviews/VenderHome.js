import React, { useState, useEffect } from "react";
import EditVenderProfile from "./EditVenderProfile";
import VenderChangePass from "./Vender_Change_Pass";
import ManageProductPanel from "./ManageProductPanel";
import "./VenderHome.css";
import AddSaleForm from "./AddSaleForm";

import VenderSales from "./VenderSales";
import InventoryDashboard from "./InventoryDashboard";
import ProductStockManager from "./ProductStockManager";

function VenderHome({ vender, onLogout }) {

  const [editing, setEditing] = useState(false);
  const [venderData, setVenderData] = useState(null);

  const [isshowproduct, setIsShowProduct] = useState(false);
  const [isshowvendorsales, setIsShowVendorSales] = useState(false);
  const [isChangePass, setIsChangePass] = useState(false);
  const [isinventory, setIsinventory] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);

  const [isShrunk, setIsShrunk] = useState(false);

  // ================= LOAD VENDOR =================
  useEffect(() => {
    if (vender) {
      setVenderData(vender);
    }
  }, [vender]);

  // ================= SCROLL EFFECT =================
  useEffect(() => {
    const handleScroll = () => {
      setIsShrunk(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ================= LOADING =================
  if (!venderData) {
    return <div>Loading vendor...</div>;
  }

  // ================= COMMON RESET =================
  const closeAll = () => {
    setShowSaleForm(false);
    setIsShowProduct(false);
    setIsShowVendorSales(false);
    setIsinventory(false);
    setIsChangePass(false);
    setEditing(false);
  };

  return (
    <div className="vh-container">

      {/* HEADER */}
      <div className="vh-header">

        <img
          src={venderData?.VPicName}
          alt="Vendor"
          className={`vh-avatar ${isShrunk ? "vh-avatar-shrink" : ""}`}
        />

        <div className="vh-userinfo">
          <h3 className="vh-name">{venderData?.VenderName}</h3>

          {isShrunk && (
            <>
              <p className="vh-email">EMAIL: {venderData?.VEmail}</p>
              <p className="vh-contact">CONTACT: {venderData?.VContact}</p>
            </>
          )}
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="vh-actions">

        {/* ADD SALE */}
        <button onClick={() => {
          closeAll();
          setShowSaleForm(true);
        }}>
          Add Sale
        </button>

        {/* CHANGE PASSWORD */}
        <button onClick={() => {
          closeAll();
          setIsChangePass(true);
        }}>
          Change Password
        </button>

        {/* PRODUCT */}
        <button onClick={() => {
          closeAll();
          setIsShowProduct(true);
        }}>
          Manage Product
        </button>

        {/* SALES */}
        <button onClick={() => {
          closeAll();
          setIsShowVendorSales(true);
        }}>
          View Sales
        </button>

        {/* INVENTORY */}
        <button onClick={() => {
          closeAll();
          setIsinventory(true);
        }}>
          View Inventory
        </button>

        {/* LOGOUT */}
        <button onClick={() => {
          localStorage.removeItem("venderSession");
          onLogout();
        }}>
          LOGOUT
        </button>

      </div>

      {/* CONTENT */}
      <div className="vh-content">

        {/* ✅ ADD SALE FORM */}
        {showSaleForm && (
          <AddSaleForm venderId={Number(venderData?.Vid)} />
        )}

        {/* PROFILE EDIT */}
        {editing && (
          <EditVenderProfile
            vender={venderData}
            onClose={() => setEditing(false)}
            onUpdate={(updated) => setVenderData(updated)}
          />
        )}

        {/* PASSWORD */}
        {isChangePass && (
          <VenderChangePass
    VUserId={venderData?.VUserId}
    onClose={() => setIsChangePass(false)}
/>
        )}

        {/* PRODUCT PANEL */}
        {isshowproduct && (
          <ManageProductPanel vid={Number(venderData?.Vid)} />
        )}

        {/* SALES */}
        {isshowvendorsales && (
          <VenderSales vender={venderData} />
        )}

        {/* INVENTORY */}
        {isinventory && (
          <>
            <ProductStockManager vendorId={Number(venderData?.Vid)} />
            <InventoryDashboard vid={Number(venderData?.Vid)} />
          </>
        )}

      </div>

    </div>
  );
}

export default VenderHome;