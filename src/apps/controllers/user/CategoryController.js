const CategoryModel = require("../../models/CategoryModel");

exports.index = async (req, res)=>{
    const categories = await CategoryModel.find()
        .sort({_id: -1})

    res
        .status(200)
        .json({
            data: {
                docs: categories,
            }
        });
}
