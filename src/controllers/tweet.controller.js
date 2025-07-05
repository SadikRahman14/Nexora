import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { updateUserAvatar } from "./user.controller.js"
import { json } from "express"

const createTweet = asyncHandler(async (req, res) => {
    // Fetch content of the tweet from user
    // Fetch user from User
    // Create a new tweet
    // Send a response

    const {content} = req.body;
    if(!content?.trim()){
        throw new ApiError(404,"Content Not Found");
    }

    const user = req.user?._id;

    if(!user){
        throw new ApiError(401,"Unauthorized User");
    }

    const tweet = await Tweet.create({
        content: content,
        owner: user
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201, tweet, "New Tweet Posted")
    )  
})

const getUserTweets = asyncHandler(async (req, res) => {
    // Fetch the user from database
    // Use Pipeline to join tweets and user
    // return all the tweets as response

    const { username } = req.params;

    if(!username?.trim()){
        throw new ApiError(404, "Username was not Found!")
    }

    
    const AllTweets = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            },
    
        },
        {
            $lookup:{
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "alltweets"
            }
        },
        {
            $addFields:{
                TotalTweets : {
                    $size: "$alltweets"
                }
            }
        },
        {
            $project:{
                fullName: 1,
                TotalTweets: 1,
                username: 1,
                alltweets: 1 
            }
        }
    ])


    if(!AllTweets?.length){
        throw new ApiError(404, "No Tweet Exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, AllTweets[0], "All Tweets Fetched Successfully")
    )


});


const updateTweet = asyncHandler(async (req, res) => {
    // Get the tweet id user want to update and put it in url of while posting
    // Fetch the updated tweet
    // Then update the tweet to database
    // return response

    const tweetId = req.params.tweetId;
    const { content } = req.body;
    // console.log("Tweet ID:", req.params.tweetId);

    /*
        router.route("/update-tweet/:tweetId").post(verifyJWT, updateTweet)
        const tweetId = req.params.tweetId;
        req.params.tweetId must match the routers tweetId 
    */

    if(!tweetId){
        throw new ApiError(404, "Tweet ID was not found");
    }

    if(!content?.trim()){
        throw new ApiError(404, "Updated Tweet Content is required");
    }
    

    const tweet = await Tweet.findById(tweetId);
    
    if(!tweet){
        throw new ApiError(404, "Tweet was not found");
    }

    if(tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet")
    }

    const UpdatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content: content
        },
        {new: true}
    )

    const user = await User.findById(req.user._id).select("fullName"); 
    // Less efficient, emni moja tai korsi

    return res
    .status(201)
    .json(
        new ApiResponse(201, UpdatedTweet , `${user.fullName}!, your Tweet is Updated`)
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    // Get the tweetid user wants to delete
    // Delete the tweet
    // return response

    const tweetId = req.params.tweetId;

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required");
    }
    console.log("Delete Tweet ID:", tweetId)


    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(404, "Tweet was not found");
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not Authorized to Delete this tweet");
    }

    await tweet.deleteOne(tweet)

    return res
    .status(200)
    .json(
        new ApiResponse(200, {},  "Tweet Deleted Successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}