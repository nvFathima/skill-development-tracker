import React from 'react';
import { Phone } from 'lucide-react';

const countryOptions = [
    { code: '+1', country: 'US' },
    { code: '+91', country: 'IN' },
    { code: '+44', country: 'UK' },
    { code: '+61', country: 'AU' },
    { code: '+86', country: 'CN' },
    // Add more as needed
];

const PhoneInput = ({ register, trigger, errors }) => {
    return (
        <div className="relative flex gap-0">
            {/* Country Code Select */}
            <div className="relative w-24">
                <select 
                    className="h-full w-full py-3 px-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                    {...register("countryCode", { required: "Required" })}
                >
                    {countryOptions.map(option => (
                        <option key={option.code} value={option.code}>
                            {option.code}
                        </option>
                    ))}
                </select>
            </div>

            {/* Phone Number Input */}
            <div className="relative flex-1">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                    type="tel" 
                    placeholder="Phone Number"
                    className="w-full pl-10 p-3 border border-l-0 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                    {...register("phoneNumber", { 
                        required: "Phone number is required",
                        pattern: { 
                            value: /^[0-9]{1,14}$/, 
                            message: "Please enter a valid phone number" 
                        } 
                    })}
                    onBlur={() => trigger("phoneNumber")}
                />
                {errors.phoneNumber && (
                    <p className="text-red-500 text-sm -bottom-6">{errors.phoneNumber.message}</p>
                )}
            </div>
        </div>
    );
};

export default PhoneInput;