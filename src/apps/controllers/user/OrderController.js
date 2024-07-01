const OrderModel = require("../../models/OrderModel");
const UserModel = require("../../models/UserModel");
const ProductModel = require("../../models/ProductModel");
const jwt = require("jsonwebtoken");
const config = require("config");
const ejs = require("ejs");
const path = require("path");
const transporter = require("../../../libs/transporter");
const pagination = require('../../../libs/pagination/api');
const stripe = require("stripe")(config.get("payment.stripeSecretKey"));

exports.order = async (req, res)=>{
    const body = req.body;
    const user = await UserModel.findOne({ email: body.email });
    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }
    const lineItems = body.items.map((item)=>({
        price_data: {
            currency: "usd",
            product_data: {              
                name: item.name,
            },
            unit_amount: item.price*100,
        },
        quantity: item.qty
    }));
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        customer_email: body.email,
        mode: "payment",
        success_url: `${config.get("app.reactAppURL")}/Success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.get("app.reactAppURL")}/Cart`,
    })

    res
    .status(201)
    .json({
        url: session.url, 
        session_id: session.id,
    });
}

exports.orderSuccess = async (req, res) => {
    const { session_id } = req.query;   
    if (!session_id) {
        return res.status(400).send({ error: 'Session ID is required' });
    }

    let session;
    try {
        session = await stripe.checkout.sessions.retrieve(session_id);
    } catch (error) {
        return res.status(404).send({ error: 'Session not found' });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session_id);

    const totalPrice = session.amount_total / 100;
    const email = session.customer_email;
    const lineItemsData = lineItems.data.map((item) => ({
        name: item.description,
        price: item.amount_total / item.quantity / 100,
        qty: item.quantity,
    }));

    const user = await UserModel.findOne({ email: email });
    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }

    const existingOrder = await OrderModel.findOne({ session_id: session_id });
    if (existingOrder) {
        return res.status(400).send({ error: 'Order already exists' });
    }
    
    await new OrderModel({
        user_id: user._id,
        email: email,
        totalPrice: totalPrice,
        items: lineItemsData,
        session_id: session_id,
    }).save();

    const html = await ejs.renderFile(path.join(req.app.get("views"), "user/mail.ejs"),{
        lineItemsData
    }); 

    await transporter.sendMail({
        to: `${email}`,
        subject: "Verify product", 
        html,
      });

    res.status(201).json({
        status: "success",
        message: "Order created successfully",
    });
};


exports.history = async (req, res)=>{
    const {token} = req.headers;
    const accessToken = token.split(" ")[1];
    const decoded = jwt.verify(accessToken, config.get("jwt.jwtAccessKey"));
    const query = {email: decoded.email};
    const page = Number(req.query.page) || 1;
    const limit = 3;
    const skip = page * limit - limit;

    if (req.query.orderDate) {
        const date = new Date(req.query.orderDate);
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
    
    const orders = await OrderModel.find(query)
    .sort({_id: -1})
    .skip(skip)
    .limit(limit);
    

    return res
        .status(200)
        .json({
            status: "success",
            data: {
                docs: orders,
                pages: await pagination(OrderModel, query, page, limit),
            }
        });
}

exports.detailsCart = async (req, res)=>{
    const {id} = req.params;
    const cart = await OrderModel.findById(id);

    return res
        .status(200)
        .json({
            status: "success",
            data: {
                docs: cart,
            }
        });
}
