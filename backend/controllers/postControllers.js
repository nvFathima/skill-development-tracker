const Post = require('../models/Posts');

// Create a new post
const createPost = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const userId = req.user.id;

        const post = new Post({
            author: userId,
            title,
            content,
            tags,
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get a single post by ID
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id)
            .populate('author', 'fullName profilePhoto')
            .populate({
                path: 'comments.userId',
                select: 'fullName profilePhoto'
            });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json(post);
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all posts with pagination and user filtering
// Get all posts with pagination and user filtering
const getPosts = async (req, res) => {
    try {
        const { skillId, userId, page = 1, limit = 8, sort = 'recent', search = '' } = req.query;
        
        // Build the aggregation pipeline
        const pipeline = [];

        // Match stage for filtering
        let matchStage = {};
        if (search) {
            matchStage.$or = [
                { title: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];
        }
        if (skillId) {
            matchStage.associatedSkills = skillId;
        }
        if (userId) {
            matchStage.author = userId;
        }
        
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // Add fields for sorting
        pipeline.push({
            $addFields: {
                likesCount: { $size: { $ifNull: ["$likes", []] } },
                commentsCount: { $size: { $ifNull: ["$comments", []] } }
            }
        });

        // Sorting stage
        let sortStage = {};
        switch (sort) {
            case 'recent':
                sortStage = { $sort: { createdAt: -1 } };
                break;
            case 'popular':
                sortStage = { $sort: { likesCount: -1, createdAt: -1 } };
                break;
            case 'commented':
                sortStage = { $sort: { commentsCount: -1, createdAt: -1 } };
                break;
            default:
                sortStage = { $sort: { createdAt: -1 } };
        }
        pipeline.push(sortStage);

        // Get total count before pagination
        const totalPosts = await Post.aggregate([...pipeline, { $count: "total" }]);
        const total = totalPosts[0]?.total || 0;

        // Add pagination
        pipeline.push(
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        );

        // Add author lookup
        pipeline.push({
            $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                pipeline: [
                    { $project: { fullName: 1, profilePhoto: 1 } }
                ],
                as: 'author'
            }
        });
        pipeline.push({ $unwind: '$author' });

        const posts = await Post.aggregate(pipeline);

        res.status(200).json({
            posts,
            totalPosts: total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error("Error fetching posts:", { error, query: req.query });
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
};


// Update a post
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, tags } = req.body; // Change associatedSkills to tags

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.author.toString() !== req.user.id) { // Change userId to author
            return res.status(403).json({ message: "Unauthorized to update this post" });
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.tags = tags || post.tags;
        post.updatedAt = Date.now();

        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a post
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        await post.deleteOne(); // Correct way to delete a document instance
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Like or Unlike a post
const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const userLikeIndex = post.likes.findIndex(
            (like) => like.toString() === userId
        );

        if (userLikeIndex !== -1) {
            // User has already liked the post, so unlike it
            post.likes.splice(userLikeIndex, 1);
        } else {
            // User hasn't liked the post, so add the like
            post.likes.push(userId);
        }

        await post.save();
        
        // Return both the likes array and count for frontend flexibility
        res.status(200).json({ 
            likes: post.likes,
            likesCount: post.likes.length
        });
    } catch (error) {
        console.error("Error liking/unliking post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Add a comment
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.comments.push({
            userId: req.user.id,
            content,
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a comment
const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Find the specific comment within the post
        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if the user is authorized to delete the comment
        if (comment.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to delete this comment" });
        }

        // Remove the comment by filtering it out
        post.comments = post.comments.filter(c => c._id.toString() !== commentId);

        // Save the updated post
        await post.save();

        res.status(200).json({ message: "Comment deleted successfully", post });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Flag a post
const flagPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user has already flagged this post
        const existingFlag = post.flags.find(
            flag => flag.userId.toString() === userId
        );

        if (existingFlag) {
            return res.status(400).json({ message: "You have already flagged this post" });
        }

        post.flags.push({
            userId,
            reason
        });

        await post.save();
        res.status(200).json({ message: "Post has been flagged for review" });
    } catch (error) {
        console.error("Error flagging post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Flag a comment
const flagComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if user has already flagged this comment
        const existingFlag = comment.flags.find(
            flag => flag.userId.toString() === userId
        );

        if (existingFlag) {
            return res.status(400).json({ message: "You have already flagged this comment" });
        }

        comment.flags.push({
            userId,
            reason
        });

        await post.save();
        res.status(200).json({ message: "Comment has been flagged for review" });
    } catch (error) {
        console.error("Error flagging comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    createPost, getPostById,getPosts, updatePost, deletePost, 
    toggleLike, addComment, deleteComment, flagComment,flagPost };