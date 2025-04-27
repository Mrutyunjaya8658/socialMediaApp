import express from "express";
import isAuthenticated from "../middleWare/isAuthenticated.js";
import upload from "../middleWare/multer.js";
import { addComment, addNewPost, bookmark, deletePost, disLikePost, getAllPost, getCommentByPost, getUserPost, likePost } from "../controllers/post.controller.js";

const router = express.Router();

router.route("/addpost").post(isAuthenticated, upload.single('image'), addNewPost)
router.route("/all").get(isAuthenticated, getAllPost)
router.route("/userpost/all").get(isAuthenticated, getUserPost)
router.route("/:id/like").get(isAuthenticated, likePost)
router.route("/:id/disLike").get(isAuthenticated, disLikePost)
router.route("/:id/comment").post(isAuthenticated, addComment)
router.route("/:id/comment/all").post(isAuthenticated,getCommentByPost )
router.route("/delete/:id").delete(isAuthenticated, deletePost)
router.route("/:id/bookmark").get(isAuthenticated, bookmark )

export default router;