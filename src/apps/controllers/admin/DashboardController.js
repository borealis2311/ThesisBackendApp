const CommentModel = require("../../models/CommentModel");
const OrderModel = require("../../models/OrderModel");
const UserModel = require("../../models/UserModel");

exports.dashboard = async (req, res) => {
    const orders = await OrderModel.find({status: "Delivered"});
    const totalOrders = await OrderModel.find().countDocuments();
    const totalUsers = await UserModel.find({ Role: { $ne: 'Admin' } }).countDocuments();
    const totalComments = await CommentModel.find().countDocuments();
    const topUsers = await UserModel.aggregate([
        {
            $match: {
                Role: { $ne: "Admin" }
            }
        },        
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "user_id",
                as: "comments"
            }
        },
        {
            $addFields: {
                averageRating: { 
                    $ifNull: [{ $avg: "$comments.rating" }, 0]
                }
            }
        },
        {
            $sort: {
                averageRating: -1
            }
        },
        {
            $limit: 3
        }
    ]);
    const topProducts = await CommentModel.aggregate([
        {
            $group: {
                _id: "$product_id",
                averageRating: { $avg: "$rating" }
            }
        },
        {
            $lookup: {
                from: "products", 
                localField: "_id",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $unwind: "$product"
        },
        {
            $project: {
                product_id: "$_id",
                product_name: "$product.name",
                averageRating: 1
            }
        },
        {
            $sort: {
                averageRating: -1
            }
        },
        {
            $limit: 3
        }
    ]);
    const totalPrices = orders.reduce((total, order) => total + order.totalPrice, 0);
    let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let ordersByDay = {};
    let revenueByDay = {};

    for (let day = 0; day <= 6; day++) {
        const ordersPerDay = await OrderModel.aggregate([
            {
                $addFields: {
                    dayOfWeek: { $dayOfWeek: "$updatedAt" }
                }
            },
            {
                $match: {
                    status: "Delivered",
                    dayOfWeek: day + 1
                }
            },
            {
                $count: "count"
            }
        ]);
        ordersByDay[daysOfWeek[day]] = ordersPerDay.length > 0 ? ordersPerDay[0].count : 0;
    }
    for (let day = 0; day <= 6; day++) {
        const revenuePerDay = await OrderModel.aggregate([
            {
                $addFields: {
                    dayOfWeek: { $dayOfWeek: "$updatedAt" }
                }
            },
            {
                $match: {
                    status: "Delivered",
                    dayOfWeek: day + 1
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$totalPrice"
                    }
                }
            }
        ]);
        revenueByDay[daysOfWeek[day]] = revenuePerDay.length > 0 ? revenuePerDay[0].total : 0;
    }

    res.render("admin/dashboard", {
        topUsers, 
        totalPrices, 
        totalOrders, 
        totalUsers, 
        totalComments, 
        ordersByDay, 
        revenueByDay,
        topProducts
    });
};