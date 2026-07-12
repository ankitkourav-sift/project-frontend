import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    pendingReturns: 0,
    totalRevenue: 0,
  });

  const BASE_URL = "https://project-backend-nka5.vercel.app";

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/dashboard/stats`
        );

        console.log("Dashboard API:", res.data);
           console.log("API DATA:", res.data);

        setStats(res.data);
      } catch (err) {
        console.log("Dashboard Error:", err);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="dashboard-container">

      <div className="dashboard-card">
        <h3>Total Customers</h3>
        <h1>{stats.totalCustomers}</h1>
      </div>

      <div className="dashboard-card">
        <h3>Total Products</h3>
        <h1>{stats.totalProducts}</h1>
      </div>

      <div className="dashboard-card">
        <h3>Total Orders</h3>
        <h1>{stats.totalOrders}</h1>
      </div>

      <div className="dashboard-card">
        <h3>Delivered Orders</h3>
        <h1>{stats.deliveredOrders}</h1>
      </div>

      <div className="dashboard-card">
        <h3>Cancelled Orders</h3>
        <h1>{stats.cancelledOrders}</h1>
      </div>

      <div className="dashboard-card">
        <h3>Pending Returns</h3>
        <h1>{stats.pendingReturns}</h1>
      </div>

      <div className="dashboard-card revenue-card">
        <h3>Total Revenue</h3>
        <h1>₹{stats.totalRevenue}</h1>
      </div>

    </div>
  );
}

export default AdminDashboard;