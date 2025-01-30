const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    flags: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        reason: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' }
    }],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        flags: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
            reason: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' }
        }]
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', 
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('posts', postSchema);
