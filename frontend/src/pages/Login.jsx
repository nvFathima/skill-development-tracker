import React, { useEffect } from 'react';
import { CircleArrowLeft } from "lucide-react";
import axiosInstance from '../utils/axios';
import Textbox from "../components/ui/Textbox";
import Button from "../components/ui/LoginButton";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion"; 

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const submitHandler = async (data) => {
        try {
            sessionStorage.clear();

            if (!data.email || !data.password) {
                throw new Error('Email and password are required');
            }

            const response = await axiosInstance.post('/login', data);

            if (!response?.data) {
                throw new Error('Invalid server response');
            }

            const { token, role, name, _id, lastActiveTime, profilePhoto } = response.data;

            if (!token || !role) {
                throw new Error('Invalid authentication data received');
            }

            const authData = {
                token,
                role,
                name,
                userId: _id,
                lastActiveTime,
                profilePhoto
            };

            Object.entries(authData).forEach(([key, value]) => {
                if (value) sessionStorage.setItem(key, value);
            });

            switch (role) {
                case 'admin':
                    navigate('/admin-dashboard');
                    break;
                case 'user':
                    navigate('/user-dashboard');
                    break;
                default:
                    throw new Error(`Unsupported user role: ${role}`);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 
                                 error.message || 
                                 "An error occurred during login";

            console.error("Login Error:", errorMessage);
            alert(errorMessage);
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            const role = sessionStorage.getItem('role');
            switch (role) {
                case 'admin':
                    navigate('/admin-dashboard');
                    break;
                case 'user':
                    navigate('/user-dashboard');
                    break;
                default:
                    sessionStorage.clear();
            }
        }
    }, [navigate]);

    return (
        
        <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]'>
            {/* Back to Home Link */}
            <Link to="/" className="absolute top-6 left-6 text-blue-700 hover:underline text-sm">
                <CircleArrowLeft size={22} /> Home
            </Link>
            <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
                {/* Left side */}
                <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
                    <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
                        <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700'>
                            <span>Skillify</span>
                        </p>
                        <span className='flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base border-gray-300 text-gray-600'>
                            Empower Your Skills, Unlock Your Potential!
                        </span>
                        <div className='cell'>
                            <img src="/skillify-icon-bgremoved1.png" alt="logo" />
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6, ease: "easeOut" }} 
                >
                    <form
                        onSubmit={handleSubmit(submitHandler)}
                        className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14'
                    >
                        <div>
                            <p className='text-blue-600 text-3xl font-bold text-center'>
                                Welcome back!
                            </p>
                            <p className='text-center text-base text-gray-700'>
                                Keep all your credentials safe.
                            </p>
                        </div>

                        <div className='flex flex-col gap-y-5'>
                            <Textbox
                                placeholder='email@example.com'
                                type='email'
                                name='email'
                                label='Email Address'
                                className='w-full rounded-full'
                                register={register("email", {
                                    required: "Email Address is required!",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                error={errors.email ? errors.email.message : ""}
                            />
                            <Textbox
                                placeholder='your password'
                                type='password'
                                name='password'
                                label='Password'
                                className='w-full rounded-full'
                                register={register("password", {
                                    required: "Password is required!",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                                error={errors.password ? errors.password.message : ""}
                            />

                            {/* Forgot Password Link */}
                            <span 
                                onClick={() => navigate("/forgot-password")}
                                className="text-sm text-gray-500 hover:text-blue-600 hover:underline cursor-pointer"
                            >
                                Forgot Password?
                            </span>

                            <Button
                                type='submit'
                                label='Submit'
                                className='w-full h-10 bg-blue-700 text-white rounded-full'
                            />
                            <p className='text-sm text-center text-gray-500 mt-4'>
                                Don't have an account? <a href="/register" className='text-blue-600 hover:underline'>Register here</a>
                            </p>
                        </div>
                    </form>
                </motion.div>
                </div>
            </div>
        </div>
    );
}

export default Login;
