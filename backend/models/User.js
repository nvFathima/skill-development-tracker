const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        age: {
            type: Number,
            required: true,
            validate: {
                validator: Number.isInteger,
                message: 'Age must be an integer.',
            },
            min: [0, 'Age cannot be negative'],
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            validate: {
                validator: function (email) {
                    // Simple email regex validation
                    return /^\S+@\S+\.\S+$/.test(email);
                },
                message: 'Invalid email format.',
            },
        },
        phone: {
            type: String,
            required: true,
            validate: {
                validator: function (phone) {
                    return /^\+?[1-9]\d{1,14}$/.test(phone); // E.164 format
                },
                message: 'Invalid phone number format.',
            },
        },
        alternateEmail: {
            type: String,
            validate: {
                validator: function (email) {
                    return !email || /^\S+@\S+\.\S+$/.test(email);
                },
                message: 'Invalid alternate email format.',
            },
        },
        password: {
            type: String,
            required: true,
        },
        userRole: {
            type: String,
            default: 'user',
            enum: ['user', 'admin'],
        },
        employmentDetails: {
            status: {
                type: String,
                enum: ['employed', 'unemployed', 'student'],
                required: true,
            },
            currentJob: {
                company: { type: String, default: '' },
                title: { type: String, default: '' },
                startDate: { type: Date, default: null },
            },
            preferredJobs: {
                type: [String],
                default: [], // Allow empty array by default
            },
        },        
        education: [{
            institution: { type: String },
            degree: { type: String },
            field: { type: String },
            startDate: { type: Date },
            endDate: { type: Date },
            current: { type: Boolean, default: false },
          }],
        profilePhoto: {
            type: String,  // This will store the URL/path to the photo
            default: ''
        },lastActiveTime: {
            type: Date,
            default: Date.now
        },
        notifications: [{
            message: String,
            createdAt: { type: Date, default: Date.now },
            read: { type: Boolean, default: false }
        }],
        activityAlertThreshold: {
            type: Number,  // in days
            default: 30    // default alert after 30 days of inactivity
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('users', userSchema);
