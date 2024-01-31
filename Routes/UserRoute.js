const express=require('express');
const user_route=express();
const {registerUser, loginUser,registerLoad,loadLogin,loadDashboard} = require('../controller/userController');
const bodyParser=require('body-parser');
const session=require('express-session');
const {SESSION_SECRET}=process.env;
user_route.use(bodyParser.urlencoded({extended:true}));//form of the user-data will be passed 
user_route.set('view engine','ejs');
user_route.set('views','./views');
const cookieParser=require('cookie-parser');
const { isLogout} = require('../middleware/auth');
const {isLogin}=require('../middleware/auth');
// user_route.use(express.static('public'));
user_route.use(cookieParser());
user_route.use(session({secret:SESSION_SECRET,resave:true,saveUninitialized:false}));
user_route.use(bodyParser.json());
user_route.get('/register',isLogout,registerLoad);//implement the middleware
user_route.post("/register",registerUser);
user_route.get('/login',isLogout,loadLogin);
user_route.post("/login",loginUser);
user_route.get('/dashboard',isLogin,loadDashboard);
module.exports = user_route;