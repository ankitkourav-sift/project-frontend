import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./OrderTrackingPerBillId.css";

const STATUS_FLOW = [
  "Processing",
  "Order Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

function OrderTrackingPerBillId() {
  const { billid } = useParams();

  const safeBillId = billid?.trim(); // 🔥 IMPORTANT FIX

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 DEBUG: BILL ID CHECK
  useEffect(() => {
    console.log("👉 BILLID FROM URL:", safeBillId);
  }, [safeBillId]);

  // ================= FETCH ORDER =================
  const fetchOrder = async () => {
    if (!safeBillId) {
      console.log("❌ billid missing");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(
        `https://project-backend-nka5.vercel.app/bill/showbillbyid/${safeBillId}`
      );

      console.log("✅ API RESPONSE:", res.data);

      setOrder(res.data?.[0] || null);
    } catch (err) {
      console.log("❌ API ERROR:", err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  // ================= EFFECT =================
  useEffect(() => {
    if (!safeBillId || safeBillId === "undefined") return;

    fetchOrder();

    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, [safeBillId]);

  const currentIndex = order
    ? Math.max(STATUS_FLOW.indexOf(order.status), 0)
    : 0;

  return (
    <div className="track-container">

      <h2>📦 Order Tracking</h2>

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* DEBUG / ERROR STATE */}
      {!safeBillId && (
        <p style={{ color: "red" }}>
          ❌ Bill ID NOT FOUND (CHECK ROUTE)
        </p>
      )}

      {/* EMPTY STATE */}
      {safeBillId && !order && !loading && (
        <p>No Order Found</p>
      )}

      {/* ORDER CARD */}
      {order && (
        <div className="card">

          <h3>Bill #{order.billid}</h3>
          <p>Status: {order.status}</p>

          {/* PROGRESS BAR */}
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
                className={i <= currentIndex ? "active" : ""}
              >
                {s}
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

export default OrderTrackingPerBillId;