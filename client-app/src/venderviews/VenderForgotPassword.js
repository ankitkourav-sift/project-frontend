  
    import React,{use, useState} from "react";
    import axios from "axios";
    //import "./VenderForgetPass.css";

     function VenderForgetPassword({onBack})
     {
         const [VUserId,setVUserId] = useState("");
         const [otp,setOtp] = useState("");
         const [newPassword, setNewPassword]=useState("");
         const [step,setStep] = useState(1);

         const sendOtp = async () =>{
             try{
                const res = await axios.post("http://localhost:9876/vender/send-otp", {
                    VUserId,
                   
                         });
                alert(res.data.message);
                if(res.data.success) setStep(2);
             }
             catch(err)
             {
                console.error(err);
                alert("Error Sending OTP");
             }
         };

         const resetPassword = async() =>{
            try{
                const res = await axios.post("http://localhost:9876/vender/reset-password", {
                    VUserId,
                    otp,
                    newPassword,
                });
                alert(res.data.message);
                if(res.data.success) onBack();
            } catch(err)
            {
                console.error(err);
                alert("Error Reseting Password")
            }
         };


         return(
  <div className="vfp-container">
    <h3 className="vfp-heading">Vendor Forget Password</h3>

    {step === 1 && (
      <>
        <input 
          type="text" 
          placeholder="Enter Vendor User ID" 
          value={VUserId} 
          onChange={(e) => setVUserId(e.target.value)}
          className="vfp-input"
        />
        <button onClick={sendOtp} className="vfp-btn vfp-btn-primary">Send OTP</button>
      </>
    )}

    {step === 2 && (
      <>
        <input 
          type="text" 
          placeholder="Enter OTP" 
          value={otp} 
          onChange={(e) => setOtp(e.target.value)}
          className="vfp-input"
        />
        <input 
          type="password" 
          placeholder="New Password" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)}
          className="vfp-input"
        />
        <button onClick={resetPassword} className="vfp-btn vfp-btn-success">Reset Password</button>
      </>
    )}

    <button onClick={onBack} className="vfp-btn vfp-btn-cancel">Back to Login</button>
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