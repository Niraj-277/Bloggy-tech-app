// @desc Register new user
// @route POST /api/v1/users/register
// @access public 
const User=require("../../models/Users/User")
const bcrypt= require ("bcryptjs");
const generateToken=require("../../utils/generateToken")
const asyncHandler=require('express-async-handler');
const sendEmail = require("../../utils/sendEmail");
const crypto=require("crypto");
const sendAccountVerificationEmail = require("../../utils/sendAccountVerificationEmail");


exports.register=asyncHandler(async(req,resp,next)=>{
    
        const {username,password,email}=req.body;
        const user =await User.findOne({username});
        if(user){
            throw new Error("User already Existing");
        }
       const newUser= new User({username,email,password});
       const salt=await bcrypt.genSalt(10);
       newUser.password=await bcrypt.hash(password,salt);
       await newUser.save();
       resp.json({
        status:"success",
        message:"user registered successfully",
        _id:newUser?.id,
        username:newUser?.username,
        email:newUser?.email,
        role:newUser?.role,
       }); 
});
    

// @desc login new user
// @route POST /api/v1/users/login
// @access public 

exports.login=asyncHandler(async (req,resp,next)=>{
    
        const{username,password}=req.body;
        const user=await User.findOne({username});
        if(!user){
            throw new Error("Invalid Credentials");
        }
        let isMatched=await bcrypt.compare(password,user?.password);
        if(!isMatched){
            throw new Error("Invalid credentials")
        }
        user.lastlogin=new Date();
        await user.save();
        resp.json({status:"success",email:user?.email,_id:user?._id,username:user?.username,role:user?.role,token:generateToken(user)});
    
});
    

// @desc Profile view
// @route GET /api/v1/users/profile/:id
// @access private

exports.getProfile=asyncHandler(async(req,resp,next)=>{
    //console.log("rec:",req.userAuth);
    
        const user= await User.findById(req.userAuth.id).populate({path:"posts",model:"Post"}).populate({path:"following",model:"User"}).populate({path:"followers",model:"User"}).populate({path:"blockedUsers",model:"User"}).populate({path:"profileViewers",model:"User"});
        
        resp.json({status:"success",message:"Profile fetched",user});
    
    
}
);


//@dexc Block User
//@route PUT /api/v1/users/block/userIdToBlock
//@access private

exports.blockUser=asyncHandler(async(req,resp,next)=>{
    // find the user id to be blocked
    const userIdToBlock=req.params.userIdToBlock;
    //check whether the user is present in db or not 
    const userToBlock = await User.findById(userIdToBlock);
    if(!userToBlock){
        let  error= new Error("User to block not found ");
        next(error);
        return;
    }
    //!Get the current user id 
    const userBlocking=req?.userAuth?._id;

    // check if it is  self blocking
    if (userIdToBlock.toString()===userBlocking.toString()){
        let  error= new Error("cannot block yourself ");
        next(error);
        return;
    } 
    //get the current user object from the database
    const currentUser=await User.findById(userBlocking);

    //check whether the userIdToBlock is already blocked
    if(currentUser.blockedUsers.includes(userIdToBlock)){
        let  error= new Error("This user has already been blocked  ");
        next(error);
        return;
    }

    //Push the user to be blocked in the blocked Users array

    currentUser.blockedUsers.push(userIdToBlock);
    await currentUser.save();
    resp.json({
        status:"success",
        message:"User blocked successfully "
        
    })

})

//@desc unBlock user
//@route Put /api/v1/users/unblock/:userIdTounBlock
//access private

exports.unblockUser=asyncHandler(async(req,resp,next)=>{
    //Find the user to be unblocked
    const userIdToUnBlock=req.params.userIdToUnBlock;
    const userToUnBlock=await User.findById(userIdToUnBlock);
    if(!userToUnBlock){
        let error=new Error("user is not availabe")
        next(error)
        return;
    }
    //Find the current User
    const userUnBlocking=req?.userAuth?._id;
    const currentUser=await User.findById(userUnBlocking);

    //Check if the user to unblock is already blocked
    if(!currentUser.blockedUsers.includes(userIdToUnBlock)){
        let  error= new Error("User not blocked ");
        next(error);
        return;
    }

    //Remove the user from the current user blockedUser array
    currentUser.blockedUsers=currentUser.blockedUsers.filter((id)=>{
        return id.toString()!== userIdToUnBlock;
    });
    //update the db
    await currentUser.save();

    //return the response
    resp.json({
        status:"success",
        message:"User unblocked successfully "
        
    });    
})

//@desc View another user profile
//@route GET /api/v1/users/view-another-profile/:userProfileId
//access private

exports.viewOtherProfile=asyncHandler(async(req,resp,next)=>{
    //Get the userId whose profile is to be viewed
    const userProfileId=req.params.userProfileId;
    const userProfile=await User.findById(userProfileId);
    if(!userProfile){
        let error=new Error("user whose profile is to be viewed not present")
        next(error)
        return;
    }
    const currentUserId=req?.userAuth?._id;
    //check if we have already viewed the profile of userProfileId
    if(userProfile.profileViewers.includes(currentUserId)){
        let  error= new Error("you have already viewed the profile");
        next(error);
        return;
    }
    //push the currentUserId into array of userProfile
    userProfile.profileViewers.push(currentUserId);
    //update the db
    await userProfile.save();
    //return the response
    resp.json({
        status:"success",
        message:"profile successfully viewed "
        
    });  
});

//@desc follow user
//@route put /api/v1/users/following/:userIdToFollow
//access private

