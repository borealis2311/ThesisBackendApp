const mongoose = require("../../common/dbConnection")();
const CommentModel = require("./CommentModel");

const productSchema = new mongoose.Schema({
    image:{
        type: String,
        required: true,
    },
    name:{
        type: String, 
        required: true,
    },
    price:{
        type: Number,
        default: 0,
    },
    description:{
        type: String,
        required: true,
    },
    category_id:{
        type: mongoose.Types.ObjectId,
        ref: "Categories",
        required: true,
    },
    featured:{
        type: Boolean,
        default: false,
    },
    is_stock:{
        type: Boolean,
        default: true,
    },
}, {timestamps: true});

productSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
    try {
        await CommentModel.deleteMany({ product_id: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

const ProductModel = mongoose.model("Products", productSchema, "products");
module.exports = ProductModel;
