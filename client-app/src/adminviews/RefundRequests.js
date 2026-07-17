import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RefundRequests.css";

function RefundRequests() {
  const [orders, setOrders] = useState([]);

  const loadRefunds = async () => {
    try {
      const res = await axios.get(
        "https://project-backend-nka5.vercel.app/order/refund-requests"
      );

      setOrders(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const completeRefund = async (billid) => {
    try {
      await axios.put(
        `https://project-backend-nka5.vercel.app/order/refund/${billid}`
      );

      alert("Refund Completed");

      loadRefunds();
    } catch (err) {
      console.log(err);
      alert("Refund failed");
    }
  };

  return (
    <div className="refund-container">
      <h2>Refund Requests</h2>

      {orders.length === 0 ? (
        <h3>No Pending Refunds</h3>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Customer ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.billid}</td>
                <td>{order.cid}</td>
                <td>₹{order.refundAmount}</td>
                <td>{order.refundStatus}</td>

                <td>
                  <button
                    className="refund-btn"
                    onClick={() =>
                      completeRefund(order.billid)
                    }
                  >
                    Complete Refund
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RefundRequests;