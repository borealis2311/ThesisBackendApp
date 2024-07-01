module.exports = {
    serverApp: `${__dirname}/../src/apps/app`,
    serverPort: process.env.SERVER_PORT || 8888,
    reactAppURL: process.env.REACT_APP_URL || "http://localhost:3000",
    router: `${__dirname}/../src/routers/web`,
    viewPath:`${__dirname}/../src/apps/views`,
    staticFolder: `${__dirname}/../src/public`,
    viewEngine: `ejs`, 
}