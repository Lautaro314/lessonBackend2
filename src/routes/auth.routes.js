const express = require("express");
const router = express.Router();
const { login, getProducts, register } = require("../controllers/auth.controller");
const { validateRegister } = require("../middleware/validate.middleware")
const passport = require("../config/passport")

//middleware local
router.use((req, res, next) => {
    console.log(`Acceso a ${req.originalUrl}`);
    next();
});


router.post("/login", login)
router.post("/register", validateRegister, register)
router.get("/products", passport.authenticate("jwt", { session: false }), getProducts);
router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
    res.json({ user: req.user })
})
router.get("/google",

    passport.authenticate("google", {
        scope: ["profile", "email"]
    })

);



router.get(

    "/google/callback",

    passport.authenticate("google", {
        failureRedirect: "/login"
    }),

    (req, res) => {

        res.json({
            message: "Login con Google exitoso",
            user: req.user
        });

    }

);

module.exports = router;