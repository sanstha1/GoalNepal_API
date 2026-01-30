const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/profile_pictures", express.static(path.join(__dirname, "public/profile_pictures")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("GoalNepal API is running");
});

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/users", require("./routes/profileRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});