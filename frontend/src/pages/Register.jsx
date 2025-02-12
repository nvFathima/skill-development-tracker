import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { CircleArrowLeft, User, Lock, Mail, Phone, Calendar, Briefcase } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion"; 

const Register = () => {
    const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm({ mode: 'onBlur' });
    const navigate = useNavigate();
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const watchPassword = watch("password", "");

    const onSubmit = async (data) => {
        const transformedData = {
            ...data,
            employmentDetails: {
                status: data.employmentStatus.toLowerCase(),
            }
        };
        delete transformedData.employmentStatus;

        try {
            const response = await axios.post('http://localhost:8800/register', transformedData);
            toast.success("Registration Successful!", {
                duration: 3000,
                style: { background: "#4CAF50", color: "#fff" },
            });

            setTimeout(() => {
                navigate('/log-in', { replace: true });
            }, 3000);

        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred during registration.", {
                duration: 4000,
                style: { background: "#f44336", color: "#fff" },
            });
        }
    };

    // Password validation criteria
    const passwordCriteria = {
        minLength: watchPassword.length >= 8,
        hasUppercase: /[A-Z]/.test(watchPassword),
        hasLowercase: /[a-z]/.test(watchPassword),
        hasNumber: /\d/.test(watchPassword),
        hasSpecialChar: /[@$!%*?&]/.test(watchPassword),
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-[#f3f4f6] p-6">

            <Toaster position="top-right" />
            
            {/* Back to Home Link */}
            <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-blue-700 hover:underline text-sm">
                <CircleArrowLeft size={16} /> Back to Home
            </Link>

            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, ease: "easeOut" }} 
                className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg"
            >
                <h1 className="text-3xl font-bold text-center text-blue-700">Sign Up for Skillify</h1>
                <p className="text-center text-gray-600 mb-6 text-sm">Track & improve your skills effortlessly!</p>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Full Name */}
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="text" placeholder="Full Name"
                                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                {...register("fullName", { required: "Full Name is required" })}
                                onBlur={() => trigger("fullName")} />
                            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                        </div>

                        {/* Phone Number */}
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="tel" placeholder="Phone Number"
                                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                {...register("phone", { required: "Phone number is required", pattern: { value: /^[0-9]{10}$/, message: "Phone number must be 10 digits" } })}
                                onBlur={() => trigger("phone")} />
                            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                        </div>

                        {/* Employment Status */}
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                            <select
                                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                {...register("employmentStatus", { required: "Please select your employment status" })}
                                onBlur={() => trigger("employmentStatus")}
                            >
                                <option value="">Select employment status</option>
                                <option value="Employed">Employed</option>
                                <option value="Student">Student</option>
                                <option value="Unemployed">Unemployed</option>
                            </select>
                            {errors.employmentStatus && <p className="text-red-500 text-sm">{errors.employmentStatus.message}</p>}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Email Address */}
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="email" placeholder="Email Address"
                                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" } })}
                                onBlur={() => trigger("email")} />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </div>

                        {/* Age */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="number" placeholder="Age"
                                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                {...register("age", { required: "Age is required", min: { value: 18, message: "You must be at least 18 years old" } })}
                                onBlur={() => trigger("age")} />
                            {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="password" placeholder="Password"
                                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)} />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
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

                        {/* Confirm Password */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="password" placeholder="Confirm Password"
                                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                {...register("confirmPassword", { required: "Confirm Password is required", validate: (value) => value === watchPassword || "Passwords do not match" })}
                                onBlur={() => trigger("confirmPassword")} />
                            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="flex items-center text-sm text-gray-700">
                            <input
                                type="checkbox"
                                className="mr-2"
                                {...register("terms", { required: "You must agree to the terms and conditions" })}
                                onBlur={() => trigger("terms")}
                            />
                            I agree to the <Link to="/terms" className="text-blue-600 hover:underline" target='_blank'> terms and conditions</Link>.
                        </label>
                        {errors.terms && <p className="text-red-500 text-sm">{errors.terms.message}</p>}
                    </div>

                    {/* Submit Button */}
                    <div className="col-span-1 md:col-span-2">
                        <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition">
                            Sign Up
                        </button>
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-gray-600 text-sm col-span-1 md:col-span-2">
                        Already have an account? <Link to="/log-in" className="text-blue-600 hover:underline">Log in</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;
