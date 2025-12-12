const express = require("express");
const {createComment, deleteComment, updateComment}=require("../../controllers/comments/commentsController");

const isLoggedIn=require("../../middlewares/isLoggedIn")

const commentsRouter=express.Router();
// Create comment
commentsRouter.post('/:postId',isLoggedIn,createComment)

// Delete comment
commentsRouter.delete('/:commentId',isLoggedIn,deleteComment)

// update comment
commentsRouter.put('/:commentId',isLoggedIn,updateComment)

module.exports=commentsRouter;