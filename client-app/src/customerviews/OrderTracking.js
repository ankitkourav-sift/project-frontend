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
  "Return Requested",
  "Returned",
  "Cancelled",
];

function OrderTracking({ CUserId }) {
  const [billIds, setBillIds] = useState([]);
  const [billid, setBillid] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= LOAD BILL IDS =================
  useEffect(() => {
    if (!CUserId) return;

    axios
      .get(
        `https://project-backend-nka5.vercel.app/bill/billshowbillids/${CUserId}`
      )
      .then((res) => {
        console.log("Bill IDs:", res.data);
        setBillIds(res.data || []);
      })
      .catch((err) => console.log(err));
  }, [CUserId]);

  // ================= LOAD ORDER =================
  const loadOrder = async (id) => {
    if (!id) return;

    setLoading(true);

    try {
      const res = await axios.get(
        `https://project-backend-nka5.vercel.app/order/getorder/${id}`
      );

      console.log("Selected Order:", res.data);

      setOrder(res.data || null);
    } catch (err) {
      console.log(err);
      setOrder(null);
    }

    setLoading(false);
  };

 useEffect(() => {
  if (!billid) {
    setOrder(null);
    return;
  }

  loadOrder(billid);

  const interval = setInterval(() => {
    loadOrder(billid);
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, [billid]);

  // ================= CANCEL =================
  const handleCancel = async (billid) => {
    const reason = prompt(
      "Why do you want to cancel this order?"
    );

    if (!reason) return;

    try {
      await axios.put(
        `https://project-backend-nka5.vercel.app/order/cancel/${billid}`,
        { reason }
      );

      alert("Order Cancelled");
      loadOrder(billid);
    } catch (err) {
      console.log(err);
      alert("Cancel Failed");
    }
  };

  // ================= RETURN =================
  const handleReturn = async (billid) => {
    const reason = prompt(
      "Why do you want to return this order?"
    );

    if (!reason) return;

    try {
      await axios.put(
        `https://project-backend-nka5.vercel.app/order/return/${billid}`,
        { reason }
      );

      alert("Return Request Submitted");
      loadOrder(billid);
    } catch (err) {
      console.log(err);
      alert("Return Failed");
    }
  };

  const currentIndex = order
    ? Math.max(
        STATUS_FLOW.indexOf(order.status),
        0
      )
    : 0;

  return (
    <div className="track-container">
      <h2 className="track-title">
        🚚 Track Your Order
      </h2>

      <select
        className="dropdown"
        value={billid}
        onChange={(e) =>
          setBillid(e.target.value)
        }
      >
        <option value="">
          Select Bill
        </option>

        {billIds.map((b, i) => (
          <option
            key={i}
            value={b.billid}
          >
            {b.billid}
          </option>
        ))}
      </select>

      {loading && (
        <p className="empty">
          Loading Order...
        </p>
      )}

      {!loading &&
        billid &&
        !order && (
          <p className="empty">
            Order Not Found
          </p>
        )}

      {order && (
        <div className="card">
          <div className="card-header">
            <h3>
              Bill ID : {order.billid}
            </h3>

            <span className="badge">
              {order.status}
            </span>
          </div>

          <p>
            <strong>
              Total Products :
            </strong>{" "}
            {order.items?.length || 0}
          </p>

          <p>
            <strong>
              Total Quantity :
            </strong>{" "}
            {order.items?.reduce(
              (sum, item) =>
                sum + item.qty,
              0
            )}
          </p>

          <p>
            <strong>
              Order Date :
            </strong>{" "}
            {order.date
              ? new Date(
                  order.date
                ).toLocaleDateString()
              : "N/A"}
          </p>

          {order.deliveredDate && (
            <p>
              <strong>
                Delivered Date :
              </strong>{" "}
              {new Date(
                order.deliveredDate
              ).toLocaleDateString()}
            </p>
          )}

          {order.cancelReason && (
            <p
              style={{
                color: "red",
                fontWeight: "bold",
              }}
            >
              Cancel Reason :
              {" " +
                order.cancelReason}
            </p>
          )}
{order.returnReason && (
  <p
    style={{
      color: "orange",
      fontWeight: "bold",
    }}
  >
    Return Reason: {order.returnReason}
  </p>
)}

{order.returnApproved && (
  <p
    style={{
      color: "green",
      fontWeight: "bold",
      marginTop: "10px",
    }}
  >
    ✅ Return Request Approved
  </p>
)}

{order.returnRejected && (
  <p
    style={{
      color: "red",
      fontWeight: "bold",
      marginTop: "10px",
    }}
  >
    ❌ Return Request Rejected
  </p>
)}

          <div className="progress">
            <div
              className="progress-bar"
              style={{
                width: `${
                  (currentIndex /
                    (STATUS_FLOW.length -
                      1)) *
                  100
                }%`,
              }}
            />
          </div>

          <div className="steps">
            {STATUS_FLOW.map(
              (s, i) => (
                <div
                  key={i}
                  className={`step ${
                    i <= currentIndex
                      ? "active"
                      : ""
                  }`}
                >
                  <div className="circle">
                    {i + 1}
                  </div>

                  <span>{s}</span>
                </div>
              )
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "25px",
              flexWrap: "wrap",
            }}
          >
     {order.status !== "Delivered" &&
 order.status !== "Cancelled" &&
 order.status !== "Returned" &&
 order.status !== "Return Requested" && (
  <button
    className="cancel-btn"
    onClick={() => handleCancel(order.billid)}
  >
    Cancel Order
  </button>
)}

         {order.status === "Delivered" &&
 !order.isReturned &&
 !order.returnApproved && (
  <button
    className="return-btn"
    onClick={() => handleReturn(order.billid)}
  >
    Return Order
  </button>
)}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderTracking;