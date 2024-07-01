const express = require("express");
const app = express();
const config = require("config");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const corsOptions = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
};

app.use(expressSession({
    secret: 'test',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.set('trust proxy', 1) 
app.use(cors(corsOptions));
app.set("views", config.get("app.viewPath"));
app.set("view engine", config.get("app.viewEngine"));
app.use("/static", express.static(config.get("app.staticFolder")));

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());

app.use(require(config.get("app.router")));
module.exports = app;