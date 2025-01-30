const express = require('express');
const {
  getAllPosts,
  editPost,
  editComment,
  deletePost,
  deleteComment,
  resolveFlaggedContent,
  getFlaggedStats
} = require('../controllers/forumAdminControllers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Forum Management Routes
router.get('/admin/posts', authMiddleware, getAllPosts);
router.put('/admin/posts/:postId', authMiddleware, editPost);
router.put('/admin/posts/:postId/comments/:commentId', authMiddleware, editComment);
router.delete('/admin/posts/:postId', authMiddleware, deletePost);
router.delete('/admin/posts/:postId/comments/:commentId', authMiddleware, deleteComment);
router.post('/admin/resolve-flagged', authMiddleware, resolveFlaggedContent);
router.get('/admin/flagged-stats', authMiddleware, getFlaggedStats);

module.exports = router;