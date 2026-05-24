import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrderTracking.css";

const STATUS_FLOW = [
  "Processing",
  "Order Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

function OrderTracking({ CUserId }) {
  const [billIds, setBillIds] = useState([]);
  const [billid, setBillid] = useState("");
  const [order, setOrder] = useState(null);

  // load bills
  useEffect(() => {
    if (!CUserId) return;

    axios
      .get(`https://project-backend-nka5.vercel.app/bill/billshowbillids/${CUserId}`)
      .then((res) => setBillIds(res.data))
      .catch(console.log);
  }, [CUserId]);

  // load order
  const loadOrder = async (id) => {
    try {
      const res = await axios.get(
        `https://project-backend-nka5.vercel.app/bill/showbillbyid/${id}`
      );
      setOrder(res.data?.[0] || null);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!billid) return;

    loadOrder(billid);

    const interval = setInterval(() => {
      loadOrder(billid);
    }, 4000);

    return () => clearInterval(interval);
  }, [billid]);

  const currentIndex = order
    ? Math.max(STATUS_FLOW.indexOf(order.status), 0)
    : 0;

  return (
    <div className="track-container">

      <h2 className="track-title">🚚 Track Your Order</h2>

      <select
        className="dropdown"
        value={billid}
        onChange={(e) => setBillid(e.target.value)}
      >
        <option value="">Select Bill</option>
        {billIds.map((b, i) => (
          <option key={i} value={b.billid}>
            {b.billid} - {b.billdate}
          </option>
        ))}
      </select>

      {!order && billid && <p className="empty">Loading order...</p>}

      {order && (
        <div className="card">

          <div className="card-header">
            <h3>{order.billid}</h3>
            <span className="badge">{order.status}</span>
          </div>

          <p>Product ID: {order.pid}</p>
          <p>Quantity: {order.Qty}</p>

          <div className="progress">
            <div
              className="progress-bar"
              style={{
                width: `${
                  (currentIndex / (STATUS_FLOW.length - 1)) * 100
                }%`,
              }}
            />
          </div>

          <div className="steps">
            {STATUS_FLOW.map((s, i) => (
              <div
                key={i}
                className={`step ${i <= currentIndex ? "active" : ""}`}
              >
                <div className="circle">{i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

export default OrderTracking;