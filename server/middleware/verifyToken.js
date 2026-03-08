import jwt from "jsonwebtoken";

/**
 * Middleware: verify JWT from Authorization header.
 * Attaches decoded payload to req.user.
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};

/**
 * Middleware: verify JWT AND require admin role.
 */
export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user?.role !== "admin") {
            return res.status(403).json({ success: false, message: "Admin access required." });
        }
        next();
    });
};


/**
 * Protect middleware
 * Verify JWT token
 */
export const protect = (req, res, next) => {
  try {
    let token;

    // token from header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user info
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};


/**
 * Authorize middleware
 * Check user role
 */
export const authorize = (...roles) => {
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

export default verifyToken;
