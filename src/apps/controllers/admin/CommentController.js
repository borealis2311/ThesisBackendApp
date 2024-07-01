const CommentModel = require("../../models/CommentModel");
const pagination = require("../../../libs/pagination/ejs");
const UserModel = require("../../models/UserModel");
const ProductModel = require("../../models/ProductModel");

exports.getData = async (req, res)=>{
    let query = {}
    if (req.query.email) {
        const users = await UserModel.find({ email: { $regex: new RegExp(req.query.email, 'i') } }).select('_id');
        const userIds = users.map(user => user._id);
        query.user_id = { $in: userIds };
    }  
    if (req.query.productName) {
        const products = await ProductModel.find({ name: { $regex: new RegExp(req.query.productName, 'i') } }).select('_id');
        const productIds = products.map(product => product._id);
        query.product_id = { $in: productIds };
    }  
    if (req.query.rating) {
        query.rating = req.query.rating;
    }  
    const currentPage = Number(req.query.page) || 1;
    const limit = 3;
    const skip = currentPage * limit - limit;
    const comments = await CommentModel.find(query)
            .populate({ path: "user_id product_id" }) 
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit); 
              
    const totalComments = await CommentModel.find(query).countDocuments();
    const filterParams = { ...req.query };
    delete filterParams.page;
    const queryString = Object.keys(filterParams).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filterParams[key])}`).join('&');
    res.render("admin/comments/comment", {
        comments,
        specifiedPages: pagination(totalComments, limit, currentPage),
        currentPage,
        limit,
        totalPages: Math.ceil(totalComments / limit),
        totalComments,
        searchParams: req.query,
        queryString
        });    
}

exports.del = async (req, res)=>{
    const {id} = req.params;
    await CommentModel.deleteOne({_id: id});
    res.redirect("/admin/comments"); 
}
 