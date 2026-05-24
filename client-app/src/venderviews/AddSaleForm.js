import React, { useEffect, useState } from "react";
import axios from "axios";

function AddSaleForm({ venderId }) {

  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= LOAD PRODUCTS =================
  useEffect(() => {
    axios.get("https://project-backend-nka5.vercel.app/product/showproduct")
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  }, []);

  // ================= AUTO PRICE =================
  useEffect(() => {
    const selected = products.find(p => Number(p.pid) === Number(productId));

    if (selected) {
      setPrice(selected.pprice * quantity);
    } else {
      setPrice(0);
    }
  }, [productId, quantity, products]);

  // ================= LOAD STOCK =================
  useEffect(() => {
    if (!productId || !venderId) return;

    axios.get(`https://project-backend-nka5.vercel.app/inventory/getstock/${productId}/${venderId}`)
      .then(res => {
        setStock(res.data.stock);
      })
      .catch(() => setStock(null));
  }, [productId, venderId]);

  // ================= ADD SALE =================
  const handleSale = async () => {

    if (loading) return; // 🔥 prevent double click

    if (!productId) {
      alert("Select product");
      return;
    }

    if (quantity <= 0) {
      alert("Enter valid quantity");
      return;
    }

    if (stock !== null && quantity > stock) {
      alert("Not enough stock ❌");
      return;
    }

    setLoading(true);

    try {
      await axios.post("https://project-backend-nka5.vercel.app/sales/add", {
        billid: Date.now(),
        productId: Number(productId),
        quantity: Number(quantity),
        totalPrice: price,
        venderId: venderId
      });

      alert("Sale Added ✅");

      // reset
      setProductId("");
      setQuantity(1);
      setStock(null);

    } catch (err) {
      console.log(err);
      alert("Error adding sale ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      border: "1px solid #ddd",
      padding: "20px",
      marginTop: "10px",
      borderRadius: "10px",
      width: "350px"
    }}>

      <h3>Add Sale</h3>

      {/* PRODUCT */}
      <select
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
      >
        <option value="">Select Product</option>
        {products.map(p => (
          <option key={p.pid} value={p.pid}>
            {p.pname}
          </option>
        ))}
      </select>

      <br /><br />

      {/* STOCK INFO */}
      {stock !== null && (
        <p style={{ color: stock < 5 ? "red" : "green" }}>
          Available Stock: {stock}
        </p>
      )}

      {/* QUANTITY */}
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        placeholder="Quantity"
      />

      <br /><br />

      {/* PRICE */}
      <p>Total Price: ₹{price}</p>

      {/* BUTTON */}
      <button
        onClick={handleSale}
        disabled={loading}
        style={{
          background: "#007bff",
          color: "#fff",
          padding: "8px 15px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        {loading ? "Processing..." : "Confirm Sale"}
      </button>

    </div>
  );
}

export default AddSaleForm;