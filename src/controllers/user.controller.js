import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js" 
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const registerUser = asyncHandler( async(req, res) => {
    // get user details from frontend

    const {fullName, email, username, password} = req.body
/*
        "Hey Express, if the incoming request has a JSON body, please parse it and attach 
        it as an object to req.body."

        Extracting these parameters from user input to req.body
*/
    console.log("email", email)

    // validation not empty

    if(
        [fullName, email, password, username].some((fields) => fields.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exist
    const isUserExists = await User.findOne({
        $or: [{ username }, { email }]
    })
    /*
        In Mongoose (MongoDB's ODM for Node.js), findOne() is a method used to:
            Find a single document in a collection that matches the given query.
            It returns the first matching document, or null if none is found.
    */

    if(isUserExists){
        throw new ApiError(409, "User with email or username already exists")
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0].path;
    //const coverImageLocalPath = req.files?.coverImage[0].path;

    // If we dont add coverImage:
/*
        <body>
            <pre>TypeError: Cannot read properties of undefined (reading &#39;0&#39;)<br> 
        </body>

        If no coverImage is uploaded, then:
        req.files?.coverImage is undefined
        So req.files?.coverImage[0] becomes undefined[0] → 💥 Error
*/

    let  coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
// this fixes cover image issue
    
/*
    console.log(req.files);
        avatar: [
            {
                fieldname: 'avatar',
                originalname: 'Screen_03-01-2025_18-12-10.png',
                encoding: '7bit',
                mimetype: 'image/png',
                destination: './public/temp',
                filename: 'Screen_03-01-2025_18-12-10.png',
                path: 'public\\temp\\Screen_03-01-2025_18-12-10.png',
                size: 2539567```
            }
     ],
*/
   
/*
        If an avatar file was uploaded, get its local file path

        req.files - an object automatically populated by multer. Contains files grouped by field name
        
        ?. => Prevents the app from crashing if req.files or req.files.avatar is undefined.
        If its missing returns undefined instead of throwing error

        avatar[0] => upload.files may have maxCount. Even if its only 1, still the are stored as array.
        So take the first one

        .path => The local path on your server where file was saved by multer
*/

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }

    // upload them to cloudinary and check for avatar again
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar is required");
    }

    // create user object - create entry in db

    const user  = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // remove password and refresh token
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    /*
        findbyId() => This is a Mongoose method to find a document by its _id (MongoDB’s default primary key).
        It returns the full user document if a match is found.

        select() is a query which lets include or exclude specific fields from the returned document
        '-' means exclude ofc

        !!!!DANGER
        res.status(200).json(user); // user contains password and refreshToken

        ** We are only excluding from a query not database
    */

    // check for user creation
    if(!createdUser){
        throw new ApiError(500, "Something Went Wrong while registering user")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
    /*
        200 => Ok
        201 => created

        res.status(201) sets the HTTP status for entire response
        ApiResponse(200, createdUser, "User Registered Successfully") => this status code serves
        as a parameter to class ApiResponse

    */
})

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("generateAccessAndRefreshToken error:", error);
    throw new ApiError(500, "Something went wrong");
  }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(refreshAccessToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401, "Invalid Refreh Token");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or used");
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", newRefreshToken)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }



}) 

const loginUser = asyncHandler(async(req, res) => {
    // fetch the body from data
    const {email, username, password} = req.body;

    // username or email, let user login if they have any of this
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    // find the user by username or email
    const user = await User.findOne({
        $or: [{username},{email}]
    })

    // Check if user exists
    if(!user){
        throw new ApiError(404, "User does not exists")
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid User Credentials");
    }

    // provide accessToken and refreshToken
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    // Just show what they need
    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")


    // send cookies
    const options = {
        httpOnly: true, //  prevent client-side JS from accessing cookies
        secure: true // cookie only sent over HTTPS (set false in dev if needed)
        
    }


    // Send Response
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"
        )
    )
    /*
        Reason of sending data twice is, the json response is for us to see in postman
        {
            statusCode: 200,
            data: {
                user: { ... },            // user info (without password or refresh token)
                accessToken: "xyz",       // short-lived token
                refreshToken: "abc"       // long-lived token
            },
            message: "User logged in Successfully",
            success: true
        }

    */



})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
                /*
                    setting the refreshToken field to undefined, effectively removing it
                    This is important because the refresh token is stored in the DB (server-side), 
                    and removing it invalidates any future token refresh attempts 
                */
            }
        },
        {new : true}
        /*
            In Mongoose, when you use update methods like:
            findByIdAndUpdate()
            findOneAndUpdate()
            Mongoose by default returns the original (pre-update) document.
            To get the updated version instead, you pass: {new : true}

            Here, To get the version after updating refreshToken
        */
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const getCurrentUser = asyncHandler( async(req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "User Fetched Successfully")
    )
})

const changePassword = asyncHandler(async(req, res) => {
    // fetch the current and new password from user
    // fetch current password from database
    // check if the old password is valid
    // store the new password in database
    // send a response to user

    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);
    
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid Current Password");
    }

    user.password = newPassword;

    await user.save({
        validateBeforeSave: true
    })

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"))

})

const updateAccountDetails = asyncHandler(async (req, res) => {
    // Fetch details from user
    // fetch user from database
    // store the change in database

    const {fullName, email} = req.body;

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName: fullName,
                email: email
            }
        }, {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Details Updated Successfully")
    )

})

const updateUserAvatar = asyncHandler( async(req, res) => {
    // Get the avatar from files
    // check if the file is missing
    // Upload image in cloudinary
    // store the url in database
    // return response
    
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading in cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            } 
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user,  "Avatar Changed Successfully")
    )
})

const updateCoverImage = asyncHandler( async(req, res) => {
    const coverImageLocalPath = req.file.path;

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover Image missing in filess");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading Cover Image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover Image updated Successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params
    /*
        Username is being fetched from url path parameters
        When a request hits URL like :
        GET /api/v1/users/channel/sadikrahman
        req.params = {username : "sadikrahman"}
    */

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        /*
            The from field in a MongoDB $lookup stage refers to the collection name 
            you want to join from — basically, "which collection do I want documents from?"
        */
        /*
            This matches subscription.channel = user._id
            Finds all user who subscribed to this channel, stores, and returns a array

            After the lookup, User:
            {
                _id: "...", // user
                fullName: "...",
                ...
                subscribers: [
                    { subscriber: userId1, channel: currentUserId },
                    { subscriber: userId2, channel: currentUserId },
                    ...
                ]
            }


        */
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        /*
            This matches subscription.subscriber = user._id
            Finds all  channel, this user have subscribed to

            After the lookup, User:
            {
                subscribedTo: [
                    { subscriber: currentUserId, channel: otherUserId1 },
                    { subscriber: currentUserId, channel: otherUserId2 },
                    ...
                ]
            }
        */
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
        /*
            Here channel holds one object of unique user.
            But User.aggregate() always returns a array and the user is ofc in first index
        */
    )
})

const getWatcHistory = asyncHandler( async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[{
                                $project:{
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            }]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHostory,
            "Watch History fetched Successfully"
        )
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,
    getCurrentUser,
    getUserChannelProfile,
    getWatcHistory
}