import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./CustomerLogin.css";

function CustomerLogin() {
  const [uid, setUId] = useState("");
  const [upass, setUPass] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");

  // 🔥 FORGOT PASSWORD STATES
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);

  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔥 LOAD COOKIE
  useEffect(() => {
    const myCookies = Cookies.get("auth");
    if (myCookies) {
      const obj = JSON.parse(myCookies);
      setUId(obj.username);
      setUPass(obj.password);
    }
  }, []);

  // 🔥 VALIDATION
  const validateForm = () => {
    let temp = {};
    let valid = true;

    if (!uid || uid.length < 4) {
      temp.cuserid = "UserID must be at least 4 characters";
      valid = false;
    }

    if (!upass || upass.length < 3) {
      temp.cuserpass = "Password must be at least 3 characters";
      valid = false;
    }

    setErrors(temp);
    return valid;
  };

  // 🔥 LOGIN (UNCHANGED)
const handleLogin = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  try {

    const res = await axios.post(
      "https://project-backend-nka5.vercel.app/customer/login",
      {
        CUserId: uid,
        CUserPass: upass,
      }
    );

    console.log(res.data);

    // 🔥 CUSTOMER OBJECT
    const customer = res.data.customer;

    if (customer) {

      // 🔥 STATUS CHECK
      if (customer.Status === "Inactive") {
        alert("User not active. Contact admin.");
        return;
      }

      // 🔥 REMEMBER ME COOKIE
      if (isChecked) {

        Cookies.set(
          "auth",
          JSON.stringify({
            username: uid,
            password: upass,
          }),
          { expires: 7 }
        );
      }

      // 🔥 SESSION DATA
      const sessionData = {

        cfname: customer.CustomerName,

        // 🔥 IMAGE FIX
        CPicName: customer.CPicName,

        Cid: customer.Cid,

        CUserId: customer.CUserId,
      };

      // 🔥 SAVE SESSION
      if (isChecked) {

        localStorage.setItem(
          "userSession",
          JSON.stringify(sessionData)
        );

      } else {

        sessionStorage.setItem(
          "userSession",
          JSON.stringify(sessionData)
        );
      }

      // 🔥 REDIRECT
      navigate("/customermain/customerhome");
    }

  } catch (err) {

    console.log(err);

    if (err.response && err.response.data?.message) {

      setAuthError(err.response.data.message);

    } else {

      setAuthError("Server error");
    }
  }
};

  // ================= OTP FLOW =================

  // 🔥 SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      setForgotMessage("Enter Customer ID");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://project-backend-nka5.vercel.app/customer/forgotpassword/send-otp",
        { CUserId: forgotEmail }
      );

      setForgotMessage(res.data.message);
      setForgotStep(2);

    } catch (err) {
      setForgotMessage(
        err.response?.data?.message || "Error: " + err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔥 VERIFY OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      setForgotMessage("Enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://project-backend-nka5.vercel.app/customer/forgotpassword/verify-otp",
        {
          CUserId: forgotEmail,
          OTP: otp,
        }
      );

      setForgotMessage(res.data.message);
      setForgotStep(3);

    } catch (err) {
      setForgotMessage(
        err.response?.data?.message || "Error: " + err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔥 CHANGE PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      setForgotMessage("Enter new password");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://project-backend-nka5.vercel.app/customer/forgotpassword/change-password",
        {
          CUserId: forgotEmail,
          NewPassword: newPassword,
        }
      );

      setForgotMessage(res.data.message);

      // RESET UI
      setShowForgot(false);
      setForgotStep(1);
      setOtp("");
      setNewPassword("");

      // AUTO FILL LOGIN
      setUId(forgotEmail);
      setUPass(newPassword);

    } catch (err) {
      setForgotMessage(
        err.response?.data?.message || "Error: " + err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cl-container">
      <div className="cl-form">

        {!showForgot ? (
          <>
            <h3>Customer Login</h3>

            <input
              type="text"
              placeholder="User ID"
              value={uid}
              onChange={(e) => setUId(e.target.value)}
              className="cl-input"
            />
            <span className="cl-error">{errors.cuserid}</span>

            <input
              type="password"
              placeholder="Password"
              value={upass}
              onChange={(e) => setUPass(e.target.value)}
              className="cl-input"
            />
            <span className="cl-error">{errors.cuserpass}</span>

            {authError && <p className="cl-error">{authError}</p>}

            <div className="cl-remember">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              Remember Me
            </div>

            <button className="cl-btn" onClick={handleLogin}>
              Login
            </button>

            <p className="cl-forgot" onClick={() => setShowForgot(true)}>
              Forgot Password?
            </p>
          </>
        ) : (
          <>
            <h3>Forgot Password</h3>

            {/* STEP 1 */}
            {forgotStep === 1 && (
              <>
                <input
                  type="text"
                  placeholder="Customer ID"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="cl-input"
                />

                <button className="cl-btn" onClick={handleSendOtp}>
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {/* STEP 2 */}
            {forgotStep === 2 && (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="cl-input"
                />

                <button className="cl-btn" onClick={handleVerifyOtp}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}

            {/* STEP 3 */}
            {forgotStep === 3 && (
              <>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="cl-input"
                />

                <button className="cl-btn" onClick={handleChangePassword}>
                  {loading ? "Updating..." : "Change Password"}
                </button>
              </>
            )}

            {forgotMessage && <p className="cl-message">{forgotMessage}</p>}

            <p className="cl-back" onClick={() => setShowForgot(false)}>
              Back to Login
            </p>
          </>
        )}

      </div>
    </div>
  );
}

export default CustomerLogin;