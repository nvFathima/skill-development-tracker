const express = require('express');
const { createPost, getPostById, getPosts, updatePost, deletePost, 
    toggleLike, addComment, deleteComment, flagPost, flagComment,
    } = require('../controllers/postControllers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/posts', authMiddleware, createPost);
router.get('/posts/:id', authMiddleware, getPostById);
router.get('/posts', authMiddleware, getPosts);
router.put('/posts/:id', authMiddleware, updatePost);
router.delete('/posts/:id', authMiddleware, deletePost);
router.put('/posts/:id/like', authMiddleware, toggleLike);
router.post('/posts/:id/comments', authMiddleware, addComment);
router.delete('/posts/:postId/comments/:commentId', authMiddleware, deleteComment);
router.post('/posts/:id/flag', authMiddleware, flagPost);
router.post('/posts/:postId/comments/:commentId/flag', authMiddleware, flagComment);

module.exports = router;
