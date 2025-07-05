import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"




const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    // Handle the variables
    // search for videoId in all comments
    // fetch all comments with similar id
    // return response

    const { videoId } = req.params
    let {page = 1, limit = 10} = req.query
    
    page = parseInt(page)
    limit = parseInt(limit)
    
    if(isNaN(page) || page < 1) page = 1;
    if(isNaN(limit) || limit < 1) limit = 1;

    const comments = await Comment.find({ video: videoId })
        .populate("owner", "fullName avatar")
        .skip((page-1)* limit)
        .limit(limit);

    const totalComments = await Comment.countDocuments({ video: videoId })

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            {
                comments,
                totalComments,
                page,
                limit
            },  "All video Comments fetched Successfully!!")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    // Fetch comment user wants to make 
    // Fetch the owner of the comment 
    // Fetch the videoId from the video
    // Insert everything in commentSchema
    // return response

    const { content } = req.body;
    const { videoId } = req.params;

    if(!content){
        throw new ApiError(404, "Comment Not Found")
    }
    console.log(videoId);
    if(!videoId){
        throw new ApiError(400, "Provide Video ID")
    }

    const videoExists = await Video.findById(videoId);

    if(!videoExists){
        throw new ApiError(400, "Video Does not exists")
    }

    const owner = await User.findById(req.user._id);

    if(!owner){
        throw new ApiError(404, "Owner not Found")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: owner
        
    })

    const populatedComment = await Comment.findById(comment._id)
        .populate("owner", "fullName avatar")


    return res.
    status(201)
    .json(
        new ApiResponse(201, populatedComment, "Comment posted Successfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    // Fetch the new comment and comment id
    // validate new comment
    // Update the content in comment
    // save
    // Return response

    const { content } = req.body;
    const { commentId } = req.params

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404, "Comment was not found")
    }

    if(!content){
        throw new ApiError(400, "Provide new Comment")
    }

    if(comment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to change comment")
    }

    comment.content = content;
    await comment.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment updated successfully")
    )




})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    // Fetch the comment from commentId
    // get comment from commentId
    // Delete it
    // return response

    const { commentId } = req.params

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404, "Comment was not found")
    }

    await Comment.deleteOne(comment);

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}