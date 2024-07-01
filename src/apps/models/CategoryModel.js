const mongoose = require("../../common/dbConnection")();
const ProductModel = require("./ProductModel");
const CommentModel = require("./CommentModel");

const categorySchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        unique: true,
    },
    }, {timestamps: true});

categorySchema.pre("deleteOne", { document: true, query: false }, async function(next) {
    try {
        const products = await ProductModel.find({ category_id: this._id });
        const productIds = products.map(product => product._id);

        await ProductModel.deleteMany({ category_id: this._id });
        await CommentModel.deleteMany({ product_id: { $in: productIds } });

        next();
    } catch (error) {
        next(error);
    }
});
const CategoryModel = mongoose.model("Categories", categorySchema, "categories");
module.exports = CategoryModel;
