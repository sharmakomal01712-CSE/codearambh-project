const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sehatkosh';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(` MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`\n[WARNING] MongoDB Connection Notice: Could not connect to MongoDB at ${mongoURI}.`);
    console.warn(` Reason: ${error.message}`);
    console.warn(` Tip: Ensure MongoDB service is running (or provide a MongoDB Atlas URI in backend/.env).`);
    console.log(` The server will continue running. Any MongoDB requests will retry on operation.\n`);
    return null;
  }
};

module.exports = connectDB;
