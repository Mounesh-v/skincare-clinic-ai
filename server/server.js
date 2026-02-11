import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authUser from "./router/auth.js";
import cors from "cors";


import productRoutes from "./router/productRoutes.js"
import orderRoutes from "./router/orderRoutes.js"

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "Heyy server is running" });
});

app.use("/api/auth", authUser);

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`server is running ${process.env.NODE_ENV}`);
});
