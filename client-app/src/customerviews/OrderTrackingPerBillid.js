import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrderTrackingModern.css";

const STATUS_FLOW = [
  "Processing",
  "Order Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

function OrderTrackingPerBillId({ BillId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadOrder = async (billid) => {
    if (!billid) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:9292/bill/showbillbyid/${billid}`
      );

      // backend returns array
      setOrder(res.data?.[0] || null);
    } catch (err) {
      console.error(err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!BillId) return;

    loadOrder(BillId);

    const interval = setInterval(() => {
      loadOrder(BillId);
    }, 4000);

    return () => clearInterval(interval);
  }, [BillId]);

  const currentIndex = order
    ? Math.max(STATUS_FLOW.indexOf(order.status), 0)
    : 0;

  return (
    <div className="track-container">

      <h2 className="track-title">📦 Order Tracking</h2>

      {loading && <p className="loading">Loading...</p>}

      {!order && !loading && (
        <p className="empty">Select an order to track</p>
      )}

      {order && (
        <div className="card">

          <div className="card-header">
            <h3>Bill #{order.billid}</h3>
            <span className="badge">{order.status}</span>
          </div>

          <p><b>Date:</b> {order.billdate}</p>

          {/* PROGRESS */}
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

          {/* STEPS */}
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

export default OrderTrackingPerBillId;