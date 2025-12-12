const express=require("express")
const multer=require("multer");
const storage=require("../../utils/fileUpload")

const {createPost, getAllPosts, getPost, deletePost, updatePost,likePost, disLikePost, clapPost, schedulePost}=require('../../controllers/posts/postsController')

const isLoggedIn=require('../../middlewares/isLoggedIn');
const isAccountVerified = require("../../middlewares/isAccountVerified");

const postsRouter=express.Router();

const upload=multer({storage});

//Create Post route

postsRouter.post('/',isLoggedIn,isAccountVerified,upload.single("file"),createPost);

//Get All Posts route

postsRouter.get('/',isLoggedIn,getAllPosts);

//Get a Single  Post route

postsRouter.get('/:id',getPost);

// Delete Post route

postsRouter.delete('/:id',isLoggedIn,deletePost);

//Update Post 
postsRouter.put('/:id',isLoggedIn,updatePost);

// like a post 
postsRouter.put('/like/:postId',isLoggedIn,likePost);

// dislike a post 
postsRouter.put('/dislike/:postId',isLoggedIn,disLikePost);

// clap a post 
postsRouter.put('/claps/:postId',isLoggedIn,clapPost);

// schedule a post 
postsRouter.put('/schedule/:postId',isLoggedIn,schedulePost);

module.exports=postsRouter;