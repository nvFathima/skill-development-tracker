import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Search, Edit2, Trash2, Send, Bookmark, MessageCircle, Calendar, Tag } from 'lucide-react';
import axiosInstance from '../utils/axios';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const DiscussionForum = () => {
  // State management
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewingOwnPosts, setViewingOwnPosts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('recent');
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '', category: '' });
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [discussions, setDiscussions] = useState([
    {
      id: "", title: "", content: "", author: { id: "", name: "", avatar: "" },
      category: "", tags: ["", "", ""], createdAt: "", likes: 0,
      replies: [{ id: "", content: "", author: { id: "", name: "", avatar: "" }, createdAt: "", likes: 0 }]
    }]);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axiosInstance.get('/profile');
        console.log('Current User Data:', response.data);
        setCurrentUser({
          _id: response.data._id,
          name: response.data.fullName,
          avatar: response.data.profilePhoto || "/default-avatar.png"
        });
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        if (err.response?.status === 401) {
          setError("Please log in to view discussions");
        }
      }
    };

    const token = sessionStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setError("Please log in to view discussions");
    }
  }, []);

  const fetchPosts = async (page = 1, onlyUserPosts = false) => {
    setIsLoading(true);
    try {
        const url = `/posts?page=${page}&limit=8${
            onlyUserPosts && currentUser ? `&userId=${currentUser._id}` : ''
        }&sort=${sortOption}&search=${searchQuery}`;
        
        const response = await axiosInstance.get(url);
        
        // Add some data validation
        if (response.data?.posts) {
            setPosts(response.data.posts);
            setCurrentPage(response.data.currentPage);
            setTotalPages(Math.ceil(response.data.totalPages));
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Failed to fetch posts");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage, viewingOwnPosts);
  }, [currentPage, viewingOwnPosts, sortOption, searchQuery]); 

  // Handle new post submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedTags = newPost.tags.split(',').map(tag => tag.trim());
      const response = await axiosInstance.post('/posts', {
        title: newPost.title,
        content: newPost.content,
        tags: formattedTags,
      });
  
      // Clear the form and close the modal
      setNewPost({ title: '', content: '', tags: '' });
      setIsCreatingPost(false);
      toast.success('Post added successfully');
  
      // Fetch the latest posts
      fetchPosts(currentPage, viewingOwnPosts);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  // Handle reply submission
  const handleReplySubmit = (discussionId) => {
    const newReply = {
      id: Date.now(),
      content: replyContent,
      author: currentUser,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setDiscussions(discussions.map(discussion =>
      discussion.id === discussionId
        ? { ...discussion, replies: [...discussion.replies, newReply] }
        : discussion
    ));

    setReplyContent('');
    setReplyingTo(null);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
        fetchPosts(newPage);
    }
  };

  // Handler for deleting a post
  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axiosInstance.delete(`/posts/${postId}`);
        setPosts(posts.filter(post => post._id !== postId));
        toast.success('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
      }
    }
  };

  // Handler for initiating post edit
  const handleEditClick = (post) => {
    setEditingPost({
      _id: post._id,
      title: post.title,
      content: post.content,
      tags: post.tags.join(', ')
    });
  };

  // Handler for submitting edited post
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    console.log("Editing post data:", editingPost);
    try {
        const formattedTags = editingPost.tags.split(',').map(tag => tag.trim());
        const response = await axiosInstance.put(`/posts/${editingPost._id}`, { 
            title: editingPost.title,
            content: editingPost.content,
            tags: formattedTags
        });

        setPosts(posts.map(post => 
            post._id === editingPost._id ? { ...post, ...response.data } : post 
        ));
        setEditingPost(null);
        toast.success('Post updated successfully');
    } catch (error) {
        console.error('Error updating post:', error);
        toast.error(error.response?.data?.message || 'Failed to update post');
    }
};

