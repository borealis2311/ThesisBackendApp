const config = require("config");
const app = require(config.get("app.serverApp"));
const server = app.listen(port=config.get("app.serverPort"), (req, res)=>{
    console.log(`Server is running on port ${port}`);
});