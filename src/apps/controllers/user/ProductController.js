const ProductModel = require('../../models/ProductModel');
const pagination = require('../../../libs/pagination/api');
exports.index = async (req, res)=>{
    let query = {};
    if (req.query.minPrice || req.query.maxPrice) {
        query.price = {};
        if (req.query.minPrice) {
            query.price.$gte = req.query.minPrice;
        }
        if (req.query.maxPrice) {
            query.price.$lte = req.query.maxPrice;
        }        
    }
    if (req.query.search) {
        query.name = { $regex: new RegExp(req.query.search, 'i') };
    }
    if (req.query.category) {
        query.category_id = req.query.category;
    }
    const page = Number(req.query.page) || 1;
    const limit = 6;
    const skip = page * limit - limit;

    const products = await ProductModel.find(query)
        .sort({_id: -1})
        .skip(skip)
        .limit(limit);

    res
        .json({
            data: {
                docs: products,
                pages: await pagination(ProductModel, query, page, limit),
            }
        });
}

exports.details = async (req, res)=>{
    const {id} = req.params;
    const product = await ProductModel.findById(id);
    res
    .status(200)
    .json({
        data: {
            docs: product,
        }
    });
}