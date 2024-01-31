//this is the middleware present when we are not logged in and trying to access any resource
//now again that middleware needed which handles the case when we are logged in and trying to register again but we will be taken to dashboard only 
// const jwt = require("jsonwebtoken");
// const asyncHandler = require("express-async-handler");

// const validateToken = asyncHandler(async (req, res, next) => {
//     let token;
//     let authHeader = req.headers.authorization || req.headers.Authorization;
//     console.log(req.headers);
//     console.log("authHeader=",authHeader);
//     if (authHeader && authHeader.startsWith("Bearer")) {
//         console.log("yes");
//         token = authHeader.split(" ")[1];
//         jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//             if (err) {
//                 console.log(err.message);
//                 return;
//             }
//             console.log("Now will be redirected");
//             // Attach the user object to the request for later use
//             req.user = decoded.user; // Assuming user details are in the 'user' field of the decoded token
//             res.redirect('/dashboard');
//             return;
//         });
//     }
//     next();
// });


const isLogin = (req, res, next) => {
    // Check if the authorization header is present
    try {
        if(req.session.user===undefined)
        {
           res.redirect('/login');
        }
        next();
     } 
     catch (error) {
        console.log("got this error"+error.message);
     }
};
const isLogout=async (req,res,next)=>{
    try {
        if(req.session.user)
        {
           res.redirect('/dashboard');//The user will be redirected to the dashboard if already logged in
        }
        next();
    } 
    catch (error) {
       console.log(error.message);
    }
};

module.exports = {isLogin,isLogout};