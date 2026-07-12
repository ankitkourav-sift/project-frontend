import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import StateMgt from "./StateMgt";
import CityMgt from "./City.Mgt";
import ProductCatgMgt from "./ProductCatgMgt";
import VenderMgt from "./VenderMgt";
import ShowBills from "./ShowBills";
import ProductList from "./ProductList";
import CustomerMgt from "./CustomerMgt";
import UpdateOrderStatus from "./UpdateOrderStatus";
import AdminVenderSales from "./AdminVenderSales";
import ReturnRequests from "./ReturnRequests";
import AdminDashboard from "./AdminDashboard";

import "./AdminHome.css";

function AdminHome() {
  const [active, setActive] = useState("");

  const navigate = useNavigate();

  function LogOutButtonClick() {
    localStorage.removeItem("admintoken");
    navigate("/adminmain/adminlogin");
  }

  const renderComponent = () => {
    switch (active) {
      case "state":
        return <StateMgt />;
      case "city":
        return <CityMgt />;
      case "category":
        return <ProductCatgMgt />;
      case "vender":
        return <VenderMgt />;
      case "bill":
        return <ShowBills />;
      case "product":
        return <ProductList />;
      case "customer":
        return <CustomerMgt />;
      case "order":
        return <UpdateOrderStatus updateByName={"Admin"} />;
      case "sales":
        return <AdminVenderSales />;
            case "returns":
      return <ReturnRequests />;   
      
      default:
        
  return <AdminDashboard />;
        return (
          <div className="welcome-box">
            <h2>Welcome Admin 👋</h2>
            <p>Select an option from sidebar</p>
          </div>
        );
    }
  };

  return (
    <div className="admin-container">

      {/* LEFT SIDEBAR */}
      <div className="sidebar">
        <h2 className="logo">Admin Panel</h2>

        <button onClick={() => setActive("state")}>State</button>
        <button onClick={() => setActive("city")}>City</button>
        <button onClick={() => setActive("category")}>Category</button>
        <button onClick={() => setActive("vender")}>Vender</button>
        <button onClick={() => setActive("bill")}>Bills</button>
        <button onClick={() => setActive("order")}>Order Status</button>
        <button onClick={() => setActive("returns")}> Return Requests</button>
        <button onClick={() => setActive("product")}>Product</button>
        <button onClick={() => setActive("customer")}>Customer</button>
        <button onClick={() => setActive("sales")}>Vendor Sales</button>

        <button className="logout" onClick={LogOutButtonClick}>
          Logout
        </button>
      </div>

      {/* RIGHT CONTENT */}
      <div className="main-content">
        {renderComponent()}
      </div>

    </div>
  );
}

export default AdminHome;