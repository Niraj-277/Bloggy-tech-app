const asyncHandler = require("express-async-handler");
const Post = require("../../models/Posts/Post");
const User = require("../../models/Users/User");
const Category = require("../../models/Categories/Category");

//@desc Create a new post
//@route POST /api/v1/posts
//@access private

exports.createPost = asyncHandler(async (req, resp, next) => {
  //Get the payload
  const { title, content, categoryId } = req.body;

  //check if the post is present
  const postFound = await Post.findOne({ title });
  if (postFound) {
    let error = new Error("Post already Existing");
    next(error);
    return;
  }
  //Create post object
  const post = await Post.create({
    title,
    content,
    category: categoryId,
    author: req.userAuth?._id,
    image:req.file.path,
  });

  //update user by adding post in it

  const user = await User.findByIdAndUpdate(
    req.userAuth?._id,
    { $push: { posts: post._id } },
    { new: true }
  );

  //update category by adding post in it
  const category = await Category.findByIdAndUpdate(
    categoryId,
    { $push: { posts: post._id } },
    { new: true }
  );

  //send the response

  resp.json({
    status: "success",
    message: "Post successfully Created",
    post,
    user,
    category,
  });
  console.log("file uploaded",req.file);
  
});

//@desc Get all post
//@route GET /api/v1/posts
//@access private

exports.getAllPosts = asyncHandler(async (req, resp) => {
  //get the current user
  const currentUserId=req.userAuth._id;
  //Get the current time 
  const currentDateTime=new Date();
  //Get all those users who have blocked the current user
  const usersBlockingCurrentUser=await User.find({blockedUsers:currentUserId});
  //extract the id of the users who have blocked the current user 
  const blockingUsersIds=usersBlockingCurrentUser.map((userObj)=>
    userObj._id)
  
  const query={
    author:{$nin:blockingUsersIds},$or:[
      {scheduledPublished:{$lte:currentDateTime},scheduledPublished:null
    },
  ],
}
  
  //Fetch those posts whose author is not in blocking user ids 

  const allPosts=await Post.find(query).populate({
    path:"author",
    model:"User",
    select:"email username role"
  });

  //send the response
  resp.json({
    status: "success",
    message: "All posts successfuly fetched",
    allPosts,
  });
});

//@desc Get  single post
//@route GET /api/v1/posts/:id
//@access public

exports.getPost = asyncHandler(async (req, resp) => {
  // get the id from the req
  const postId = req.params.id;

  //fetch the post corresponding to this id
  const post = await Post.findById(postId);
  if (post) {
    resp.json({
      status: "success",
      message: "Post successfuly fetched",
      post,
    });
  }else{
     resp.json({
      status: "success",
      message: "No Post available for given id",
    });
  }
});

//@desc  delete post
//@route DELETE /api/v1/posts/:id
//@access private

exports.deletePost = asyncHandler(async (req, resp) => {
  //get the id 
  const postId=req.params.id;
  //delete this post from the database
  await Post.findByIdAndDelete(postId);
  resp.json({
    status:"success",
    message:"post successfully deleted",
  })
});

//@desc  Update Post
//@route PUT /api/v1/posts/:id
//@access private

exports.updatePost = asyncHandler(async (req, resp) => {
  //get the id 
  const postId=req.params.id;
  //Get the post object from the req
  const post=req.body;
  //update this post from the database
  const updatedPost=await Post.findByIdAndUpdate(postId,post,{new:true,runValidators:true});
  //send the response
  resp.json({
    status:"success",
    message:"post successfully updated",
    updatedPost,
  })
});

//@desc Like a Post
//@route PUT /api/v1/posts/like/:postId
//@access private

exports.likePost=asyncHandler(async(req,resp,next)=>{
  //Get the id of the post 
  const {postId}=req.params;
  //Get the current user
  const currentUserId=req.userAuth._id;
  //search the post 
  const post=await Post.findById(postId);
  if(!post){
    let error=new Error("Post not found ");
    next(error);
    return;
  }
  //add the currentUserId to likes array 
  await Post.findByIdAndUpdate(postId,{$addToSet:{likes:currentUserId}},{new:true});

  //remove the currentUserId to dislikes array 
  post.disLikes=post.disLikes.filter((userId)=>userId.toString()!==currentUserId.toString());

  //resave the post 
  await post.save()
  //send the response
  resp.json({
    status:"success",
    message:"post liked successfully",
    
  });
})

//@desc disLike a Post
//@route PUT /api/v1/posts/dislike/:postId
//@access private

exports.disLikePost=asyncHandler(async(req,resp,next)=>{
  //Get the id of the post 
  const {postId}=req.params;
  //Get the current user
  const currentUserId=req.userAuth._id;
  //search the post 
  const post=await Post.findById(postId);
  if(!post){
    let error=new Error("Post not found ");
    next(error);
    return;
  }
  //add the currentUserId to likes array 
  await Post.findByIdAndUpdate(postId,{$addToSet:{disLikes:currentUserId}},{new:true});

  //remove the currentUserId to ikes array 
  post.likes=post.likes.filter((userId)=>userId.toString()!==currentUserId.toString());

  //resave the post 
  await post.save()
  //send the response
  resp.json({
    status:"success",
    message:"post disliked successfully",
    
  });
});

//@desc clap a Post
//@route PUT /api/v1/posts/claps/:postId
//@access private

exports.clapPost=asyncHandler(async(req,resp,next)=>{
  //Get the id of the post 
  const {postId}=req.params;
   //search the post 
  const post=await Post.findById(postId);
  if(!post){
    let error=new Error("Post not found ");
    next(error);
    return;
  }

  //implement claps
  const updatedPost=await Post.findByIdAndUpdate(postId,{$inc:{claps:1}},{new:true});

    //send the response
  resp.json({
    status:"success",
    message:"post clapped successfully",
    updatedPost,
    
  });
})

//@desc schedule a Post
//@route PUT /api/v1/posts/schedule/:postId
//@access private

exports.schedulePost=asyncHandler(async(req,resp,next)=>{
  //Get the data
  const {postId}=req.params;
  const {scheduledPublish}=req.body;
  //check if post id and scheduledPublish are present 
  if(!postId || !scheduledPublish){
    let error =new Error("post id and scheduled date are required")
    next(error);
    return;
  }

  // find the post form the db 
  const post=await Post.findById(postId);
  if(!post){
    let error=new Error("Post not found ");
    next(error);
    return;
  }

  //Check if the currentUser is the author 
  if (post.author.toString()!==req.userAuth._id.toString()){
    let error=new Error("you can schedule only your post ")
    next(error);
    return;
  }
  const scheduleDate=new Date(scheduledPublish);
  const currentDate=new Date();
  if(scheduleDate<currentDate){
    let error=new Error(" Scheduled date cannot be previous date ")
    next(error);
    return;
  }
  post.scheduledPublished=scheduleDate;
  await post.save();

  //send the response
  resp.json({
    status:"success",
    message:"post scheduled successfully",
    post,
    
  });

});