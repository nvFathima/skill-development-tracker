import axios from 'axios';
import React from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const response = await axios.post('http://localhost:8800/api/register', data);
            console.log("Registration Successful:", response.data);
            navigate('/log-in');
        } catch (error) {
            console.error("Registration Error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "An error occurred during registration.");
        }
    };

    const watchPassword = watch("password", "");

    return (
        <div className='w-full min-h-screen flex items-center justify-center bg-[#f3f4f6]'>
            <div className='w-full max-w-lg bg-white p-6 rounded-lg shadow-lg'>
                <h1 className='text-2xl font-bold text-center text-blue-700 mb-4'>Create Your Account</h1>
                <p className='text-center text-gray-600 mb-4 text-sm'>
                    Join Skillify to track your skill development journey!
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-2 gap-4'>
                    {/* Full Name */}
                    <div className='col-span-2'>
                        <label className='block text-gray-700 text-sm'>Full Name</label>
                        <input
                            type='text'
                            className='w-full p-2 border rounded-lg'
                            {...register("fullName", { required: "Full Name is required" })}
                        />
                        {errors.fullName && <span className='text-red-500 text-sm'>{errors.fullName.message}</span>}
                    </div>

                    {/* Age */}
                    <div>
                        <label className='block text-gray-700 text-sm'>Age</label>
                        <input
                            type='number'
                            className='w-full p-2 border rounded-lg'
                            {...register("age", {
                                required: "Age is required",
                                min: { value: 13, message: "Minimum age is 13" },
                                max: { value: 100, message: "Maximum age is 100" },
                            })}
                        />
                        {errors.age && <span className='text-red-500 text-sm'>{errors.age.message}</span>}
                    </div>

                    {/* Email Address */}
                    <div>
                        <label className='block text-gray-700 text-sm'>Email Address</label>
                        <input
                            type='email'
                            className='w-full p-2 border rounded-lg'
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email format",
                                },
                            })}
                        />
                        {errors.email && <span className='text-red-500 text-sm'>{errors.email.message}</span>}
                    </div>

                    {/* Education */}
                    <div>
                        <label className='block text-gray-700 text-sm'>Education</label>
                        <select
                            className='w-full p-2 border rounded-lg'
                            {...register("education", { required: "Education is required" })}
                        >
                            <option value=''>Select</option>
                            <option value="High School">High School</option>
                            <option value="Bachelor's">Bachelor's</option>
                            <option value="Master's">Master's</option>
                            <option value="Ph.D.">Ph.D.</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.education && <span className='text-red-500 text-sm'>{errors.education.message}</span>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className='block text-gray-700 text-sm'>Phone Number</label>
                        <input
                            type='tel'
                            className='w-full p-2 border rounded-lg'
                            {...register("phone", {
                                required: "Phone number is required",
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: "Phone number must be 10 digits",
                                },
                            })}
                        />
                        {errors.phone && <span className='text-red-500 text-sm'>{errors.phone.message}</span>}
                    </div>

                    {/* Alternate Email */}
                    <div>
                        <label className='block text-gray-700 text-sm'>Alternate Email</label>
                        <input
                            type='email'
                            className='w-full p-2 border rounded-lg'
                            {...register("alternateEmail", {
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email format",
                                },
                            })}
                        />
                        {errors.alternateEmail && <span className='text-red-500 text-sm'>{errors.alternateEmail.message}</span>}
                    </div>

                    {/* Password */}
                    <div className='col-span-2'>
                        <label className='block text-gray-700 text-sm'>Password</label>
                        <input
                            type='password'
                            className='w-full p-2 border rounded-lg'
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 6, message: "Password must be at least 6 characters" },
                            })}
                        />
                        {errors.password && <span className='text-red-500 text-sm'>{errors.password.message}</span>}
                    </div>

                    {/* Confirm Password */}
                    <div className='col-span-2'>
                        <label className='block text-gray-700 text-sm'>Confirm Password</label>
                        <input
                            type='password'
                            className='w-full p-2 border rounded-lg'
                            {...register("confirmPassword", {
                                required: "Confirm Password is required",
                                validate: (value) => value === watchPassword || "Passwords do not match",
                            })}
                        />
                        {errors.confirmPassword && <span className='text-red-500 text-sm'>{errors.confirmPassword.message}</span>}
                    </div>

                    {/* Terms */}
                    <div className='col-span-2'>
                        <label className='flex items-center text-sm text-gray-700'>
                            <input
                                type='checkbox'
                                className='mr-2'
                                {...register("terms", { required: "You must agree to the terms and conditions" })}
                            />
                            I agree to the <Link to='/terms' className='text-blue-600 underline'>terms and conditions</Link>.
                        </label>
                        {errors.terms && <span className='text-red-500 text-sm'>{errors.terms.message}</span>}
                    </div>

                    {/* Submit Button */}
                    <div className='col-span-2'>
                        <button
                            type='submit'
                            className='w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800'
                        >
                            Sign Up
                        </button>
                    </div>
                </form>

                <p className='text-center text-gray-600 mt-4 text-sm'>
                    Already have an account? <Link to='/log-in' className='text-blue-600 hover:underline'>Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;