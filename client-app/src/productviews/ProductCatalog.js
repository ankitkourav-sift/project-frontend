import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Bill from "../customerviews/Bill";
import CustomerLoginPopup from "../customerviews/CustomerLoginPopup";
import "./ProductCatalog.css";

const LOW_STOCK_THRESHOLD = 5;
const STOCK_REFRESH_INTERVAL = 10000;
const ZOOM = 2.5;

function ProductCatalog({ mode = "inner", propCid = null }) {
  const API = process.env.REACT_APP_BASE_API_URL;

  // UI STATE
  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  // ZOOM REFS
  const imgRef = useRef(null);
  const zoomRef = useRef(null);

  const handleZoomMove = (e) => {
    if (!imgRef.current || !zoomRef.current) return;
    const img = imgRef.current;
    const zoom = zoomRef.current;
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      zoom.style.display = "none";
      return;
    }
    zoom.style.display = "block";
    zoom.style.backgroundImage = `url(${img.src})`;
    zoom.style.backgroundRepeat = "no-repeat";
    zoom.style.backgroundSize = `${rect.width * ZOOM}px ${rect.height * ZOOM}px`;
    zoom.style.backgroundPosition = `-${x * ZOOM - zoom.offsetWidth / 2}px -${y * ZOOM - zoom.offsetHeight / 2}px`;
  };

  const hideZoom = () => {
    if (zoomRef.current) zoomRef.current.style.display = "none";
  };

  // PRODUCTS, CATEGORIES & STOCK
  const [plist, setPList] = useState([]);
  const [pcatglist, setPCatgList] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [initialStockMap, setInitialStockMap] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  // CART
  const [selitems, setSelItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [itemcount, setItemCount] = useState(0);

  // CUSTOMER
  const [cid, setCId] = useState(propCid);
  const [customerSession, setCustomerSession] = useState(null);
  const [showBill, setShowBill] = useState(false);

  // FILTERS
  const [searchText, setSearchText] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  // LOAD PRODUCTS & SESSION
  useEffect(() => {
    axios
  .get(`${API}/product/showproduct`)
  .then((res) => {

    setPList(
      (res.data || []).filter(
        (p) => p.status === "Active"
      )
    );

  })
  .catch((err) => console.log(err));

    axios.get(`${API}/productcatg/showproductcatg`)
      .then((res) => setPCatgList(res.data || []));

    if (mode === "main") {
      const session = sessionStorage.getItem("userSession") || localStorage.getItem("userSession");
      if (session) {
        const obj = JSON.parse(session);
        setCustomerSession(obj);
        setCId(obj.Cid || obj.cid || obj.CUserId);
      }
    }
  }, [mode, API]);

  // STOCK HANDLING
  const reloadStock = async () => {
    const map = {};
    for (const p of plist) {
      try {
        const res = await axios.get(`${API}/inventory/inventorybyproduct/${p.pid}`);
        map[p.pid] = (res.data || []).reduce((s, i) => s + (i.stock || 0), 0);
      } catch {
        map[p.pid] = 0;
      }
    }
    setStockMap(map);
    setInitialStockMap((prev) => (Object.keys(prev).length ? prev : map));
  };

  useEffect (() => {
    if (!plist.length || isCheckingOut) return;
    reloadStock();
    const id = setInterval(() => {
      if (!isCheckingOut) reloadStock();
    }, STOCK_REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [plist, isCheckingOut]);

  // CART ACTIONS
const handleBuyButton = (pid) => {
  const maxStock = stockMap[pid] ?? 0;

  if (maxStock <= 0) {
    alert("Out of stock");
    return;
  }

  const product = plist.find((p) => p.pid === pid);

  setSelItems((items) =>
    items.find((i) => i.pid === pid)
      ? items
      : [...items, product]
  );

  setQuantities((q) => ({
    ...q,
    [pid]: 1,
  }));

  setItemCount((c) => c + 1);
};
  const increaseQty = (pid) => {
    const currentQty = quantities[pid] || 0;
    const maxStock = initialStockMap[pid] ?? 0;
    if (currentQty >= maxStock) return alert("Stock limit reached");
    setQuantities((q) => ({ ...q, [pid]: currentQty + 1 }));
    setItemCount((c) => c + 1);
  };

  const decreaseQty = (pid) => {
    const currentQty = quantities[pid] || 0;
    if (currentQty <= 1) {
      setSelItems((items) => items.filter((i) => i.pid !== pid));
      setQuantities((q) => {
        const copy = { ...q };
        delete copy[pid];
        return copy;
      });
    } else {
      setQuantities((q) => ({ ...q, [pid]: currentQty - 1 }));
    }
    setItemCount((c) => Math.max(c - 1, 0));
  };

  const getValidCartItems = () => selitems
    .map((item) => ({ pid: item.pid, vid: item.vid ?? item.venderId, qty: quantities[item.pid] || 0 }))
    .filter((item) => item.qty > 0 && item.vid);
const handleCheckout = async () => {
  if (!cid) {
    setPendingCheckout(true);
    setShowLogin(true);
    return;
  }

  const validItems = getValidCartItems();

  if (!validItems.length) {
    alert("Cart is empty");
    return;
  }

  try {
    setIsCheckingOut(true);

    await axios.post(
      `${API}/inventory/validate-stock`,
      { items: validItems }
    );

    setShowBill(true);

  } catch (err) {
    alert(
      err.response?.data?.message ||
      "Stock changed"
    );

    await reloadStock();
  } finally {
    setIsCheckingOut(false);
  }
};
  const grandTotal = selitems.reduce(
    (sum, item) => sum + (quantities[item.pid] || 1) * Number(item.oprice || 0),
    0
  );

  const filteredProducts = plist.filter((p) => {
    const stock = stockMap[p.pid] ?? 0;
    if (searchText && !p.pname.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (categoryId !== "all" && String(p.pcatgid) !== categoryId) return false;
    if (minPrice && Number(p.oprice) < Number(minPrice)) return false;
    if (maxPrice && Number(p.oprice) > Number(maxPrice)) return false;
    if (stockFilter === "in" && stock <= 0) return false;
    if (stockFilter === "low" && !(stock > 0 && stock <= LOW_STOCK_THRESHOLD)) return false;
    if (stockFilter === "out" && stock > 0) return false;
    return true;
  });

  return (
    <>
      {showBill && (
   <Bill
  data={{ selitems, cid, quantities }}
  onBack={() => setShowBill(false)}
  onRequireLogin={() => {
    setShowBill(false);
    setShowLogin(true);
  }}
  onPaymentSuccess={async () => {
    setSelItems([]);
    setQuantities({});
    setItemCount(0);
    setShowBill(false);
    await reloadStock();
  }}
/>
      )}

      {showLogin && (
<CustomerLoginPopup
  onClose={() => {
    setShowLogin(false);
    setPendingCheckout(false);
  }}
  onLoginSuccess={(user) => {
    const customerId =
      user.Cid || user.cid || user.CUserId;

    setCustomerSession(user);
    setCId(customerId);
    setShowLogin(false);

    if (pendingCheckout) {
      setPendingCheckout(false);

      setTimeout(() => {
        handleCheckout();
      }, 200);
    }
  }}
/>
      )}

      <div className={showLogin || showBill ? "blurred-content" : ""}>
        {/* HEADER */}
        <div className="customer-info">
          <div className="customer-left">
            {customerSession ? (
              <>
                <span>
  {customerSession?.cfname ||
   customerSession?.CustomerName ||
   customerSession?.CName}
</span>
                <button
                  className="logout-btn"
                  onClick={() => {
                    sessionStorage.clear();
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              mode === "main" && <span className="guest-text">Guest</span>
            )}
          </div>
          <div className="customer-right">
            <strong onClick={() => setShowCart(true)}>{itemcount}</strong>
   <div className="customer-right">
  <button
    className="cart-btn"
    onClick={() => setShowCart(true)}
  >
    🛒 Cart
    <span className="cart-count">{itemcount}</span>
  </button>
</div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="main-layout">
          <button className="filter-toggle-btn" onClick={() => setShowFilters(true)}>
            Filters
          </button>
          <aside className={`sidebar ${showFilters ? "open" : ""}`}>
            <h6>FILTERS</h6>
            <input
              placeholder="Search product"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="all">All Categories</option>
              {pcatglist.map((c) => (
                <option key={c.pcatgid} value={c.pcatgid}>
                  {c.pcatgname}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
              <option value="all">All Stock</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </aside>

          <section className="product-list">
            {filteredProducts.map((p) => {
              const qty = quantities[p.pid] || 0;
              const stock = stockMap[p.pid] ?? 0;
              const lowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD;
              return (
                <div className="product-card" key={p.pid}>
                  {lowStock && <div className="low-stock-badge">Hurry! Only {stock} left</div>}
                  <img
                    src={p.ppicname}
                    alt={p.pname}
                    onClick={() => {
                      setSelectedProduct(p);
                      setShowProductPopup(true);
                    }}
                  />
                  <h4>{p.pname}</h4>
                  <p>₹{p.oprice}</p>
                  {qty > 0 ? (
                    <div className="quantity-controls">
                      <button onClick={() => decreaseQty(p.pid)}>-</button>
                      <span>{qty}</span>
                      <button onClick={() => increaseQty(p.pid)}>+</button>
                    </div>
                  ) : (
                    <button
                      className="buy"
                      disabled={stock === 0}
                      onClick={() => handleBuyButton(p.pid)}
                    >
                      {stock === 0 ? "Out of Stock" : "ADD TO BAG"}
                    </button>
                  )}
                </div>
              );
            })}
          </section>
        </div>
      </div>

      {/* CART DRAWER */}
      {showCart && (
        <>
          <div className="cart-overlay" onClick={() => setShowCart(false)} />
          <div className="cart-drawer">
            <div className="cart-header">
              <h3>My Bag ({itemcount})</h3>
              <button onClick={() => setShowCart(false)}>X</button>
            </div>
            <div className="cart-items">
              {selitems.length === 0 && <p>Your bag is empty</p>}
              {selitems.map((item) => {
                const qty = quantities[item.pid] || 0;
                if (!qty) return null;
                return (
                  <div className="cart-item" key={item.pid}>
                    <img src={item.ppicname} alt={item.pname} />
                    <div className="cart-item-info">
                      <h4>{item.pname}</h4>
                      <p>₹{item.oprice}</p>
                      <div className="cart-qty">
                        <button onClick={() => decreaseQty(item.pid)}>-</button>
                        <span>{qty}</span>
                        <button onClick={() => increaseQty(item.pid)}>+</button>
                      </div>
                    </div>
                    <div className="cart-item-total">₹{(item.oprice * qty).toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
            <div className="cart-grand-total">
              <strong>Grand Total:</strong> ₹{grandTotal.toFixed(2)}
            </div>
            <div className="cart-footer">
              <button className="place-order-btn" onClick={handleCheckout}>
                PLACE ORDER
              </button>
            </div>
          </div>
        </>
      )}

      {/* PRODUCT POPUP */}
      {showProductPopup && selectedProduct && (
        <div className="product-popup-overlay" onClick={() => setShowProductPopup(false)}>
          <div className="product-popup" onClick={(e) => e.stopPropagation()}>
            <button
              className="popup-close-button"
              onClick={() => setShowProductPopup(false)}
            >
              X
            </button>
            <div className="popup-zoom-layout">
              <div
                className="popup-image-container"
                onMouseMove={handleZoomMove}
                onMouseLeave={hideZoom}
              >
                <img
                  ref={imgRef}
                  src={selectedProduct.ppicname}
                  alt={selectedProduct.pname}
                  className="product-popup-img"
                />
                <div ref={zoomRef} className="popup-zoom-panel" />
              </div>
              <h2>{selectedProduct.pname}</h2>
              <p className="popup-price">₹{selectedProduct.oprice}</p>
              <button
                className="buy popup-buy-btn"
                onClick={() => {
                  handleBuyButton(selectedProduct.pid);
                  setShowProductPopup(false);
                }}
              >
                ADD TO BAG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILTER OVERLAY */}
      {showFilters && <div className="filter-overlay" onClick={() => setShowFilters(false)} />}
    </>
  );
}

export default ProductCatalog;