exports.followingUser=asyncHandler(async(req,resp,next)=>{
    //Find the current user id
    const currentUserId=req?.userAuth?._id

    //Fing the user to be followed
     const userIdToFollow=req.params.userIdToFollow;
    const userProfile=await User.findById(userIdToFollow);
    if(!userProfile){
        let error=new Error("User to be followed is not present")
        next(error)
        return;
    };

    //Avoid current user following himself
    if(currentUserId.toString()===userIdToFollow.toString()){
        let error=new Error("You cannot follow yourself")
        next(error)
        return;
    }

    //Push the id of userToFollow inside following array of current user
    await User.findByIdAndUpdate(
        currentUserId,
        { $addToSet:        {following:userIdToFollow}},
        {new:true}


    );

    //Push the current user id into the followers array of user to follow  
    await User.findByIdAndUpdate(
        userIdToFollow,
        { $addToSet:        {followers:currentUserId}},
        {new:true}

    );
    //Send the response
    resp.json({
        status:"success",
        message:"YOU have followed the user successfully "
        
    });  
})

//@desc unfollow user
//@route put /api/v1/users/unfollowing/:userIdToUnFollow
//access private

exports.unFollowingUser=asyncHandler(async(req,resp,next)=>{
     //Find the current user id
    const currentUserId=req?.userAuth?._id

    //YOu cannot unfollow yourself
     const userIdToUnFollow=req.params.userIdToUnFollow;

     //Avoid current user following himself
    if(currentUserId.toString()===userIdToUnFollow.toString()){
        let error=new Error("You cannot unfollow yourself")
        next(error)
        return;
    }
    //Check whether the user exists
    const userProfile=await User.findById(userIdToUnFollow);
    if(!userProfile){
        let error=new Error("User to be Unfollowed is not present")
        next(error)
        return;
    };
    //Get the current user object
    const currentUser=await User.findById(currentUserId);

    //Get the current user object
    if(!currentUser.following.includes(userIdToUnFollow)){
        let error=new Error("You cannot unfollow user you did not follow ")
        next(error)
        return;
    }

    //Remove the userIdToUnfollow from the following array

    await User.findByIdAndUpdate(currentUserId,{$pull:{following:userIdToUnFollow}},{new:true});

    //Remove the currentuserid from the followers array of userIdToUnfollow
    await User.findByIdAndUpdate(userIdToUnFollow,{$pull:{followers:currentUserId}},{new:true});

    //Send the response
    resp.json({
        status:"success",
        message:"YOU have unfollowed the user successfully "
        
    });  
})

//@desc forgot password
//@route Post /api/v1/users/forgot-password
//@access public

exports.forgotPassword=asyncHandler(async(req,resp,next)=>{
    //!Fetch the email
    const {email}=req.body;

    //!Find email in the db
    const userFound=await User.findOne({email});
    if(!userFound){
        let error=new Error("This email id is not registered with us")
        next(error)
        return;
    }
    //!get the reset token
    const resetToken=await userFound.generatePasswordResetToken();
    //!save the changes (resetToken and expiryTime)to the DB
    await userFound.save();
    sendEmail(email,resetToken);
    //send the response
    resp.json({
        success:"success",
        message:"Passwordreset token sent to your email successfully"
    })
});

//@desc reset password
//@route Post /api/v1/users/reset-password/:resetToken
//@access public

exports.resetPassword=asyncHandler(async(req,resp,next)=>{
    //Get the token from params
    const {resetToken}=req.params;
    //Get the password
    const{password}=req.body;

    //convert resetToken into hashed token

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    //verify the token with db

    const userFound=await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()},});
    //if user is not found
    if(!userFound){
        let error=new Error("Password reset token is invalid or expired");
        next(error);
        return;
    }
    //update the new password 
    const salt= await bcrypt.genSalt(10);
    userFound.password=    await bcrypt.hash(password,salt);
    userFound.passwordResetToken=undefined;
    userFound.passwordResetExpires=undefined;

    //resave the user
    await userFound.save();

    // send the response

    resp.json({
        status:"success",
        message:"password has been changed successfully"
    })

});

//@desc send account verification mail
//@route Post /api/v1/users/account-verification-email
//@access private

exports.accountVerificationEmail=asyncHandler(async(req,resp,next)=>{
    //Find the current user email
    const currentUser=await User.findById(req?.userAuth?._id);
    if(!currentUser){
        let error=new Error("User not found")
        next(error);
        return;
    }
    //Get the token from current user object 
    const verifyToken=await currentUser.generateAccountVerificationToken();

    //resave the user
    await currentUser.save();

    //send the verification email
    sendAccountVerificationEmail(currentUser.email,verifyToken);

    //send the response

    resp.json({
        status:"success",
        message:`Account verification email has been sent to your registered email id${currentUser.email}`
    });
});

//@desc account token verification 
//@route Put /api/v1/users/verify-account/:verifyToken
//@access private

exports.verifyAccount=asyncHandler(async(req,resp)=>{
    //Get the token from params
    const {verifyToken}=req.params;
    //convert the token into hashed form 
    let cryptoToken=crypto.createHash("sha256").update(verifyToken).digest("hex");

    const userFound=await User.findOne({accountVerificationToken:cryptoToken,accountVerificationExpires:{$gt:Date.now()}});
    if (!userFound){
        let error=new Error("Account token invalid or expired");
        next(error);
        return;
    }
    //Update the user 
    userFound.isVerified=true;
    userFound.accountVerificationToken=undefined;
    userFound.accountVerificationExpires=undefined;

    //resave the user
    await userFound.save();

    resp.json({
        status:"success",
        message:"Account  successfully verified"
    });
});