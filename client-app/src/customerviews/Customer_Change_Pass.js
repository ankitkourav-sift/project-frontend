
    import React,{useState,useEffect} from "react";
    import axios from "axios";
    import {FaEye,FaEyeSlash} from "react-icons/fa";
    //import "./CustomerChangePass.css";

     export default function Customer_Change_Pass({Customer,onClose})
     {
         const [CUserId,setCUserId] = useState("");
         const [oldPassword,setOldPassword] = useState("");
         const[newPassword,setNewPassword] = useState("");
         const [confirmPassword,setConfrimPassword] = useState("");
         const [loading,setLoading] = useState(false);
         const [message,setMessage] = useState(null);
         const [error,setError] = useState(null);
         const[showPassword,setShowPassword] = useState({
             old:false,
             new:false,
             confirm:false
         });

         // AUTHO CLEAR MESSAGE AFTER 4S

         useEffect(() =>{
            if(message || error)
            {
                const timer = setTimeout(() => {
                    setMessage(null);
                    setError(null);
                },4000);
                return () => clearTimeout(timer)
            }
         },[message,error])

         // PASSWORD STRENGHT EVALUATION

         function passwordStrength(pw)
         {
             if(!pw) return {label:"", score: 0};
             let score = 0;
             if(pw.length >= 8) score++;
             if(/[A-Z]/.test(pw)) score++;
             if(/[0-9]/.test(pw)) score++;
             if(/[^A-Za-z0-9]/.test(pw)) score++;

             const labels = ["Very Weak", "Good","Strong"];
             return{label:labels[score-1]  || "",score};
         }

          const handleSubmit = async (e) => {
            e.preventDefault();
            setMessage(null);
            setError(null);

            if(!CUserId || !oldPassword || !newPassword || !confirmPassword)
            {
                setError("Please fill all fileds");
                return;
            }

            if(newPassword !== confirmPassword)
            {
                setError("New password and confrim password do not match");
                return;
            }
            if(newPassword.length <6)
            {
                setError("New password must be at least be a 6 charecters long.");
                return;
            }

             setLoading(true);
              if(Customer.CUserId !== CUserId)
             {
                setError("User ID does not match the logged-in user.");
                setLoading(false);
                return;
             }

             try
             {
                const res = await axios.post("https://project-backend-nka5.vercel.app/customer/changepassword", {
                      CUserId,
                      OldPassword:oldPassword,
                      NewPassword:newPassword,
                });

                setMessage(res.data?.message || "password changed succesfully!");
                setOldPassword("");
                setNewPassword("");
                setConfrimPassword("");
                alert("Password changed successfully.please log in again");
                onClose();
             }catch(err)
             {
                const msg = err?.response?.data?.message || err.message || "failed to change password";
                setError(msg);
             } finally
             {
                setLoading(false);
             }
          };

          const strenght = passwordStrength(newPassword);
          return(

          <div className="ch-pass-container">
    <div className="ch-pass-card">
        <h2 className="ch-pass-header">Change Password</h2>

        {message && <div className="ch-pass-alert-success">{message}</div>}
        {error && <div className="ch-pass-alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
            <label>User ID</label>
            <input className="ch-pass-input" type="text" value={CUserId} onChange={(e) => setCUserId(e.target.value)} placeholder="Enter your user ID" />

            <label>Old Password</label>
            <div className="ch-pass-field">
                <input type={showPassword.old ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter Current Password" />
                <span onClick={() => setShowPassword({...showPassword, old: !showPassword.old})}>
                    {showPassword.old ? <FaEyeSlash/> : <FaEye/>}
                </span>
            </div>

            <label>New Password</label>
            <div className="ch-pass-field">
                <input type={showPassword.new ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter New Password" />
                <span onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}>
                    {showPassword.new ? <FaEyeSlash/> : <FaEye/>}
                </span>
            </div>

            {strenght.label && (
                <div className="ch-pass-strength-bar">
                    <div className={`ch-pass-bar level-${strenght.score}`}></div>
                    <span>{strenght.label}</span>
                </div>
            )}

            <label>Confirm New Password</label>
            <div className="ch-pass-field">
                <input type={showPassword.confirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfrimPassword(e.target.value)} placeholder="Re-Enter New Password" />
                <span onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}>
                    {showPassword.confirm ? <FaEyeSlash/> : <FaEye/>}
                </span>
            </div>

            <button type="submit" className="ch-pass-btn" disabled={loading}>{loading ? "Saving..." : "Change Password"}</button>
        </form>

        <p className="ch-pass-hint">TIP: use a strong password (8+ chars, uppercase, numbers, symbols).</p>
    </div>
</div>
          )}