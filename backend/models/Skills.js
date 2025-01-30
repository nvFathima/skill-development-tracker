const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    name: { type: String, required: true },
    description: { type: String, default: "No description provided.", },
    progress: { type: Number, default: 0 }, // Percentage progress
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('skills', skillSchema);