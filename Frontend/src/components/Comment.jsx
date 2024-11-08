import React, { useState, useEffect } from "react";
import { Button, Input } from "./index.js";
import appwriteService from "../appwrite/config";
import { useSelector } from "react-redux"; 

export default function Comment({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);

  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const fetchedComments = await appwriteService.getComments(postId);
        setComments(fetchedComments);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const addedComment = await appwriteService.addComment(postId, newComment);
      setComments((prevComments) => [addedComment, ...prevComments]);
      setNewComment("");
    } catch (error) {
    }
  };

  const handleReplyComment = async (parentId) => {
    if (!replyContent.trim()) return;

    try {
      const addedReply = await appwriteService.addComment(postId, replyContent, parentId);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === parentId
            ? {
                ...comment,
                replies: [...comment.replies, addedReply],
              }
            : comment
        )
      );
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
    }
  };

  const renderComment = (comment) => (
    <div key={comment._id} className="mb-4">
      <p className="text-sm text-gray-500">
        Posted by {comment.userId.username ? comment.userId.username : userData.data.username}
      </p>
      <p className="bg-gray-100 p-3 rounded-md shadow-sm">{comment.content}</p>
      <button
        className="text-blue-500 text-sm mt-1"
        onClick={() => setReplyingTo(comment._id)}
      >
        Reply
      </button>

      {replyingTo === comment._id && (
        <div className="mt-2 flex">
          <Input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="w-full border border-gray-300 rounded p-2 mr-2"
          />
          <Button bgColor="bg-gray-500" onClick={() => handleReplyComment(comment._id)}>
            Send
          </Button>
        </div>
      )}

      {comment.replies?.length > 0 && (
        <div className="ml-6 mt-2">
          {comment.replies.map((reply) => (
            <div key={reply._id} className="mb-2">
              <p className="text-sm text-gray-500">
                Replied by {reply?.userId?.username  ? reply.userId.username : userData.data.username}

              </p>
              <p className="bg-gray-50 p-2 rounded-md shadow-sm">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-5xl bg-white shadow-md p-6 rounded-md mt-8">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>

      <div className="mb-4">
        <Input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full border border-gray-300 rounded p-3 mb-2 shadow-sm"
        />
        <Button bgColor="bg-gray-500" onClick={handleAddComment}>
          Send
        </Button>
      </div>

      <div className="overflow-y-auto max-h-64">
        {loading ? (
          <p>Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map(renderComment)
        ) : (
          <p>No comments posted.</p>
        )}
      </div>
    </div>
  );
}
