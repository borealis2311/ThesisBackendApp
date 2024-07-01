const CategoryModel = require("../../models/CategoryModel");
const pagination = require("../../../libs/pagination/ejs");

exports.getData = async (req, res)=>{
    let query = {}
    if (req.query.name) {
        query.title = { $regex: new RegExp(req.query.name, 'i') };
    }
    const currentPage = Number(req.query.page) || 1;
    const limit = 3;
    const skip = currentPage * limit - limit;
    const categories = await CategoryModel.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "category_id",
                as: "products"
            }
        },
        {
            $addFields: {
                productCount: { $size: "$products" }
            }
        },
        {
            $match: query
        }
    ]) 
    .sort({_id: -1}) 
    .skip(skip)
    .limit(limit);
    const totalCategories = await CategoryModel.find(query).countDocuments();

    const filterParams = { ...req.query };
    delete filterParams.page;
    const queryString = Object.keys(filterParams).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filterParams[key])}`).join('&');

    res.render("admin/categories/category", {
        categories,
        specifiedPages: pagination(totalCategories, limit, currentPage),
        currentPage,
        limit,
        totalPages: Math.ceil(totalCategories / limit),
        totalCategories,
        searchParams: req.query,
        queryString
    });
}
exports.create = async (req, res)=>{
    res.render("admin/categories/add", {data:{}});
}
exports.store = async (req, res)=>{
    let error;
    const {body} = req;
    const category = {
        title: body.title,
    }
    const existingCategory = await CategoryModel.findOne({ title: body.title });
    if (!existingCategory) {
        await CategoryModel(category).save();
        res.redirect("/admin/categories");
    }
    error = "Exist Category"
    res.render("admin/categories/add", {data: {error}});
}
exports.edit = async (req, res)=>{
    const {id} = req.params;
    const categories = await CategoryModel.findById(id);
    res.render("admin/categories/edit", {categories, data:{}});
}
exports.update = async (req, res)=>{
    const {id} = req.params;
    const {body} = req;

    const existingCategory = await CategoryModel.findOne({ title: body.title, _id: { $ne: id } });

    if (!existingCategory) {
        await CategoryModel.updateOne({_id: id}, { $set: { title: body.title } });
        res.redirect("/admin/categories");
    } else {
        const error = "Existing Category";
        const categories = await CategoryModel.findById(id);
        res.render("admin/categories/edit", { categories, data: { error }});
    }
}

exports.del = async (req, res) => {
    const { id } = req.params;
    const category = await CategoryModel.findById(id);
    await category.deleteOne();
    res.redirect("/admin/categories");
};