import { Router } from "express";
import { upload } from "../Middleware/Multer.js";
import { verifyJWT } from "../Middleware/Auth.js";
import { addComment, createPost, deletePost, getAllPosts, getCommentsForPost, getCurrentUser, getPostById, getPostLikes, getUserPosts, loginUser, logOutUser, registerUser, toggleLikePost, updatePost} from "../Controllers/User.controller.js";


const router = Router()

router.route("/register").post(
    upload.single( "profileImage" ),
    registerUser
  );
  

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logOutUser)

router.route("/create-post").post(verifyJWT,
    upload.single( "coverImage" ),createPost)

router.route("/all-posts").get(verifyJWT,getAllPosts)

router.route("/user-posts").get(verifyJWT,getUserPosts)

router.route("/currentUser").get(verifyJWT,getCurrentUser)

router.route("/:id").get(verifyJWT,getPostById)

router.route("/update/:id").patch(verifyJWT,upload.none(),updatePost)

router.route("/delete/:id").delete(verifyJWT,deletePost)

router.route('/:postId/like').put(verifyJWT, toggleLikePost);

router.route('/:id/like').get(verifyJWT,getPostLikes);

router.route("/add-comment").post(verifyJWT,addComment);

router.route("/comment/:postId").get(verifyJWT,getCommentsForPost)

// router.route("/update-profile").patch(verifyJWT,upload.single("profile"),updateUserProfileImage)

// router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updatePostCoverImage)

export default router