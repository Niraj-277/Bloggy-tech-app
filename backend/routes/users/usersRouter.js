const express= require ("express");
const {register, login, getProfile, blockUser, unblockUser, viewOtherProfile, followingUser, unFollowingUser, forgotPassword, resetPassword, accountVerificationEmail, verifyAccount}= require("../../controllers/users/usersController");
const isLoggedIn = require("../../middlewares/isLoggedIn");

const usersrouter=express.Router();
//! Register route
usersrouter.post("/register",register);

//! Login Route
usersrouter.post("/login",login);

//! Profile Route
usersrouter.get("/profile",isLoggedIn,getProfile);

//! Block User Route
usersrouter.put("/block/:userIdToBlock",isLoggedIn,blockUser);

//! unBlock User Route
usersrouter.put("/unblock/:userIdToUnBlock",isLoggedIn,unblockUser);

//! View another profile
usersrouter.get("/view-other-profile/:userProfileId",isLoggedIn,viewOtherProfile);

//! follow a user route 
usersrouter.put("/following/:userIdToFollow",isLoggedIn,followingUser);

//! unfollow a user route 
usersrouter.put("/unfollowing/:userIdToUnFollow",isLoggedIn,unFollowingUser);

//! Forgot password route
usersrouter.put("/forgot-password",forgotPassword);

//! reset password route
usersrouter.put("/reset-password/:resetToken",resetPassword);


//! send account verificaion email route
usersrouter.put("/account-verification-email",isLoggedIn,accountVerificationEmail);

//! account token verificaion  route
usersrouter.put("/verify-account/:verifyToken",isLoggedIn,verifyAccount);


module.exports =usersrouter;





