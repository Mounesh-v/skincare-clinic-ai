import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authUser from "./router/auth.js";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport-config.js";
import { rateLimit } from "express-rate-limit";

import productRoutes from "./router/productRoutes.js";
import orderRoutes from "./router/orderRoutes.js";
import doctorRoutes from "./router/doctorRoutes.js";

dotenv.config();

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required but not set. Add it to your .env file.");
}

const app = express();

// Body parsing (declared once — 10 MB covers base64-encoded images comfortably)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Session middleware (required for passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
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

// Rate limiter — auth routes only (20 requests / 15 min per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

app.use("/api/auth", authLimiter, authUser);

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/doctors", doctorRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`server is running ${process.env.NODE_ENV}`);
});
