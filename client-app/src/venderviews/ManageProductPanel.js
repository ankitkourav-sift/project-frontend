import React, { useState } from "react";
import Product from "../productviews/Product";

function ManageProductPanel({ vid }) {

  const [option, setOption] = useState("");

  return (
    <div style={{ padding: "10px" }}>

      <h2>Product Management</h2>

      {/* 🔥 OPTIONS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setOption("add")}>➕ New Product</button>
        <button onClick={() => setOption("view")}>📦 View Products</button>
      </div>

      {/* 🔥 CONTENT */}

      {option === "add" && <Product data={vid} />}

      {option === "view" && <Product data={vid} />}

      {!option && <p>Select an option above</p>}

    </div>
  );
}

export default ManageProductPanel;