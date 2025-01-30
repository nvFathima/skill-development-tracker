import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const Register = () => {
    const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm({
        mode: 'onBlur',
    });
    const navigate = useNavigate();
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const watchPassword = watch("password", "");

    const onSubmit = async (data) => {
        // Transform the form data to match the schema
        const transformedData = {
            ...data,
            employmentDetails: {
                status: data.employmentStatus.toLowerCase(),
            }
        };
        
        // Remove the original employmentStatus as it's now nested
        delete transformedData.employmentStatus;

        try {
            const response = await axios.post('http://localhost:8800/register', transformedData);
            console.log("Registration Successful:", response.data);
            alert("Registration Successful!");
            navigate('/log-in');
        } catch (error) {
            console.error("Registration Error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "An error occurred during registration.");
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
        <div className="w-full min-h-screen flex items-center justify-center bg-[#f3f4f6] p-4">
            <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center text-blue-700 mb-4">Create Your Account</h1>
                <p className="text-center text-gray-600 mb-6 text-sm">
                    Join Skillify to track your skill development journey!
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-gray-700 text-sm font-medium">Full Name</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg mt-1"
                                {...register("fullName", { 
                                    required: "Full Name is required",
                                })}
                                onBlur={() => trigger("fullName")}
                            />
                            {errors.fullName && <span className="text-red-500 text-sm">{errors.fullName.message}</span>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-gray-700 text-sm font-medium">Phone Number</label>
                            <input
                                type="tel"
                                className="w-full p-2 border rounded-lg mt-1"
                                {...register("phone", {
                                    required: "Phone number is required",
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "Phone number must be 10 digits",
                                    },
                                })}
                                onBlur={() => trigger("phone")}
                            />
                            {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <label className="block text-gray-700 text-sm font-medium">Password</label>
                            <input
                                type="password"
                                className="w-full p-2 border rounded-lg mt-1"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                        message: "Password doesn't meet requirements",
                                    },
                                })}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => {
                                    setIsPasswordFocused(false);
                                    trigger("password");
                                }}
                            />
                            {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                            
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

                        {/* Employment Status */}
                        <div>
                            <label className="block text-gray-700 text-sm font-medium">Employment Status</label>
                            <select
                                className="w-full p-2 border rounded-lg mt-1"
                                {...register("employmentStatus", { required: "Please select your employment status" })}
                                onBlur={() => trigger("employmentStatus")}
                            >
                                <option value="">Select your status</option>
                                <option value="Employed">Employed</option>
                                <option value="Student">Student</option>
                                <option value="Unemployed">Unemployed</option>
                            </select>
                            {errors.employmentStatus && <span className="text-red-500 text-sm">{errors.employmentStatus.message}</span>}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Age */}
                        <div>
                            <label className="block text-gray-700 text-sm font-medium">Age</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded-lg mt-1"
                                {...register("age", {
                                    required: "Age is required",
                                    min: { value: 13, message: "Minimum age is 13" },
                                    max: { value: 100, message: "Maximum age is 100" },
                                })}
                                onBlur={() => trigger("age")}
                            />
                            {errors.age && <span className="text-red-500 text-sm">{errors.age.message}</span>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-gray-700 text-sm font-medium">Email Address</label>
                            <input
                                type="email"
                                className="w-full p-2 border rounded-lg mt-1"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Invalid email format",
                                    },
                                })}
                                onBlur={() => trigger("email")}
                            />
                            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-gray-700 text-sm font-medium">Confirm Password</label>
                            <input
                                type="password"
                                className="w-full p-2 border rounded-lg mt-1"
                                {...register("confirmPassword", {
                                    required: "Confirm Password is required",
                                    validate: (value) => value === watchPassword || "Passwords do not match",
                                })}
                                onBlur={() => trigger("confirmPassword")}
                            />
                            {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
                        </div>
                    </div>

                    {/* Full Width Elements */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        {/* Terms */}
                        <div>
                            <label className="flex items-center text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    {...register("terms", { required: "You must agree to the terms and conditions" })}
                                    onBlur={() => trigger("terms")}
                                />
                                I agree to the <Link to="/terms" className="text-blue-600 hover:underline ml-1">terms and conditions</Link>.
                            </label>
                            {errors.terms && <span className="text-red-500 text-sm block">{errors.terms.message}</span>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition-colors"
                        >
                            Sign Up
                        </button>

                        <p className="text-center text-gray-600 text-sm">
                            Already have an account? <Link to="/log-in" className="text-blue-600 hover:underline">Log in</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;