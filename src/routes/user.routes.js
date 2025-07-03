import { Router } from "express";
import { 
    loginUser, 
    registerUser, 
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
from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage", 
            maxCount: 1
        }
    ]),
    registerUser);

router.route("/login").post(loginUser);

// secured routs (user already logged in)
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)
/*
    When you do upload.single("avatar"), you're telling multer:
        "Expect one file upload with the form field named 'avatar'."
        This returns a middleware function that will:
        Parse the incoming request,
        Extract the file under the field 'avatar',
        Save it using the storage engine you configured,
        Attach the file info to req.file.
*/

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
/*
    The :username part in the route path is called a route parameter (or path parameter). 
    It means that part of the URL is dynamic and will be captured as a variable named username.
*/
router.route("/history").get(verifyJWT, getWatcHistory)

export default router;