// Handle like/unlike
const handleLikeToggle = async (postId) => {
  try {
      const response = await axiosInstance.put(`/posts/${postId}/like`);
      
      // Update the posts state with the new likes count
      setPosts(posts.map(post => 
        post._id === postId 
            ? { ...post, likes: response.data.likes, likesCount: response.data.likesCount }
            : post
      ));

      // Show success message
      const isLiked = response.data.likes.includes(currentUser._id);
      toast.success(isLiked ? 'Post liked!' : 'Post unliked!');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    }
  };

  // Edit Post Modal
  const EditPostModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Post</h2>
        <form onSubmit={handleEditSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={editingPost.title}
              onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              value={editingPost.content}
              onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
              className="w-full p-2 border rounded"
              rows="4"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={editingPost.tags}
              onChange={(e) => setEditingPost({...editingPost, tags: e.target.value})}
              className="w-full p-2 border rounded"
              placeholder="e.g., react, javascript, web development"
            />
          </div>
          <div className="flex space-x-2">
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditingPost(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Update the Post Footer section in the existing JSX
  const PostFooter = ({ post }) => {
    return (
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => handleLikeToggle(post._id)}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ThumbsUp 
                className={`w-5 h-5 ${
                    post.likes?.includes(currentUser?._id) 
                        ? 'text-blue-600 fill-current' 
                        : ''
                }`} 
            />
            <span className="text-sm font-medium">{post.likes?.length || 0}</span>
          </button>
          <Link to={`/user-dashboard/forum/${post._id}`}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.comments?.length || 0}</span>
          </Link>
        </div>
        {currentUser && post.author && (
          <div className="flex items-center space-x-2">
            {currentUser._id === post.author._id && (
              <>
                <button 
                  onClick={() => handleEditClick(post)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeletePost(post._id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {editingPost && <EditPostModal />} 
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <h1 className="text-2xl font-bold dark:text-white">Discussion Forum</h1>
            <button
              onClick={() => setIsCreatingPost(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Start New Discussion
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-900">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative ">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " size={20} />
              <input
                type="text"
                placeholder="Search discussions..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Sorting Options */}
            <select
              className="px-4 py-2 border rounded-lg"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Liked</option>
              <option value="commented">Most Commented</option>
            </select>
          </div>
        </div>

        {/* New Post Form */}
        {isCreatingPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Discussion</h2>
              <form onSubmit={handlePostSubmit}>
                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter a catchy title for your post"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">{newPost.title.length}/100 characters</p>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Share your thoughts or ask a question..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">{newPost.content.length}/2000 characters</p>
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <input
                    type="text"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., react, javascript, web development"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingPost(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter Buttons with improved styling */}
        <div className="flex justify-end gap-4 mb-6">
          <button
            onClick={() => {
              setViewingOwnPosts(false);
              setCurrentPage(1);
            }}
            className={`px-6 py-2 rounded-lg transition-all duration-200 ${
              !viewingOwnPosts 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => {
              setViewingOwnPosts(true);
              setCurrentPage(1);
            }}
            className={`px-6 py-2 rounded-lg transition-all duration-200 ${
              viewingOwnPosts 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            My Posts
          </button>
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post._id} className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                  {/* Post Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={post.author?.profilePhoto 
                          ? `http://localhost:8800${post.author.profilePhoto}` 
                          : '/default-avatar.png'}
                        alt={post.author?.fullName || 'Unknown Author'}
                        className="w-12 h-12 rounded-full border-2 border-gray-100"
                      />
                      <div>
                      <Link to={`/user-dashboard/forum/${post._id}`}>
                        <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 dark:text-gray-100 transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className="font-medium">{post.author?.fullName || 'Unknown Author'}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Bookmark className="w-5 h-5 text-gray-400 hover:text-blue-600 cursor-pointer" />
                  </div>

                  {/* Post Content */}
                  <div className="prose prose-sm max-w-none mb-4">
                    <p className="text-gray-700 dark:text-gray-400">
                      {post.content.length > 200 ? (
                        <>
                          {post.content.slice(0, 200)}
                          <Link to={`/user-dashboard/forum/${post._id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium ml-2 ">
                            Read More...
                          </Link>
                        </>
                      ) : (
                        post.content
                      )}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags?.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-600">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Post Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <PostFooter post={post} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm dark:bg-gray-700">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              {viewingOwnPosts ? "You haven't created any posts yet." : "No posts found."}
            </p>
            {viewingOwnPosts && (
              <button
                onClick={() => setIsCreatingPost(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Post
              </button>
            )}
          </div>
        )}

        {/* Enhanced Pagination Controls */}
        {posts.length > 0 && (
          <div className="flex items-center justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionForum;