const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Routes
const productRoutes = require("./routes/productRoutes");
const stockRoutes = require("./routes/stockRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const chartRoutes = require("./routes/chartRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const cors = require("cors");

// Load env
dotenv.config();

// App init
const app = express();
const server = http.createServer(app);

// =======================
// CORS (Sabse Pehle)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    console.log("👉 Incoming Origin:", JSON.stringify(origin));

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Origin mismatch! Allowed:", allowedOrigins);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

console.log("FRONTEND_URL =", process.env.FRONTEND_URL);
// Logging
app.use((req, res, next) => {
  console.log("🔥 HIT:", req.method, req.url);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// DB connection
connectDB();

// Socket.IO
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("joinAdmin", () => socket.join("admin-room"));
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

app.set("io", io);

// Routes
app.use("/api/product", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/charts", chartRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/category", categoryRoutes);

// Home
app.get("/", (req, res) => res.send("🚀 Inventory API Running"));

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, server, io };