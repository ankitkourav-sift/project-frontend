import React, { useState } from "react";
import axios from "axios";
// import "./VenderForgetPass.css";

function VenderForgetPassword({ onBack }) {

    const [VUserId, setVUserId] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1);

    const REACT_APP_BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

    // ================= SEND OTP =================
    const sendOtp = async () => {
        try {

            const res = await axios.post(
                `${REACT_APP_BASE_API_URL}/vender/send-otp`,
                {
                    VUserId
                }
            );

            alert(res.data.message);

            if (res.data.success) {
                setStep(2);
            }

        } catch (err) {
            console.error(err);

            if (err.response) {
                alert(err.response.data.message);
            } else {
                alert("Unable to connect to server.");
            }
        }
    };

    // ================= RESET PASSWORD =================
    const resetPassword = async () => {

        if (!otp || !newPassword) {
            alert("Please enter OTP and New Password");
            return;
        }

        try {

            const res = await axios.post(
                `${REACT_APP_BASE_API_URL}/vender/reset-password`,
                {
                    VUserId,
                    otp,
                    newPassword
                }
            );

            alert(res.data.message);

            if (res.data.success) {
                onBack();
            }

        } catch (err) {

            console.error(err);

            if (err.response) {
                alert(err.response.data.message);
            } else {
                alert("Unable to connect to server.");
            }
        }
    };

    return (

        <div
            style={{
                width: "400px",
                margin: "50px auto",
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "10px",
                textAlign: "center"
            }}
        >

            <h2>Vendor Forgot Password</h2>

            {step === 1 && (
                <>
                    <input
                        type="text"
                        placeholder="Enter Vendor User ID"
                        value={VUserId}
                        onChange={(e) => setVUserId(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginBottom: "15px"
                        }}
                    />

                    <button
                        onClick={sendOtp}
                        style={{
                            width: "100%",
                            padding: "10px",
                            background: "#0d6efd",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        Send OTP
                    </button>
                </>
            )}

            {step === 2 && (
                <>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "15px"
                        }}
                    />

                    <input
                        type="password"
                        placeholder="Enter New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "15px"
                        }}
                    />

                    <button
                        onClick={resetPassword}
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "15px",
                            background: "green",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        Reset Password
                    </button>
                </>
            )}

            <button
                onClick={onBack}
                style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "15px",
                    background: "#555",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer"
                }}
            >
                Back to Login
            </button>

        </div>
    );
}

export default VenderForgetPassword;

           
          // return(
    //         <div style={{margin:20}}>
    //            <h3>Vendor Forget Password</h3>
    //           {step === 1 && (
    //             <>
    //              <input type="text" placeholder="Enter Vendor User ID" value={VUserId} onChange={(e) => setVUserId(e.target.value)}></input>
    //               <br/>
    //               <button onClick={sendOtp}>Send OTP</button>
    //             </>
    //           )}

    //           {step === 2 && 
    //           (
    //             <>
    //             <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)}></input>
                
    //              <br/>

    //            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}></input>

    //               <br/>

    //                  <button onClick={resetPassword}>Reset Password</button>
    //              </>
    //                 )}

    //                 <br/>

    //                 <button onClick={onBack}>Back to Login</button>
    //               </div>
    //       );
    //  }

    //  export default VenderForgetPassword;