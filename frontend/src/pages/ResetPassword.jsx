import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, CircleArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const ResetPassword = () => {
    const { userId } = useParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const navigate = useNavigate();

    // Password validation criteria
    const passwordCriteria = {
        minLength: newPassword.length >= 8,
        hasUppercase: /[A-Z]/.test(newPassword),
        hasLowercase: /[a-z]/.test(newPassword),
        hasNumber: /\d/.test(newPassword),
        hasSpecialChar: /[@$!%*?&]/.test(newPassword),
    };

    const validatePassword = () => {
        if (!passwordCriteria.minLength) {
            return "Password must be at least 8 characters";
        }
        if (!passwordCriteria.hasUppercase) {
            return "Password must contain at least one uppercase letter";
        }
        if (!passwordCriteria.hasLowercase) {
            return "Password must contain at least one lowercase letter";
        }
        if (!passwordCriteria.hasNumber) {
            return "Password must contain at least one number";
        }
        if (!passwordCriteria.hasSpecialChar) {
            return "Password must contain at least one special character (@$!%*?&)";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const passwordError = validatePassword();
        if (passwordError) {
            return toast.error(passwordError);
        }

        if (newPassword !== confirmPassword) {
            return toast.error("Passwords do not match.");
        }

        setLoading(true);
        try {
            await axios.post("http://localhost:8800/reset-password", { userId, newPassword });
            toast.success("Password reset successfully! Redirecting to login...");

            setTimeout(() => {
                navigate("/log-in");
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Password reset failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-[#f3f4f6] p-6">
            <Toaster position="top-right" />

            <button 
                onClick={() => navigate("/log-in")}
                className="absolute top-6 left-6 flex items-center gap-2 text-blue-700 hover:underline text-sm"
            >
                <CircleArrowLeft size={16} /> Back to Login
            </button>

            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, ease: "easeOut" }} 
                className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg"
            >
                <h1 className="text-2xl font-bold text-center text-blue-700">Reset Password</h1>
                <p className="text-center text-gray-600 text-sm mt-2">Enter your new password below.</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            placeholder="New Password" 
                            className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)}
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            required 
                        />
                        {/* Password requirements tooltip */}
                        {isPasswordFocused && (
                            <div className="absolute z-10 mt-2 p-3 bg-white border rounded-lg shadow-lg w-full">
                                <p className="text-sm font-medium mb-2">Password requirements:</p>
                                <ul className="text-xs space-y-1">
                                    <li className={passwordCriteria.minLength ? "text-green-600" : "text-gray-600"}>
                                        ✓ Minimum 8 characters
                                    </li>
                                    <li className={passwordCriteria.hasUppercase ? "text-green-600" : "text-gray-600"}>
                                        ✓ At least one uppercase letter
                                    </li>
                                    <li className={passwordCriteria.hasLowercase ? "text-green-600" : "text-gray-600"}>
                                        ✓ At least one lowercase letter
                                    </li>
                                    <li className={passwordCriteria.hasNumber ? "text-green-600" : "text-gray-600"}>
                                        ✓ At least one number
                                    </li>
                                    <li className={passwordCriteria.hasSpecialChar ? "text-green-600" : "text-gray-600"}>
                                        ✓ At least one special character (@$!%*?&)
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            placeholder="Confirm Password" 
                            className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition"
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;