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

export default verifyToken;
