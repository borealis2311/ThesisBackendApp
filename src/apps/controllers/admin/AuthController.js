const UserModel = require("../../models/UserModel");
const bcrypt = require("bcrypt");

exports.login = (req, res) => {
    res.render("admin/login", {data:{}});
};

exports.enterLogin = async (req, res) => {
    let error;
    const { email, password } = req.body;    

    try {
        const user = await UserModel.findOne({ email });
        if (user && user.Role === "Admin") {
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                req.session.email = email;
                return res.redirect("/admin/dashboard");
            } else {
                error = "Invalid account or you do not have access to the system";
            }
        } else {
            error = "Invalid account or you do not have access to the system";
        }
    } catch (err) {
        error = "An error occurred during login!";
    }

    res.render("admin/login", {data: {error}});
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect("/admin/login");
};
