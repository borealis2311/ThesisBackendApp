exports.notLoggedAdmin = (req, res, next)=>{
    if(!req.session.email){
        res.redirect("/admin/login")
    };
    next();
}

exports.loggedAdmin = (req, res, next)=>{
    if(req.session.email){
        res.redirect("/admin/dashboard")
    };
    next();
}
