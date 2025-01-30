import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageCircle, ArrowLeft, Send, Flag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import axiosInstance from '../utils/axios';
import { toast } from 'sonner';

const DiscussionDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPostFlagDialog, setShowPostFlagDialog] = useState(false);
  const [commentToFlag, setCommentToFlag] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axiosInstance.get(`/posts/${postId}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
        toast.error('Failed to load discussion');
        if (error.response?.status === 404) {
          navigate('/user-dashboard/forum');
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const response = await axiosInstance.get('/profile');
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchPost();
    fetchCurrentUser();
  }, [postId, navigate]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`/posts/${postId}/comments`, {
        content: comment
      });
      
      setPost(response.data);
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleLikeToggle = async () => {
    try {
      const response = await axiosInstance.put(`/posts/${postId}/like`);
      setPost(prev => ({
        ...prev,
        likes: response.data.likes
      }));
      toast.success(response.data.likes.includes(currentUser._id) 
        ? 'Post liked!' 
        : 'Post unliked!');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`);
      setPost(prev => ({
        ...prev,
        comments: prev.comments.filter(comment => comment._id !== commentId)
      }));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleFlagPost = async (reason) => {
    try {
      await axiosInstance.post(`/posts/${postId}/flag`, { reason });
      toast.success('Post has been flagged for review');
    } catch (error) {
      console.error('Error flagging post:', error);
      toast.error(error.response?.data?.message || 'Failed to flag post');
    }
  };

  const handleFlagComment = async (commentId, reason) => {
    try {
      await axiosInstance.post(`/posts/${postId}/comments/${commentId}/flag`, { reason });
      toast.success('Comment has been flagged for review');
    } catch (error) {
      console.error('Error flagging comment:', error);
      toast.error(error.response?.data?.message || 'Failed to flag comment');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const FlagDialog = ({ isPost = true, itemId, onSubmit, onClose }) => {
    const [reason, setReason] = useState('');
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (isPost) {
        onSubmit(reason);
      } else {
        onSubmit(itemId, reason);
      }
      onClose();
      setReason('');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-bold mb-4">
            Flag {isPost ? 'Post' : 'Comment'} as Inappropriate
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Reason for flagging
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Select a reason</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={!reason}
              >
                Submit Flag
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Discussion not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <button
        onClick={() => navigate('/user-dashboard/forum')}
        className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Discussions
      </button>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={post.author?.profilePhoto || '/default-avatar.png'}
                alt={post.author?.fullName}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">{post.title}</h1>
                <div className="text-sm text-gray-500">
                  Posted by {post.author?.fullName} • {formatDate(post.createdAt)}
                </div>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {post.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-6 pt-4 border-t">
              <button
                onClick={handleLikeToggle}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-600"
              >
                <ThumbsUp
                  className={`w-5 h-5 ${
                    post.likes?.includes(currentUser?._id)
                      ? 'text-blue-600 fill-current'
                      : ''
                  }`}
                />
                <span>{post.likes?.length || 0}</span>
              </button>
              <div className="flex items-center space-x-2 text-gray-500">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments?.length || 0}</span>
              </div>
              <button
                onClick={() => setShowPostFlagDialog(true)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Flag as inappropriate"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Comments</h2>
          
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex space-x-4">
              <input
                type="text" value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Comment
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {post.comments?.map((comment) => (
              <div key={comment._id} className="border-b pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 mb-2">
                    <img
                      src={comment.userId?.profilePhoto || '/default-avatar.png'}
                      alt={comment.userId?.fullName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{comment.userId?.fullName}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentUser?._id === comment.userId?._id && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      onClick={() => setCommentToFlag(comment._id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Flag as inappropriate"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 ml-11">{comment.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showPostFlagDialog && (
        <FlagDialog isPost={true} onSubmit={handleFlagPost} onClose={() => setShowPostFlagDialog(false)} />
      )}
      
      {commentToFlag && (
        <FlagDialog isPost={false} itemId={commentToFlag} onSubmit={handleFlagComment} onClose={() => setCommentToFlag(null)} />
      )}
    </div>
  );
};

export default DiscussionDetail;