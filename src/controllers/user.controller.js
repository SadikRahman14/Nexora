import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js" 
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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

export {registerUser}