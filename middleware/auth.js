import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "arun@321";

export const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Extract token

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", verified); // Debugging log

    if (!verified.role) {
      console.error("Role is missing in the token payload");
    }

    req.user = {
      userName: verified.userName,
      userId: verified.userId,
      role: verified.role, // Ensure this is set
      _id: verified._id,
    };

    next();
  } catch (error) {
    console.error("Invalid Token:", error.message);
    return res.status(403).json({ message: "Forbidden: Invalid Token" });
  }
};
