import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { User } from "../Models/UserModel.js";
import { uploadOnCloudinary } from "../Utils/Cloudinary.js";
import { Post } from "../Models/PostModel.js";
import {Comment} from "../Models/CommentModel.js"
import mongoose from 'mongoose';

const generateAccessAndRefreshToken = async (userId) => {
    try {
       const user = await User.findById(userId);
 
       if (!user) {
          throw new ApiError(404, "User not found");
       }
 
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()
 
 
       user.refreshToken = refreshToken
       await user.save({ validateBeforeSave: false })
 
       return { accessToken, refreshToken }
 
    } catch (error) {
       throw new ApiError(500, "Unable to generate access and refresh token")
    }
 }

const registerUser = asyncHandler(async (req, res) => {

    const { fullname, username, email, password } = req.body 
    if (
       [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
       throw new ApiError(400, "All fields are required")
    }
 
    const existedUser = await User.findOne({
       $or: [{ username }, { email }]
    })
 
    if (existedUser) {
       throw new ApiError(409, "User already existed")
    }

    const profileImageLocalPath=req.file?.path
   //  console.log(profileImageLocalPath);
    

    if(!profileImageLocalPath){
      throw new ApiError(400,"profile Image file is required")
     }
 
    const profileImage = await uploadOnCloudinary(profileImageLocalPath)

    if(!profileImage){
      throw new ApiError(400,"profileImage file is required")
    }
 
    const user = await User.create({
       fullname,
       email,
       password,
       profileImage:profileImage.url,
       username: username.toLowerCase()
    })
 
    const createdUserId = await User.findById(user._id).select(
       "-password -refreshToken"
    )
 
    if (!createdUserId) {
       throw new ApiError(500, "Something went wrong while creating the user ")
    }
 
    return res.status(201).json(
       new ApiResponse(200, createdUserId, "User registerd succesfully")
    )
 
 });

 const loginUser = asyncHandler(async (req, res) => {
    
    const { email, password } = req.body
   //  console.log(req.body);
    

    if (!email) {
       throw new ApiError(400, "email is required");
    }
 
    const user = await User.findOne({ email })

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
       throw new ApiError(401, "Incorrect password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
 
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
 

    const options = {
       httpOnly: true,
       secure: true, 
    };
 
    
    return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", refreshToken, options)
       .json(
          new ApiResponse(200, {
             user: loggedInUser,
             accessToken,
             refreshToken,
          }, "User logged in successfully")
       );
 });

 const getCurrentUser = asyncHandler(async(req,res)=>{
   return res.status(200)
   .json(new ApiResponse(200,req.user,"current user fetched successfully"))
})

 const logOutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
       req.user._id,
       {
          $set: {
             refreshToken: undefined
          }
       }, {
       new: true
    }
    )
 
    const options = {
       httpOnly: true,
       secure: true
    }
    
    return res
       .status(200)
       .clearCookie("accessToken", options)
       .clearCookie("refreshToken", options)
       .json(new ApiResponse(200, {}, "User logged Out"))
 })

 const createPost = asyncHandler(async (req, res) => {

    const { title, content, tags,status} = req.body
 
    if (
       [title, content, tags].some((field) => field?.trim() === "")
    ) {
       throw new ApiError(400, "All fields are required")
    }
 
    const coverImageLocalPath=req.file.path
 
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   //  console.log("Going to create the post");
    
    const newPost = await Post.create({
       title,
       content,
       tags,
       status,
       coverImage:coverImage.url,
       user:req.user._id
    })
   //  console.log("post created");
    
    await User.findByIdAndUpdate(req.user._id, { $push: { posts: newPost._id } });
 
    return res.status(201).json(
       new ApiResponse(200, newPost, "Post created succesfully")
    )
 
 });

 const getAllPosts = asyncHandler(async (req, res) => {
    try {
      const posts = await Post.find({status:true}).populate('user', 'username'); // Optionally populate the user details
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })

  const getUserPosts = asyncHandler(async (req, res) => {
   try {
       const userId = req.user._id; 

       const userPosts = await Post.find({ user:new mongoose.Types.ObjectId(userId) });

       if (!userPosts || userPosts.length === 0) {
           return res.status(404).json({ message: 'No posts found for this user' });
       }

       res.status(200).json(userPosts);
   } catch (error) {
       console.error("Error fetching user posts:", error);
       res.status(500).json({ message: 'Server error, please try again later' });
   }
}
)

  const getPostById = asyncHandler(async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).populate('user', 'username');
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })

  const updatePost = asyncHandler(async (req, res) => {
    try {
      const { title, content, tags, status } = req.body;
      // console.log("Body",req.body);
      
  
      const postFields = { title, content, tags, status };

      Object.keys(postFields).forEach((key) => postFields[key] === undefined && delete postFields[key]);
      // console.log("postfield",postFields);
      

      const post = await Post.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
           postFields,
            { new: true }
        );
      //   console.log("post",post);
        
      if (!post) {
        return res.status(404).json({ message: 'Post not found or you are not the owner' });
      }
  
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })

//   const updatePostCoverImage = asyncHandler(async (req,res)=>{
//     const coverImageLocalPath = req.file?.path
 
//     if(!coverImageLocalPath){
//        throw new ApiError(400,"Cover Image file is missing")
//     }
//     const coverImage=await uploadOnCloudinary(coverImageLocalPath)
 
//     if(!coverImage.url){
//  throw new ApiError(400,"Error while uploading on avatar")
//     }
 
//     const postImage = await Post.findByIdAndUpdate(req.user?._id,
//        {
//           $set:{
//              coverImage:coverImage.url
//           }
//        },
//        {
//           new:true
//        }
//     )
 
//     return res.status(200)
//     .json(new ApiResponse (200,user,"Cover Image updated successfully"))
    
//  })

//  const updateUserProfileImage = asyncHandler(async (req,res)=>{
//     const profileImageLocalPath = req.file?.path
 
//     if(!profileImageLocalPath){
//        throw new ApiError(400,"Profile Image file is missing")
//     }
//     const profileImage =await uploadOnCloudinary(profileImageLocalPath)
 
//     if(!profileImage.url){
//  throw new ApiError(400,"Error while uploading thr profile Image")
//     }
 
//     const user = await User.findByIdAndUpdate(req.user?._id,
//        {
//           $set:{
//           profileImage:profileImage.url
//           }
//        },
//        {
//           new:true
//        }
//     ).select("-password")
 
//     return res.status(200)
//     .json(new ApiResponse (200,user,"profile Image updated successfully"))
    
//  })

 const toggleLikePost = asyncHandler(async (req, res) => {
   const { postId } = req.params;
   const userId = req.user._id;
 
   try {
     const post = await Post.findById(postId);
 
     if (!post) {
       return res.status(404).json({ message: 'Post not found' });
     }
 
     const isLiked = post.likes.includes(userId);
 
     if (isLiked) {
       post.likes = post.likes.filter((like) => like.toString() !== userId.toString());
     } else {
       post.likes.push(userId);
     }
 
     await post.save();
     res.status(200).json(post);
   } catch (error) {
     res.status(500).json({ message: 'Error liking/unliking post', error });
   }
 })

const getPostLikes = asyncHandler(async (req, res) => {
   const postId = req.params.id;  
   // console.log(postId);
   
   try {
     const post = await Post.findById(postId).populate('likes', 'username');
     
     if (!post) {
       return res.status(404).json({ message: 'Post not found' });
     }
 
     return res.status(200).json({ likes: post.likes });  
   } catch (error) {
     console.error('Error fetching likes:', error);
     return res.status(500).json({ message: 'Server error' });
   }
 })

  const deletePost = asyncHandler(async (req, res) => {
    try {
      const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found or you are not the owner' });
      }
  
      await User.findByIdAndUpdate(req.user._id, { $pull: { posts: post._id } });
  
      res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

const addComment = asyncHandler(async (req, res) => {
   try {
     const { content, postId, parentId } = req.body; 
   //   console.log(req.body);
     
     const userId = req.user._id;  
      // console.log(req.user._id);
      
     const comment = new Comment({
       content,
       userId,
       postId,
       parentId: parentId || null 
     });
   //   console.log(comment);
     
     const savedComment = await comment.save();
 
     res.status(201).json(new ApiResponse(201,savedComment,"Comment added"));
   } catch (error) {
      // console.log(error);
      
     throw new ApiError(500,'Failed to add comment',)
   }
 })

 const getCommentsForPost = asyncHandler(async (req, res) => {
   try {
     const { postId } = req.params;
 
     const comments = await Comment.find({ postId, parentId: null })
       .populate('userId', 'username') 
       .lean();  
 
     const commentWithReplies = await Promise.all(comments.map(async (comment) => {
       const replies = await Comment.find({ parentId: comment._id })
         .populate('userId', 'username')
         .lean();
 
       return { ...comment, replies };
     }));
 
     res.status(200).json(commentWithReplies);
   } catch (error) {
     res.status(500).json({ message: 'Failed to get comments', error });
   }
 })
 

 export {registerUser,
    loginUser,
    logOutUser,
    createPost,
    deletePost,
    updatePost,
    getAllPosts,
    getPostById,
   //  updatePostCoverImage,
   //  updateUserProfileImage,
    getCurrentUser,
    getUserPosts,
    toggleLikePost,
    getPostLikes,
    addComment,
    getCommentsForPost
}