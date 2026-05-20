import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import { useLocation } from "react-router-dom";
import "./ViewOrder.css";

function ViewOrders({ CUserId }) {

  const data = CUserId;

  console.log("🔥 RECEIVED CID:", data);


  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [products, setProducts] = useState([]); // ✅ NEW
  const [billFilter, setBillFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://localhost:9292";

  // ================= LOAD ORDERS =================
  useEffect(() => {
    if (!data) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/order/getorders/${data}`
        );

        console.log("ORDERS:", res.data);

        setOrders(res.data || []);
        setFiltered(res.data || []);
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    };

    fetchOrders();
  }, [data]);

  // ================= LOAD PRODUCTS (FOR IMAGE) =================
  useEffect(() => {
    axios
      .get(`${BASE_URL}/product/showproduct`)
      .then((res) => {
        console.log("PRODUCTS:", res.data);
        setProducts(res.data || []);
      })
      .catch((err) => console.log(err));
  }, []);

  
  // ================= GET IMAGE =================
  const getImage = (pid) => {
    const p = products.find(
      (x) => Number(x.pid) === Number(pid)
    );
    return p?.ppicname || "https://via.placeholder.com/60";
  };

  // ================= FILTER =================
  const handleFilter = (e) => {
    const val = e.target.value;
    setBillFilter(val);

    if (!val) setFiltered(orders);
    else setFiltered(orders.filter((o) => o.billid === val));
  };

  // ================= PDF =================
  const downloadPDF = (order) => {
    const doc = new jsPDF();

    doc.text("Invoice", 20, 20);
    doc.text(`Bill ID: ${order.billid}`, 20, 30);

    let y = 40;

    order.items.forEach((i, idx) => {
      doc.text(`${idx + 1}. ${i.pname}`, 20, y);
      doc.text(`Qty: ${i.qty}`, 120, y);
      doc.text(`₹${i.price * i.qty}`, 160, y);
      y += 10;
    });

    const total = order.items.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );

    doc.text(`Total: ₹${total}`, 20, y + 10);

    doc.save(`bill_${order.billid}.pdf`);
  };

  if (loading) return <h3>Loading...</h3>;
  if (!data)
    return <h3 style={{ color: "red" }}>Customer ID Missing</h3>;

  return (
    <div className="order-container">
      <h2>Your Orders</h2>
      <p>Customer ID: {data}</p>

      {/* FILTER */}
      <select onChange={handleFilter} value={billFilter}>
        <option value="">All Orders</option>
        {[...new Set(orders.map((o) => o.billid))].map((id, i) => (
          <option key={i} value={id}>
            {id}
          </option>
        ))}
      </select>

      {/* DATA */}
      {filtered.length === 0 ? (
        <p>No Orders Found</p>
      ) : (
        filtered.map((order) => (
          <div className="order-card" key={order._id}>
            <h3>Bill ID: {order.billid}</h3>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>

              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>

                    {/* ✅ IMAGE + NAME */}
                    <td
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <img
                        src={getImage(item.pid)}
                        alt="product"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "6px",
                        }}
                      />
                      {item.pname}
                    </td>

                    <td>{item.qty}</td>
                    <td>₹{item.price * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ✅ TOTAL FIX */}
            <p className="total">
              Total: ₹
              {order.items.reduce(
                (sum, item) => sum + item.qty * item.price,
                0
              )}
            </p>

            <button onClick={() => downloadPDF(order)}>
              Download PDF
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ViewOrders;