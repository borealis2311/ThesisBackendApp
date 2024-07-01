const UserModel = require("../../models/UserModel");
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const path = require("path");
const ejs = require("ejs");
const transporter = require("../../../libs/transporter");

exports.register = async (req, res) => {
    try {
        const { body } = req;
        const typeEmail = body.email + "@gmail.com";
        const exist = await UserModel.findOne({ email: typeEmail });
        if (exist) {
            return res.status(401).json("Email exists");
        }        

        const hashedPassword = await bcrypt.hash(body.password, 10);        

        const user = {
            first_name: body.first_name,
            last_name: body.last_name,
            email: typeEmail, 
            password: hashedPassword,
            Dob: body.Dob,
            gender: body.gender,
        };
        const adminExist = await UserModel.find().countDocuments();
        if (adminExist === 0) {
            user.Role = "Admin";
        }
        await UserModel(user).save();

        const html = await ejs.renderFile(path.join(req.app.get("views"), "user/register.ejs"), {
            first_name: user.first_name,
            last_name: user.last_name
        });

        await transporter.sendMail({
            to: `${typeEmail}`,
            subject: "Welcome to Fantastic Coffee", 
            html,
        });
        return res.status(201).json("Success");
    } catch (error) {
        return res.status(500).json(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { body } = req;
        
        const user = await UserModel.findOne({ email: body.email });
        if (!user || user.Role === "Admin") {
            return res.status(401).json("Incorrect information");
        }

        const validPassword = await bcrypt.compare(body.password, user.password);
        if (!validPassword) {
            return res.status(401).json("Incorrect information");
        }

        const accessToken = jwt.sign(
            { email: body.email, user_id: user._id},
            config.get("jwt.jwtAccessKey"),
            { expiresIn: "1d" }
        );

        const {password, ...others} = user._doc;
        return res.status(200).json({
            ...others, 
            accessToken,
        });

    } catch (error) {
        return res.status(500).json("Authentication required");
    }
};