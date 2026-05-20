import React ,{ useEffect, useState } from "react";
import axios from "axios";
import "./VenderLogin.css";
import VenderHome from "./VenderHome";

function VenderLogin(){

    const[vuid,setVuid]=useState("");
    const [vupass,setVupass]=useState("");
    const [rememberMe,setRememberMe]=useState(false);
    const [vender,setVender]=useState(null);
    const [showForget,setShowForget]=useState(false);

    const REACT_APP_BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

    // Load Session
    useEffect(() => {

      

        const savedUid = localStorage.getItem("venderUID");
        const savedPass = localStorage.getItem("venderUPass");

        if (savedUid && savedPass) {
            setVuid(savedUid);
            setVupass(savedPass);
            setRememberMe(true);
        }

    }, []);

    // Login
    const handleLogin = async () => {

        try {

            const res = await axios.post(`${REACT_APP_BASE_API_URL}/vender/login`,{
                vuid,
                vupass
            });

            if(res.data && res.data.VUserId){

                if(res.data.Status === "Inactive"){
                    alert("User not active ,please wait for admin approval");
                    return;
                }

                //alert("Login Successful");

                setVender(res.data);

                localStorage.setItem("venderSession", JSON.stringify(res.data));

                if (rememberMe) {
                    localStorage.setItem("venderUID", vuid);
                    localStorage.setItem("venderUPass", vupass);
                } 
                else {
                    localStorage.removeItem("venderUID");
                    localStorage.removeItem("venderUPass");
                }

            } 
            else{
                alert("Invalid Login");
            }

        } 
        catch (error) {

            console.error("Login error:", error);
            alert("An error occurred during login. Please try again.");

        }

    };

    // Logout
    const handleLogout = () => {

        setVender(null);
        localStorage.removeItem("venderSession");

    };

    // ⭐ VendorHome Render
    if (vender) {
        return <VenderHome vender={vender} onLogout={handleLogout} />;
    }

    return(

        <div className="venderlogin-container">

            <div className="venderlogin-forms">

                <h4 className="venderlogin-title">Vendor Login</h4>

                <input 
                    type="text"
                    placeholder="Vendor ID"
                    value={vuid}
                    onChange={(e) => setVuid(e.target.value)}
                /> 

                <input
                    type="password"
                    placeholder="Password"
                    value={vupass}
                    onChange={(e) => setVupass(e.target.value)}
                />

                <div className="remember-me">

                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />

                    <label>Remember Me</label>

                </div>

                <button 
                    onClick={handleLogin} 
                    className="venderlogin-button"
                >
                    Login
                </button>

                <button 
                    onClick={handleLogout}
                    className="venderlogin-button"
                    style={{backgroundColor:"#555",marginTop:"10px"}}
                >
                    Logout
                </button>

            </div>

        </div>

    );

}

export default VenderLogin;