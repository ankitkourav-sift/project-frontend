import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ReturnRequest.css";

function ReturnRequests() {
  const [orders, setOrders] = useState([]);

  const BASE_URL =
    "https://project-backend-nka5.vercel.app";

  const loadReturns = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/order/return-requests`
      );

      setOrders(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  // APPROVE
  const approveReturn = async (billid) => {
    try {
      await axios.put(
        `${BASE_URL}/order/approve-return/${billid}`
      );

      alert("Return Approved ✅");
      loadReturns();
    } catch (err) {
      console.log(err);
    }
  };

  // REJECT
  const rejectReturn = async (billid) => {
    try {
      await axios.put(
        `${BASE_URL}/order/reject-return/${billid}`
      );

      alert("Return Rejected ❌");
      loadReturns();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="return-container">
      <h2>Return Requests</h2>

      {orders.length === 0 ? (
        <h3 className="empty-msg">
          No Return Requests Found
        </h3>
      ) : (
        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Customer ID</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.billid}</td>
                  <td>{order.cid}</td>
                  <td>{order.returnReason}</td>

                  <td>
                    <span className="status">
                      {order.status}
                    </span>
                  </td>

                  <td>
                    {new Date(
                      order.date
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    <button
                      className="approve-btn"
                      onClick={() =>
                        approveReturn(
                          order.billid
                        )
                      }
                    >
                      Approve
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() =>
                        rejectReturn(
                          order.billid
                        )
                      }
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ReturnRequests;