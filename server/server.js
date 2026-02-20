import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authUser from "./router/auth.js";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport-config.js";

import productRoutes from "./router/productRoutes.js";
import orderRoutes from "./router/orderRoutes.js";
import doctorRoutes from "./router/doctorRoutes.js";
dotenv.config();
const app = express();


// ✅ ADD THESE TWO LINES RIGHT HERE (BEFORE ROUTES!)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "Heyy server is running" });
});

app.use("/api/auth", authUser);

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/doctors", doctorRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`server is running ${process.env.NODE_ENV}`);
});
