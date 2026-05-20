import React, { useEffect, useState } from "react";
import ProductAPI from "./InventorywebService";
//import "./ProductStockManager.css";

function ProductStockManager({ vendorId: propVid }) {

  const [vid] = useState(() => {
    if (propVid) return propVid;
    const stored = localStorage.getItem("vid");
    return stored ? Number(stored) : null;
  });

  const [products, setProducts] = useState([]);
  const [selectedPid, setSelectedPid] = useState(null);
  const [inventory, setInventory] = useState(null);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const [error, setError] = useState("");
  const [updateMode, setUpdateMode] = useState("inc");
  const [updateValue, setUpdateValue] = useState(0);

  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);

  // ================== LOAD PRODUCTS ==================
  useEffect(() => {
    if (!vid) {
      setError("VendorId not provided");
      return;
    }

    setLoadingProducts(true);

    ProductAPI.productsByVendor(vid)
      .then((data) => {
        setProducts(Array.isArray(data) ? data : data.products || []);
      })
      .catch((err) => {
        console.error(err);
        setError(err?.response?.data?.message || err.message || "Failed to load products");
      })
      .finally(() => setLoadingProducts(false));

  }, [vid]);

  // ================== LOAD INVENTORY ==================
  useEffect(() => {
    if (!selectedPid) return;

    setLoadingInventory(true);
    setInventory(null);

    ProductAPI.inventoryByProduct(selectedPid)
      .then((data) => {
        if (Array.isArray(data)) {
          const byVid = vid
            ? data.find((d) => Number(d.vid) === Number(vid))
            : null;
          setInventory(byVid || data[0] || null);
        } else {
          setInventory(data);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err?.response?.data?.message || err.message || "Failed to load inventory");
      })
      .finally(() => setLoadingInventory(false));

  }, [selectedPid, vid]);

  // ================== SELECT PRODUCT ==================
  const handleSelect = (e) => {
    const pid = e.target.value ? Number(e.target.value) : null;
    setSelectedPid(pid);
    setError("");
    setInventory(null);
  };

  // ================== CREATE INVENTORY ==================
  const createInventory = async ({ initialStock = 0, threshold = 5 }) => {

    if (!selectedPid) {
      setError("Select a product first");
      return;
    }

    if (!vid) {
      setError("VendorId not set");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const res = await ProductAPI.createInventory(selectedPid, vid, {
        initialStock,
        threshold,
      });

      const inv = res?.inventory || res;
      setInventory(inv);

      alert("Inventory created");

    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  // ================== UPDATE STOCK ==================
  const doUpdate = async () => {

    if (!selectedPid) {
      setError("Select a product");
      return;
    }

    if (!vid) {
      setError("VendorId not set");
      return;
    }

    if (!Number.isFinite(Number(updateValue))) {
      setError("Enter numeric value");
      return;
    }

    setBusy(true);
    setError("");

    try {
      let result;

      try {
        result = await ProductAPI.updateStock(selectedPid, vid, {
          mode: updateMode,
          value: Number(updateValue),
        });
      } catch {
        result = await ProductAPI.manageStock(selectedPid, vid, {
          mode: updateMode,
          value: Number(updateValue),
        });
      }
     const refreshInventory = async () => {
  if (!selectedPid) return;

  try {
    const data = await ProductAPI.inventoryByProduct(selectedPid);

    if (Array.isArray(data)) {
      const byVid = data.find((d) => Number(d.vid) === Number(vid));
      setInventory(byVid || data[0] || null);
    } else {
      setInventory(data);
    }
  } catch (err) {
    console.error(err);
  }
};
      const inv = result?.inventory || result;
      setInventory(inv);

      alert("Stock updated");

    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  // ================== UI ==================
  return (
    <div className="stock-manager">

      <h3>Vendor Inventory - Product Stock Manager</h3>

      {/* PRODUCT SELECT */}
      <div>
        <label>Select Product</label>

        {loadingProducts ? (
          <div>Loading...</div>
        ) : (
          <select value={selectedPid || ""} onChange={handleSelect}>
            <option value="">-- choose product --</option>
            {products.map((p) => (
              <option key={p.pid} value={p.pid}>
                {p.pname} ({p.pid})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* INVENTORY */}
      <div>
        <h4>Inventory</h4>

        {loadingInventory ? (
          <div>Loading...</div>
        ) : inventory ? (
          <div>
            <p>Stock: {inventory.stock}</p>
            <p>Sold: {inventory.soldCount}</p>
            <p>Threshold: {inventory.threshold}</p>
          </div>
        ) : selectedPid ? (
          <button onClick={() => createInventory({})}>
            {creating ? "Creating..." : "Create Inventory"}
          </button>
        ) : (
          <p>Select product</p>
        )}
      </div>

      {/* UPDATE */}
      <div>
        <h4>Update Stock</h4>

        <select
          value={updateMode}
          onChange={(e) => setUpdateMode(e.target.value)}
        >
          <option value="inc">Increase/Decrease</option>
          <option value="set">Set Stock</option>
        </select>

        <input
          type="number"
          value={updateValue}
          onChange={(e) => setUpdateValue(e.target.value)}
        />

        <button onClick={doUpdate} disabled={busy}>
          {busy ? "Updating..." : "Update"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

    </div>
  );
}

export default ProductStockManager;