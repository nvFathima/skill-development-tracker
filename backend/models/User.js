const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    education: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    alternateEmail: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
