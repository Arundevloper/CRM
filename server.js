import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/dbConnect.js";
import cors from "cors";
import morgan from "morgan";
import bussinessRoutes from "./routes/bussinessRoutes.js";
import authenticatinRoutes from "./routes/authenticationRoutes.js"

// Configure environment variables
dotenv.config();

// Connect to database and start server
connectDB();


// Create Express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// API routes
app.use("/", bussinessRoutes);
app.use("/auth", authenticatinRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
