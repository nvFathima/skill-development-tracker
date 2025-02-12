require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routers/userRoutes');
const skillRoutes = require('./routers/skillsRoutes');
const resourceRoutes = require('./routers/resourceRoutes');
const postRoutes = require('./routers/postRoutes');
const userManageRoutes = require('./routers/userManageRoutes');
const sgManageRoutes = require('./routers/sgManageRoutes');
const notificationRoutes = require('./routers/notificationRoutes');
const forumRoutes = require('./routers/forumRoutes');
const statRoutes = require('./routers/statRoutes');
const concernRoutes = require('./routers/concernRoutes');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', userRoutes);
app.use('/', skillRoutes);
app.use('/', postRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/resources',resourceRoutes);
app.use('/', userManageRoutes);
app.use('/', sgManageRoutes);
app.use('/', forumRoutes);
app.use('/concerns',concernRoutes);
app.use('/notifications', notificationRoutes);
app.use('/stats',statRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

<<<<<<< HEAD
async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("DB Connected");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit process on failure
    }
=======
async function main() {
    await mongoose.connect('mongodb connection string');
  
>>>>>>> 84bc1c288eaeb8342009e5ca98c21f3a6e15f6f7
}

connectDB();

// Start Server
const PORT = ; // your port number
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
