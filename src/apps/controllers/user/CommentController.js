const CommentModel = require("../../models/CommentModel");
const ProductModel = require("../../models/ProductModel");
const UserModel = require("../../models/UserModel");
const jwt = require("jsonwebtoken");
const config = require("config");
const pagination = require('../../../libs/pagination/api');

exports.postComment = async (req, res)=>{
    const { id } = req.params;
    const { body } = req;
    const user = await UserModel.findOne({ email: body.email });
    if(!user){
        return res.status(404).json({ message: "User not found"});
    }
    const newComment = { 
        user_id: user._id,
        content: body.content,
        product_id: id,
        rating: body.rating
    }
    await new CommentModel(newComment).save();
    res
    .status(201)
    .json({
        status: "success",
        message: "Create comment successfully"
    });
}

exports.historyComment = async (req, res)=>{
    const {token} = req.headers;
    const accessToken = token.split(" ")[1];
    const decoded = jwt.verify(accessToken, config.get("jwt.jwtAccessKey"));
    const userId = decoded.user_id;
    const query = { user_id: userId };
    const page = Number(req.query.page) || 1;
    const limit = 3;
    const skip = page * limit - limit;

    if (req.query.commentProduct) {
        const products = await ProductModel.find({ name: { $regex: new RegExp(req.query.commentProduct, 'i') } }).select('_id');
        const productIds = products.map(product => product._id);
        query.product_id = { $in: productIds };
    }
    if (req.query.commentDate) {
        const date = new Date(req.query.commentDate);
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const day = date.getUTCDate();
        const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
        query.createdAt = {
            $gte: startOfDay,
            $lte: endOfDay
        };
    }

    const comments = await CommentModel.find(query)
    .populate('product_id')
    .populate('user_id') 
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit);

    
    return res
        .status(200)
        .json({
            status: "success",
            data: {
                docs: comments,
                pages: await pagination(CommentModel, query, page, limit),
            }
        });
}

exports.infoByProductID = async (req, res) => {
    const { id } = req.params;
    const query = { product_id: id };
    const page = Number(req.query.page) || 1;
    const limit = 2;
    const skip = page * limit - limit;

    const comments = await CommentModel.find(query)
        .populate('user_id')
        .sort({_id: -1})
        .skip(skip)
        .limit(limit);

    const totalStars = await CommentModel.find(query)
        .populate('user_id')
        .sort({_id: -1});

    const rating = await CommentModel.find(query).countDocuments();
    const totalRating = totalStars.reduce((total, doc) => total + doc.rating, 0);
    let averageRating;
    if(rating == 0){
        averageRating = 0;
    }else{
        averageRating = totalRating / rating;
    }
    
    res.json({
        status: 'success', 
        data: { 
            docs: {
                comments: comments,
                averageRating: averageRating,
            },
            pages: await pagination(CommentModel, query, page, limit),
        } 
    });
}