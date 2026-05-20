import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";

function MainPage() {
  const navigate = useNavigate();

  // 🔥 REAL ECOMMERCE BANNERS
  const slides = [
  "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg",
  "https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg",
  "https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg"
];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="homepage">

      {/* 🔥 NAVBAR */}
      

      {/* 🔥 SLIDER */}
      <div className="slider">
        <img src={slides[index]} alt="banner" />

        <div className="overlay">
          <h1>KouravKart 🛒</h1>
          <p>Clothes | Shoes | Electronics | Accessories</p>

          <button onClick={() => navigate("/customermain")}>
  Start Shopping
</button>
        </div>
      </div>

      {/* 🔥 CATEGORY SECTION */}
      <div className="categories">
<div className="cat-card">
  <img src="https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg" />
  <h3>Clothing</h3>
</div>

<div className="cat-card">
  <img src="https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg" />
  <h3>Shoes</h3>
</div>

<div className="cat-card">
  <img src="https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg" />
  <h3>Mobiles</h3>
</div>

<div className="cat-card">
  <img src="https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg" />
  <h3>Electronics</h3>
</div>

<div className="cat-card">
  <img src="https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg" />
  <h3>Accessories</h3>
</div>

      </div>

    </div>
  );
}

export default MainPage;