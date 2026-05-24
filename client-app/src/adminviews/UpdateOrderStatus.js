import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UpdateOrderStatus.css";

const STATUS_FLOW = [
  "Processing",
  "Order Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

function UpdateOrderStatus({ updateByName }) {
  const [billIds, setBillIds] = useState([]);
  const [billid, setBillid] = useState("");
  const [status, setStatus] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [updatedBy, setupdatedBy] = useState("");

  // ================= LOAD BILL IDS =================
  useEffect(() => {
    axios
      .get("https://project-backend-nka5.vercel.app/bill/allbillids")
      .then((res) => {
        console.log("Bill IDs:", res.data);
        setBillIds(res.data);
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to load Bill IDs");
      });
  }, []);

  // ================= LOAD CURRENT STATUS =================
  const loadCurrentStatus = () => {
    if (!billid) return;

    axios
      .get(`https://project-backend-nka5.vercel.app/bill/getstatus/${billid}`)
      .then((res) => {
        setCurrentStatus(res.data.status);
        setUpdatedAt(res.data.updatedAt);
        setupdatedBy(res.data.updatedBy);
      })
      .catch((err) => {
        console.log(err);
        setCurrentStatus("");
      });
  };

  useEffect(() => {
    loadCurrentStatus();
  }, [billid]);

  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  const isFinalLocked =
    currentStatus === "Delivered" || currentStatus === "Cancelled";

  // ================= UPDATE STATUS =================
  const UpdateStatus = async () => {
    if (!billid || !status) {
      alert("Please select Bill ID and Status");
      return;
    }

    if (!window.confirm(`Confirm update status to "${status}" ?`)) return;

    try {
      await axios.put("https://project-backend-nka5.vercel.app/bill/updatestatus", {
        billid,
        status,
        updatedBy: updateByName,
      });

      alert("Status Updated Successfully ✅");
      setStatus("");
      loadCurrentStatus();

    } catch (err) {
      console.log(err);
      alert("Error updating status ❌");
    }
  };

  return (
    <div className="upAdmin">
      <div className="upStatus">
        <h2 className="UpH2">
          Update Order Status <span>{updateByName}</span>
        </h2>

        {/* BILL ID */}
        <label>Select Bill ID</label>
        <select
          value={billid}
          onChange={(e) => setBillid(e.target.value)}
        >
          <option value="">--Select Bill ID--</option>
          {billIds.length > 0 ? (
            billIds.map((id, index) => (
              <option key={index} value={id}>
                {id}
              </option>
            ))
          ) : (
            <option>No Bills Found</option>
          )}
        </select>

        {/* STATUS INFO */}
        {currentStatus && (
          <div className="upAdminStatus">
            <p>
              <strong>Current Status:</strong>
              <span className="status-badge">{currentStatus}</span>
            </p>

            <p>
              <strong>Last Updated:</strong>{" "}
              {updatedAt
                ? new Date(updatedAt).toLocaleString()
                : "N/A"}
            </p>

            <p>
              <strong>Updated By:</strong> {updatedBy || "N/A"}
            </p>

            {/* PROGRESS BAR */}
            <div className="UdadminProgess">
              <div className="UdProbar">
                <div
                  className="UdadminFill"
                  style={{
                    width: `${
                      (currentIndex / (STATUS_FLOW.length - 1)) * 100
                    }%`,
                  }}
                ></div>
              </div>

              <div className="UdadminStep">
                {STATUS_FLOW.map((s, i) => (
                  <span
                    key={i}
                    className={i <= currentIndex ? "active" : ""}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NEW STATUS */}
        <label>Set New Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={isFinalLocked}
        >
          <option value="">--Select Status--</option>
          {STATUS_FLOW.map((s, i) =>
            i > currentIndex ? (
              <option key={i} value={s}>
                {s}
              </option>
            ) : null
          )}
        </select>

        {/* BUTTON */}
        <button onClick={UpdateStatus} disabled={isFinalLocked}>
          {isFinalLocked ? "STATUS LOCKED 🔒" : "Update Status"}
        </button>
      </div>
    </div>
  );
}

export default UpdateOrderStatus;