const mongoose = require('mongoose');
const { parseISO8601Duration } = require('../utils/timeParser');

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    platform: { type: String, required: true },
    link: { type: String, required: true },
    thumbnail: String,
    duration: { 
        type: Number,
        get: function(seconds) {
            if (!seconds) return '';
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;
            let timeString = '';
            if (hours > 0) timeString += `${hours}h `;
            if (minutes > 0) timeString += `${minutes}m `;
            if (remainingSeconds > 0) timeString += `${remainingSeconds}s`;
            
            return timeString.trim();
        },
        set: function(duration) {
            if (typeof duration === 'number') return duration;
            if (typeof duration === 'string' && duration.startsWith('PT')) {
                return parseISO8601Duration(duration);
            }
            return 0;
        }
    }
});

const goalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    title: { type: String, required: true },
    description: { type: String, default: "No description provided." },    
    associatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'skills' }],
    startDate: { type: Date, required: true },
    targetCompletionDate: { 
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return new Date(this.startDate) <= new Date(value);
            },
            message: "Target completion date must be on or after the start date.",
        },
    },   
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    resources: [resourceSchema]
},
{ timestamps: true });

module.exports = mongoose.model('goals', goalSchema);