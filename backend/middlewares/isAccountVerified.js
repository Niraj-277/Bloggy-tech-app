const User=require("../models/Users/User");

const isAccountVerified=async(req , resp,next)=>{
    try{
        //find user by id
        const currentUser=await User.findById(req.userAuth._id);
        //check whether the user is verified or not
        if(currentUser.isVerified){
            next();
        }else{
            resp.status(401).json({message:"Account not verified"})
        }
    }
    catch(error){
        resp.status(500).json({message:"Server error",error});
    }
}
module.exports=isAccountVerified;