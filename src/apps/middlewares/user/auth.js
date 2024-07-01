const jwt = require("jsonwebtoken");
const config = require("config");
const AuthMiddleware = {
    verifyAuthentication: async (req, res, next)=>{        
        try {
            const {token} = req.headers;
            const accessToken = token.split(" ")[1];
            jwt.verify(accessToken, config.get("jwt.jwtAccessKey"), (error, user)=>{
                if(error){
                    return res.status(401).json("Authentication failed");
                }
                next();
            });            
        } catch (error) {
            return res.status(403).json("Authentication required");
        }
    }
}
module.exports = AuthMiddleware;