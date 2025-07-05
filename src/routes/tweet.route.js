import { Router } from "express";
import { 
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet

} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js";



const router = Router();

router.route("/create-tweet").post(verifyJWT, createTweet)
router.route("/get-user-tweet/:username").get(verifyJWT, getUserTweets)
router.route("/update-tweet/:tweetId").post(verifyJWT, updateTweet)
router.route("/delete-tweet/:tweetId").delete(verifyJWT, deleteTweet)

console.log("Tweet router loaded");

export default router;