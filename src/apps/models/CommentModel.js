const mongoose = require("../../common/dbConnection")();

const commentSchema = new mongoose.Schema({
    user_id:{
        type: mongoose.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    content:{
        type: String,
        required: true,
    },
    rating:{
        type: Number,
        default: 0,
        required: true,
    },
    product_id:{
        type: mongoose.Types.ObjectId,
        ref: "Products",
        required: true,
    },
    }, {timestamps: true});
const CommentModel = mongoose.model("Comments", commentSchema, "comments");
module.exports = CommentModel;