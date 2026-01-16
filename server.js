const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();          // load .env
connectDB();              // connect MongoDB

const app = express();

// Body parser
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("GoalNepal API is running");
});

// Auth routes (LOGIN / REGISTER)
app.use("/api/auth", require("./routes/authRoutes"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
