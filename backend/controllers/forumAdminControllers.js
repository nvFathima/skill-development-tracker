const Post = require('../models/Posts');
const { createNotification } = require('../controllers/notificationControllers');

// Get all posts with optional filters
const getAllPosts = async (req, res) => {
  try {
    const { flaggedOnly, page = 1, limit = 10, searchQuery } = req.query;
    
    let query = flaggedOnly === 'true' 
      ? { 
          $or: [
            { 'flags.status': 'pending' },
            { 'comments.flags.status': 'pending' }
          ]
        }
      : {};

    // Add search query to the filter
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { 'author.fullName': { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'fullName email')
      .populate('comments.userId', 'fullName email')
      .populate('flags.userId', 'fullName email')
      .populate('comments.flags.userId', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);
    
    res.status(200).json({
      posts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalPosts: total
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// Edit a post
const editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;

    const post = await Post.findById(postId)
      .populate('author', 'fullName email');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Save original content for notification
    const originalTitle = post.title;

    // Update post
    post.title = title;
    post.content = content;
    post.updatedAt = Date.now();
    await post.save();

    // Create notification for the author
    await createNotification(
      post.author._id,
      `Your post "${originalTitle}" has been edited by an administrator.`
    );

    res.status(200).json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Failed to update post' });
  }
};

// Edit a comment
const editComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    const post = await Post.findById(postId)
      .populate('comments.userId', 'fullName email');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Update comment
    comment.content = content;
    comment.updatedAt = Date.now();
    await post.save();

    // Create notification for the comment author
    await createNotification(
      comment.userId._id,
      `Your comment on the post "${post.title}" has been edited by an administrator.`
    );

    res.status(200).json(post);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Failed to update comment' });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate('author', 'fullName email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create notification before deleting
    await createNotification(
      post.author._id,
      `Your post "${post.title}" has been removed by an administrator.`
    );

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId)
      .populate('comments.userId', 'fullName email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Create notification before deleting
    await createNotification(
      comment.userId._id,
      `Your comment on the post "${post.title}" has been removed by an administrator.`
    );

    // Remove the comment
    post.comments.pull(commentId);
    await post.save();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};

// Resolve flagged content
const resolveFlaggedContent = async (req, res) => {
  try {
    const { postId, commentId, flagId, action, notifyUser } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    let flaggedItem;
    if (commentId) {
      // Handle comment flag
      const comment = post.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      const flag = comment.flags.id(flagId);
      if (!flag) {
        return res.status(404).json({ message: 'Flag not found' });
      }
      flag.status = action;
      flaggedItem = 'comment';
    } else {
      // Handle post flag
      const flag = post.flags.id(flagId);
      if (!flag) {
        return res.status(404).json({ message: 'Flag not found' });
      }
      flag.status = action;
      flaggedItem = 'post';
    }

    await post.save();

    // Notify user of the resolution
    if (notifyUser) {
      const notificationMessage = action === 'reviewed'
        ? `Your flagged ${flaggedItem} has been reviewed and appropriate action has been taken.`
        : `The flag on your ${flaggedItem} has been dismissed.`;
      
      await createNotification(notifyUser, notificationMessage);
    }

    res.status(200).json({ 
      message: 'Flag resolved successfully',
      post 
    });
  } catch (error) {
    console.error('Error resolving flag:', error);
    res.status(500).json({ message: 'Failed to resolve flag' });
  }
};

// Get flagged content statistics
const getFlaggedStats = async (req, res) => {
  try {
    const stats = await Post.aggregate([
      {
        $facet: {
          postFlags: [
            { $match: { 'flags.status': 'pending' } },
            { $count: 'total' }
          ],
          commentFlags: [
            { $match: { 'comments.flags.status': 'pending' } },
            { $count: 'total' }
          ]
        }
      }
    ]);

    const postFlagsCount = stats[0].postFlags[0]?.total || 0;
    const commentFlagsCount = stats[0].commentFlags[0]?.total || 0;

    res.status(200).json({
      postFlags: postFlagsCount,
      commentFlags: commentFlagsCount,
      total: postFlagsCount + commentFlagsCount
    });
  } catch (error) {
    console.error('Error fetching flag statistics:', error);
    res.status(500).json({ message: 'Failed to fetch flag statistics' });
  }
};

module.exports = {
  getAllPosts,
  editPost,
  editComment,
  deletePost,
  deleteComment,
  resolveFlaggedContent,
  getFlaggedStats
};