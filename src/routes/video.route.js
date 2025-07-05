import { Router } from "express";
import {verifyJWT} from "../middleware/auth.middleware.js"
import { upload } from "../middleware/multer.middleware.js";

import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js"

const router = Router();

router.route("/get-all-videos").get(verifyJWT, getAllVideos);
router.route("/publish-video").post(verifyJWT, upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "content", maxCount: 1 }
]), publishAVideo);
router.route("/get-video/:videoId").get(verifyJWT, getVideoById);
router.route("/update-video/:videoId").post(verifyJWT, upload.single("thumbnail"), updateVideo);
router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo);
router.route("/toogle-publish-status/:videoId").post(verifyJWT, togglePublishStatus);

export default router;