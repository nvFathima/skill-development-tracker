import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Mail, CircleArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8800/verify-email", { email });
            toast.success("Email verified! Proceed to reset password.");
            
            // Navigate to reset password page with userId
            setTimeout(() => {
                navigate(`/reset-password/${response.data.userId}`);
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Email verification failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-[#f3f4f6] p-6">
            
            <Toaster position="top-right" />

            {/* Back to Login */}
            <button 
                onClick={() => navigate("/log-in")}
                className="absolute top-6 left-6 flex items-center gap-2 text-blue-700 hover:underline text-sm"
            >
                <CircleArrowLeft size={16} /> Back to Login
            </button>

            {/* Animated Container */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, ease: "easeOut" }} 
                className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg"
            >
                <h1 className="text-2xl font-bold text-center text-blue-700">Forgot Password?</h1>
                <p className="text-center text-gray-600 text-sm mt-2">Enter your registered email to reset your password.</p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition"
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
