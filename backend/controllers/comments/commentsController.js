const asyncHandler = require("express-async-handler");
const Post = require("../../models/Posts/Post");
const Comment = require("../../models/Comments/Comment");

//@desc Create a new Comment
//@route POST /api/v1/comments/:postId
//@access private

exports.createComment = asyncHandler(async (req, resp) => {
  //Get the payload
  const { message } = req.body;

  //Get the post id
  const postId = req.params.postId;

  //Create the comment
  const comment = await Comment.create({
    message,
    author: req?.userAuth?._id,
    postId,
  });
  //Associate comment with post

  await Post.findByIdAndUpdate(
    postId,
    { $push: { comments: comment._id } },
    { new: true }
  );
  resp
    .status(201)
    .json({
      status: "success",
      message: "Comment successfully created",
      comment,
    });
});

//@desc Delete comment
//@route DELETE /api/v1/comment/:commentId
//@access private 

exports.deleteComment=asyncHandler(async(req,resp)=>{
  // Get the comment id to be deleted
  const commentId=req.params.commentId;
  await Comment.findByIdAndDelete(commentId);
  resp
    .status(201)
    .json({
      status: "success",
      message: "Comment successfully deleted",
    });

});

//@desc Update comment
//@route Update /api/v1/comment/:commentId
//@access private

exports.updateComment=asyncHandler(async(req,resp)=>{
  const commentId=req.params.commentId

  // Get the message
  const message=req.body.message;

  const updatedComment=await Comment.findByIdAndUpdate(commentId,{message},{new:true,runValidators:true});

  resp.status(201).json({
    status:"success",
    message:"comment successfully updated",
    updatedComment,
  })
})


