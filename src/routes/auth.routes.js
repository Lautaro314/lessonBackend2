const express = require("express");
const router = express.Router();
const {
    login,
    getProducts,
    register,
    logout,
    googleCallback,
} = require("../controllers/auth.controller");
const { validateRegister } = require("../middleware/validate.middleware");
const passport = require("../config/passport");

router.use((req, res, next) => {
    console.log(`Acceso a ${req.originalUrl}`);
    next();
});

router.post("/register", validateRegister, register);
router.post("/login", login);
router.post("/logout", logout);

router.get(
    "/products",
    passport.authenticate("jwt", { session: false }),
    getProducts
);

router.get(
    "/current",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        res.json({ user: req.user });
    }
);

router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/api/v1/auth/login",
        session: true,
    }),
    googleCallback
);

module.exports = router;
