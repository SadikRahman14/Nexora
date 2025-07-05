
import { Router } from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js"

const router = Router()


router.route("/toggle-subscription/:channelId").post(verifyJWT, toggleSubscription)
router.route("/get-channel-subscriber/:channelId").get(verifyJWT, getUserChannelSubscribers)
router.route("/get-subscribed-channels/:subscriberId").get(verifyJWT, getSubscribedChannels)

export default router;