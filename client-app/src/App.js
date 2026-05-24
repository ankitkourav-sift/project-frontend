import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainPage from "./MainPage";

// ADMIN
import AdminMain from "./adminviews/AdminMain";
import AdminLogin from "./adminviews/AdminLogin";
import AdminReg from "./adminviews/AdminReg";
import AdminHome from "./adminviews/AdminHome";

// CUSTOMER
import CustomerMain from "./customerviews/CustomerMain";
import CustomerLogin from "./customerviews/CustomerLogin";
import CustomerReg from "./customerviews/CustomerReg";
import CustomerHome from "./customerviews/CustomerHome";
// VENDOR
import VenderMain from "./venderviews/VenderMain";
import VenderLogin from "./venderviews/VenderLogin";
import VenderReg from "./venderviews/VenderReg";
import VenderHome from "./venderviews/VenderHome";
import Navbar from "./Navbar";
console.log(process.env.REACT_APP_BASE_API_URL);
function App() {
  return (
    <BrowserRouter>

      <Navbar />

      {/* 🔥 MUST WRAP ALL ROUTES INSIDE THIS */}
      <Routes>

        <Route path="/" element={<MainPage />} />

        {/* ADMIN */}
        <Route path="/adminmain" element={<AdminMain />}>
          <Route index element={<Navigate to="adminlogin" replace />} />
          <Route path="adminlogin" element={<AdminLogin />} />
          <Route path="adminreg" element={<AdminReg />} />
          <Route path="adminhome" element={<AdminHome />} />
        </Route>

        {/* CUSTOMER */}
        <Route path="/customermain" element={<CustomerMain />}>
          <Route index element={<Navigate to="customerlogin" replace />} />
          <Route path="customerlogin" element={<CustomerLogin />} />
          <Route path="customerreg" element={<CustomerReg />} />
          <Route path="customerhome" element={<CustomerHome />} />
        </Route>

        {/* VENDOR */}
        <Route path="/vendermain" element={<VenderMain />}>
          <Route index element={<Navigate to="venderlogin" replace />} />
          <Route path="venderlogin" element={<VenderLogin />} />
          <Route path="venderreg" element={<VenderReg />} />
          <Route path="venderhome" element={<VenderHome />} />
        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;