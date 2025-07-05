import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js"

const router = Router();

router.route("/get-video-comments/:videoId").get(verifyJWT, getVideoComments);
router.route("/post-comment/:videoId").post(verifyJWT, addComment)
router.route("/update-comment/:commentId").post(verifyJWT, updateComment)
router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment)

export default router;