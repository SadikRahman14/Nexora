import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    // Get total Video through Video Schema
    // Get total Video views through Video Schema
    // Get total subscriber through Subscription Schema
    // Get total likes thorugh Like Schema

    const userId = req.user?._id;
    
    if(!userId){
        throw new ApiError(401, "Unauthorized Request")
    }

    const totalVideo = await Video.countDocuments({ owner: userId })
    const allVideos = await Video.find({ owner:userId })

    let totalViews = 0;
    allVideos.forEach((videos) => totalViews += videos.views)

    const totalSubscriber = await Subscription.countDocuments({ channel: userId })

    const videoLikes = await Like.countDocuments(
        {
            video: {$ne: null},
            likedBy: userId
        }
    )

    const tweetLikes = await Like.countDocuments(
        {
            tweet: {$ne: null},
            likedBy: userId
        }
    )

    const commentLikes = await Like.countDocuments(
        {
            comment: {$ne: null},
            likedBy: userId
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, 
            {
                totalVideo,
                totalViews,
                totalSubscriber,
                videoLikes,
                commentLikes,
                tweetLikes
            },
            "Dashboard Returned Successfully"
        )
    )

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user?._id;

    if(!userId){
        throw new ApiError(401, "Unauthorized Request")
    }

    const myVideos = await Video.find({ owner: userId });
    const totalVideos = await Video.countDocuments({ owner: userId });

    if (myVideos.length === 0) {
        return res
        .status(200)
        .json(
            new ApiResponse(200, { totalVideos: 0, myVideos: [] }, "No videos found")
        );
    }


    return res
    .status(200)
    .json(
        new ApiResponse(200, {totalVideos, myVideos}, "Users videos fetched")
    )
})

export {
    getChannelStats, 
    getChannelVideos
}