import React, { useEffect, useState, useMemo, useCallback } from "react";
import "./InventoryDashboard.css";

function InventoryDashboard({ vid }) {

  const [items, setItems] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [editDelta, setEditDelta] = useState(0);
  const [editMode, setEditMode] = useState("inc");

  // 🔥 FETCH INVENTORY
  const fetchInventory = useCallback(async () => {
    if (!vid) return;

    try {
      const res = await fetch(`https://project-backend-nka5.vercel.app/inventory/inventorybyvendor/${vid}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      alert("Failed to load inventory");
    }
  }, [vid]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // 🔥 FETCH PRODUCTS
  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch("https://project-backend-nka5.vercel.app/product/showproduct");
      const products = await res.json();

      const map = {};
      products.forEach((p) => (map[p.pid] = p));
      setProductMap(map);
    }
    fetchProducts();
  }, []);

  // 🔥 FILTER
  const filtered = useMemo(() => {
    return items.filter((i) => {
      const name = productMap[i.pid]?.pname || "";
      return (
        String(i.pid).includes(query) ||
        name.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [items, query, productMap]);

  // 🔥 UPDATE STOCK
  async function submitEdit() {
    try {
      const payload =
        editMode === "set"
          ? { stock: Number(editDelta) }
          : { delta: Number(editDelta) };

      const res = await fetch(
        `https://project-backend-nka5.vercel.app/inventory/stock/${editing.pid}/vendor/${editing.vid}?mode=${editMode}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const updated = await res.json();

      setItems((prev) =>
        prev.map((i) =>
          i.pid === updated.pid && i.vid === updated.vid ? updated : i
        )
      );

      setEditing(null);
    } catch {
      alert("Update failed");
    }
  }

  return (<center>
    <div className="invDash-container">

      <h2 className="invDash-title">Inventory Dashboard</h2>

      {/* SEARCH */}
      <div className="invDash-searchBox">
        <input
          placeholder="Search product..."
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* GRID */}
      <div className="invDash-grid">

        {filtered.map((inv) => {
          const product = productMap[inv.pid];

          return (
            <div key={inv.pid} className="invDash-card">

              {/* TOP */}
              <div className="invDash-top">
                <h3>{product?.pname || "No Name"}</h3>
                <span className="invDash-pid">#{inv.pid}</span>
              </div>

              {/* STOCK */}
              <div className="invDash-stockBox">
                <p>Stock</p>
                <h2>{inv.stock}</h2>
              </div>

              {/* ACTION */}
              <div className="invDash-action">
                <button onClick={() => setEditing(inv)}>
                  Edit Stock
                </button>
              </div>

            </div>
          );
        })}

      </div>

      {/* MODAL */}
      {editing && (
        <div className="invDash-modal">
          <div className="invDash-modalBox">

            <h3>Edit Stock</h3>

            <select onChange={(e) => setEditMode(e.target.value)}>
              <option value="inc">Increase</option>
              <option value="set">Set Value</option>
            </select>

            <input
              type="number"
              placeholder="Enter value"
              onChange={(e) => setEditDelta(e.target.value)}
            />

            <div className="invDash-modalBtns">
              <button onClick={submitEdit}>Save</button>
              <button onClick={() => setEditing(null)}>Cancel</button>
            </div>

          </div>
        </div>
      )}

    </div>
  </center>);
}

export default InventoryDashboard;