import React, { useEffect, useState } from 'react';
import { FaHeart, FaRegHeart, FaRegComment } from 'react-icons/fa';
import appwriteService from "../appwrite/config";
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function PostCard({ _id, title, coverImage }) {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentNum, setCommentNum] = useState(0);

const userData = useSelector((state) => state.auth.userData);
const user=userData.data._id

  useEffect(() => {
    const getcomments = async () => {
      try {
        const comments = await appwriteService.getComments(_id);
        setCommentNum(comments.length);
      } catch (error) {
        console.error('Error fetching comments', error);
      }
    };

    getcomments();
  }, [_id]);

  useEffect(() => {
    const fetchLikes = async () => {
      
      
      try {
        const response = await appwriteService.getPostLikes(_id);
        setLikes(response.likes.length);
        // console.log(_id,response.likes,user._id);
        
        const isLikedByUser = response.likes.some(like => like._id === user);
        
        setIsLiked(isLikedByUser);
      } catch (error) {
        console.error('Error fetching post likes', error);
      }
    };

    fetchLikes();
  }, [_id, user._id]);

  const handleLike = async () => {
    try {
      const response = await appwriteService.toggleLike(_id);
      setLikes(response.likes.length);
      const isLikedByUser = response.likes.some(like => like === user);
      setIsLiked(isLikedByUser);
    } catch (error) {
      console.error('Error liking/unliking post', error);
    }
  };

  return (
    <div className='w-full max-w-xs bg-gray-100 rounded-xl p-4 shadow-md transition-transform transform hover:scale-105'>
      <div>
        <Link to={`/post/${_id}`}>
          <div className='w-full h-48 flex justify-center mb-4 overflow-hidden'>
            <img
              src={coverImage}
              alt={title}
              className='h-full w-auto object-cover rounded-xl'
            />
          </div>
          <h2 className='text-xl font-bold text-gray-800 truncate'>{title}</h2>
        </Link>
      </div>

      <div className='flex justify-between items-center mt-4'>
        <div className='flex items-center'>
          {/* <FaRegHeart size={24}
              className="mr-2 cursor-pointer text-gray-500"
              onClick={handleLike}/> */}
          {isLiked ? (
            <FaHeart
              size={24}
              className="mr-2 cursor-pointer text-red-500 border-red-600"
              onClick={handleLike}
            />
          ) : (
            <FaRegHeart
              size={24}
              className="mr-2 cursor-pointer text-gray-500"
              onClick={handleLike}
            />
          )}
          <span>{likes}</span>
        </div>
        
        <Link to={`/post/${_id}`}>
          <div className='flex items-center'>
            <FaRegComment size={24} className='text-gray-600 mr-2 cursor-pointer' />
            <span>{commentNum}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default PostCard;
