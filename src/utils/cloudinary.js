import {v2 as cloudinary} from "cloudinary"
import fs from "fs" // file system

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:  process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const uploadOnCloudinary = async (localfilePath) => {
    try {
        if(!localfilePath) return null;

        const response = await cloudinary.uploader.upload(localfilePath, {
            resource_type: "auto"
        })
        console.log("File is uploaded successfully", response.url);
        fs.unlinkSync(localfilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localfilePath) // Remove the file if there is an error in submitting
        return null;
    }
}

export { uploadOnCloudinary }