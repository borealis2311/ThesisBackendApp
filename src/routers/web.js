const express = require("express");
const router = express.Router();
//Middleware user
const AuthMiddleware = require("../apps/middlewares/user/auth");
//View user
const AuthUserController = require("../apps/controllers/user/AuthController");
const UserController = require("../apps/controllers/user/UserController");
const CategoryController = require("../apps/controllers/user/CategoryController");
const ProductController = require("../apps/controllers/user/ProductController");
const CommentController = require("../apps/controllers/user/CommentController");
const OrderController = require("../apps/controllers/user/OrderController");

//Middleware admin
const AuthAdminMiddleware = require("../apps/middlewares/admin/auth");
const UploadMiddleware = require("../apps/middlewares/admin/upload");
//View admin
const AuthAdminController = require("../apps/controllers/admin/AuthController");
const CartAdminController = require("../apps/controllers/admin/CartController");
const CategoryAdminController = require("../apps/controllers/admin/CategoryController");
const CommentAdminController = require("../apps/controllers/admin/CommentController");
const ProductAdminController = require("../apps/controllers/admin/ProductController");
const CustomerAdminController = require("../apps/controllers/admin/UserController");
const DashboardController = require("../apps/controllers/admin/DashboardController");
//Auth Admin
router.get("/admin/login", AuthAdminMiddleware.loggedAdmin, AuthAdminController.login);
router.post("/admin/login", AuthAdminMiddleware.loggedAdmin, AuthAdminController.enterLogin);
router.get("/admin/logout", AuthAdminMiddleware.notLoggedAdmin, AuthAdminController.logout);

//Admin Panel
router.get("/admin/dashboard", AuthAdminMiddleware.notLoggedAdmin, DashboardController.dashboard);
router.get("/admin/categories", AuthAdminMiddleware.notLoggedAdmin, CategoryAdminController.getData); 
router.get("/admin/categories/create", AuthAdminMiddleware.notLoggedAdmin, CategoryAdminController.create); 
router.post("/admin/categories/store", AuthAdminMiddleware.notLoggedAdmin, CategoryAdminController.store);
router.get("/admin/categories/edit/:id", AuthAdminMiddleware.notLoggedAdmin, CategoryAdminController.edit);
router.post("/admin/categories/update/:id", AuthAdminMiddleware.notLoggedAdmin, CategoryAdminController.update); 
router.get("/admin/categories/delete/:id", AuthAdminMiddleware.notLoggedAdmin, CategoryAdminController.del); 
router.get("/admin/comments", AuthAdminMiddleware.notLoggedAdmin, CommentAdminController.getData);
router.get("/admin/comments/delete/:id", AuthAdminMiddleware.notLoggedAdmin, CommentAdminController.del);  
router.get("/admin/products", AuthAdminMiddleware.notLoggedAdmin, ProductAdminController.getData);
router.get("/admin/products/create", AuthAdminMiddleware.notLoggedAdmin, ProductAdminController.create); 
router.post("/admin/products/store", AuthAdminMiddleware.notLoggedAdmin, UploadMiddleware.single("image"), ProductAdminController.store);
router.get("/admin/products/edit/:id", AuthAdminMiddleware.notLoggedAdmin, ProductAdminController.edit);
router.post("/admin/products/update/:id", AuthAdminMiddleware.notLoggedAdmin, UploadMiddleware.single("image"), ProductAdminController.update); 
router.get("/admin/products/delete/:id", AuthAdminMiddleware.notLoggedAdmin, ProductAdminController.del);
router.get("/admin/cart", AuthAdminMiddleware.notLoggedAdmin, CartAdminController.getData);  
router.get("/admin/cart/edit/:id", AuthAdminMiddleware.notLoggedAdmin, CartAdminController.edit);  
router.post("/admin/cart/update/:id", AuthAdminMiddleware.notLoggedAdmin, CartAdminController.update);  
router.get("/admin/users", AuthAdminMiddleware.notLoggedAdmin, CustomerAdminController.getData);
router.get("/admin/users/delete/:id", AuthAdminMiddleware.notLoggedAdmin, CustomerAdminController.del);  

//Auth User
router.post("/Register", AuthUserController.register);
router.post("/Login", AuthUserController.login);
// router.post("/refreshToken", AuthUserController.reqRT);
// router.get("/logout", AuthMiddleware.verifyAuthentication, AuthUserController.logout);


//User Panel
router.post("/Profile", AuthMiddleware.verifyAuthentication, UserController.profile);
router.get("/categories", CategoryController.index);
router.get("/products", ProductController.index);
router.get("/products/:id", ProductController.details);
router.get("/comments/:id", CommentController.infoByProductID);
router.post("/products/:id/comments", AuthMiddleware.verifyAuthentication, CommentController.postComment);
router.post("/order", AuthMiddleware.verifyAuthentication, OrderController.order);
router.post("/orderSuccess", AuthMiddleware.verifyAuthentication, OrderController.orderSuccess);
router.get("/history", OrderController.history);
router.get("/historyComment", CommentController.historyComment);
router.get("/details/:id", OrderController.detailsCart);



module.exports = router;  