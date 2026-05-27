const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    const payload = {
        userId: user._id?.toString() || user.userId,
        role: user.role || "user",
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

module.exports = generateToken;
