import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
// import "./VenderChangePass.css";

export default function Vender_Change_Pass({ VUserId, onClose }) {

    const REACT_APP_BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
                setMessage(null);
                setError(null);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [message, error]);

    function passwordStrength(password) {

        if (!password) return { label: "", score: 0 };

        let score = 0;

        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const labels = ["Very Weak", "Weak", "Good", "Strong"];

        return {
            label: labels[score - 1] || "",
            score
        };
    }

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage(null);
        setError(null);

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError("Please fill all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New Password and Confirm Password do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("New Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);

        try {

            const res = await axios.post(
                `${REACT_APP_BASE_API_URL}/vender/changepassword`,
                {
                    VUserId,
                    OldPassword: oldPassword,
                    newPassword
                }
            );

            setMessage(res.data.message || "Password changed successfully");

            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                onClose();
            }, 1500);

        }
        catch (err) {

            const msg =
                err?.response?.data?.message ||
                err.message ||
                "Failed to change password";

            setError(msg);

        }
        finally {
            setLoading(false);
        }

    };

    const strength = passwordStrength(newPassword);

    return (

        <div className="vcp-container">

            <div className="vcp-card">

                <h2 className="vcp-heading">CHANGE PASSWORD</h2>

                {message && (
                    <div className="vcp-alert vcp-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="vcp-alert vcp-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="vcp-form">

                    <label className="vcp-label">
                        OLD PASSWORD
                    </label>

                    <div className="vcp-pass-field">

                        <input
                            type={showPassword.old ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Enter Old Password"
                            className="vcp-input"
                        />

                        <span
                            className="vcp-eye"
                            onClick={() =>
                                setShowPassword({
                                    ...showPassword,
                                    old: !showPassword.old
                                })
                            }
                        >
                            {showPassword.old ? <FaEyeSlash /> : <FaEye />}
                        </span>

                    </div>

                    <label className="vcp-label">
                        NEW PASSWORD
                    </label>

                    <div className="vcp-pass-field">

                        <input
                            type={showPassword.new ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter New Password"
                            className="vcp-input"
                        />

                        <span
                            className="vcp-eye"
                            onClick={() =>
                                setShowPassword({
                                    ...showPassword,
                                    new: !showPassword.new
                                })
                            }
                        >
                            {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                        </span>

                    </div>

                    {strength.label && (

                        <div className="vcp-strength">

                            <div className={`vcp-bar vcp-level-${strength.score}`}></div>

                            <span className="vcp-strength-label">
                                {strength.label}
                            </span>

                        </div>

                    )}

                    <label className="vcp-label">
                        CONFIRM PASSWORD
                    </label>

                    <div className="vcp-pass-field">

                        <input
                            type={showPassword.confirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            className="vcp-input"
                        />

                        <span
                            className="vcp-eye"
                            onClick={() =>
                                setShowPassword({
                                    ...showPassword,
                                    confirm: !showPassword.confirm
                                })
                            }
                        >
                            {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                        </span>

                    </div>

                    <button
                        type="submit"
                        className="vcp-btn"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Change Password"}
                    </button>

                    <button
                        type="button"
                        className="vcp-btn"
                        style={{
                            background: "#666",
                            marginTop: "10px"
                        }}
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                </form>

                <p className="vcp-hint">
                    TIP: Use a strong password (8+ characters, uppercase,
                    numbers and symbols)
                </p>

            </div>

        </div>

    );

}
