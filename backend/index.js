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

// MongoDB Connection
main()
.then(()=>console.log("DB Connected"))
.catch(err=>console.log(err))

async function main() {
    await mongoose.connect('mongodb+srv://fathimanv627:wtD3F6EDtmv9SjMx@skill-development-track.uf7qi.mongodb.net/skill-development-tracker');
  
}

// Start Server
const PORT = 8800;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
