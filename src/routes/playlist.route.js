import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js"

const router = Router();

router.route("/crate-playlist").post(verifyJWT, createPlaylist);
router.route("/get-user-playlist/:userId").get(verifyJWT, getUserPlaylists);
router.route("/get-playlist-by-id/:playlistId").get(verifyJWT, getPlaylistById);
router.route("/add-to-playlist/:playlistId/add/:videoId").post(verifyJWT, addVideoToPlaylist);
router.route("/remove-from-playlist/:playlistId/add/:videoId").delete(verifyJWT, removeVideoFromPlaylist);
router.route("/delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist);
router.route("/update-playlist/:playlistId").post(verifyJWT, updatePlaylist);

export default router;