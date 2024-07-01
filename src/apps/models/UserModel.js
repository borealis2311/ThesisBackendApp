const CommentModel = require("./CommentModel");
const mongoose = require("../../common/dbConnection")();

const UserSchema = new mongoose.Schema({
    first_name:{
        type: String,
        required: true,
    },
    last_name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    gender:{
        type: String,
        required: true,
    },
    Dob:{
        type: String,
        required: true,
    },
    Role:{
        type: String,
        default: "User",
    },
    }, {timestamps: true});

UserSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
    try {
        await CommentModel.deleteMany({ user_id: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

const UserModel = mongoose.model("Users", UserSchema, "users");
module.exports = UserModel;
