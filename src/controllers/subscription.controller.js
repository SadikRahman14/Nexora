import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    
    const { channelId } = req.params;
    const userId = req.user?._id;

    if(!channelId){
        throw new ApiError(400, "Provide channel Id please")
    }
    
    if(!userId){
        throw new ApiError(401, "Unauthorized request")
    }

    const existingSubscriber = await Subscription.findOne({ subscriber: userId, channel: channelId, })

    if(!existingSubscriber){
        const addSubscriber = await Subscription.create({
            subscriber: userId,
            channel: channelId
        })

        return res
        .status(200)
        .json(
            new ApiResponse(200, addSubscriber, "Channel Subscribed")
        )
    }
    else{
        await Subscription.deleteOne({ _id: existingSubscriber._id })

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Channel Unsubscribed")
        )
    }
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // Ei channel er jonno total koyta document ache
    // Fetch channelId and validate
    // Look for this channelId in all Subscription document
    // Take the subscriber from that document
    // Return Response

    const {channelId} = req.params;

    if(!channelId){
        throw new ApiError(401, "Unauthorized Request")
    }

    const totalSubscriber = await Subscription.countDocuments({ channel: channelId })

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "fullName avatar");
    
    if(subscribers.length === 0){
        return res
        .status(404)
        .json(
        new ApiResponse(404, {}, "No Suscriber Found")
    )}

    return res
    .status(200)
    .json(
        new ApiResponse(200, { totalSubscriber, subscribers }, "All Subscriber fetched")
    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // Fetch subscriberId and validate
    // Look for subscriberId in all Subscription Document
    // Get the channels for that subscriber
    // Return Response
    const { subscriberId } = req.params

    if(!subscriberId){
        throw new ApiError(401, "Unauthorized Request")
    }

    const totalChannelSubscribed = await Subscription.countDocuments({ subscriber: subscriberId })

    const channelsSubscribed = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "fullName avatar")

    if(channelsSubscribed.length === 0){
        return res
        .status(404)
        .json(
        new ApiResponse(404, {}, "No Channel Found")
    )}

    return res
    .status(200)
    .json(
        new ApiResponse(200, { totalChannelSubscribed, channelsSubscribed }, "All Subscriber fetched")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}