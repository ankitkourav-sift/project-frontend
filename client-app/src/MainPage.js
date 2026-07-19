import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function MainPage() {
  const navigate = useNavigate();

  // =======================
  // HERO SLIDER IMAGES
  // =======================

  const slides = [
    "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg",
    "https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg",
    "https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg",
  ];

  const [index, setIndex] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = async () => {

  if (!email.trim()) {
    toast.error("Please enter your email");
    return;
  }

  try {

    const res = await axios.post(
      "https://project-backend-nka5.vercel.app/newsletter/subscribe",
      {
        email,
      }
    );

    toast.success(res.data.message);

    setEmail("");

  } catch (err) {

    toast.error(
      err.response?.data?.message || "Subscription Failed"
    );

  }

};

  return (
    <div className="homepage">

      {/* ================= HERO SLIDER ================= */}

      <div className="slider">

        <img
          src={slides[index]}
          alt="banner"
        />

        <div className="overlay">

          <span className="hero-tag">
            ✨ Smart Shopping Experience
          </span>

          <h1>ShopNexa</h1>

          <p>
            Fashion • Electronics • Shoes • Accessories • Lifestyle
          </p>

          <button
            onClick={() => navigate("/customermain")}
          >
            Shop Now →
          </button>

        </div>

      </div>

      {/* ================= CATEGORY ================= */}

      <div className="section-title">
        <h2>Shop By Category</h2>
        <p>Everything you need in one place</p>
      </div>

      <div className="categories">

        <div className="cat-card">
          <img
            src="https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg"
            alt="Fashion"
          />
          <h3>Fashion</h3>
        </div>

        <div className="cat-card">
          <img
            src="https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg"
            alt="Shoes"
          />
          <h3>Shoes</h3>
        </div>

        <div className="cat-card">
          <img
            src="https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg"
            alt="Mobiles"
          />
          <h3>Mobiles</h3>
        </div>

        <div className="cat-card">
          <img
            src="https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg"
            alt="Electronics"
          />
          <h3>Electronics</h3>
        </div>

        <div className="cat-card">
          <img
            src="https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg"
            alt="Accessories"
          />
          <h3>Accessories</h3>
        </div>

        <div className="cat-card">
          <img
            src="https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg"
            alt="Watches"
          />
          <h3>Watches</h3>
        </div>

      </div>

      {/* ================= FLASH SALE ================= */}

      <div className="flash-sale">

        <h2>🔥 Today's Deals</h2>

        <div className="deal-container">

          <div className="deal-card">
            <h3>50% OFF</h3>
            <p>Fashion Collection</p>
          </div>

          <div className="deal-card">
            <h3>40% OFF</h3>
            <p>Latest Sneakers</p>
          </div>

          <div className="deal-card">
            <h3>30% OFF</h3>
            <p>Electronics</p>
          </div>

        </div>

      </div>

      {/* ================= FEATURES ================= */}

      <div className="features">

        <div className="feature-box">
          🚚
          <h3>Free Delivery</h3>
          <p>Fast & Secure Shipping</p>
        </div>

        <div className="feature-box">
          🔒
          <h3>Secure Payment</h3>
          <p>100% Safe Payment</p>
        </div>

        <div className="feature-box">
          🔄
          <h3>Easy Returns</h3>
          <p>7 Days Return Policy</p>
        </div>

        <div className="feature-box">
          ⭐
          <h3>Premium Quality</h3>
          <p>Trusted Products</p>
        </div>

      </div>

      {/* ================= NEWSLETTER ================= */}

     <div className="newsletter">

  <h2>Subscribe to ShopNexa</h2>

  <p>
    Get Exclusive Deals, Flash Sales & New Arrivals
  </p>

  <div className="newsletter-box">

    <input
      type="email"
      placeholder="Enter your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <button onClick={handleSubscribe}>
      Subscribe
    </button>

  </div>

</div>

      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <h2>ShopNexa</h2>

        <p>
          Smart Shopping Experience
        </p>

        <hr />

        <p>
          © 2026 ShopNexa. All Rights Reserved.
        </p>

      </footer>
      <ToastContainer
position="top-right"
autoClose={3000}
/>

    </div>
    
  );
}

export default MainPage;