const mongoose = require("mongoose");
/*
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
});
*/
const userSchema = new mongoose.Schema({

    email: String,

    password: String,

    role: {
        type: String,
        default: "user"
    },

    googleId: String

});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
