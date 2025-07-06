import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    const userId = req.user?._id;

    if(!name || !description){
        throw new ApiError(400, "Both name and description are required")
    }
    
    const playlist = await Playlist.create({
        name,
        description,
        videos: [],
        owner: userId,
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201, playlist, "New Playlist created")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if(!userId){
        throw new ApiError(401, "Unauthorized User")
    }

    const totalUsersPlaylists = await Playlist.countDocuments({ owner: userId })
    const usersPlaylists = await Playlist.find({ owner: userId })

    if(usersPlaylists.length === 0){
        return res
        .status(404)
        .json(
            new ApiResponse(404, {}, "No Playlist Found")
        )
    }

    return res
    .status(404)
    .json(
        new ApiResponse(404, {totalUsersPlaylists, usersPlaylists}, "Playlist Fetched Successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Provide playlistId");
    }

    const playlist = await Playlist.findById(playlistId).populate("videos");

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist Fetched"));
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new ApiError(400, "Something wrong with the req.params")
    }
    const userId = req.user?._id;

    const playlist = await Playlist.findById(playlistId)
        .populate("videos");

    if(!playlist){
        throw new ApiError(404, "Playlist Not Found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(401, "You are not authorized to add video to this playlist")
    }

    if (!playlist.videos.some(id => id.equals(videoId))) {
        playlist.videos.push(videoId);
        await playlist.save();
    }
    else{
        return res
        .status(400)
        .json(
            new ApiResponse(400, {}, "Cant add this video again")
        )
    }

    

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Video added successfully")
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(!playlistId || !videoId){
        throw new ApiError(400, "Something wrong with the req.params")
    }

    const playlist = await Playlist.findById(playlistId)


    if(!playlist){
        throw new ApiError(404, "Playlist Not Found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(401, "You are not authorized to delete video to this playlist")
    }


    playlist.videos = playlist.videos.filter(id => id.toString() !== videoId)
    await playlist.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Video removed successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(401, "You are not authorized to delete this playlist")
    }

    await Playlist.deleteOne({_id : playlist});

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Playlist Deleted Successfully!")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    
    const {playlistId} = req.params
    const {name, description} = req.body
    

    if(!(name || description)){
        throw new ApiError(400, "You are not updating anything")
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }


    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(401, "You are not authorized to update this playlist")
    }

    const previousName = playlist.name;
    const previousDescription = playlist.description;

    playlist.name = (typeof name === "undefined" || name === "")? previousName : name;
    playlist.description = (typeof description === "undefined" || description === "")? previousDescription : description;
    await playlist.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist updated successfully!!")
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}