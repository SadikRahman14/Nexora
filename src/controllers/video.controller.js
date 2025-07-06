import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { response } from "express"


const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
/*
    This is called destructuring. It takes specific fields from the req.query object 
    (which holds URL query parameters).
    
    For Example: URL: /api/videos?page=2&limit=5&query=funny&sortBy=views&sortType=asc&userId=123

    page = "2",
    limit = "5",
    query = "funny",
    sortBy = "views"
    sortBy = "asc" 
    userId = "...eq1"

    This will not triggered if they are not in url, though the default values will
*/
    page = parseInt(page);
    limit = parseInt(limit);
    // We only need to parse the numbers as they will be used in math
    if(isNaN(page) || page < 1) page = 1;
    if(isNaN(limit) || limit < 1) limit = 1;


    const filter = {}
    if(query){
        filter.$or = [
            { title: {$regex: query, $options: "i"}},
            { description: {$regex: query, $options: "i"}}
        ]
    }

    //$regex: Regular expression — for partial matches.

    if(userId){
        filter.owner = userId;
    }
/*
    $or: At least one of the conditions must match.
    $regex: Regular expression — for partial matches.
    $options: "i": Case-insensitive.
    
    IF query = "football" it will find:
    titles with football
    descriptions with football
    
    */

    const sort = {};
    sort[sortBy] = sortType === "desc" ? -1 : 1;
/*
    -1 means desc and 1 means asc
*/

    const videos = await Video.find(filter)
        .sort(sort)
        .skip((page - 1)* limit)
        .limit(limit)

    const totalVideos = await Video.countDocuments(filter);
/*
    .find() returns an array of matching video documents.
    page = 1, limit = 10 → skip 0
    page = 2, limit = 10 → skip 10
    page = 3, limit = 10 → skip 20

    Means for page 2, it will skip 1-10 and show 11-20
*/

return res
.status(200)
.json(
    new ApiResponse(200,{
        videos,
        page,
        limit,
        totalVideos,
        totalPages: Math.ceil(totalVideos / limit)
    }, "Videos Fetched Successfully")
)


})

const publishAVideo = asyncHandler(async (req, res) => {
        // Fetch title, description
        // Fetch the Video and Thumbnail through Multer
        // Check for validattion
        // Upload the video and thumbnail on cloudinary
        // Fetch The User and put as owner
        // Insert the url from cloudinary to database

        const {title, description} = req.body;

        if(
            [title, description].some((fields) => fields.trim() === "")
        ){
            throw new ApiError(400, "All fields are required")
        }

        const thumbnailLocalPath = req.files?.thumbnail[0].path;
        const contentLocalPath = req.files?.content[0].path;

        if(!thumbnailLocalPath || !contentLocalPath){
            throw new ApiError(400, "Both Video and Thumbnail are required")
        }

        //const duration = await getVideoDuration(contentLocalPath)

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        const content = await uploadOnCloudinary(contentLocalPath);

        const user = await User.findById(req.user?._id);

        const video = await Video.create({
            title,
            description,
            videoFile: content.url,
            thumbnail: thumbnail.url,
            owner: user,
            //duration
        })

        return res
        .status(201)
        .json(
            new ApiResponse(201, video ,"A new video created")
        )

})

const getVideoById = asyncHandler(async (req, res) => {
    // Fetch the video id from URI
    // find in database
    // return response

    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(404, "Video Id was not found");
    }

    const video = await Video.findById(videoId);
    
    if(!video){
        throw new ApiError(404, "Video was not found")
    }
    
    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(404, "User was not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {video, user}, "Video Fetched Successfully")
    )
    
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    // Fetch the vido id of the video, user wants to change
    // Validate Video
    // check if the user is the owner of the video
    // Fetch title, thumbnail, description from user
    // thumbnail
    // Send error if none of the field changed
    // Update the fields
    // Return Response


    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video Not Found");
    }

    if(video.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to update this video")
    }

    const previousTitle = video.title;
    const previousDescription = video.description;
    const previousThumbnail = video.thumbnail;

    const { title, description } = req.body;

    const thumbnailLocalPath = req.file?.path;

    if(!(title || description || thumbnailLocalPath)){
        throw new ApiError(400, "You are not updating anything")
    }


    let newThumbnail = video.thumbnail;
    if(thumbnailLocalPath){
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        newThumbnail = thumbnail?.url || video.thumbnail
        // OR operators takes the first value if none of them are null
    }


    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            title: (title === "")? previousTitle : title,
            description: (description === "") ? previousDescription : description,
            thumbnail: newThumbnail,

        },
        { new : true }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedVideo, "Details updated Successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // TODO: delete video
    // Get the video by videoId
    // find in database and delete
    // return response

    

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video Not Found");
    }

    if(video.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    await Video.deleteOne(video);

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video deleted Successfully")
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // TODO: delete video
    // Get the video by videoId
    // find in database and toggle the status (default is true)
    // return response

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video Not Found");
    }

    if(video.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to change status of this video")
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Status Toggled Successfully")
    )


})

const watchVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized Request");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }


    const alreadyWatched = user.watchHistory.includes(videoId);

    if (!alreadyWatched){
        user.watchHistory.push(videoId);
        await user.save();

        const video = await Video.findById(videoId);
        if (!video){
            throw new ApiError(404, "Video not found");
        }

        video.views += 1;
        await video.save();
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Watch recorded"));
});




export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    watchVideo
}