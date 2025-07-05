import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    // TODO: toggle like in video
    // Fetch the video user liked
    // If the video is not liked yet, insert the videoId in like schema
    // if its already liked than delete the id from Like Schema
    // return res

    const {videoId} = req.params;
    const userId = req.user?._id;

    if(!videoId){
        throw new ApiError(400, "Video ID is required")
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId})

    if(!existingLike){
        const likeVideo = await Like.create({
            video: videoId,
            likedBy: userId
        })

        return res
        .status(200)
        .json(
            new ApiResponse(200, likeVideo, "Video Liked Successfully")
        )
    }
    else{
        await Like.deleteOne({_id : existingLike._id})

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Video Unliked Successfully")
        )
    }

    

    
    
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user?._id;

    if(!userId){
        throw new ApiError(404, "Couldn't Find UserID")
    }

    if(!commentId){
        throw new ApiError(400, "Provide Comment ID")
    }

    const existingLike = await Like.findOne({ comment : commentId, likedBy: userId })


    if(!existingLike){
        const likeComment = await Like.create({
            comment: commentId,
            likedBy: userId
        })

        return res
        .status(200)
        .json(
            new ApiResponse(200, likeComment, "Liked Comment Successfully")
        )
    }
    else{
        await Like.deleteOne({ _id: existingLike._id })

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Unliked Comment Successfully")
        )

    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user?._id;

    if(!userId){
        throw new ApiError(404, "Couldn't Find UserID")
    }

    if(!tweetId){
        throw new ApiError(400, "Provide Tweet ID")
    }

    const existingLike = await Like.findOne({ tweet : tweetId, likedBy: userId })


    if(!existingLike){
        const likeTweet = await Like.create({
            tweet: tweetId,
            likedBy: userId
        })

        return res
        .status(200)
        .json(
            new ApiResponse(200, likeTweet, "Liked Tweet Successfully")
        )
    }
    else{
        await Like.deleteOne({ _id: existingLike._id })

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Unliked Tweet Successfully")
        )
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    // Search in Like Schema for videoId
    // return the users all liked video with a response

    const userId = req.user?._id;

    if(!userId){
        throw new ApiError(404, "User not Found")
    }

    const allLikedByUser = await Like.find({ 
        likedBy: userId, 
        video: {$ne: null}  // ne = not equal
    }).populate("video");
/*
    When you use .populate("video"), Mongoose looks at the video field in each Like document 
    which stores an ObjectId referencing a video fetches the full corresponding document 
    from the Video collection  
 */
    const totalLikedVideos = await Like.countDocuments({ 
        likedBy: userId, 
        video: {$ne: null} 
    });

    const videos = allLikedByUser.map((entry) => entry.video)


    return res
    .status(200)
    .json(
        new ApiResponse(200, { videos, totalLikedVideos }, "ALl Liked Videos Fetched Successfully!!")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}