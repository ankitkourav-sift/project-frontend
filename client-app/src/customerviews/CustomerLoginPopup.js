
   import React,{useState,useEffect} from "react";
   import axios from "axios";
   import Cookies from "js-cookie";
   //import "./CustomerLoginPopup.css";


         function CustomerLoginPopup({onClose, onLoginSuccess})
         {
             const [uid,setUId] = useState("");
             const [upass,setUPass] =useState("");
             const [isChecked,setIsChecked] = useState(false);
             const [loading,setLoading] = useState(false);
             const [authError,setAuthError] = useState("");

             useEffect(() => {
                const myCookies = Cookies.get("auth");

                if(myCookies)
                {
                    const obj = JSON.parse(myCookies);
                    setUId(obj.username);
                    setUPass(obj.password);
                }
             },[]);

     const handleLoginButton = async () => {
  setAuthError("");
  setLoading(true);

  try {
    const API = process.env.REACT_APP_BASE_API_URL;

    const res = await axios.post(
      `${API}/customer/login`,
      {
        CUserId: uid,
        CUserPass: upass,
      }
    );

    console.log("Login Response:", res.data);

    if (res.data.success && res.data.customer) {
      const customer = res.data.customer;

      if (customer.Status === "Inactive") {
        alert("User not active. Please wait for admin activation");
        setLoading(false);
        return;
      }

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

      const sessionData = {
        Cid: customer.Cid,
        CUserId: customer.CUserId,
        CustomerName: customer.CustomerName,
        CPicName: customer.CPicName,
        CAddress: customer.CAddress,
        CContact: customer.CContact,
        CEmail: customer.CEmail,
      };

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

      onLoginSuccess(sessionData);
    } else {
      setAuthError(
        "Authentication failed: Invalid ID or Password"
      );
    }
  } catch (err) {
    console.log(err);

    setAuthError(
      err.response?.data?.message ||
      "Authentication failed"
    );
  } finally {
    setLoading(false);
  }
};

             return(
    <div className="cl-popup-overlay">
        <div className="cl-popup-container">
            <span className="cl-popup-close" onClick={onClose}>&times;</span>
            <h4 className="cl-popup-header">Customer Login</h4>

            <input className="cl-popup-input" type="text" placeholder="User ID" value={uid} onChange={(e) => setUId(e.target.value)} />
            <input className="cl-popup-input" type="password" placeholder="Password" value={upass} onChange={(e) => setUPass(e.target.value)} />

            <div className="cl-popup-remember">
                <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} />
                <span>Remember Me</span>
            </div>

            {authError && <p className="cl-popup-error">{authError}</p>}

            <button className="cl-popup-btn" onClick={handleLoginButton} disabled={loading}>
                {loading && <span className="cl-popup-spinner"></span>}
                {loading ? "Logging in..." : "Login"}
            </button>
        </div>
    </div>
);
         }
         export default CustomerLoginPopup;


        