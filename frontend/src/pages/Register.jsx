import React from 'react';
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

const Register = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();

    const onSubmit = (data) => {
        console.log("User Data:", data);
    };

    const watchPassword = watch("password", "");

    return (
        <div className='w-full min-h-screen flex items-center justify-center bg-[#f3f4f6]'>
            <div className='w-full max-w-md bg-white p-6 rounded-lg shadow-lg'>
                <h1 className='text-3xl font-bold text-center text-blue-700 mb-4'>Create Your Account</h1>
                <p className='text-center text-gray-600 mb-6'>Join Skillify to track your skill development journey!</p>

                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-y-4'>
                    {/* Form fields for user input */}
                    <div>
                        <label className='block text-gray-700'>Full Name</label>
                        <input
                            type='text'
                            className='w-full p-2 border rounded-lg'
                            {...register("fullName", { required: "Full Name is required" })}
                        />
                        {errors.fullName && <span className='text-red-500 text-sm'>{errors.fullName.message}</span>}
                    </div>
                    <div>
                        <label className='block text-gray-700'>Age</label>
                        <input
                            type='number'
                            className='w-full p-2 border rounded-lg'
                            {...register("age", {
                                required: "Age is required",
                                min: { value: 13, message: "Minimum age is 13" },
                                max: { value: 100, message: "Maximum age is 100" }
                            })}
                        />
                        {errors.age && <span className='text-red-500 text-sm'>{errors.age.message}</span>}
                    </div>
                    <div>
                        <label className='block text-gray-700'>Email Address</label>
                        <input
                            type='email'
                            className='w-full p-2 border rounded-lg'
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email format"
                                }
                            })}
                        />
                        {errors.email && <span className='text-red-500 text-sm'>{errors.email.message}</span>}
                    </div>
                    <div>
                        <label className='block text-gray-700'>Education</label>
                        <select
                            className='w-full p-2 border rounded-lg'
                            {...register("education", { required: "Education is required" })}
                        >
                            <option value=''>Select your education level</option>
                            <option value="High School">High School</option>
                            <option value="Bachelor&apos;s">Bachelor's</option>
                            <option value="Master&apos;s">Master's</option>
                            <option value="Ph.D.">Ph.D.</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.education && <span className='text-red-500 text-sm'>{errors.education.message}</span>}
                    </div>
                    <div>
                        <label className='block text-gray-700'>Phone Number</label>
                        <input
                            type='tel'
                            className='w-full p-2 border rounded-lg'
                            {...register("phone", {
                                required: "Phone number is required",
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: "Phone number must be 10 digits"
                                }
                            })}
                        />
                        {errors.phone && <span className='text-red-500 text-sm'>{errors.phone.message}</span>}
                    </div>
                    <div>
                        <label className='block text-gray-700'>Alternate Email ID</label>
                        <input
                            type='email'
                            className='w-full p-2 border rounded-lg'
                            {...register("alternateEmail", {
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email format"
                                }
                            })}
                        />
                        {errors.alternateEmail && <span className='text-red-500 text-sm'>{errors.alternateEmail.message}</span>}
                    </div>
                    
                    {/* Terms and Conditions */}
                    <div>
                        <label className='flex items-center text-gray-700'>
                            <input
                                type='checkbox'
                                className='mr-2'
                                {...register("terms", { required: "You must agree to the terms and conditions" })}
                            />
                            I agree to the <a href='/terms' className='text-blue-600 underline'>terms and conditions</a>.
                        </label>
                        {errors.terms && <span className='text-red-500 text-sm'>{errors.terms.message}</span>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type='submit'
                        className='w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800'
                    >
                        Sign Up
                    </button>
                </form>

                <p className='text-center text-gray-600 mt-4'>
                    Already have an account? <Link to='/log-in' className='text-blue-600 hover:underline'>Log in here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
