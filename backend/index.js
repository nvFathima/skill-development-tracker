// server.js or index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routers/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// MongoDB Connection
main()
.then(()=>console.log("DB Connected"))
.catch(err=>console.log(err))

async function main() {
    await mongoose.connect('mongodb+srv://<username>:<password>@skill-development-track.uf7qi.mongodb.net/<db-name>');
  
}

// Start Server
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
