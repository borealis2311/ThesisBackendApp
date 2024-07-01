const UserModel = require("../../models/UserModel");
const pagination = require("../../../libs/pagination/ejs");
const OrderModel = require("../../models/OrderModel");
exports.getData = async (req, res) => {
    let query = {}
    if (req.query.email) {
        query.email = { $regex: new RegExp(req.query.email, 'i') };
    }
    const currentPage = Number(req.query.page) || 1;
    const limit = 3;
    const skip = currentPage * limit - limit;

    const users = await UserModel.find({
        Role: { $ne: 'Admin' },
        ...query
    })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit);
    
    const ordersAggregation = await OrderModel.aggregate([
        {
            $match: {
                status: "Delivered"
            }
        },
        {
            $group: {
                _id: "$email",
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: "$totalPrice" }
            }
        }
    ]);

    const ordersInfo = ordersAggregation.reduce((acc, curr) => {
        acc[curr._id] = { totalOrders: curr.totalOrders, totalSpent: curr.totalSpent };
        return acc;
    }, {});

    const usersWithOrders = users.map(user => {
        const orderInfo = ordersInfo[user.email] || { totalOrders: 0, totalSpent: 0 };
        return { ...user.toObject(), ...orderInfo };
    });

    const filterParams = { ...req.query };
    delete filterParams.page;
    const queryString = Object.keys(filterParams).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filterParams[key])}`).join('&');

    const totalUsers = await UserModel.find({ Role: { $ne: 'Admin' } }).countDocuments();

    res.render("admin/users/user", {
        users: usersWithOrders,
        specifiedPages: pagination(totalUsers, limit, currentPage),
        currentPage,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        searchParams: req.query,
        queryString
    });
};

exports.del = async (req, res)=>{
    const { id } = req.params;
    const user = await UserModel.findById(id);
    await user.deleteOne();
    res.redirect("/admin/users");
}
 