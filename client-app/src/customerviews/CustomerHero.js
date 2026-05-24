import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CustomerHero.css";

function CustomerHero({ Customer, setActiveTab }) {
  const BASE_URL =
    process.env.REACT_APP_BASE_API_URL || "https://project-backend-nka5.vercel.app";

  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);

  // ================= FETCH PRODUCT IMAGES =================
  useEffect(() => {
    axios
      .get(`${BASE_URL}/product/showproduct`)
      .then((res) => {
        const imgs = res.data
          .map((p) => p.ppicname)
          .filter((img) => img && img !== "");

        setImages(imgs);
      })
      .catch((err) => console.log("Image load error:", err));
  }, [BASE_URL]);

  // ================= AUTO SLIDER =================
  useEffect(() => {
    if (images.length === 0) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [images]);

  // ================= NAVIGATION =================
  const goShop = () => {
    setActiveTab("shop");
  };

  const goOrders = () => {
    setActiveTab("orders");
  };

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <section className="customer-hero">

      {/* LEFT SIDE */}
      <div className="customer-hero-content">

        <h1>
          Welcome {Customer?.cfname ? `, ${Customer.cfname}` : "Customer"}
        </h1>

        <p>
          Explore top deals, trending products, and seamless shopping experience.
        </p>

        <div className="customer-hero-actions">

          <button className="hero-btn primary" onClick={goShop}>
            Shop Now
          </button>

          {/* 🔥 FIXED BUTTON */}
          <button className="hero-btn-secondary" onClick={goOrders}>
            My Orders
          </button>

        </div>

      </div>

      {/* RIGHT SIDE SLIDER */}
      <div className="customer-hero-slider">

        {images.length > 0 ? (
          <>
            <img
              src={images[index]}
              alt="product"
              className="hero-slide-image"
            />

            <button className="slider-nav prev" onClick={prevSlide}>
              ❮
            </button>

            <button className="slider-nav next" onClick={nextSlide}>
              ❯
            </button>

            <div className="slider-dots">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`dot ${i === index ? "active" : ""}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </>
        ) : (
          <p>Loading images...</p>
        )}

      </div>

    </section>
  );
}

export default CustomerHero;