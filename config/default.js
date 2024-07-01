require("dotenv").config();
module.exports = {
    app: require("./app"),
    db: require("./db"),
    jwt: require("./jwt"),
    mail: require("./mail"),
    payment: require("./payment"),
    cloud: require("./cloud"),
}